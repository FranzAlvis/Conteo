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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  UserPlus,
  KeyRound,
  Edit,
  Search,
  ShieldCheck,
  Phone,
  FileText,
  Vote,
  Printer,
  Settings2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useElectionStore } from '@/stores/election-store'

interface UserItem {
  id: string
  name: string
  username: string
  telefono: string
  role: 'ADMIN' | 'TRANSCRIPTOR' | 'AYUDANTE' | 'VISOR'
  isActive: boolean
}

const initialUsers: UserItem[] = [
  { id: '1', name: 'Yamile Hayes Michel', username: 'admin', telefono: '71234567', role: 'ADMIN', isActive: true },
  { id: 'transcriptor', name: 'Juan Carlos Pérez', username: 'transcriptor', telefono: '76543210', role: 'TRANSCRIPTOR', isActive: true },
  { id: 'transcriptor2', name: 'María Elena Torrez', username: 'transcriptor2', telefono: '68098765', role: 'TRANSCRIPTOR', isActive: true },
  { id: '4', name: 'Patricia Visor', username: 'visor', telefono: '70011223', role: 'VISOR', isActive: true },
]

const userSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  username: z.string().min(1, 'El usuario es obligatorio'),
  telefono: z.string().min(1, 'El teléfono es obligatorio'),
  role: z.enum(['ADMIN', 'TRANSCRIPTOR', 'AYUDANTE', 'VISOR']),
  password: z.string().optional(),
})

export function UsersFeature() {
  const { asignaciones, ultimasMesas, actualizarAsignacionTranscriptor } = useElectionStore()
  const [usersList, setUsersList] = useState<UserItem[]>(initialUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleTabFilter, setRoleTabFilter] = useState('TODOS')
  const [openModal, setOpenModal] = useState(false)
  const [openReportModal, setOpenReportModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [assigningUser, setAssigningUser] = useState<UserItem | null>(null)
  const [selectedMesasMap, setSelectedMesasMap] = useState<Record<string, boolean>>({})

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      username: '',
      telefono: '',
      role: 'TRANSCRIPTOR',
      password: '',
    },
  })

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.telefono.includes(searchTerm)

    const matchesRole = roleTabFilter === 'TODOS' || u.role === roleTabFilter
    return matchesSearch && matchesRole
  })

  const handleOpenAdd = () => {
    setEditingUser(null)
    form.reset({ name: '', username: '', telefono: '', role: 'TRANSCRIPTOR', password: '' })
    setOpenModal(true)
  }

  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user)
    form.reset({ name: user.name, username: user.username, telefono: user.telefono || '', role: user.role, password: '' })
    setOpenModal(true)
  }

  const handleToggleStatus = (id: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
    )
    toast.success('Estado de usuario actualizado')
  }

  const handleOpenAssign = (user: UserItem) => {
    setAssigningUser(user)
    const asig = asignaciones.find((a) => a.transcriptorId === user.id)
    const map: Record<string, boolean> = {}
    ultimasMesas.forEach((m) => {
      map[m.codigo] = asig ? asig.mesasCodigos.includes(m.codigo) : false
    })
    setSelectedMesasMap(map)
  }

  const handleSaveUserAssignment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!assigningUser) return

    const nuevasMesas = Object.keys(selectedMesasMap).filter((cod) => selectedMesasMap[cod])
    actualizarAsignacionTranscriptor(assigningUser.id, nuevasMesas)
    toast.success(`Mesas asignadas correctamente a ${assigningUser.name}`)
    setAssigningUser(null)
  }

  function onSubmit(values: z.infer<typeof userSchema>) {
    if (editingUser) {
      setUsersList((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? { ...u, name: values.name, username: values.username, telefono: values.telefono, role: values.role }
            : u
        )
      )
      toast.success('Usuario actualizado correctamente')
    } else {
      const newUser: UserItem = {
        id: String(Date.now()),
        name: values.name,
        username: values.username,
        telefono: values.telefono,
        role: values.role,
        isActive: true,
      }
      setUsersList((prev) => [...prev, newUser])
      toast.success('Nuevo usuario registrado correctamente')
    }
    setOpenModal(false)
  }

  return (
    <>
      <Header>
        <div className='flex items-center gap-3 me-auto'>
          <Users className='h-5 w-5 text-primary' />
          <h1 className='text-base font-bold tracking-tight'>Gestión de Usuarios, Roles y Asignaciones</h1>
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
            <h2 className='text-2xl font-bold tracking-tight'>Usuarios y Asignación de Mesas</h2>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Control de acceso por roles, asignación directa de mesas a transcriptores y reporte oficial.
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              onClick={() => setOpenReportModal(true)}
              variant='outline'
              className='font-semibold gap-2 text-xs'
            >
              <Printer className='h-4 w-4 text-primary' /> Generar Reporte Oficial
            </Button>

            <Button onClick={handleOpenAdd} className='font-semibold gap-2 shadow-sm text-xs'>
              <UserPlus className='h-4 w-4' /> Registrar Nuevo Usuario
            </Button>
          </div>
        </div>

        <Card className='border-border/60 shadow-sm'>
          <CardHeader className='pb-4'>
            <div className='flex flex-col sm:flex-row items-center justify-between gap-3'>
              <div className='relative w-full sm:w-72'>
                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Buscar por nombre, usuario o teléfono...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-9 text-xs'
                />
              </div>

              <Tabs
                value={roleTabFilter}
                onValueChange={setRoleTabFilter}
                className='w-full sm:w-auto'
              >
                <TabsList className='grid grid-cols-4 w-full sm:w-auto font-bold text-xs h-9'>
                  <TabsTrigger value='TODOS' className='text-xs'>Todos</TabsTrigger>
                  <TabsTrigger value='TRANSCRIPTOR' className='text-xs'>Transcriptores</TabsTrigger>
                  <TabsTrigger value='ADMIN' className='text-xs'>Admins</TabsTrigger>
                  <TabsTrigger value='VISOR' className='text-xs'>Visores</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>

          <CardContent>
            <div className='rounded-md border overflow-x-auto'>
              <Table>
                <TableHeader className='bg-muted/40'>
                  <TableRow>
                    <TableHead className='font-semibold text-xs py-3 w-[220px]'>Nombre Completo</TableHead>
                    <TableHead className='font-semibold text-xs py-3 w-[130px]'>Usuario</TableHead>
                    <TableHead className='font-semibold text-xs py-3 w-[130px]'>Teléfono Celular</TableHead>
                    <TableHead className='font-semibold text-xs py-3 w-[130px]'>Rol Asignado</TableHead>
                    <TableHead className='font-semibold text-xs py-3 w-[200px]'>Mesas Bajo su Cuidado</TableHead>
                    <TableHead className='font-semibold text-xs py-3 text-center w-[100px]'>Estado</TableHead>
                    <TableHead className='font-semibold text-xs py-3 text-right w-[120px]'>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => {
                    const asig = asignaciones.find((a) => a.transcriptorId === u.id)
                    const mesasCount = asig?.mesasCodigos.length || 0

                    return (
                      <TableRow key={u.id} className='hover:bg-muted/30'>
                        <TableCell className='font-bold text-xs text-foreground py-3'>
                          <div className='flex items-center gap-2'>
                            <ShieldCheck className='h-4 w-4 text-primary shrink-0' />
                            <span>{u.name}</span>
                          </div>
                        </TableCell>

                        <TableCell className='text-xs text-muted-foreground font-mono py-3'>
                          @{u.username}
                        </TableCell>

                        <TableCell className='text-xs font-semibold text-foreground py-3'>
                          <div className='flex items-center gap-1.5'>
                            <Phone className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0' />
                            <span>+591 {u.telefono}</span>
                          </div>
                        </TableCell>

                        <TableCell className='text-xs py-3'>
                          <Badge
                            variant='outline'
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 ${
                              u.role === 'ADMIN'
                                ? 'bg-primary/10 text-primary border-primary/30'
                                : u.role === 'TRANSCRIPTOR'
                                  ? 'bg-purple-500/10 text-purple-600 border-purple-500/30'
                                  : 'bg-slate-500/10 text-slate-600 border-slate-500/30'
                            }`}
                          >
                            {u.role}
                          </Badge>
                        </TableCell>

                        <TableCell className='text-xs py-3'>
                          {u.role === 'TRANSCRIPTOR' ? (
                            <div className='flex items-center gap-1.5 flex-wrap'>
                              {mesasCount > 0 ? (
                                asig?.mesasCodigos.map((cod) => (
                                  <Badge key={cod} variant='secondary' className='text-[10px] font-mono font-bold px-1.5 py-0'>
                                    {cod}
                                  </Badge>
                                ))
                              ) : (
                                <span className='italic text-[11px] text-muted-foreground'>Sin mesas</span>
                              )}
                              <Button
                                onClick={() => handleOpenAssign(u)}
                                variant='ghost'
                                size='sm'
                                className='h-6 px-1.5 text-[10px] font-bold text-primary hover:bg-primary/10 ml-1'
                              >
                                <Settings2 className='h-3 w-3 mr-0.5' /> Editar
                              </Button>
                            </div>
                          ) : (
                            <span className='text-muted-foreground text-[11px] font-medium'>
                              {u.role === 'ADMIN' ? 'Acceso Global' : 'Solo Consulta'}
                            </span>
                          )}
                        </TableCell>

                        <TableCell className='text-center py-3'>
                          <Switch
                            checked={u.isActive}
                            onCheckedChange={() => handleToggleStatus(u.id)}
                          />
                        </TableCell>

                        <TableCell className='text-right py-3 space-x-1'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleOpenEdit(u)}
                            className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground'
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </Main>

      {/* Modal Asignar Mesas a Transcriptor */}
      {assigningUser && (
        <Dialog open={!!assigningUser} onOpenChange={() => setAssigningUser(null)}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='text-lg font-bold flex items-center gap-2'>
                <Vote className='h-5 w-5 text-primary' />
                Asignación de Mesas a Transcriptor
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Seleccione las mesas asignadas exclusivamente a <strong>{assigningUser.name}</strong> (+591 {assigningUser.telefono}).
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveUserAssignment} className='space-y-4 py-2'>
              <div className='space-y-2 max-h-60 overflow-y-auto pr-1'>
                {ultimasMesas.map((m) => (
                  <label
                    key={m.codigo}
                    className='flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-muted/30 cursor-pointer'
                  >
                    <div className='flex items-center gap-2.5'>
                      <input
                        type='checkbox'
                        checked={!!selectedMesasMap[m.codigo]}
                        onChange={(e) =>
                          setSelectedMesasMap((prev) => ({
                            ...prev,
                            [m.codigo]: e.target.checked,
                          }))
                        }
                        className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary'
                      />
                      <div>
                        <p className='text-xs font-bold text-foreground'>{m.codigo}</p>
                        <p className='text-[11px] text-muted-foreground'>{m.facultad}</p>
                      </div>
                    </div>

                    <Badge variant='outline' className='text-[10px] font-bold'>
                      {m.tipo}
                    </Badge>
                  </label>
                ))}
              </div>

              <DialogFooter className='pt-2'>
                <Button type='button' variant='outline' onClick={() => setAssigningUser(null)} className='text-xs'>
                  Cancelar
                </Button>
                <Button type='submit' className='text-xs font-bold'>
                  Guardar Asignación
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Crear/Editar Usuario */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold'>
              {editingUser ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Ingrese los datos del usuario, teléfono y rol de permisos.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Nombre Completo *</Label>
              <Input placeholder='Ej. Juan Carlos Pérez' {...form.register('name')} className='text-xs' />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Nombre de Usuario *</Label>
                <Input placeholder='Ej. jperez' {...form.register('username')} className='text-xs font-mono' />
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Teléfono Celular *</Label>
                <Input placeholder='Ej. 76543210' {...form.register('telefono')} className='text-xs font-mono' />
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Rol de Usuario *</Label>
              <Select
                value={form.watch('role')}
                onValueChange={(val) => form.setValue('role', val as any)}
              >
                <SelectTrigger className='text-xs'>
                  <SelectValue placeholder='Seleccione rol...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ADMIN' className='text-xs font-bold text-primary'>ADMIN (Acceso total)</SelectItem>
                  <SelectItem value='TRANSCRIPTOR' className='text-xs'>TRANSCRIPTOR (Carga de mesas asignadas)</SelectItem>
                  <SelectItem value='AYUDANTE' className='text-xs'>AYUDANTE (Apoyo técnico)</SelectItem>
                  <SelectItem value='VISOR' className='text-xs'>VISOR (Solo consulta live)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className='pt-2'>
              <Button type='button' variant='outline' onClick={() => setOpenModal(false)} className='text-xs'>
                Cancelar
              </Button>
              <Button type='submit' className='text-xs font-bold'>
                Guardar Usuario
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Reporte Oficial de Transcriptores y Delegados */}
      <Dialog open={openReportModal} onOpenChange={setOpenReportModal}>
        <DialogContent className='sm:max-w-2xl max-h-[85vh] overflow-y-auto'>
          <DialogHeader>
            <div className='flex items-center justify-between pe-4'>
              <DialogTitle className='text-lg font-bold flex items-center gap-2'>
                <FileText className='h-5 w-5 text-primary' />
                Reporte Oficial de Transcriptores y Delegados
              </DialogTitle>
              <Button
                onClick={() => window.print()}
                variant='outline'
                size='sm'
                className='text-xs font-bold gap-1'
              >
                <Printer className='h-3.5 w-3.5' /> Imprimir
              </Button>
            </div>
            <DialogDescription className='text-xs'>
              Nomina oficial de personal de transcripción, teléfonos y delegados por mesa (USFX 2026).
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-5 py-3 text-xs'>
            {asignaciones.map((asig) => (
              <div key={asig.transcriptorId} className='p-4 rounded-xl border bg-muted/20 space-y-3'>
                <div className='flex items-center justify-between border-b pb-2'>
                  <div>
                    <h4 className='font-extrabold text-sm text-foreground'>{asig.transcriptorNombre}</h4>
                    <p className='text-xs text-muted-foreground flex items-center gap-1 font-mono'>
                      <Phone className='h-3 w-3 text-emerald-600 dark:text-emerald-400' /> Teléfono: +591 {asig.transcriptorTelefono}
                    </p>
                  </div>

                  <div className='flex items-center gap-1'>
                    {asig.mesasCodigos.map((m) => (
                      <Badge key={m} className='bg-primary text-primary-foreground font-mono text-[10px]'>
                        {m}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className='space-y-1.5'>
                  <p className='font-bold text-[11px] uppercase tracking-wider text-muted-foreground'>
                    Delegados de Mesa a su Cargo:
                  </p>

                  <Table>
                    <TableHeader className='bg-card'>
                      <TableRow>
                        <TableHead className='py-2 text-[11px] font-bold'>Delegado</TableHead>
                        <TableHead className='py-2 text-[11px] font-bold'>Teléfono Celular</TableHead>
                        <TableHead className='py-2 text-[11px] font-bold text-center'>Mesa</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {asig.delegados.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell className='py-2 font-semibold text-xs'>{d.nombre}</TableCell>
                          <TableCell className='py-2 font-mono text-xs text-emerald-600 dark:text-emerald-400'>+591 {d.celular}</TableCell>
                          <TableCell className='py-2 text-center font-bold text-xs'>{d.mesaCodigo}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={() => setOpenReportModal(false)} className='text-xs font-bold'>
              Cerrar Reporte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
