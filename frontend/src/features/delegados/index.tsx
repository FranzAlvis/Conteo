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
import { UserCheck, UserPlus, Search, Edit, Trash2, Phone, Mail, CreditCard, Vote } from 'lucide-react'
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
  mesaCodigo: string
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
    isActive: true,
  },
  {
    id: 'd2',
    nombre: 'Jorge Luis Gutiérrez',
    ci: '9210384 CH',
    celular: '68019283',
    correo: 'jorge.gutierrez@gmail.com',
    mesaCodigo: 'MESA-02',
    isActive: true,
  },
  {
    id: 'd3',
    nombre: 'Mariana Paz Vaca',
    ci: '7491028 CH',
    celular: '76543210',
    correo: 'mariana.paz@usfx.edu.bo',
    mesaCodigo: 'MESA-03',
    isActive: false,
  },
]

const delegadoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  ci: z.string().min(1, 'El CI es requerido'),
  celular: z.string().min(1, 'El número de celular es requerido'),
  correo: z.string().email('Correo no válido').optional().or(z.literal('')),
  mesaCodigo: z.string().min(1, 'Seleccione una mesa asignada'),
})

type DelegadoFormValues = z.infer<typeof delegadoSchema>

export function DelegadosFeature() {
  const { ultimasMesas } = useElectionStore()
  const [delegadosList, setDelegadosList] = useState<DelegadoItem[]>(initialDelegados)
  const [searchTerm, setSearchTerm] = useState('')
  const [openModal, setOpenModal] = useState(false)
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
      d.mesaCodigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      mesaCodigo: delegado.mesaCodigo,
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
                mesaCodigo: values.mesaCodigo,
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
        mesaCodigo: values.mesaCodigo,
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
              Control de representantes asignados por mesa, datos de contacto (CI, Celular) y estado activo.
            </p>
          </div>
          <Button onClick={handleOpenAdd} className='font-semibold gap-2 shadow-sm'>
            <UserPlus className='h-4 w-4' /> Registrar Nuevo Delegado
          </Button>
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
            <div className='rounded-md border overflow-hidden'>
              <Table>
                <TableHeader className='bg-muted/40'>
                  <TableRow>
                    <TableHead className='font-semibold text-xs'>Nombre Completo</TableHead>
                    <TableHead className='font-semibold text-xs'>Carnet de Identidad (CI)</TableHead>
                    <TableHead className='font-semibold text-xs'>Celular</TableHead>
                    <TableHead className='font-semibold text-xs'>Correo Electrónico</TableHead>
                    <TableHead className='font-semibold text-xs text-center'>Mesa Asignada</TableHead>
                    <TableHead className='font-semibold text-xs text-center'>Estado Activo</TableHead>
                    <TableHead className='font-semibold text-xs text-right'>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDelegados.map((d) => (
                    <TableRow key={d.id} className='hover:bg-muted/30'>
                      <TableCell className='font-bold text-xs text-foreground flex items-center gap-2'>
                        <UserCheck className='h-4 w-4 text-primary' />
                        {d.nombre}
                      </TableCell>
                      <TableCell className='text-xs font-mono text-muted-foreground flex items-center gap-1'>
                        <CreditCard className='h-3 w-3 text-muted-foreground' />
                        {d.ci}
                      </TableCell>
                      <TableCell className='text-xs font-medium text-foreground flex items-center gap-1'>
                        <Phone className='h-3 w-3 text-muted-foreground' />
                        {d.celular}
                      </TableCell>
                      <TableCell className='text-xs text-muted-foreground'>
                        {d.correo ? (
                          <span className='flex items-center gap-1'>
                            <Mail className='h-3 w-3 text-muted-foreground' />
                            {d.correo}
                          </span>
                        ) : (
                          <span className='italic text-[11px] text-muted-foreground/60'>No registrado</span>
                        )}
                      </TableCell>
                      <TableCell className='text-center'>
                        <Badge variant='outline' className='bg-primary/10 text-primary border-primary/30 font-bold text-xs gap-1'>
                          <Vote className='h-3 w-3' />
                          {d.mesaCodigo}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-center'>
                        <Switch
                          checked={d.isActive}
                          onCheckedChange={() => handleToggleStatus(d.id)}
                        />
                      </TableCell>
                      <TableCell className='text-right space-x-1'>
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
              Ingrese la información de contacto y asignación de mesa para el delegado electoral.
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
              <Label className='text-xs font-semibold'>Mesa Asignada *</Label>
              <Select
                value={form.watch('mesaCodigo')}
                onValueChange={(val) => form.setValue('mesaCodigo', val)}
              >
                <SelectTrigger className='text-xs'>
                  <SelectValue placeholder='Seleccione mesa asignada...' />
                </SelectTrigger>
                <SelectContent>
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
    </>
  )
}
