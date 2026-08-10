import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import { API_URL } from '@/lib/api-client'
import { resultadosApi } from '@/lib/api/resultados'
import { useAuthStore } from '@/stores/auth-store'
import { useRealtimeStore } from '@/stores/realtime-store'

/**
 * Conecta una única vez por sesión al WebSocket del backend y mantiene
 * sincronizados tanto el badge "EN VIVO" como la caché de React Query de
 * mesas/resultados/dashboard/configuración ante cualquier cambio remoto
 * (propio o de otro transcriptor).
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore((state) => state.auth)
  const setConteoAbierto = useRealtimeStore((s) => s.setConteoAbierto)
  const setUltimaActualizacion = useRealtimeStore((s) => s.setUltimaActualizacion)
  const setSocketConectado = useRealtimeStore((s) => s.setSocketConectado)

  useEffect(() => {
    if (!user) return undefined

    resultadosApi
      .get()
      .then((resumen) => {
        setConteoAbierto(resumen.conteoAbierto)
        setUltimaActualizacion(new Date(resumen.ultimaActualizacion).toLocaleTimeString())
      })
      .catch(() => {
        // El resumen se reintentará vía las páginas que lo consultan con React Query
      })

    const socket = io(API_URL, { transports: ['websocket'], autoConnect: true })

    socket.on('connect', () => {
      setSocketConectado(true)
      socket.emit('unirseRoomRol', { role: user.role })
    })

    socket.on('disconnect', () => setSocketConectado(false))

    socket.on('mesaActualizada', () => {
      queryClient.invalidateQueries({ queryKey: ['mesas'] })
      queryClient.invalidateQueries({ queryKey: ['asignaciones'] })
    })

    socket.on('resumenVotosActualizado', (data: { conteoAbierto: boolean; ultimaActualizacion: string }) => {
      setConteoAbierto(data.conteoAbierto)
      setUltimaActualizacion(new Date(data.ultimaActualizacion).toLocaleTimeString())
      queryClient.invalidateQueries({ queryKey: ['resultados'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    })

    socket.on('conteoEstadoCambiado', (data: { abierto: boolean }) => {
      setConteoAbierto(data.abierto)
      queryClient.invalidateQueries({ queryKey: ['configuracion'] })
    })

    socket.on('sistemaReseteado', () => {
      queryClient.invalidateQueries({ queryKey: ['mesas'] })
      queryClient.invalidateQueries({ queryKey: ['asignaciones'] })
      queryClient.invalidateQueries({ queryKey: ['resultados'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['reset-log'] })
    })

    return () => {
      socket.disconnect()
    }
  }, [user, queryClient, setConteoAbierto, setUltimaActualizacion, setSocketConectado])
}
