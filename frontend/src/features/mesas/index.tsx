import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { facultadesApi } from '@/lib/api/facultades'
import { mesasApi } from '@/lib/api/mesas'
import { candidatosApi } from '@/lib/api/candidatos'
import { usersApi } from '@/lib/api/users'
import { actasApi } from '@/lib/api/actas'
import type { TipoMesa } from '@/lib/api/types'
import { handleServerError } from '@/lib/handle-server-error'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LiveStatusBadge } from '@/components/live-status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Search,
  PlusCircle,
  Vote,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Lock,
  FilterX,
  Building2,
  Plus,
  UserCheck,
  MessageSquare,
} from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const crearMesaSchema = z.object({
  codigo: z.string().min(1, 'El código de mesa es requerido'),
  facultadId: z.string().min(1, 'La facultad es requerida'),
  tipo: z.enum(['ESTUDIANTIL', 'DOCENTE']),
  transcriptorId: z.string().optional(),
})

const crearFacultadSchema = z.object({
  nombre: z.string().min(1, 'El nombre de la facultad es requerido'),
})

export function MesasFeature() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFacultadId, setSelectedFacultadId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('TODOS')

  // Modals
  const [openCrearMesaModal, setOpenCrearMesaModal] = useState(false)
  const [openCrearFacultadModal, setOpenCrearFacultadModal] = useState(false)
  const [openTranscribirModal, setOpenTranscribirModal] = useState(false)
  const [mesaATranscribirId, setMesaATranscribirId] = useState('')
  const [votosMap, setVotosMap] = useState<Record<string, number>>({})
  const [actaFile, setActaFile] = useState<File | null>(null)
  const [viendoContacto, setViendoContacto] = useState<{
    titulo: string
    nombre: string
    celular: string | null
  } | null>(null)

  const { data: facultades = [], isPending: facultadesPending } = useQuery({
    queryKey: ['facultades'],
    queryFn: facultadesApi.list,
  })
  const { data: mesas = [], isPending: mesasPending } = useQuery({
    queryKey: ['mesas'],
    queryFn: () => mesasApi.list(),
  })
  const { data: candidatos = [] } = useQuery({
    queryKey: ['candidatos'],
    queryFn: () => candidatosApi.list(),
  })
  const { data: transcriptores = [] } = useQuery({
    queryKey: ['transcriptores'],
    queryFn: usersApi.transcriptores,
  })

  const crearMesaForm = useForm<z.infer<typeof crearMesaSchema>>({
    resolver: zodResolver(crearMesaSchema),
    defaultValues: { codigo: '', facultadId: '', tipo: 'ESTUDIANTIL', transcriptorId: '' },
  })

  const crearFacultadForm = useForm<z.infer<typeof crearFacultadSchema>>({
    resolver: zodResolver(crearFacultadSchema),
    defaultValues: { nombre: '' },
  })

  const crearFacultadMutation = useMutation({
    mutationFn: facultadesApi.create,
    onSuccess: (facultad) => {
      queryClient.invalidateQueries({ queryKey: ['facultades'] })
      toast.success(`Facultad "${facultad.nombre}" agregada al Mapa Electoral`)
      setOpenCrearFacultadModal(false)
      crearFacultadForm.reset()
    },
    onError: handleServerError,
  })

  const crearMesaMutation = useMutation({
    mutationFn: mesasApi.create,
    onSuccess: (mesa) => {
      queryClient.invalidateQueries({ queryKey: ['mesas'] })
      queryClient.invalidateQueries({ queryKey: ['facultades'] })
      toast.success(`Mesa ${mesa.codigo} registrada correctamente`)
      setOpenCrearMesaModal(false)
      crearMesaForm.reset()
    },
    onError: handleServerError,
  })

  const transcribirMutation = useMutation({
    mutationFn: async () => {
      let actaFotoUrl: string | undefined
      if (actaFile) actaFotoUrl = await actasApi.upload(actaFile)
      return mesasApi.transcribir(mesaATranscribirId, {
        votos: Object.entries(votosMap).map(([candidatoId, cantidad]) => ({ candidatoId, cantidad })),
        actaFotoUrl,
      })
    },
    onSuccess: (mesa) => {
      queryClient.invalidateQueries({ queryKey: ['mesas'] })
      queryClient.invalidateQueries({ queryKey: ['facultades'] })
      queryClient.invalidateQueries({ queryKey: ['resultados'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(`Acta de ${mesa.codigo} transmitida exitosamente`)
      setOpenTranscribirModal(false)
      setActaFile(null)
    },
    onError: handleServerError,
  })

  const filteredMesas = mesas.filter((m) => {
    const matchesSearch =
      m.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.facultad.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFacultad = selectedFacultadId ? m.facultadId === selectedFacultadId : true
    const matchesStatus = statusFilter === 'TODOS' || m.estado === statusFilter
    return matchesSearch && matchesFacultad && matchesStatus
  })

  const mesasDeFacultadSeleccionada = selectedFacultadId
    ? mesas.filter((m) => m.facultadId === selectedFacultadId)
    : []
  const facultadSeleccionada = facultades.find((f) => f.id === selectedFacultadId)

  const onCrearMesaSubmit = (values: z.infer<typeof crearMesaSchema>) => {
    crearMesaMutation.mutate({
      codigo: values.codigo,
      facultadId: values.facultadId,
      tipo: values.tipo as TipoMesa,
      transcriptorId: values.transcriptorId || undefined,
    })
  }

  const onCrearFacultadSubmit = (values: z.infer<typeof crearFacultadSchema>) => {
    crearFacultadMutation.mutate({ nombre: values.nombre })
  }

  const handleOpenTranscribir = () => {
    const initial: Record<string, number> = {}
    candidatos.forEach((c) => (initial[c.id] = 0))
    setVotosMap(initial)
    setMesaATranscribirId('')
    setActaFile(null)
    setOpenTranscribirModal(true)
  }

  const mesaSeleccionadaParaTranscribir = mesas.find((m) => m.id === mesaATranscribirId)
  const sumaVotos = Object.values(votosMap).reduce((a, b) => a + (b || 0), 0)

  const onSubmitTranscribir = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mesaATranscribirId) {
      toast.error('Seleccione una mesa a transcribir')
      return
    }
    const padron = mesaSeleccionadaParaTranscribir?.totalPadron ?? 0
    if (padron > 0 && sumaVotos > padron) {
      toast.error(`La suma de votos (${sumaVotos}) excede el padrón de la mesa (${padron})`)
      return
    }
    transcribirMutation.mutate()
  }

  return (
    <>
      <Header>
        <div className='flex items-center gap-3 me-auto min-w-0'>
          <Vote className='h-5 w-5 text-primary shrink-0' />
          <h1 className='text-base font-bold tracking-tight truncate min-w-0'>Gestión y Mapa de Mesas por Facultad</h1>
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
            <h2 className='text-2xl font-bold tracking-tight'>Mesas Electorales USFX</h2>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Creación de facultades, registro de mesas y mapa visual de delegados asignados.
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            <Button
              onClick={() => setOpenCrearFacultadModal(true)}
              variant='outline'
              className='font-semibold gap-1.5 text-xs'
            >
              <Plus className='h-4 w-4 text-primary' /> Crear Nueva Facultad
            </Button>

            <Button
              onClick={() => setOpenCrearMesaModal(true)}
              variant='outline'
              className='font-semibold gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/5'
            >
              <PlusCircle className='h-4 w-4' /> Registrar Nueva Mesa
            </Button>

            <Button onClick={handleOpenTranscribir} className='font-semibold gap-1.5 shadow-sm text-xs'>
              <FileText className='h-4 w-4' /> Transcribir Votos / Acta
            </Button>
          </div>
        </div>

        {/* MAPA VISUAL DE FACULTADES USFX */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <p className='text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2'>
              <Building2 className='h-4 w-4 text-primary' /> Mapa Electoral por Facultades
            </p>
            {selectedFacultadId && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setSelectedFacultadId(null)}
                className='h-7 text-xs text-primary font-bold gap-1 hover:bg-primary/10'
              >
                <FilterX className='h-3.5 w-3.5' /> Ver Todas las Facultades
              </Button>
            )}
          </div>

          {facultadesPending ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className='h-32 w-full' />
              ))}
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {facultades.map((fac) => {
                const isSelected = selectedFacultadId === fac.id
                const pct = fac.porcentajeCompletado

                return (
                  <Card
                    key={fac.id}
                    onClick={() => setSelectedFacultadId(isSelected ? null : fac.id)}
                    className={`cursor-pointer transition-all hover:shadow-lg relative overflow-hidden ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/40 bg-primary/5 shadow-md'
                        : 'border-border/60 hover:border-primary/40 bg-card'
                    }`}
                  >
                    <CardContent className='p-4 space-y-3'>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='flex items-center gap-3'>
                          <div className='h-10 w-10 rounded-xl flex items-center justify-center border shrink-0 text-primary bg-primary/10 border-primary/30'>
                            <Building2 className='h-5 w-5' />
                          </div>
                          <div className='space-y-0.5 min-w-0'>
                            <h3 className='text-xs font-extrabold text-foreground leading-snug break-words'>
                              {fac.nombre}
                            </h3>
                            <p className='text-[11px] text-muted-foreground font-medium'>
                              {fac.totalMesas > 0 ? `${fac.totalMesas} mesas habilitadas` : 'Sin mesas regist.'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center justify-between pt-2 border-t border-border/40 text-xs'>
                        <div className='flex items-center gap-1.5'>
                          <span className='text-[11px] font-semibold text-muted-foreground'>Progreso:</span>
                          <span className='text-[11px] font-mono font-bold text-foreground'>{fac.mesasCargadas}/{fac.totalMesas}</span>
                        </div>

                        {fac.totalMesas > 0 ? (
                          <Badge
                            variant='outline'
                            className={`text-[10px] font-black px-2 py-0.5 shadow-xs ${
                              pct === 100
                                ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse'
                                : pct > 0
                                  ? 'bg-amber-500 text-white border-amber-500'
                                  : 'bg-slate-500/10 text-slate-500 border-slate-500/30'
                            }`}
                          >
                            {pct === 100 ? '100% COMPLETADO' : `${pct}% PROCESADO`}
                          </Badge>
                        ) : (
                          <Badge variant='outline' className='text-[10px] text-muted-foreground'>
                            0%
                          </Badge>
                        )}
                      </div>

                      {fac.totalMesas > 0 && (
                        <div className='w-full bg-muted/60 h-1.5 rounded-full overflow-hidden'>
                          <div
                            className={`h-full transition-all duration-500 ${
                              pct === 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-amber-500' : 'bg-transparent'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* DETALLE VISUAL DE MESAS Y DELEGADOS SI HAY UNA FACULTAD SELECCIONADA */}
        {selectedFacultadId && facultadSeleccionada && (
          <div className='p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-base font-extrabold text-foreground flex items-center gap-2'>
                  <Building2 className='h-5 w-5 text-primary' />
                  Desglose de Mesas y Delegados en: <span className='text-primary underline'>{facultadSeleccionada.nombre}</span>
                </h3>
                <p className='text-xs text-muted-foreground pt-0.5'>
                  {mesasDeFacultadSeleccionada.length} mesas asociadas a esta facultad con sus delegados de contacto directo.
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {mesasDeFacultadSeleccionada.map((m) => (
                <div key={m.id} className='p-3.5 rounded-lg bg-card border border-border/60 space-y-3 shadow-xs'>
                  <div className='flex items-center justify-between border-b pb-2'>
                    <Badge variant='outline' className='font-mono font-bold text-xs bg-primary/10 text-primary border-primary/30'>
                      {m.codigo}
                    </Badge>
                    <Badge variant='outline' className='text-[10px] font-bold'>
                      {m.tipo}
                    </Badge>
                  </div>

                  <div className='text-xs space-y-1'>
                    <p className='text-muted-foreground'>Transcriptor: <strong className='text-foreground'>{m.transcriptorNombre ?? 'Sin asignar'}</strong></p>
                    <p className='text-muted-foreground'>Estado: <strong className='text-emerald-600 font-bold'>{m.estado}</strong></p>
                  </div>

                  {m.delegadoNombre ? (
                    <div className='p-2.5 rounded bg-muted/40 border flex items-center justify-between text-xs'>
                      <div>
                        <p className='text-[10px] font-bold uppercase text-muted-foreground'>Delegado de Mesa</p>
                        <p className='font-bold text-foreground flex items-center gap-1'>
                          <UserCheck className='h-3.5 w-3.5 text-primary' /> {m.delegadoNombre}
                        </p>
                        <p className='text-[11px] font-mono text-muted-foreground'>+591 {m.delegadoCelular}</p>
                      </div>
                      {m.delegadoCelular && (
                        <a
                          href={`https://wa.me/591${m.delegadoCelular}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='p-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors'
                          title='Chat de WhatsApp'
                        >
                          <MessageSquare className='h-4 w-4' />
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className='text-[11px] italic text-muted-foreground pt-1'>Sin delegado asignado a esta mesa</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TABLA COMPLETA DE MESAS */}
        <Card className='border-border/60 shadow-sm'>
          <CardHeader className='pb-4'>
            <div className='flex flex-col sm:flex-row items-center justify-between gap-3'>
              <div className='relative w-full sm:w-72'>
                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Buscar por mesa o facultad...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-9 text-xs'
                />
              </div>

              <div className='flex items-center gap-2 w-full sm:w-auto'>
                <Label className='text-xs text-muted-foreground whitespace-nowrap'>Estado:</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-36 text-xs h-9'>
                    <SelectValue placeholder='Todos' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='TODOS'>Todos los estados</SelectItem>
                    <SelectItem value='CARGADA'>Cargada</SelectItem>
                    <SelectItem value='EN_CARGA'>En Edición</SelectItem>
                    <SelectItem value='PENDIENTE'>Pendiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {mesasPending ? (
              <Skeleton className='h-64 w-full' />
            ) : (
              <div className='rounded-md border overflow-x-auto'>
                <Table>
                  <TableHeader className='bg-muted/40'>
                    <TableRow>
                      <TableHead className='font-semibold text-xs py-3 w-[110px]'>Código Mesa</TableHead>
                      <TableHead className='font-semibold text-xs py-3 w-[140px]'>Facultad</TableHead>
                      <TableHead className='font-semibold text-xs py-3 w-[170px]'>Delegado</TableHead>
                      <TableHead className='font-semibold text-xs py-3 w-[170px]'>Transcriptor Encargado</TableHead>
                      <TableHead className='font-semibold text-xs py-3 text-center w-[110px]'>Votos Registrados</TableHead>
                      <TableHead className='font-semibold text-xs py-3 text-center w-[100px]'>Última Act.</TableHead>
                      <TableHead className='font-semibold text-xs py-3 text-right w-[110px]'>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMesas.map((m) => (
                      <TableRow key={m.id} className='hover:bg-muted/30'>
                        <TableCell className='font-bold text-xs flex items-center gap-1.5 py-3'>
                          <Lock className='h-3.5 w-3.5 text-muted-foreground' />
                          {m.codigo}
                        </TableCell>
                        <TableCell className='text-xs text-muted-foreground py-3'>
                          <span className='block max-w-[120px] truncate' title={m.facultad}>
                            {m.facultad}
                          </span>
                        </TableCell>
                        <TableCell className='text-xs py-3'>
                          {m.delegadoNombre ? (
                            <div className='flex items-center gap-1'>
                              <span className='font-medium text-foreground truncate max-w-[100px]' title={m.delegadoNombre}>
                                {m.delegadoNombre}
                              </span>
                              <button
                                type='button'
                                onClick={() =>
                                  setViendoContacto({
                                    titulo: 'Delegado de Mesa',
                                    nombre: m.delegadoNombre!,
                                    celular: m.delegadoCelular,
                                  })
                                }
                                className='p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary shrink-0'
                                title='Ver datos del delegado'
                              >
                                <Search className='h-3.5 w-3.5' />
                              </button>
                              {m.delegadoCelular && (
                                <a
                                  href={`https://wa.me/591${m.delegadoCelular}`}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shrink-0'
                                  title='Chat de WhatsApp'
                                >
                                  <MessageSquare className='h-3.5 w-3.5' />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className='italic text-[11px] text-muted-foreground'>Sin delegado</span>
                          )}
                        </TableCell>
                        <TableCell className='text-xs font-medium text-foreground py-3'>
                          {m.transcriptorNombre ? (
                            <div className='flex items-center gap-1'>
                              <span className='truncate max-w-[130px]' title={m.transcriptorNombre}>
                                {m.transcriptorNombre}
                              </span>
                              <button
                                type='button'
                                onClick={() =>
                                  setViendoContacto({
                                    titulo: 'Transcriptor Encargado',
                                    nombre: m.transcriptorNombre!,
                                    celular: m.transcriptorTelefono,
                                  })
                                }
                                className='p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary shrink-0'
                                title='Ver datos del transcriptor'
                              >
                                <Search className='h-3.5 w-3.5' />
                              </button>
                            </div>
                          ) : (
                            'Sin asignar'
                          )}
                        </TableCell>
                        <TableCell className='text-xs text-center font-bold text-primary py-3'>
                          {m.votosRegistrados ? m.votosRegistrados : '—'}
                        </TableCell>
                        <TableCell className='text-xs text-center font-mono text-muted-foreground py-3'>
                          {new Date(m.updatedAt).toLocaleTimeString()}
                        </TableCell>
                        <TableCell className='text-right py-3'>
                          {m.estado === 'CARGADA' && (
                            <Badge variant='outline' className='bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] uppercase font-bold gap-1'>
                              <CheckCircle2 className='h-3 w-3' /> Cargada
                            </Badge>
                          )}
                          {m.estado === 'EN_CARGA' && (
                            <Badge variant='outline' className='bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px] uppercase font-bold gap-1 animate-pulse'>
                              <Clock className='h-3 w-3' /> En Edición
                            </Badge>
                          )}
                          {m.estado === 'PENDIENTE' && (
                            <Badge variant='outline' className='bg-slate-500/10 text-slate-500 border-slate-500/30 text-[10px] uppercase font-bold gap-1'>
                              <AlertCircle className='h-3 w-3' /> Pendiente
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </Main>

      {/* Modal 1: REGISTRAR NUEVA MESA */}
      <Dialog open={openCrearMesaModal} onOpenChange={setOpenCrearMesaModal}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold flex items-center gap-2'>
              <PlusCircle className='h-5 w-5 text-primary' />
              Registrar Nueva Mesa de Votación
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Cree una nueva mesa asignando código, facultad y sector (Estudiantil o Docente).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={crearMesaForm.handleSubmit(onCrearMesaSubmit)} className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Código de Mesa *</Label>
              <Input placeholder='Ej. MESA-96, MESA-DOC-02' {...crearMesaForm.register('codigo')} className='text-xs font-mono' />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Facultad Asignada *</Label>
              <Select
                value={crearMesaForm.watch('facultadId')}
                onValueChange={(val) => crearMesaForm.setValue('facultadId', val)}
              >
                <SelectTrigger className='text-xs'>
                  <SelectValue placeholder='Seleccione facultad...' />
                </SelectTrigger>
                <SelectContent>
                  {facultades.map((f) => (
                    <SelectItem key={f.id} value={f.id} className='text-xs'>
                      {f.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Tipo de Sector *</Label>
              <Select
                value={crearMesaForm.watch('tipo')}
                onValueChange={(val) => crearMesaForm.setValue('tipo', val as TipoMesa)}
              >
                <SelectTrigger className='text-xs'>
                  <SelectValue placeholder='Seleccione tipo sector...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ESTUDIANTIL' className='text-xs'>Mesa Estudiantil (Ponderación 1)</SelectItem>
                  <SelectItem value='DOCENTE' className='text-xs font-bold text-purple-600'>Mesa Docente (Ponderación 45)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Transcriptor Encargado</Label>
              <Select
                value={crearMesaForm.watch('transcriptorId') || 'SIN_ASIGNAR'}
                onValueChange={(val) => crearMesaForm.setValue('transcriptorId', val === 'SIN_ASIGNAR' ? '' : val)}
              >
                <SelectTrigger className='text-xs'>
                  <SelectValue placeholder='Seleccione transcriptor (opcional)...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='SIN_ASIGNAR' className='text-xs text-amber-600 font-bold'>-- Sin Asignar por Ahora --</SelectItem>
                  {transcriptores.map((t) => (
                    <SelectItem key={t.id} value={t.id} className='text-xs'>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className='pt-2'>
              <Button type='button' variant='outline' onClick={() => setOpenCrearMesaModal(false)} className='text-xs'>
                Cancelar
              </Button>
              <Button type='submit' disabled={crearMesaMutation.isPending} className='text-xs font-bold'>
                Crear Mesa
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 2: CREAR NUEVA FACULTAD */}
      <Dialog open={openCrearFacultadModal} onOpenChange={setOpenCrearFacultadModal}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold flex items-center gap-2'>
              <Building2 className='h-5 w-5 text-primary' />
              Registrar Nueva Facultad
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Agregue una nueva unidad académica al Mapa Electoral USFX.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={crearFacultadForm.handleSubmit(onCrearFacultadSubmit)} className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Nombre de la Facultad *</Label>
              <Input placeholder='Ej. Facultad de Arquitectura y Urbanismo' {...crearFacultadForm.register('nombre')} className='text-xs' />
            </div>

            <DialogFooter className='pt-2'>
              <Button type='button' variant='outline' onClick={() => setOpenCrearFacultadModal(false)} className='text-xs'>
                Cancelar
              </Button>
              <Button type='submit' disabled={crearFacultadMutation.isPending} className='text-xs font-bold'>
                Guardar Facultad
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 3: TRANSCRIBIR ACTA / VOTOS */}
      <Dialog open={openTranscribirModal} onOpenChange={setOpenTranscribirModal}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold flex items-center gap-2'>
              <FileText className='h-5 w-5 text-primary' />
              Transcripción de Acta de Mesa
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Ingrese los resultados del acta de escrutinio de la mesa seleccionada.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmitTranscribir} className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Seleccionar Mesa</Label>
              <Select value={mesaATranscribirId} onValueChange={setMesaATranscribirId}>
                <SelectTrigger className='text-xs'>
                  <SelectValue placeholder='Seleccione la mesa a procesar...' />
                </SelectTrigger>
                <SelectContent>
                  {mesas.map((m) => (
                    <SelectItem key={m.id} value={m.id} className='text-xs'>
                      {m.codigo} — {m.facultad} ({m.estado})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-3 pt-2 border-t border-border/50'>
              <Label className='text-xs font-semibold text-primary uppercase tracking-wider'>
                Desglose de Votos por Candidatura
              </Label>

              <div className='grid grid-cols-2 gap-3'>
                {candidatos.map((c) => (
                  <div key={c.id} className='space-y-1'>
                    <Label className='text-[11px] text-muted-foreground truncate block'>{c.nombre}</Label>
                    <Input
                      type='number'
                      min={0}
                      value={votosMap[c.id] ?? 0}
                      onChange={(e) =>
                        setVotosMap((prev) => ({ ...prev, [c.id]: Math.max(0, parseInt(e.target.value, 10) || 0) }))
                      }
                      className='text-xs font-bold'
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className='space-y-1.5 pt-2 border-t border-border/50'>
              <Label className='text-xs font-semibold flex items-center justify-between'>
                <span>Foto digital del Acta (Obligatorio)</span>
                {actaFile && <span className='text-[10px] text-emerald-600 font-bold'>✓ Cargada</span>}
              </Label>
              <div className='border-2 border-dashed border-border rounded-lg p-4 text-center bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer'>
                <input
                  type='file'
                  accept='image/*'
                  className='hidden'
                  id='acta-file-input'
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setActaFile(file)
                      toast.info(`Archivo ${file.name} adjuntado`)
                    }
                  }}
                />
                <label htmlFor='acta-file-input' className='cursor-pointer flex flex-col items-center gap-1'>
                  <Upload className='h-5 w-5 text-primary' />
                  <span className='text-xs font-medium text-foreground'>
                    {actaFile ? actaFile.name : 'Haga clic para subir foto del acta'}
                  </span>
                  <span className='text-[10px] text-muted-foreground'>Formatos permitidos: JPG, PNG, WEBP</span>
                </label>
              </div>
            </div>

            <DialogFooter className='pt-2'>
              <Button type='button' variant='outline' onClick={() => setOpenTranscribirModal(false)} className='text-xs'>
                Cancelar
              </Button>
              <Button type='submit' disabled={transcribirMutation.isPending} className='text-xs font-bold'>
                Transmitir Votos
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 4: VER DATOS DE DELEGADO / TRANSCRIPTOR */}
      <Dialog open={!!viendoContacto} onOpenChange={(open) => !open && setViendoContacto(null)}>
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold flex items-center gap-2'>
              <UserCheck className='h-5 w-5 text-primary' />
              {viendoContacto?.titulo}
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-3 py-2 text-xs'>
            <div>
              <p className='text-[11px] font-bold uppercase text-muted-foreground'>Nombre</p>
              <p className='font-bold text-foreground'>{viendoContacto?.nombre}</p>
            </div>
            <div>
              <p className='text-[11px] font-bold uppercase text-muted-foreground'>Celular</p>
              <p className='font-mono font-semibold text-foreground'>
                {viendoContacto?.celular ? `+591 ${viendoContacto.celular}` : 'Sin teléfono registrado'}
              </p>
            </div>
          </div>

          <DialogFooter className='pt-2'>
            <Button type='button' variant='outline' onClick={() => setViendoContacto(null)} className='text-xs'>
              Cerrar
            </Button>
            {viendoContacto?.celular && (
              <a
                href={`https://wa.me/591${viendoContacto.celular}`}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors'
              >
                <MessageSquare className='h-3.5 w-3.5' /> Chat de WhatsApp
              </a>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
