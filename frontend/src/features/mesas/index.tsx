import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LiveStatusBadge } from '@/components/live-status-badge'
import { useElectionStore } from '@/stores/election-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  Stethoscope,
  Scale,
  Laptop,
  Sprout,
  Calculator,
  TrendingUp,
  Smile,
  Award,
  FilterX,
  Building2,
  Plus,
  Phone,
  UserCheck,
  MessageSquare,
} from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Base Faculties list
const FACULTADES_PREDEFINIDAS = [
  { id: 'medicina', nombre: 'Facultad de Medicina', keyword: 'Medicina', icon: Stethoscope, color: 'text-rose-500 bg-rose-500/10 border-rose-500/30' },
  { id: 'derecho', nombre: 'Facultad de Derecho', keyword: 'Derecho', icon: Scale, color: 'text-amber-600 bg-amber-500/10 border-amber-500/30' },
  { id: 'tecnologia', nombre: 'Facultad de Tecnología', keyword: 'Tecnología', icon: Laptop, color: 'text-blue-500 bg-blue-500/10 border-blue-500/30' },
  { id: 'agrarias', nombre: 'Ciencias Agrarias', keyword: 'Agrarias', icon: Sprout, color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30' },
  { id: 'contaduria', nombre: 'Contaduría Pública', keyword: 'Contaduría', icon: Calculator, color: 'text-cyan-600 bg-cyan-500/10 border-cyan-500/30' },
  { id: 'economia', nombre: 'Ciencias Económicas', keyword: 'Economía', icon: TrendingUp, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30' },
  { id: 'odontologia', nombre: 'Facultad de Odontología', keyword: 'Odontología', icon: Smile, color: 'text-teal-600 bg-teal-500/10 border-teal-500/30' },
  { id: 'docentes', nombre: 'Mesa Docentes USFX', keyword: 'Docente', icon: Award, color: 'text-purple-600 bg-purple-500/10 border-purple-500/30' },
]

// Schemas
const crearMesaSchema = z.object({
  codigo: z.string().min(1, 'El código de mesa es requerido'),
  facultad: z.string().min(1, 'La facultad es requerida'),
  tipo: z.enum(['ESTUDIANTIL', 'DOCENTE']),
  transcriptor: z.string().optional(),
})

const crearFacultadSchema = z.object({
  nombre: z.string().min(1, 'El nombre de la facultad es requerido'),
})

const cargarMesaSchema = z.object({
  mesaId: z.string().min(1, 'Seleccione una mesa'),
  votosYamile: z.coerce.number().min(0, 'Cantidad no válida'),
  votosMendoza: z.coerce.number().min(0, 'Cantidad no válida'),
  votosSoliz: z.coerce.number().min(0, 'Cantidad no válida'),
  votosBlanco: z.coerce.number().min(0, 'Cantidad no válida'),
  observaciones: z.string().optional(),
})

export function MesasFeature() {
  const { ultimasMesas, asignaciones, facultadesCustom, crearMesa, crearFacultad, cargarNuevaMesa } = useElectionStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFacultad, setSelectedFacultad] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('TODOS')

  // Modals
  const [openCrearMesaModal, setOpenCrearMesaModal] = useState(false)
  const [openCrearFacultadModal, setOpenCrearFacultadModal] = useState(false)
  const [openTranscribirModal, setOpenTranscribirModal] = useState(false)
  const [actaFileName, setActaFileName] = useState<string | null>(null)

  // Forms
  const crearMesaForm = useForm<z.infer<typeof crearMesaSchema>>({
    resolver: zodResolver(crearMesaSchema),
    defaultValues: {
      codigo: '',
      facultad: 'Facultad de Medicina',
      tipo: 'ESTUDIANTIL',
      transcriptor: 'Juan Carlos Pérez',
    },
  })

  const crearFacultadForm = useForm<z.infer<typeof crearFacultadSchema>>({
    resolver: zodResolver(crearFacultadSchema),
    defaultValues: {
      nombre: '',
    },
  })

  const cargarMesaForm = useForm<z.infer<typeof cargarMesaSchema>>({
    resolver: zodResolver(cargarMesaSchema) as any,
    defaultValues: {
      mesaId: '',
      votosYamile: 0,
      votosMendoza: 0,
      votosSoliz: 0,
      votosBlanco: 0,
      observaciones: '',
    },
  })

  // Combine predefined and custom faculties
  const todasLasFacultades = [
    ...FACULTADES_PREDEFINIDAS,
    ...facultadesCustom.map((f) => ({
      id: f.id,
      nombre: f.nombre,
      keyword: f.keyword,
      icon: Building2,
      color: 'text-primary bg-primary/10 border-primary/30',
    })),
  ]

  const filteredMesas = ultimasMesas.filter((m) => {
    const matchesSearch =
      m.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.facultad.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFacultad = selectedFacultad
      ? m.facultad.toLowerCase().includes(selectedFacultad.toLowerCase())
      : true

    const matchesStatus = statusFilter === 'TODOS' || m.estado === statusFilter
    return matchesSearch && matchesFacultad && matchesStatus
  })

  // Selected faculty mesas & delegados
  const mesasDeFacultadSeleccionada = selectedFacultad
    ? ultimasMesas.filter((m) => m.facultad.toLowerCase().includes(selectedFacultad.toLowerCase()))
    : []

  const onCrearMesaSubmit = (values: z.infer<typeof crearMesaSchema>) => {
    crearMesa({
      codigo: values.codigo,
      facultad: values.facultad,
      tipo: values.tipo,
      transcriptor: values.transcriptor || 'Sin Asignar',
    })
    toast.success(`Mesa ${values.codigo} registrada correctamente en ${values.facultad}`)
    setOpenCrearMesaModal(false)
    crearMesaForm.reset()
  }

  const onCrearFacultadSubmit = (values: z.infer<typeof crearFacultadSchema>) => {
    crearFacultad(values.nombre)
    toast.success(`Facultad "${values.nombre}" agregada al Mapa Electoral`)
    setOpenCrearFacultadModal(false)
    crearFacultadForm.reset()
  }

  const onCargarMesaSubmit = (values: z.infer<typeof cargarMesaSchema>) => {
    const mesaSeleccionada = ultimasMesas.find((m) => m.id === values.mesaId)
    const padronMax = 300
    const sumaTotal =
      values.votosYamile + values.votosMendoza + values.votosSoliz + values.votosBlanco

    if (sumaTotal > padronMax) {
      toast.error(
        `La suma de votos (${sumaTotal}) excede el padrón total de la mesa (${padronMax})`
      )
      return
    }

    const votosMap: Record<string, number> = {
      c1: values.votosYamile,
      c2: values.votosMendoza,
      c3: values.votosSoliz,
      c4: values.votosBlanco,
    }

    cargarNuevaMesa(
      {
        id: values.mesaId,
        codigo: mesaSeleccionada?.codigo || 'MESA-NUEVA',
        facultad: mesaSeleccionada?.facultad || 'Facultad General',
        tipo: mesaSeleccionada?.tipo || 'ESTUDIANTIL',
        ponderacion: mesaSeleccionada?.ponderacion || 1,
        transcriptor: 'Transcriptor Actual',
        hora: new Date().toLocaleTimeString(),
        estado: 'CARGADA',
        votosRegistrados: sumaTotal,
      },
      votosMap
    )

    toast.success(`Acta de ${mesaSeleccionada?.codigo || ''} transmitida exitosamente`)
    setOpenTranscribirModal(false)
    cargarMesaForm.reset()
    setActaFileName(null)
  }

  return (
    <>
      <Header>
        <div className='flex items-center gap-3 me-auto'>
          <Vote className='h-5 w-5 text-primary' />
          <h1 className='text-base font-bold tracking-tight'>Gestión y Mapa de Mesas por Facultad</h1>
        </div>
        <div className='flex items-center gap-3'>
          <LiveStatusBadge />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='space-y-6 p-4 sm:p-6'>
        {/* Top Header Actions */}
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

            <Button onClick={() => setOpenTranscribirModal(true)} className='font-semibold gap-1.5 shadow-sm text-xs'>
              <FileText className='h-4 w-4' /> Transcribir Votos / Acta
            </Button>
          </div>
        </div>

        {/* MAPA VISUAL DE FACULTADES USFX (Sin cortes '...' y con tarjetas amplias) */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <p className='text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2'>
              <Building2 className='h-4 w-4 text-primary' /> Mapa Electoral por Facultades
            </p>
            {selectedFacultad && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setSelectedFacultad(null)}
                className='h-7 text-xs text-primary font-bold gap-1 hover:bg-primary/10'
              >
                <FilterX className='h-3.5 w-3.5' /> Ver Todas las Facultades
              </Button>
            )}
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {todasLasFacultades.map((fac) => {
              const IconComponent = fac.icon
              const countMesas = ultimasMesas.filter((m) =>
                m.facultad.toLowerCase().includes(fac.keyword.toLowerCase())
              ).length
              const countCargadas = ultimasMesas.filter(
                (m) =>
                  m.facultad.toLowerCase().includes(fac.keyword.toLowerCase()) &&
                  m.estado === 'CARGADA'
              ).length

              const isSelected = selectedFacultad === fac.keyword
              const pct = countMesas > 0 ? Math.round((countCargadas / countMesas) * 100) : 0

              return (
                <Card
                  key={fac.id}
                  onClick={() => setSelectedFacultad(isSelected ? null : fac.keyword)}
                  className={`cursor-pointer transition-all hover:shadow-lg relative overflow-hidden ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/40 bg-primary/5 shadow-md'
                      : 'border-border/60 hover:border-primary/40 bg-card'
                  }`}
                >
                  <CardContent className='p-4 space-y-3'>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex items-center gap-3'>
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center border shrink-0 ${fac.color}`}>
                          <IconComponent className='h-5 w-5' />
                        </div>
                        <div className='space-y-0.5 min-w-0'>
                          {/* Full name without truncation */}
                          <h3 className='text-xs font-extrabold text-foreground leading-snug break-words'>
                            {fac.nombre}
                          </h3>
                          <p className='text-[11px] text-muted-foreground font-medium'>
                            {countMesas > 0 ? `${countMesas} mesas habilitadas` : 'Sin mesas regist.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center justify-between pt-2 border-t border-border/40 text-xs'>
                      <div className='flex items-center gap-1.5'>
                        <span className='text-[11px] font-semibold text-muted-foreground'>Progreso:</span>
                        <span className='text-[11px] font-mono font-bold text-foreground'>{countCargadas}/{countMesas}</span>
                      </div>

                      {countMesas > 0 ? (
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

                    {/* Progress Bar Visual Line */}
                    {countMesas > 0 && (
                      <div className='w-full bg-muted/60 h-1.5 rounded-full overflow-hidden'>
                        <div
                          className={`h-full transition-all duration-500 ${
                            pct === 100
                              ? 'bg-emerald-500'
                              : pct > 0
                                ? 'bg-amber-500'
                                : 'bg-transparent'
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
        </div>

        {/* DETALLE VISUAL DE MESAS Y DELEGADOS SI HAY UNA FACULTAD SELECCIONADA */}
        {selectedFacultad && (
          <div className='p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-base font-extrabold text-foreground flex items-center gap-2'>
                  <Building2 className='h-5 w-5 text-primary' />
                  Desglose de Mesas y Delegados en: <span className='text-primary underline'>{selectedFacultad}</span>
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
                    <p className='text-muted-foreground'>Transcriptor: <strong className='text-foreground'>{m.transcriptor}</strong></p>
                    <p className='text-muted-foreground'>Estado: <strong className='text-emerald-600 font-bold'>{m.estado}</strong></p>
                  </div>

                  {/* Delegado Card */}
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
            <div className='rounded-md border overflow-x-auto'>
              <Table>
                <TableHeader className='bg-muted/40'>
                  <TableRow>
                    <TableHead className='font-semibold text-xs py-3 w-[120px]'>Código Mesa</TableHead>
                    <TableHead className='font-semibold text-xs py-3 w-[220px]'>Facultad / Ubicación</TableHead>
                    <TableHead className='font-semibold text-xs py-3 w-[120px]'>Tipo Sector</TableHead>
                    <TableHead className='font-semibold text-xs py-3 w-[180px]'>Transcriptor Encargado</TableHead>
                    <TableHead className='font-semibold text-xs py-3 text-center w-[120px]'>Votos Registrados</TableHead>
                    <TableHead className='font-semibold text-xs py-3 text-center w-[110px]'>Última Act.</TableHead>
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
                      <TableCell className='text-xs text-muted-foreground py-3'>{m.facultad}</TableCell>
                      <TableCell className='text-xs py-3'>
                        {m.tipo === 'DOCENTE' ? (
                          <Badge className='bg-purple-600 text-white font-bold text-[10px]'>
                            Docente (x45)
                          </Badge>
                        ) : (
                          <Badge variant='outline' className='text-[10px] font-semibold'>
                            Estudiantil (x1)
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className='text-xs font-medium text-foreground py-3'>{m.transcriptor}</TableCell>
                      <TableCell className='text-xs text-center font-bold text-primary py-3'>
                        {m.votosRegistrados ? m.votosRegistrados : '—'}
                      </TableCell>
                      <TableCell className='text-xs text-center font-mono text-muted-foreground py-3'>
                        {m.hora}
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
              <Input placeholder='Ej. MESA-04, MESA-DOC-02' {...crearMesaForm.register('codigo')} className='text-xs font-mono' />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Facultad Asignada *</Label>
              <Select
                value={crearMesaForm.watch('facultad')}
                onValueChange={(val) => crearMesaForm.setValue('facultad', val)}
              >
                <SelectTrigger className='text-xs'>
                  <SelectValue placeholder='Seleccione facultad...' />
                </SelectTrigger>
                <SelectContent>
                  {todasLasFacultades.map((f) => (
                    <SelectItem key={f.id} value={f.nombre} className='text-xs'>
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
                onValueChange={(val) => crearMesaForm.setValue('tipo', val as any)}
              >
                <SelectTrigger className='text-xs'>
                  <SelectValue placeholder='Seleccione tipo sector...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ESTUDIANTIL' className='text-xs'>
                    Mesa Estudiantil (Ponderación 1)
                  </SelectItem>
                  <SelectItem value='DOCENTE' className='text-xs font-bold text-purple-600'>
                    Mesa Docente (Ponderación 45)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Transcriptor Encargado</Label>
              <Input placeholder='Ej. Juan Carlos Pérez' {...crearMesaForm.register('transcriptor')} className='text-xs' />
            </div>

            <DialogFooter className='pt-2'>
              <Button type='button' variant='outline' onClick={() => setOpenCrearMesaModal(false)} className='text-xs'>
                Cancelar
              </Button>
              <Button type='submit' className='text-xs font-bold'>
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
              <Button type='submit' className='text-xs font-bold'>
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

          <form onSubmit={cargarMesaForm.handleSubmit(onCargarMesaSubmit)} className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Seleccionar Mesa</Label>
              <Select onValueChange={(val) => cargarMesaForm.setValue('mesaId', val)}>
                <SelectTrigger className='text-xs'>
                  <SelectValue placeholder='Seleccione la mesa a procesar...' />
                </SelectTrigger>
                <SelectContent>
                  {ultimasMesas.map((m) => (
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
                <div className='space-y-1'>
                  <Label className='text-[11px] text-muted-foreground'>Yamile Hayes Michel</Label>
                  <Input
                    type='number'
                    min={0}
                    {...cargarMesaForm.register('votosYamile')}
                    className='text-xs font-bold text-primary'
                  />
                </div>

                <div className='space-y-1'>
                  <Label className='text-[11px] text-muted-foreground'>Dr. Roberto Mendoza</Label>
                  <Input
                    type='number'
                    min={0}
                    {...cargarMesaForm.register('votosMendoza')}
                    className='text-xs font-bold'
                  />
                </div>

                <div className='space-y-1'>
                  <Label className='text-[11px] text-muted-foreground'>Dra. Patricia Soliz</Label>
                  <Input
                    type='number'
                    min={0}
                    {...cargarMesaForm.register('votosSoliz')}
                    className='text-xs font-bold'
                  />
                </div>

                <div className='space-y-1'>
                  <Label className='text-[11px] text-muted-foreground'>Blancos / Nulos</Label>
                  <Input
                    type='number'
                    min={0}
                    {...cargarMesaForm.register('votosBlanco')}
                    className='text-xs font-bold'
                  />
                </div>
              </div>
            </div>

            {/* Photo Upload simulation */}
            <div className='space-y-1.5 pt-2 border-t border-border/50'>
              <Label className='text-xs font-semibold flex items-center justify-between'>
                <span>Foto digital del Acta (Obligatorio)</span>
                {actaFileName && (
                  <span className='text-[10px] text-emerald-600 font-bold'>✓ Cargada</span>
                )}
              </Label>
              <div className='border-2 border-dashed border-border rounded-lg p-4 text-center bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer'>
                <input
                  type='file'
                  accept='image/*'
                  className='hidden'
                  id='acta-file-input'
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setActaFileName(e.target.files[0].name)
                      toast.info(`Archivo ${e.target.files[0].name} adjuntado`)
                    }
                  }}
                />
                <label htmlFor='acta-file-input' className='cursor-pointer flex flex-col items-center gap-1'>
                  <Upload className='h-5 w-5 text-primary' />
                  <span className='text-xs font-medium text-foreground'>
                    {actaFileName ? actaFileName : 'Haga clic para subir foto del acta'}
                  </span>
                  <span className='text-[10px] text-muted-foreground'>Formatos permitidos: JPG, PNG, WEBP</span>
                </label>
              </div>
            </div>

            <DialogFooter className='pt-2'>
              <Button type='button' variant='outline' onClick={() => setOpenTranscribirModal(false)} className='text-xs'>
                Cancelar
              </Button>
              <Button type='submit' className='text-xs font-bold'>
                Transmitir Votos
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
