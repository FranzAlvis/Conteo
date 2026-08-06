import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LiveStatusBadge } from '@/components/live-status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  UserCheck,
  UserPlus,
  Search,
  Edit,
  Trash2,
  Phone,
  CreditCard,
  Vote,
  Printer,
  FileText,
  MessageSquare,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useElectionStore } from '@/stores/election-store'

export interface DelegadoItem {
  id: string
  nombre: string
  ci: string
  celular: string
  correo?: string
  mesaCodigo?: string
  transcriptorNombre?: string
  isActive: boolean
}

const initialDelegados: DelegadoItem[] = [
  {
    id: 'd1',
    nombre: 'Ana María Roca',
    ci: '8492019 CH',
    celular: '71234567',
    correo: 'ana.roca@usfx.edu.bo',
    mesaCodigo: 'MESA-01',
    transcriptorNombre: 'Juan Carlos Pérez',
    isActive: true,
  },
  {
    id: 'd2',
    nombre: 'Jorge Luis Gutiérrez',
    ci: '9210384 CH',
    celular: '68019283',
    correo: 'jorge.gutierrez@gmail.com',
    mesaCodigo: 'MESA-02',
    transcriptorNombre: 'Juan Carlos Pérez',
    isActive: true,
  },
  {
    id: 'd3',
    nombre: 'Mariana Paz Vaca',
    ci: '7491028 CH',
    celular: '76543210',
    correo: 'mariana.paz@usfx.edu.bo',
    mesaCodigo: '', // Sin mesa asignada por ahora
    isActive: true,
  },
  {
    id: 'd4',
    nombre: 'Dr. Fernando Arancibia',
    ci: '3410928 CH',
    celular: '77889900',
    correo: 'f.arancibia@usfx.edu.bo',
    mesaCodigo: 'MESA-DOC-01',
    transcriptorNombre: 'María Elena Torrez',
    isActive: true,
  },
]

const delegadoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  ci: z.string().min(1, 'El CI es requerido'),
  celular: z.string().min(1, 'El número de celular es requerido'),
  correo: z.string().email('Correo no válido').optional().or(z.literal('')),
  mesaCodigo: z.string().optional(),
})

type DelegadoFormValues = z.infer<typeof delegadoSchema>

export function DelegadosFeature() {
  const { ultimasMesas } = useElectionStore()
  const [delegadosList, setDelegadosList] = useState<DelegadoItem[]>(initialDelegados)
  const [searchTerm, setSearchTerm] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [openReportModal, setOpenReportModal] = useState(false)
  const [editingDelegado, setEditingDelegado] = useState<DelegadoItem | null>(null)

  const form = useForm<DelegadoFormValues>({
    resolver: zodResolver(delegadoSchema) as any,
    defaultValues: {
      nombre: '',
      ci: '',
      celular: '',
      correo: '',
      mesaCodigo: '',
    },
  })

  const filteredDelegados = delegadosList.filter(
    (d) =>
      d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.ci.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.mesaCodigo && d.mesaCodigo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      d.celular.includes(searchTerm)
  )

  const handleOpenAdd = () => {
    setEditingDelegado(null)
    form.reset({ nombre: '', ci: '', celular: '', correo: '', mesaCodigo: '' })
    setOpenModal(true)
  }

  const handleOpenEdit = (delegado: DelegadoItem) => {
    setEditingDelegado(delegado)
    form.reset({
      nombre: delegado.nombre,
      ci: delegado.ci,
      celular: delegado.celular,
      correo: delegado.correo || '',
      mesaCodigo: delegado.mesaCodigo || '',
    })
    setOpenModal(true)
  }

  const handleToggleStatus = (id: string) => {
    setDelegadosList((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d))
    )
    toast.success('Estado del delegado actualizado')
  }

  const handleDelete = (id: string, nombre: string) => {
    setDelegadosList((prev) => prev.filter((d) => d.id !== id))
    toast.success(`Delegado ${nombre} eliminado`)
  }

  const handleOpenPrintPreview = () => {
    setOpenReportModal(true)
  }

  function onSubmit(values: DelegadoFormValues) {
    if (editingDelegado) {
      setDelegadosList((prev) =>
        prev.map((d) =>
          d.id === editingDelegado.id
            ? {
                ...d,
                nombre: values.nombre,
                ci: values.ci,
                celular: values.celular,
                correo: values.correo,
                mesaCodigo: values.mesaCodigo || '',
              }
            : d
        )
      )
      toast.success('Delegado actualizado correctamente')
    } else {
      const newDelegado: DelegadoItem = {
        id: String(Date.now()),
        nombre: values.nombre,
        ci: values.ci,
        celular: values.celular,
        correo: values.correo,
        mesaCodigo: values.mesaCodigo || '',
        isActive: true,
      }
      setDelegadosList((prev) => [...prev, newDelegado])
      toast.success('Delegado registrado exitosamente')
    }
    setOpenModal(false)
  }

  return (
    <>
      <Header>
        <div className='flex items-center gap-3 me-auto'>
          <UserCheck className='h-5 w-5 text-primary' />
          <h1 className='text-base font-bold tracking-tight'>Gestión de Delegados de Mesa</h1>
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
            <h2 className='text-2xl font-bold tracking-tight'>Delegados Electorales</h2>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Registro previo de delegados. La asignación de mesa puede realizarse ahora o previo al día de la elección.
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              onClick={handleOpenPrintPreview}
              variant='outline'
              className='font-semibold gap-2 text-xs border-primary/30 text-primary hover:bg-primary/5'
            >
              <Printer className='h-4 w-4' /> Vista Previa e Imprimir Nómina
            </Button>

            <Button onClick={handleOpenAdd} className='font-semibold gap-2 shadow-sm text-xs'>
              <UserPlus className='h-4 w-4' /> Registrar Delegado
            </Button>
          </div>
        </div>

        <Card className='border-border/60 shadow-sm'>
          <CardHeader className='pb-4'>
            <div className='relative w-full sm:w-80'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Buscar por nombre, CI, mesa o celular...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-9 text-xs'
              />
            </div>
          </CardHeader>

          <CardContent>
            <div className='rounded-md border overflow-x-auto'>
              <Table>
                <TableHeader className='bg-muted/40'>
                  <TableRow>
                    <TableHead className='font-semibold text-xs py-3 w-[200px]'>Nombre Completo</TableHead>
                    <TableHead className='font-semibold text-xs py-3 w-[130px]'>Carnet (CI)</TableHead>
                    <TableHead className='font-semibold text-xs py-3 w-[150px]'>Teléfono Celular</TableHead>
                    <TableHead className='font-semibold text-xs py-3 w-[180px]'>Transcriptor Responsable</TableHead>
                    <TableHead className='font-semibold text-xs py-3 text-center w-[150px]'>Mesa Asignada</TableHead>
                    <TableHead className='font-semibold text-xs py-3 text-center w-[100px]'>Estado</TableHead>
                    <TableHead className='font-semibold text-xs py-3 text-right w-[100px]'>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDelegados.map((d) => (
                    <TableRow key={d.id} className='hover:bg-muted/30'>
                      <TableCell className='font-bold text-xs text-foreground py-3'>
                        <div className='flex items-center gap-2'>
                          <UserCheck className='h-4 w-4 text-primary shrink-0' />
                          <span>{d.nombre}</span>
                        </div>
                      </TableCell>

                      <TableCell className='text-xs font-mono text-muted-foreground py-3'>
                        <div className='flex items-center gap-1.5'>
                          <CreditCard className='h-3.5 w-3.5 text-muted-foreground shrink-0' />
                          <span>{d.ci}</span>
                        </div>
                      </TableCell>

                      <TableCell className='text-xs font-medium text-foreground py-3'>
                        <div className='flex items-center gap-1.5 justify-between pr-2'>
                          <span className='flex items-center gap-1.5 font-mono'>
                            <Phone className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0' />
                            +591 {d.celular}
                          </span>
                          <a
                            href={`https://wa.me/591${d.celular}`}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded transition-colors shadow-xs'
                          >
                            <MessageSquare className='h-3 w-3' /> WA
                          </a>
                        </div>
                      </TableCell>

                      <TableCell className='text-xs text-muted-foreground py-3'>
                        {d.transcriptorNombre ? (
                          <span className='font-semibold text-foreground'>{d.transcriptorNombre}</span>
                        ) : (
                          <span className='italic text-[11px] text-muted-foreground'>Sin transcriptor</span>
                        )}
                      </TableCell>

                      <TableCell className='text-center py-3'>
                        {d.mesaCodigo ? (
                          <Badge variant='outline' className='bg-primary/10 text-primary border-primary/30 font-bold text-xs gap-1 inline-flex items-center'>
                            <Vote className='h-3 w-3' />
                            {d.mesaCodigo}
                          </Badge>
                        ) : (
                          <Badge variant='outline' className='bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold text-[11px] gap-1 inline-flex items-center'>
                            <Clock className='h-3 w-3' /> Sin Mesa (Pendiente)
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className='text-center py-3'>
                        <Switch
                          checked={d.isActive}
                          onCheckedChange={() => handleToggleStatus(d.id)}
                        />
                      </TableCell>

                      <TableCell className='text-right py-3 space-x-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleOpenEdit(d)}
                          className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground'
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDelete(d.id, d.nombre)}
                          className='h-8 w-8 p-0 text-destructive hover:text-destructive'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </Main>

      {/* Modal Registrar / Editar Delegado */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold flex items-center gap-2'>
              <UserCheck className='h-5 w-5 text-primary' />
              {editingDelegado ? 'Editar Delegado' : 'Registrar Nuevo Delegado'}
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Ingrese la información del delegado. La asignación de mesa es opcional.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Nombre Completo *</Label>
              <Input placeholder='Ej. Ana María Roca' {...form.register('nombre')} className='text-xs' />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>CI (Carnet) *</Label>
                <Input placeholder='Ej. 8492019 CH' {...form.register('ci')} className='text-xs font-mono' />
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Celular *</Label>
                <Input placeholder='Ej. 71234567' {...form.register('celular')} className='text-xs font-mono' />
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Correo Electrónico (Opcional)</Label>
              <Input placeholder='ejemplo@usfx.edu.bo' {...form.register('correo')} className='text-xs' />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Mesa Asignada (Opcional por ahora)</Label>
              <Select
                value={form.watch('mesaCodigo') || 'SIN_ASIGNAR'}
                onValueChange={(val) => form.setValue('mesaCodigo', val === 'SIN_ASIGNAR' ? '' : val)}
              >
                <SelectTrigger className='text-xs'>
                  <SelectValue placeholder='Seleccione mesa (o dejar sin asignar)...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='SIN_ASIGNAR' className='text-xs text-amber-600 font-bold'>
                    -- Sin Mesa Asignada por Ahora --
                  </SelectItem>
                  {ultimasMesas.map((m) => (
                    <SelectItem key={m.id} value={m.codigo} className='text-xs'>
                      {m.codigo} — {m.facultad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className='pt-2'>
              <Button type='button' variant='outline' onClick={() => setOpenModal(false)} className='text-xs'>
                Cancelar
              </Button>
              <Button type='submit' className='text-xs font-bold'>
                Guardar Delegado
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Vista Previa en Pantalla */}
      <Dialog open={openReportModal} onOpenChange={setOpenReportModal}>
        <DialogContent className='sm:max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader className='no-print'>
            <div className='flex items-center justify-between pe-4'>
              <DialogTitle className='text-lg font-bold flex items-center gap-2'>
                <FileText className='h-5 w-5 text-primary' />
                Vista Previa de Impresión — Nómina de Delegados
              </DialogTitle>
              <Button onClick={() => window.print()} className='text-xs font-bold gap-1 bg-primary text-white'>
                <Printer className='h-4 w-4' /> Imprimir Nómina
              </Button>
            </div>
            <DialogDescription className='text-xs'>
              Formato de nómina oficial de delegados acreditados por mesa (USFX 2026).
            </DialogDescription>
          </DialogHeader>

          {/* On-screen visual preview inside Modal */}
          <div className='p-6 bg-card border rounded-lg space-y-4 text-xs shadow-xs'>
            <div className='border-b pb-3 text-center space-y-1'>
              <h2 className='text-sm font-black uppercase text-foreground'>
                UNIVERSIDAD MAYOR, REAL Y PONTIFICIA DE SAN FRANCISCO XAVIER DE CHUQUISACA
              </h2>
              <h3 className='text-sm font-extrabold uppercase text-primary pt-0.5'>
                ELECCIONES AUTORIDADES UNIVERSITARIAS 2026 — VICERRECTORADO
              </h3>
              <p className='text-xs font-bold uppercase text-foreground pt-1 inline-block px-3 py-0.5 bg-muted rounded-sm'>
                NÓMINA OFICIAL DE DELEGADOS DE MESA ACREDITADOS
              </p>
            </div>

            <div className='rounded-md border overflow-x-auto'>
              <table className='w-full text-left text-xs border-collapse'>
                <thead>
                  <tr className='bg-muted/60 font-bold uppercase text-[10px] border-b'>
                    <th className='p-2 border-r text-center w-8'>N°</th>
                    <th className='p-2 border-r'>Nombre Completo</th>
                    <th className='p-2 border-r w-28'>CI</th>
                    <th className='p-2 border-r w-28'>Celular</th>
                    <th className='p-2 border-r text-center w-24'>Mesa</th>
                    <th className='p-2 border-r'>Transcriptor Encargado</th>
                    <th className='p-2 text-center w-20'>Estado</th>
                  </tr>
                </thead>
                <tbody className='divide-y'>
                  {delegadosList.map((d, index) => (
                    <tr key={d.id} className='hover:bg-muted/20'>
                      <td className='p-2 border-r text-center font-bold text-[11px]'>{index + 1}</td>
                      <td className='p-2 border-r font-bold text-xs'>{d.nombre}</td>
                      <td className='p-2 border-r font-mono text-[11px]'>{d.ci}</td>
                      <td className='p-2 border-r font-mono text-[11px]'>+591 {d.celular}</td>
                      <td className='p-2 border-r text-center font-bold text-xs'>{d.mesaCodigo || 'Pendiente'}</td>
                      <td className='p-2 border-r text-[11px]'>{d.transcriptorNombre || 'Sin asignar'}</td>
                      <td className='p-2 text-center font-bold text-[10px]'>
                        {d.isActive ? 'ACTIVO' : 'INACTIVO'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter className='no-print'>
            <Button onClick={() => setOpenReportModal(false)} className='text-xs font-bold'>
              Cerrar Vista Previa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PRINTABLE AREA CONTAINER (Rendered at root level for flawless printing) */}
      <div id='printable-area' className='hidden print:block p-6 bg-white text-black font-sans space-y-4 text-xs'>
        <div className='border-b-2 border-black pb-3 text-center space-y-1'>
          <h2 className='text-sm font-black uppercase tracking-wider text-black'>
            UNIVERSIDAD MAYOR, REAL Y PONTIFICIA DE SAN FRANCISCO XAVIER DE CHUQUISACA
          </h2>
          <h3 className='text-sm font-extrabold uppercase text-black pt-0.5'>
            ELECCIONES AUTORIDADES UNIVERSITARIAS 2026 — VICERRECTORADO
          </h3>
          <p className='text-xs font-bold uppercase text-black pt-1 bg-gray-100 inline-block px-4 py-0.5 border border-gray-400 rounded-sm'>
            NÓMINA OFICIAL DE DELEGADOS DE MESA ACREDITADOS
          </p>
          <div className='flex justify-between items-center text-[10px] text-gray-700 pt-2 font-mono'>
            <span><strong>Lugar:</strong> Sucre, Chuquisaca - Bolivia</span>
            <span><strong>Fecha de Emisión:</strong> {new Date().toLocaleDateString('es-BO')} {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        <table className='w-full text-left border-collapse border border-black text-xs'>
          <thead>
            <tr className='bg-gray-200 text-black font-bold uppercase text-[10px] border-b border-black'>
              <th className='p-2 border border-black text-center w-8'>N°</th>
              <th className='p-2 border border-black'>Nombre Completo del Delegado</th>
              <th className='p-2 border border-black w-28'>Carnet (CI)</th>
              <th className='p-2 border border-black w-28'>Teléfono Celular</th>
              <th className='p-2 border border-black text-center w-24'>Mesa</th>
              <th className='p-2 border border-black'>Transcriptor Responsable</th>
              <th className='p-2 border border-black text-center w-20'>Estado</th>
            </tr>
          </thead>
          <tbody>
            {delegadosList.map((d, index) => (
              <tr key={d.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className='p-2 border border-black text-center font-bold text-[11px]'>{index + 1}</td>
                <td className='p-2 border border-black font-bold text-xs text-black'>{d.nombre}</td>
                <td className='p-2 border border-black font-mono text-[11px] text-black'>{d.ci}</td>
                <td className='p-2 border border-black font-mono text-[11px] text-black'>+591 {d.celular}</td>
                <td className='p-2 border border-black text-center font-bold text-xs text-black'>{d.mesaCodigo || 'Pendiente'}</td>
                <td className='p-2 border border-black font-medium text-[11px] text-black'>
                  {d.transcriptorNombre || 'Sin asignar'}
                </td>
                <td className='p-2 border border-black text-center font-bold text-[10px] text-black'>
                  {d.isActive ? 'ACTIVO' : 'INACTIVO'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
