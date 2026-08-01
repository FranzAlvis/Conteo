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
import { Users, UserPlus, KeyRound, Edit, Search, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

interface UserItem {
  id: string
  name: string
  username: string
  role: 'ADMIN' | 'TRANSCRIPTOR' | 'AYUDANTE' | 'VISOR'
  isActive: boolean
}

const initialUsers: UserItem[] = [
  { id: '1', name: 'Yamile Hayes Michel', username: 'admin', role: 'ADMIN', isActive: true },
  { id: '2', name: 'Carlos Transcriptor', username: 'transcriptor', role: 'TRANSCRIPTOR', isActive: true },
  { id: '3', name: 'Ana Ayudante', username: 'ayudante', role: 'AYUDANTE', isActive: true },
  { id: '4', name: 'Patricia Visor', username: 'visor', role: 'VISOR', isActive: true },
]

const userSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  username: z.string().min(1, 'El usuario es obligatorio'),
  role: z.enum(['ADMIN', 'TRANSCRIPTOR', 'AYUDANTE', 'VISOR']),
  password: z.string().optional(),
})

export function UsersFeature() {
  const [usersList, setUsersList] = useState<UserItem[]>(initialUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      username: '',
      role: 'VISOR',
      password: '',
    },
  })

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenAdd = () => {
    setEditingUser(null)
    form.reset({ name: '', username: '', role: 'VISOR', password: '' })
    setOpenModal(true)
  }

  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user)
    form.reset({ name: user.name, username: user.username, role: user.role, password: '' })
    setOpenModal(true)
  }

  const handleToggleStatus = (id: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
    )
    toast.success('Estado de usuario actualizado')
  }

  const handleResetPassword = (username: string) => {
    toast.success(`Contraseña restablecida manualmente para @${username}`)
  }

  function onSubmit(values: z.infer<typeof userSchema>) {
    if (editingUser) {
      setUsersList((prev) =>
        prev.map((u) =>
          u.id === editingUser.id ? { ...u, name: values.name, username: values.username, role: values.role } : u
        )
      )
      toast.success('Usuario actualizado correctamente')
    } else {
      const newUser: UserItem = {
        id: String(Date.now()),
        name: values.name,
        username: values.username,
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
          <h1 className='text-base font-bold tracking-tight'>Gestión de Usuarios y Roles</h1>
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
            <h2 className='text-2xl font-bold tracking-tight'>Usuarios del Sistema</h2>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Administración de cuentas con control de acceso por roles (ADMIN, TRANSCRIPTOR, AYUDANTE, VISOR).
            </p>
          </div>
          <Button onClick={handleOpenAdd} className='font-semibold gap-2 shadow-sm'>
            <UserPlus className='h-4 w-4' /> Registrar Nuevo Usuario
          </Button>
        </div>

        <Card className='border-border/60 shadow-sm'>
          <CardHeader className='pb-4'>
            <div className='relative w-full sm:w-72'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Buscar por nombre o usuario...'
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
                    <TableHead className='font-semibold text-xs'>Usuario</TableHead>
                    <TableHead className='font-semibold text-xs'>Rol Asignado</TableHead>
                    <TableHead className='font-semibold text-xs text-center'>Estado Activo</TableHead>
                    <TableHead className='font-semibold text-xs text-right'>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id} className='hover:bg-muted/30'>
                      <TableCell className='font-bold text-xs text-foreground flex items-center gap-2'>
                        <ShieldCheck className='h-4 w-4 text-primary' />
                        {u.name}
                      </TableCell>
                      <TableCell className='text-xs text-muted-foreground font-mono'>@{u.username}</TableCell>
                      <TableCell className='text-xs'>
                        <Badge
                          variant='outline'
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 ${
                            u.role === 'ADMIN'
                              ? 'bg-primary/10 text-primary border-primary/30'
                              : u.role === 'TRANSCRIPTOR'
                                ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                                : u.role === 'AYUDANTE'
                                  ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                                  : 'bg-slate-500/10 text-slate-600 border-slate-500/30'
                          }`}
                        >
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-center'>
                        <Switch
                          checked={u.isActive}
                          onCheckedChange={() => handleToggleStatus(u.id)}
                        />
                      </TableCell>
                      <TableCell className='text-right space-x-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleOpenEdit(u)}
                          className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground'
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleResetPassword(u.username)}
                          title='Resetear contraseña'
                          className='h-8 w-8 p-0 text-amber-600 hover:text-amber-700'
                        >
                          <KeyRound className='h-4 w-4' />
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

      {/* Modal Crear/Editar Usuario */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold'>
              {editingUser ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Defina las credenciales y el nivel de privilegios para el usuario en el sistema.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Nombre Completo</Label>
              <Input placeholder='Ej. Yamile Hayes Michel' {...form.register('name')} className='text-xs' />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Nombre de Usuario</Label>
              <Input placeholder='Ej. yhayes' {...form.register('username')} className='text-xs' />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Rol de Usuario</Label>
              <Select
                value={form.watch('role')}
                onValueChange={(val) => form.setValue('role', val as any)}
              >
                <SelectTrigger className='text-xs'>
                  <SelectValue placeholder='Seleccione rol...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ADMIN' className='text-xs font-bold text-primary'>ADMIN (Acceso total)</SelectItem>
                  <SelectItem value='TRANSCRIPTOR' className='text-xs'>TRANSCRIPTOR (Carga de mesas)</SelectItem>
                  <SelectItem value='AYUDANTE' className='text-xs'>AYUDANTE (Gestión delegados)</SelectItem>
                  <SelectItem value='VISOR' className='text-xs'>VISOR (Solo consulta live)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Contraseña inicial</Label>
              <Input
                type='password'
                placeholder={editingUser ? 'Dejar en blanco para mantener actual' : '••••••••'}
                {...form.register('password')}
                className='text-xs'
              />
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
    </>
  )
}
