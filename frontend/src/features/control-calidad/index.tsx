import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { mesasApi } from '@/lib/api/mesas'
import { candidatosApi } from '@/lib/api/candidatos'
import { usersApi } from '@/lib/api/users'
import { resolveUploadUrl } from '@/lib/api-client'
import type { Mesa } from '@/lib/api/types'
import { handleServerError } from '@/lib/handle-server-error'
import { useAuthStore } from '@/stores/auth-store'
import { getUserRole } from '@/lib/auth-role'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LiveStatusBadge } from '@/components/live-status-badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ImageOff,
  MessageSquareWarning,
} from 'lucide-react'
import { toast } from 'sonner'

type FiltroEstado = 'PENDIENTES' | 'APROBADAS' | 'RECHAZADAS' | 'TODAS'

export function ControlCalidadFeature() {
  const queryClient = useQueryClient()
  const { auth } = useAuthStore()
  const currentUser = auth.user
  const isAdmin = getUserRole(currentUser) === 'ADMIN'

  const [searchTerm, setSearchTerm] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('PENDIENTES')
  const [filtroRevisorId, setFiltroRevisorId] = useState<string>('TODOS')
  const [mesaARechazar, setMesaARechazar] = useState<Mesa | null>(null)
  const [comentarioRechazo, setComentarioRechazo] = useState('')
  const [imagenAmpliada, setImagenAmpliada] = useState<{ url: string; titulo: string } | null>(null)

  const { data: mesas = [], isPending } = useQuery({
    queryKey: ['mesas'],
    queryFn: () => mesasApi.list(),
  })
  const { data: candidatos = [] } = useQuery({
    queryKey: ['candidatos'],
    queryFn: () => candidatosApi.list(),
  })
  const { data: usuarios = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
    enabled: isAdmin,
  })

  const revisoresActivos = usuarios.filter((u) => u.role === 'CONTROL_CALIDAD' && u.isActive)

  const revisarMutation = useMutation({
    mutationFn: ({ id, estado, comentario }: { id: string; estado: 'APROBADA' | 'RECHAZADA'; comentario?: string }) =>
      mesasApi.revisar(id, { estado, comentario }),
    onSuccess: (mesa, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mesas'] })
      toast.success(
        variables.estado === 'APROBADA'
          ? `Mesa ${mesa.codigo} aprobada`
          : `Mesa ${mesa.codigo} rechazada, vuelve al transcriptor`,
      )
      setMesaARechazar(null)
      setComentarioRechazo('')
    },
    onError: handleServerError,
  })

  const mesasAsignadas = useMemo(() => {
    return mesas.filter((m) => {
      if (!isAdmin) return m.controlCalidadId === currentUser?.id
      if (filtroRevisorId === 'TODOS') return m.controlCalidadId != null
      return m.controlCalidadId === filtroRevisorId
    })
  }, [mesas, isAdmin, currentUser?.id, filtroRevisorId])

  const mesasFiltradas = mesasAsignadas.filter((m) => {
    const matchesSearch =
      m.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.facultad.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false

    if (filtroEstado === 'TODAS') return true
    if (filtroEstado === 'PENDIENTES') return m.estado === 'CARGADA' && m.revisionEstado === 'PENDIENTE'
    if (filtroEstado === 'APROBADAS') return m.revisionEstado === 'APROBADA'
    return m.revisionEstado === 'RECHAZADA'
  })

  const pendientesCount = mesasAsignadas.filter(
    (m) => m.estado === 'CARGADA' && m.revisionEstado === 'PENDIENTE',
  ).length

  const handleAprobar = (mesa: Mesa) => {
    revisarMutation.mutate({ id: mesa.id, estado: 'APROBADA' })
  }

  const handleAbrirRechazo = (mesa: Mesa) => {
    setMesaARechazar(mesa)
    setComentarioRechazo('')
  }

  const handleConfirmarRechazo = () => {
    if (!mesaARechazar) return
    if (!comentarioRechazo.trim()) {
      toast.error('Debe indicar un comentario explicando qué corregir')
      return
    }
    revisarMutation.mutate({
      id: mesaARechazar.id,
      estado: 'RECHAZADA',
      comentario: comentarioRechazo.trim(),
    })
  }

  return (
    <>
      <Header>
        <div className='flex items-center gap-3 me-auto min-w-0'>
          <ShieldCheck className='h-5 w-5 text-primary shrink-0' />
          <h1 className='text-base font-bold tracking-tight truncate min-w-0'>Control de Calidad</h1>
        </div>
        <div className='flex items-center gap-3'>
          <LiveStatusBadge />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='space-y-6 p-4 sm:p-6'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Verificación de Actas</h2>
            <p className='text-xs text-muted-foreground mt-0.5'>
              {isAdmin
                ? 'Vista de supervisión: mesas repartidas entre todo el equipo de control de calidad.'
                : `Tienes ${mesasAsignadas.length} mesas asignadas · ${pendientesCount} pendientes de revisión.`}
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            {isAdmin && (
              <Select value={filtroRevisorId} onValueChange={setFiltroRevisorId}>
                <SelectTrigger className='w-48 text-xs h-9'>
                  <SelectValue placeholder='Control de calidad' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='TODOS'>Todos los revisores</SelectItem>
                  {revisoresActivos.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className='relative w-full sm:w-64'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Buscar mesa o facultad...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-9 text-xs'
              />
            </div>
          </div>
        </div>

        <Tabs value={filtroEstado} onValueChange={(v) => setFiltroEstado(v as FiltroEstado)}>
          <TabsList className='grid grid-cols-4 w-full sm:w-auto font-bold text-xs h-9'>
            <TabsTrigger value='PENDIENTES' className='text-xs gap-1'>
              <Clock className='h-3.5 w-3.5' /> Pendientes
            </TabsTrigger>
            <TabsTrigger value='APROBADAS' className='text-xs gap-1'>
              <CheckCircle2 className='h-3.5 w-3.5' /> Aprobadas
            </TabsTrigger>
            <TabsTrigger value='RECHAZADAS' className='text-xs gap-1'>
              <XCircle className='h-3.5 w-3.5' /> Rechazadas
            </TabsTrigger>
            <TabsTrigger value='TODAS' className='text-xs'>Todas</TabsTrigger>
          </TabsList>
        </Tabs>

        {isPending ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className='h-72 w-full' />
            ))}
          </div>
        ) : mesasFiltradas.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
            {mesasFiltradas.map((m) => {
              const esPendiente = m.estado === 'CARGADA' && m.revisionEstado === 'PENDIENTE'
              const esAprobada = m.revisionEstado === 'APROBADA'
              const esRechazada = m.revisionEstado === 'RECHAZADA'

              return (
                <Card
                  key={m.id}
                  className={`border-border/60 shadow-sm ${
                    esAprobada
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : esRechazada
                        ? 'bg-destructive/5 border-destructive/30'
                        : ''
                  }`}
                >
                  <CardHeader className='pb-3'>
                    <div className='flex items-center justify-between'>
                      <Badge variant='outline' className='font-mono font-bold text-xs bg-primary/10 text-primary border-primary/30'>
                        {m.codigo}
                      </Badge>
                      {esAprobada && (
                        <Badge className='bg-emerald-600 text-white text-[10px] font-bold gap-1'>
                          <CheckCircle2 className='h-3 w-3' /> Aprobada
                        </Badge>
                      )}
                      {esRechazada && (
                        <Badge variant='destructive' className='text-[10px] font-bold gap-1'>
                          <XCircle className='h-3 w-3' /> Rechazada
                        </Badge>
                      )}
                      {!esAprobada && !esRechazada && m.estado !== 'CARGADA' && (
                        <Badge variant='outline' className='text-[10px] text-muted-foreground font-bold'>
                          Sin transcribir
                        </Badge>
                      )}
                      {esPendiente && (
                        <Badge variant='outline' className='text-[10px] font-bold gap-1 text-amber-600 border-amber-500/30'>
                          <Clock className='h-3 w-3' /> Pendiente
                        </Badge>
                      )}
                    </div>
                    <CardTitle className='text-base font-bold pt-2'>{m.facultad}</CardTitle>
                    <CardDescription className='text-xs'>
                      Transcriptor: <strong className='text-foreground'>{m.transcriptorNombre ?? 'Sin asignar'}</strong>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className='space-y-3 text-xs'>
                    <div className='space-y-1 p-2.5 rounded-lg bg-muted/30 border'>
                      <p className='text-[11px] font-bold uppercase text-muted-foreground'>Votos cargados</p>
                      {candidatos.map((c) => (
                        <div key={c.id} className='flex items-center justify-between'>
                          <span className='truncate text-foreground'>{c.nombre}</span>
                          <span className='font-mono font-bold'>{m.votosPorCandidato?.[c.id] ?? 0}</span>
                        </div>
                      ))}
                    </div>

                    <div className='grid grid-cols-2 gap-2'>
                      {m.actaFotoUrl ? (
                        <button
                          type='button'
                          onClick={() =>
                            setImagenAmpliada({
                              url: resolveUploadUrl(m.actaFotoUrl)!,
                              titulo: `Foto de Acta — ${m.codigo}`,
                            })
                          }
                          className='block'
                        >
                          <img
                            src={resolveUploadUrl(m.actaFotoUrl)}
                            alt='Foto de acta'
                            className='w-full h-24 object-cover rounded-md border hover:opacity-80 transition-opacity cursor-zoom-in'
                          />
                        </button>
                      ) : (
                        <div className='w-full h-24 flex flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground'>
                          <ImageOff className='h-4 w-4' />
                          <span className='text-[10px]'>Sin foto de acta</span>
                        </div>
                      )}
                      {m.pizarraFotoUrl ? (
                        <button
                          type='button'
                          onClick={() =>
                            setImagenAmpliada({
                              url: resolveUploadUrl(m.pizarraFotoUrl)!,
                              titulo: `Foto de Pizarra — ${m.codigo}`,
                            })
                          }
                          className='block'
                        >
                          <img
                            src={resolveUploadUrl(m.pizarraFotoUrl)}
                            alt='Foto de pizarra'
                            className='w-full h-24 object-cover rounded-md border hover:opacity-80 transition-opacity cursor-zoom-in'
                          />
                        </button>
                      ) : (
                        <div className='w-full h-24 flex flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground'>
                          <ImageOff className='h-4 w-4' />
                          <span className='text-[10px]'>Sin foto de pizarra</span>
                        </div>
                      )}
                    </div>

                    {(esAprobada || esRechazada) && (
                      <div className='p-2 rounded-lg bg-muted/40 border text-[11px] space-y-0.5'>
                        <p className='text-muted-foreground'>
                          Revisado por <strong className='text-foreground'>{m.revisadoPorNombre ?? '—'}</strong>
                        </p>
                        {m.revisionComentario && (
                          <p className='flex items-start gap-1 text-foreground'>
                            <MessageSquareWarning className='h-3.5 w-3.5 shrink-0 mt-0.5 text-destructive' />
                            {m.revisionComentario}
                          </p>
                        )}
                      </div>
                    )}

                    {esPendiente && (
                      <div className='flex items-center gap-2 pt-1'>
                        <Button
                          onClick={() => handleAprobar(m)}
                          disabled={revisarMutation.isPending}
                          className='flex-1 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white'
                        >
                          <CheckCircle2 className='h-3.5 w-3.5' /> Aprobar
                        </Button>
                        <Button
                          onClick={() => handleAbrirRechazo(m)}
                          disabled={revisarMutation.isPending}
                          variant='destructive'
                          className='flex-1 text-xs font-bold gap-1.5'
                        >
                          <XCircle className='h-3.5 w-3.5' /> Rechazar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className='p-12 text-center border border-dashed rounded-xl bg-card space-y-3'>
            <ShieldCheck className='h-12 w-12 text-muted-foreground mx-auto opacity-50' />
            <h3 className='text-lg font-bold text-foreground'>Sin mesas en este filtro</h3>
            <p className='text-xs text-muted-foreground max-w-sm mx-auto'>
              {isAdmin
                ? 'No hay mesas de control de calidad que coincidan con el filtro seleccionado.'
                : 'No tienes mesas asignadas en este estado por el momento.'}
            </p>
          </div>
        )}
      </Main>

      <ConfirmDialog
        open={!!mesaARechazar}
        onOpenChange={(o) => {
          if (!o) {
            setMesaARechazar(null)
            setComentarioRechazo('')
          }
        }}
        form='rechazar-mesa-form'
        disabled={!comentarioRechazo.trim()}
        isLoading={revisarMutation.isPending}
        title={
          <span className='text-destructive'>
            <XCircle className='me-1 inline-block' size={18} />
            Rechazar {mesaARechazar?.codigo}
          </span>
        }
        desc={
          <form
            id='rechazar-mesa-form'
            onSubmit={(e) => {
              e.preventDefault()
              handleConfirmarRechazo()
            }}
            className='space-y-3'
          >
            <p>
              La mesa volverá al transcriptor asignado para que la corrija. Indique qué
              está mal (foto ilegible, número que no coincide, etc.):
            </p>
            <Label className='flex flex-col items-start gap-1.5'>
              <span>Comentario para el transcriptor</span>
              <Textarea
                value={comentarioRechazo}
                onChange={(e) => setComentarioRechazo(e.target.value)}
                placeholder='Ej. El voto de Candidato X en la foto dice 15, no 5.'
                autoFocus
                className='h-24'
              />
            </Label>
          </form>
        }
        confirmText='Rechazar Mesa'
        destructive
      />

      <Dialog open={!!imagenAmpliada} onOpenChange={(o) => !o && setImagenAmpliada(null)}>
        <DialogContent className='sm:max-w-3xl p-2'>
          <DialogTitle className='sr-only'>{imagenAmpliada?.titulo}</DialogTitle>
          {imagenAmpliada && (
            <img
              src={imagenAmpliada.url}
              alt={imagenAmpliada.titulo}
              className='w-full max-h-[80vh] object-contain rounded-md'
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
