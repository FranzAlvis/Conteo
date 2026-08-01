import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LiveStatusBadge } from '@/components/live-status-badge'
import { useElectionStore } from '@/stores/election-store'
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
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Search, PlusCircle, Vote, Upload, CheckCircle2, Clock, AlertCircle, FileText, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const cargarMesaSchema = z.object({
  mesaId: z.string().min(1, 'Seleccione una mesa'),
  votosYamile: z.coerce.number().min(0, 'Cantidad no válida'),
  votosMendoza: z.coerce.number().min(0, 'Cantidad no válida'),
  votosSoliz: z.coerce.number().min(0, 'Cantidad no válida'),
  votosBlanco: z.coerce.number().min(0, 'Cantidad no válida'),
  observaciones: z.string().optional(),
})

type CargarMesaFormValues = z.infer<typeof cargarMesaSchema>

export function MesasFeature() {
  const { ultimasMesas, cargarNuevaMesa } = useElectionStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('TODOS')
  const [openModal, setOpenModal] = useState(false)
  const [actaFileName, setActaFileName] = useState<string | null>(null)

  const form = useForm<CargarMesaFormValues>({
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

  const filteredMesas = ultimasMesas.filter((m) => {
    const matchesSearch =
      m.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.facultad.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'TODOS' || m.estado === statusFilter
    return matchesSearch && matchesStatus
  })

  function onSubmit(values: CargarMesaFormValues) {
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
      '1': values.votosYamile,
      '2': values.votosMendoza,
      '3': values.votosSoliz,
      '4': values.votosBlanco,
    }

    cargarNuevaMesa(
      {
        id: values.mesaId,
        codigo: mesaSeleccionada?.codigo || 'MESA-NUEVA',
        facultad: mesaSeleccionada?.facultad || 'Facultad General',
        transcriptor: 'Transcriptor Actual',
        hora: new Date().toLocaleTimeString(),
        estado: 'CARGADA',
        votosRegistrados: sumaTotal,
      },
      votosMap
    )

    toast.success(`Mesa ${mesaSeleccionada?.codigo || ''} guardada y bloqueada exitosamente`)
    setOpenModal(false)
    form.reset()
    setActaFileName(null)
  }

  return (
    <>
      <Header>
        <div className='flex items-center gap-3 me-auto'>
          <Vote className='h-5 w-5 text-primary' />
          <h1 className='text-base font-bold tracking-tight'>Gestión y Carga de Mesas</h1>
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
            <h2 className='text-2xl font-bold tracking-tight'>Mesas Electorales</h2>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Transcripción de actas oficiales y control de estado de escrutinio por facultad.
            </p>
          </div>
          <Button onClick={() => setOpenModal(true)} className='font-semibold gap-2 shadow-sm'>
            <PlusCircle className='h-4 w-4' /> Cargar Acta de Mesa
          </Button>
        </div>

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
            <div className='rounded-md border overflow-hidden'>
              <Table>
                <TableHeader className='bg-muted/40'>
                  <TableRow>
                    <TableHead className='font-semibold text-xs'>Código Mesa</TableHead>
                    <TableHead className='font-semibold text-xs'>Facultad / Ubicación</TableHead>
                    <TableHead className='font-semibold text-xs'>Transcriptor</TableHead>
                    <TableHead className='font-semibold text-xs text-center'>Votos Registrados</TableHead>
                    <TableHead className='font-semibold text-xs text-center'>Última Act.</TableHead>
                    <TableHead className='font-semibold text-xs text-right'>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMesas.map((m) => (
                    <TableRow key={m.id} className='hover:bg-muted/30'>
                      <TableCell className='font-bold text-xs flex items-center gap-1.5'>
                        <Lock className='h-3.5 w-3.5 text-muted-foreground' />
                        {m.codigo}
                      </TableCell>
                      <TableCell className='text-xs text-muted-foreground'>{m.facultad}</TableCell>
                      <TableCell className='text-xs font-medium'>{m.transcriptor}</TableCell>
                      <TableCell className='text-xs text-center font-bold text-primary'>
                        {m.votosRegistrados ? m.votosRegistrados : '—'}
                      </TableCell>
                      <TableCell className='text-xs text-center font-mono text-muted-foreground'>
                        {m.hora}
                      </TableCell>
                      <TableCell className='text-right'>
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

      {/* Modal / Dialog Cargar Mesa */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
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

          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Seleccionar Mesa</Label>
              <Select onValueChange={(val) => form.setValue('mesaId', val)}>
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
                    {...form.register('votosYamile')}
                    className='text-xs font-bold text-primary'
                  />
                </div>

                <div className='space-y-1'>
                  <Label className='text-[11px] text-muted-foreground'>Dr. Roberto Mendoza</Label>
                  <Input
                    type='number'
                    min={0}
                    {...form.register('votosMendoza')}
                    className='text-xs font-bold'
                  />
                </div>

                <div className='space-y-1'>
                  <Label className='text-[11px] text-muted-foreground'>Dra. Patricia Soliz</Label>
                  <Input
                    type='number'
                    min={0}
                    {...form.register('votosSoliz')}
                    className='text-xs font-bold'
                  />
                </div>

                <div className='space-y-1'>
                  <Label className='text-[11px] text-muted-foreground'>Blancos / Nulos</Label>
                  <Input
                    type='number'
                    min={0}
                    {...form.register('votosBlanco')}
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
              <Button type='button' variant='outline' onClick={() => setOpenModal(false)} className='text-xs'>
                Cancelar
              </Button>
              <Button type='submit' className='text-xs font-bold'>
                Guardar y Bloquear Mesa
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
