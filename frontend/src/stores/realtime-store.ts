import { create } from 'zustand'

/**
 * Estado efímero de UI en tiempo real (badge "EN VIVO" / hora de última
 * actualización). Los datos de negocio (mesas, resultados, etc.) viven en
 * React Query; este store solo evita que cada página que muestra el badge
 * tenga que pedir /configuracion por su cuenta.
 */
interface RealtimeState {
  conteoAbierto: boolean
  ultimaActualizacion: string
  socketConectado: boolean
  setConteoAbierto: (abierto: boolean) => void
  setUltimaActualizacion: (hora: string) => void
  setSocketConectado: (conectado: boolean) => void
}

export const useRealtimeStore = create<RealtimeState>()((set) => ({
  conteoAbierto: true,
  ultimaActualizacion: '—',
  socketConectado: false,
  setConteoAbierto: (conteoAbierto) => set({ conteoAbierto }),
  setUltimaActualizacion: (ultimaActualizacion) => set({ ultimaActualizacion }),
  setSocketConectado: (socketConectado) => set({ socketConectado }),
}))
