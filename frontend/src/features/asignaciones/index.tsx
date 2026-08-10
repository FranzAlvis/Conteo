import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { asignacionesApi } from '@/lib/api/asignaciones'
import { mesasApi } from '@/lib/api/mesas'
import type { Asignacion } from '@/lib/api/types'
import { handleServerError } from '@/lib/handle-server-error'
import { getUserRole } from '@/lib/auth-role'
import { useAuthStore } from '@/stores/auth-store'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LiveStatusBadge } from '@/components/live-status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Users,
  UserCheck,
  Phone,
  MessageSquare,
  Check,
  Vote,
  Search,
  Settings2,
  Share2,
} from 'lucide-react'
import { toast } from 'sonner'

export function AsignacionesFeature() {
  const queryClient = useQueryClient()
  const role = useAuthStore((state) => getUserRole(state.auth.user))
  const isAdmin = role === 'ADMIN'
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTranscriptor, setSelectedTranscriptor] = useState<Asignacion | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedMesasMap, setSelectedMesasMap] = useState<Record<string, boolean>>({})

  const { data: asignaciones = [], isPending } = useQuery({
    queryKey: ['asignaciones'],
    queryFn: asignacionesApi.list,
  })
  const { data: mesas = [] } = useQuery({
    queryKey: ['mesas'],
    queryFn: () => mesasApi.list(),
  })

  const updateMutation = useMutation({
    mutationFn: ({ transcriptorId, mesaIds }: { transcriptorId: string; mesaIds: string[] }) =>
      asignacionesApi.updateMesas(transcriptorId, mesaIds),
    onSuccess: (asignacion) => {
      queryClient.invalidateQueries({ queryKey: ['asignaciones'] })
      queryClient.invalidateQueries({ queryKey: ['mesas'] })
      toast.success(`Asignación de mesas actualizada para ${asignacion.transcriptorNombre}`)
      setOpenDialog(false)
    },
    onError: handleServerError,
  })

  const filteredAsignaciones = asignaciones.filter(
    (a) =>
      a.transcriptorNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.transcriptorTelefono ?? '').includes(searchTerm) ||
      a.mesasCodigos.some((m) => m.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleOpenAssignModal = (trans: Asignacion) => {
    setSelectedTranscriptor(trans)
    const map: Record<string, boolean> = {}
    mesas.forEach((m) => {
      map[m.id] = trans.mesasCodigos.includes(m.codigo)
    })
    setSelectedMesasMap(map)
    setOpenDialog(true)
  }

  const handleMesaToggle = (mesaId: string, checked: boolean) => {
    setSelectedMesasMap((prev) => ({ ...prev, [mesaId]: checked }))
  }

  const handleSaveAsignacion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTranscriptor) return
    const mesaIds = Object.keys(selectedMesasMap).filter((id) => selectedMesasMap[id])
    updateMutation.mutate({ transcriptorId: selectedTranscriptor.transcriptorId, mesaIds })
  }

  const handleCopiarContactoWhatsApp = (trans: Asignacion) => {
    let text = `📱 *GRUPO DE TRABAJO WHATSAPP DE CONTEO — USFX*\n\n`
    text += `👤 *Transcriptor Encargado:* ${trans.transcriptorNombre} (${trans.transcriptorTelefono ?? 'sin teléfono'})\n`
    text += `📌 *Mesas Asignadas:* ${trans.mesasCodigos.join(', ') || 'Ninguna'}\n\n`
    text += `👥 *Delegados de Mesa Coordinados:*\n`

    trans.delegados.forEach((d) => {
      text += `• ${d.nombre} (${d.mesaCodigo ?? 'sin mesa'}): 📞 +591 ${d.celular}\n`
    })

    navigator.clipboard.writeText(text)
    toast.success('Lista de contactos copiada para crear grupo de WhatsApp')
  }

  return (
    <>
      <Header>
        <div className='flex items-center gap-3 me-auto min-w-0'>
          <Users className='h-5 w-5 text-primary shrink-0' />
          <h1 className='text-base font-bold tracking-tight truncate min-w-0'>Asignación de Mesas y Grupos de WhatsApp</h1>
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
            <h2 className='text-2xl font-bold tracking-tight'>Control de Transcriptores y Delegados</h2>
            <p className='text-xs text-muted-foreground mt-0.5'>
              {isAdmin
                ? 'Asignación exclusiva de mesas para evitar sobreposición y números de teléfono para coordinar grupos de WhatsApp.'
                : 'Vista de consulta: transcriptores, mesas asignadas y números de teléfono para coordinar grupos de WhatsApp.'}
            </p>
          </div>

          <div className='relative w-full sm:w-72'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Buscar transcriptor o mesa...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-9 text-xs'
            />
          </div>
        </div>

        {isPending ? (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className='h-72 w-full' />
            ))}
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {filteredAsignaciones.map((trans) => (
              <Card key={trans.transcriptorId} className='border-border/60 shadow-sm'>
                <CardHeader className='pb-4 border-b border-border/40'>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-1'>
                      <Badge variant='outline' className='text-[10px] font-bold uppercase bg-primary/10 text-primary border-primary/30'>
                        TRANSCRIPTOR AUTORIZADO
                      </Badge>
                      <CardTitle className='text-lg font-bold text-foreground flex items-center gap-2 pt-1'>
                        <UserCheck className='h-5 w-5 text-primary' /> {trans.transcriptorNombre}
                      </CardTitle>
                      <CardDescription className='text-xs font-semibold text-foreground flex items-center gap-1 font-mono'>
                        <Phone className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' /> +591 {trans.transcriptorTelefono ?? '—'}
                      </CardDescription>
                    </div>

                    {isAdmin && (
                      <Button
                        onClick={() => handleOpenAssignModal(trans)}
                        variant='outline'
                        size='sm'
                        className='text-xs font-semibold gap-1.5'
                      >
                        <Settings2 className='h-3.5 w-3.5 text-primary' /> Asignar Mesas
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className='space-y-4 pt-4 text-xs'>
                  <div className='space-y-1.5'>
                    <p className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                      Mesas Bajo su Responsabilidad:
                    </p>
                    <div className='flex flex-wrap gap-1.5'>
                      {trans.mesasCodigos.length > 0 ? (
                        trans.mesasCodigos.map((cod) => (
                          <Badge key={cod} variant='secondary' className='font-mono font-bold text-xs gap-1 py-1'>
                            <Vote className='h-3 w-3 text-primary' /> {cod}
                          </Badge>
                        ))
                      ) : (
                        <span className='italic text-muted-foreground text-xs'>Sin mesas asignadas</span>
                      )}
                    </div>
                  </div>

                  <div className='space-y-2 pt-2 border-t border-border/40'>
                    <div className='flex items-center justify-between'>
                      <p className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                        Delegados para Grupo de WhatsApp:
                      </p>
                      <span className='text-[11px] font-bold text-primary'>{trans.delegados.length} delegados vinculados</span>
                    </div>

                    <div className='space-y-2'>
                      {trans.delegados.map((del) => (
                        <div key={del.id} className='p-2.5 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-between'>
                          <div>
                            <p className='font-bold text-xs text-foreground'>{del.nombre}</p>
                            <p className='text-[11px] text-muted-foreground flex items-center gap-1 font-mono'>
                              <Phone className='h-3 w-3 text-emerald-600 dark:text-emerald-400' /> +591 {del.celular} ({del.mesaCodigo ?? 'sin mesa'})
                            </p>
                          </div>

                          <a
                            href={`https://wa.me/591${del.celular}`}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded-md transition-colors shadow-xs'
                          >
                            <MessageSquare className='h-3 w-3' /> Chat
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className='pt-2'>
                    <Button
                      onClick={() => handleCopiarContactoWhatsApp(trans)}
                      className='w-full text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white gap-2 shadow-sm'
                    >
                      <Share2 className='h-3.5 w-3.5' /> Copiar Datos para Grupo WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Main>

      {selectedTranscriptor && (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='text-lg font-bold flex items-center gap-2'>
                <Settings2 className='h-5 w-5 text-primary' />
                Asignación de Mesas
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Seleccione las mesas que transcribirá <strong>{selectedTranscriptor.transcriptorNombre}</strong>.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveAsignacion} className='space-y-4 py-2'>
              <div className='space-y-2 max-h-60 overflow-y-auto pr-1'>
                {mesas.map((m) => (
                  <div
                    key={m.id}
                    className='flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-muted/30 cursor-pointer'
                    onClick={() => handleMesaToggle(m.id, !selectedMesasMap[m.id])}
                  >
                    <div className='flex items-center gap-2.5'>
                      <Checkbox
                        checked={!!selectedMesasMap[m.id]}
                        onCheckedChange={(val) => handleMesaToggle(m.id, !!val)}
                      />
                      <div>
                        <p className='text-xs font-bold text-foreground'>{m.codigo}</p>
                        <p className='text-[11px] text-muted-foreground'>{m.facultad}</p>
                      </div>
                    </div>

                    <Badge variant='outline' className='text-[10px] font-bold'>
                      {m.tipo}
                    </Badge>
                  </div>
                ))}
              </div>

              <DialogFooter className='pt-2'>
                <Button type='button' variant='outline' onClick={() => setOpenDialog(false)} className='text-xs'>
                  Cancelar
                </Button>
                <Button type='submit' disabled={updateMutation.isPending} className='text-xs font-bold gap-1'>
                  <Check className='h-4 w-4' /> Guardar Asignaciones
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
