import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/lib/api/users'
import { asignacionesApi } from '@/lib/api/asignaciones'
import { mesasApi } from '@/lib/api/mesas'
import type { Role, UserSummary } from '@/lib/api/types'
import { handleServerError } from '@/lib/handle-server-error'
import { ReportPreviewDialog } from '@/lib/pdf/ReportPreviewDialog'
import { TranscriptoresDocument } from '@/lib/pdf/documents/TranscriptoresDocument'
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
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  UserPlus,
  Edit,
  Search,
  ShieldCheck,
  Phone,
  Vote,
  Printer,
  Settings2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const userSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  username: z.string().min(1, 'El usuario es obligatorio'),
  telefono: z.string().min(1, 'El teléfono es obligatorio'),
  role: z.enum(['ADMIN', 'TRANSCRIPTOR', 'AYUDANTE', 'VISOR', 'CONTROL_CALIDAD']),
  password: z.string().optional(),
})

export function UsersFeature() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleTabFilter, setRoleTabFilter] = useState('TODOS')
  const [openModal, setOpenModal] = useState(false)
  const [openReportModal, setOpenReportModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserSummary | null>(null)
  const [assigningUser, setAssigningUser] = useState<UserSummary | null>(null)
  const [selectedMesasMap, setSelectedMesasMap] = useState<Record<string, boolean>>({})

  const { data: usersList = [], isPending } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
  })
  const { data: asignaciones = [] } = useQuery({
    queryKey: ['asignaciones'],
    queryFn: asignacionesApi.list,
  })
  const { data: mesas = [] } = useQuery({
    queryKey: ['mesas'],
    queryFn: () => mesasApi.list(),
  })

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', username: '', telefono: '', role: 'TRANSCRIPTOR', password: '' },
  })

  const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: ['users'] })

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      invalidateUsers()
      toast.success('Nuevo usuario registrado correctamente')
      setOpenModal(false)
    },
    onError: handleServerError,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Parameters<typeof usersApi.update>[1]) =>
      usersApi.update(id, payload),
    onSuccess: () => {
      invalidateUsers()
      toast.success('Usuario actualizado correctamente')
      setOpenModal(false)
    },
    onError: handleServerError,
  })

  const assignMutation = useMutation({
    mutationFn: ({ transcriptorId, mesaIds }: { transcriptorId: string; mesaIds: string[] }) =>
      asignacionesApi.updateMesas(transcriptorId, mesaIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['asignaciones'] })
      queryClient.invalidateQueries({ queryKey: ['mesas'] })
      toast.success('Mesas asignadas correctamente')
      setAssigningUser(null)
      void variables
    },
    onError: handleServerError,
  })

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.telefono ?? '').includes(searchTerm)
    const matchesRole = roleTabFilter === 'TODOS' || u.role === roleTabFilter
    return matchesSearch && matchesRole
  })

  const transcriptoresPdf = useMemo(
    () => (
      <TranscriptoresDocument
        transcriptores={usersList.filter((u) => u.role === 'TRANSCRIPTOR')}
        asignaciones={asignaciones}
      />
    ),
    [usersList, asignaciones],
  )

  const handleOpenAdd = () => {
    setEditingUser(null)
    form.reset({ name: '', username: '', telefono: '', role: 'TRANSCRIPTOR', password: '' })
    setOpenModal(true)
  }

  const handleOpenEdit = (user: UserSummary) => {
    setEditingUser(user)
    form.reset({ name: user.name, username: user.username, telefono: user.telefono || '', role: user.role, password: '' })
    setOpenModal(true)
  }

  const handleToggleStatus = (user: UserSummary) => {
    updateMutation.mutate({ id: user.id, isActive: !user.isActive })
  }

  const handleOpenAssign = (user: UserSummary) => {
    setAssigningUser(user)
    const asig = asignaciones.find((a) => a.transcriptorId === user.id)
    const map: Record<string, boolean> = {}
    mesas.forEach((m) => {
      map[m.id] = asig ? asig.mesasCodigos.includes(m.codigo) : false
    })
    setSelectedMesasMap(map)
  }

  const mesasDisponiblesParaAsignar = assigningUser
    ? mesas.filter((m) => {
        const dueño = asignaciones.find((a) => a.mesasCodigos.includes(m.codigo))
        return !dueño || dueño.transcriptorId === assigningUser.id
      })
    : []
  const mesasOcultasPorOtroTranscriptor = mesas.length - mesasDisponiblesParaAsignar.length

  const handleSaveUserAssignment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!assigningUser) return
    const mesaIds = Object.keys(selectedMesasMap).filter((id) => selectedMesasMap[id])
    assignMutation.mutate({ transcriptorId: assigningUser.id, mesaIds })
  }

  function onSubmit(values: z.infer<typeof userSchema>) {
    if (editingUser) {
      updateMutation.mutate({
        id: editingUser.id,
        name: values.name,
        username: values.username,
        telefono: values.telefono,
        role: values.role as Role,
        ...(values.password ? { password: values.password } : {}),
      })
    } else {
      if (!values.password || values.password.length < 6) {
        form.setError('password', { message: 'La contraseña debe tener al menos 6 caracteres' })
        return
      }
      createMutation.mutate({
        name: values.name,
        username: values.username,
        telefono: values.telefono,
        role: values.role as Role,
        password: values.password,
      })
    }
  }

  return (
    <>
      <Header>
        <div className='flex items-center gap-3 me-auto min-w-0'>
          <Users className='h-5 w-5 text-primary shrink-0' />
          <h1 className='text-base font-bold tracking-tight truncate min-w-0'>Gestión de Usuarios y Roles</h1>
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
              Control de acceso por roles, números de celular y asignación directa de mesas.
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              onClick={() => setOpenReportModal(true)}
              variant='outline'
              className='font-semibold gap-2 text-xs border-primary/30 text-primary hover:bg-primary/5'
            >
              <Printer className='h-4 w-4' /> Vista Previa e Imprimir Lista
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

              <Tabs value={roleTabFilter} onValueChange={setRoleTabFilter} className='w-full sm:w-auto'>
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
            {isPending ? (
              <Skeleton className='h-64 w-full' />
            ) : (
              <div className='rounded-md border overflow-x-auto'>
                <Table>
                  <TableHeader className='bg-muted/40'>
                    <TableRow>
                      <TableHead className='font-semibold text-xs py-3 w-[220px]'>Nombre Completo</TableHead>
                      <TableHead className='font-semibold text-xs py-3 w-[130px]'>Usuario</TableHead>
                      <TableHead className='font-semibold text-xs py-3 w-[130px]'>Teléfono Celular</TableHead>
                      <TableHead className='font-semibold text-xs py-3 w-[130px]'>Rol Asignado</TableHead>
                      <TableHead className='font-semibold text-xs py-3 w-[200px]'>Mesas Asignadas</TableHead>
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

                          <TableCell className='text-xs text-muted-foreground font-mono py-3'>@{u.username}</TableCell>

                          <TableCell className='text-xs font-semibold text-foreground py-3'>
                            <div className='flex items-center gap-1.5'>
                              <Phone className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0' />
                              <span>+591 {u.telefono ?? '—'}</span>
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
                                    : u.role === 'CONTROL_CALIDAD'
                                      ? 'bg-teal-500/10 text-teal-600 border-teal-500/30'
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
                                  <Settings2 className='h-3 w-3 mr-0.5' /> Asignar
                                </Button>
                              </div>
                            ) : (
                              <span className='text-muted-foreground text-[11px] font-medium'>
                                {u.role === 'ADMIN' ? 'Acceso Global' : 'Solo Consulta'}
                              </span>
                            )}
                          </TableCell>

                          <TableCell className='text-center py-3'>
                            <Switch checked={u.isActive} onCheckedChange={() => handleToggleStatus(u)} />
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
            )}
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
                {mesasOcultasPorOtroTranscriptor > 0 && (
                  <span className='block mt-1 text-amber-600 dark:text-amber-400'>
                    {mesasOcultasPorOtroTranscriptor} mesa(s) ya asignada(s) a otro transcriptor no se muestran aquí.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveUserAssignment} className='space-y-4 py-2'>
              <div className='space-y-2 max-h-60 overflow-y-auto pr-1'>
                {mesasDisponiblesParaAsignar.map((m) => (
                  <label
                    key={m.id}
                    className='flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-muted/30 cursor-pointer'
                  >
                    <div className='flex items-center gap-2.5'>
                      <input
                        type='checkbox'
                        checked={!!selectedMesasMap[m.id]}
                        onChange={(e) =>
                          setSelectedMesasMap((prev) => ({ ...prev, [m.id]: e.target.checked }))
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
                <Button type='submit' disabled={assignMutation.isPending} className='text-xs font-bold'>
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
              <Label className='text-xs font-semibold'>
                Contraseña {editingUser ? '(dejar en blanco para no cambiarla)' : '*'}
              </Label>
              <Input type='password' placeholder='••••••••' {...form.register('password')} className='text-xs' />
              {form.formState.errors.password && (
                <p className='text-[11px] text-destructive'>{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Rol de Usuario *</Label>
              <Select value={form.watch('role')} onValueChange={(val) => form.setValue('role', val as Role)}>
                <SelectTrigger className='text-xs'>
                  <SelectValue placeholder='Seleccione rol...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ADMIN' className='text-xs font-bold text-primary'>ADMIN (Acceso total)</SelectItem>
                  <SelectItem value='TRANSCRIPTOR' className='text-xs'>TRANSCRIPTOR (Carga de mesas asignadas)</SelectItem>
                  <SelectItem value='AYUDANTE' className='text-xs'>AYUDANTE (Apoyo técnico)</SelectItem>
                  <SelectItem value='CONTROL_CALIDAD' className='text-xs'>CONTROL DE CALIDAD (Revisión de actas)</SelectItem>
                  <SelectItem value='VISOR' className='text-xs'>VISOR (Solo consulta live)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className='pt-2'>
              <Button type='button' variant='outline' onClick={() => setOpenModal(false)} className='text-xs'>
                Cancelar
              </Button>
              <Button type='submit' disabled={createMutation.isPending || updateMutation.isPending} className='text-xs font-bold'>
                Guardar Usuario
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ReportPreviewDialog
        open={openReportModal}
        onOpenChange={setOpenReportModal}
        title='Nómina de Transcriptores'
        description='Formato de nómina oficial de personal transcriptor acreditado para la carga de actas electoral (USFX 2026).'
        fileName='nomina-transcriptores.pdf'
        content={transcriptoresPdf}
      />
    </>
  )
}
