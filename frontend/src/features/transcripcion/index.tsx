import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LiveStatusBadge } from '@/components/live-status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  FileSpreadsheet,
  Vote,
  Upload,
  CheckCircle2,
  AlertCircle,
  Edit,
  GraduationCap,
  Award,
  Phone,
  MessageSquare,
  Search,
  Lock,
} from 'lucide-react'
import { toast } from 'sonner'
import { useElectionStore, MesaReciente } from '@/stores/election-store'
import { useAuthStore } from '@/stores/auth-store'

export function TranscripcionFeature() {
  const { ultimasMesas, candidatos, guardarOEditarMesa } = useElectionStore()
  const { auth } = useAuthStore()

  const currentUser = auth.user || {
    id: 'transcriptor',
    name: 'Juan Carlos Pérez',
    role: 'TRANSCRIPTOR',
  }

  const isAdmin = currentUser.role === 'ADMIN'

  // Filter tables assigned to this transcriptor (or all tables if Admin)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMesa, setSelectedMesa] = useState<MesaReciente | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [votosInputMap, setVotosInputMap] = useState<Record<string, number>>({})
  const [observacionesInput, setObservacionesInput] = useState('')
  const [actaPreview, setActaPreview] = useState<string>('')

  const mesasAsignadas = ultimasMesas.filter((m) => {
    const matchesSearch =
      m.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.facultad.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false

    if (isAdmin) return true
    return m.transcriptorId === currentUser.id || m.transcriptor === currentUser.name
  })

  const handleOpenTranscripcion = (mesa: MesaReciente) => {
    setSelectedMesa(mesa)
    setObservacionesInput(mesa.observaciones || '')
    setActaPreview(mesa.actaFotoUrl || '')

    // Pre-populate input map if already has votes
    const initialVotes: Record<string, number> = {}
    candidatos.forEach((c) => {
      initialVotes[c.id] = mesa.votosPorCandidato?.[c.id] || 0
    })
    setVotosInputMap(initialVotes)
    setOpenDialog(true)
  }

  const handleVoteChange = (candidatoId: string, valStr: string) => {
    const val = parseInt(valStr, 10)
    setVotosInputMap((prev) => ({
      ...prev,
      [candidatoId]: isNaN(val) ? 0 : Math.max(0, val),
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      setActaPreview(evt.target?.result as string)
      toast.info('Foto de acta cargada')
    }
    reader.readAsDataURL(file)
  }

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMesa) return

    guardarOEditarMesa(selectedMesa.id, votosInputMap, actaPreview, observacionesInput)
    toast.success(`Acta de ${selectedMesa.codigo} guardada y transmitida en tiempo real`)
    setOpenDialog(false)
  }

  return (
    <>
      <Header>
        <div className='flex items-center gap-3 me-auto'>
          <FileSpreadsheet className='h-5 w-5 text-primary' />
          <h1 className='text-base font-bold tracking-tight'>Módulo de Transcripción de Actas</h1>
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
            <h2 className='text-2xl font-bold tracking-tight'>Mis Mesas Asignadas</h2>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Carga y edición exclusiva de actas electorales por transcriptor con actualización en vivo al Visor.
            </p>
          </div>

          <div className='relative w-full sm:w-72'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Buscar mesa asignada...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-9 text-xs'
            />
          </div>
        </div>

        {/* Mesas Cards Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
          {mesasAsignadas.map((m) => {
            const isDocente = m.tipo === 'DOCENTE'
            const isCargada = m.estado === 'CARGADA'
            const isEnCarga = m.estado === 'EN_CARGA'

            return (
              <Card
                key={m.id}
                className={`border-border/60 shadow-sm transition-all hover:shadow-md ${
                  isCargada ? 'bg-card border-emerald-500/30' : isEnCarga ? 'bg-amber-500/5 border-amber-500/30' : ''
                }`}
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <Badge variant='outline' className='font-mono font-bold text-xs bg-primary/10 text-primary border-primary/30'>
                      {m.codigo}
                    </Badge>

                    {isDocente ? (
                      <Badge className='bg-purple-600 text-white font-bold text-[10px] gap-1'>
                        <Award className='h-3 w-3' /> Mesa Docente (1 Voto = 45 Est.)
                      </Badge>
                    ) : (
                      <Badge variant='secondary' className='text-[10px] font-semibold gap-1'>
                        <GraduationCap className='h-3 w-3' /> Estudiantil (Ponderación 1)
                      </Badge>
                    )}
                  </div>
                  <CardTitle className='text-base font-bold pt-2'>{m.facultad}</CardTitle>
                  <CardDescription className='text-xs'>
                    Transcriptor: <strong className='text-foreground'>{m.transcriptor}</strong>
                  </CardDescription>
                </CardHeader>

                <CardContent className='space-y-4 text-xs'>
                  {/* Delegate WhatsApp Contact Card */}
                  {m.delegadoNombre && (
                    <div className='p-2.5 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-between'>
                      <div>
                        <p className='text-[11px] font-bold text-muted-foreground uppercase'>Delegado de Mesa</p>
                        <p className='font-semibold text-foreground flex items-center gap-1'>
                          <Phone className='h-3 w-3 text-primary' /> {m.delegadoNombre}
                        </p>
                      </div>
                      {m.delegadoCelular && (
                        <a
                          href={`https://wa.me/591${m.delegadoCelular}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-md transition-colors shadow-xs'
                        >
                          <MessageSquare className='h-3 w-3' /> WhatsApp
                        </a>
                      )}
                    </div>
                  )}

                  <div className='flex items-center justify-between pt-1 border-t border-border/40 text-muted-foreground'>
                    <span>Estado del Cómputo:</span>
                    {isCargada ? (
                      <span className='font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1'>
                        <CheckCircle2 className='h-3.5 w-3.5' /> CARGADA ({m.votosRegistrados} votos)
                      </span>
                    ) : isEnCarga ? (
                      <span className='font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1'>
                        <AlertCircle className='h-3.5 w-3.5' /> EN PROCESO
                      </span>
                    ) : (
                      <span className='font-bold text-muted-foreground flex items-center gap-1'>
                        <Lock className='h-3.5 w-3.5' /> PENDIENTE
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={() => handleOpenTranscripcion(m)}
                    variant={isCargada ? 'outline' : 'default'}
                    className='w-full font-bold text-xs gap-1.5'
                  >
                    {isCargada ? (
                      <>
                        <Edit className='h-3.5 w-3.5 text-primary' /> Editar Acta Transcrita
                      </>
                    ) : (
                      <>
                        <Vote className='h-3.5 w-3.5' /> Llenar Votos de Mesa
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </Main>

      {/* Modal Transcripción y Edición de Mesa */}
      {selectedMesa && (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className='sm:max-w-lg max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <div className='flex items-center justify-between pe-4'>
                <DialogTitle className='text-lg font-bold flex items-center gap-2'>
                  <FileSpreadsheet className='h-5 w-5 text-primary' />
                  Transcripción de {selectedMesa.codigo}
                </DialogTitle>
                {selectedMesa.tipo === 'DOCENTE' && (
                  <Badge className='bg-purple-600 text-white font-bold text-[10px]'>
                    Docentes (x45)
                  </Badge>
                )}
              </div>
              <DialogDescription className='text-xs'>
                {selectedMesa.facultad} — Ingrese el conteo por candidato y adjunte la foto del acta.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleGuardar} className='space-y-5 py-2'>
              {/* Votes Input Table */}
              <div className='space-y-3 bg-muted/20 p-3.5 rounded-xl border border-border/60'>
                <p className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  Votos Registrados por Candidato
                </p>

                {candidatos.map((c) => (
                  <div key={c.id} className='flex items-center justify-between gap-3 p-2 bg-card rounded-lg border'>
                    <div className='space-y-0.5 max-w-[240px]'>
                      <p className='text-xs font-bold text-foreground truncate'>{c.nombre}</p>
                      <p className='text-[11px] text-muted-foreground truncate'>{c.lista}</p>
                    </div>

                    <div className='flex items-center gap-2'>
                      <Label className='text-xs font-semibold text-muted-foreground'>Votos:</Label>
                      <Input
                        type='number'
                        min={0}
                        value={votosInputMap[c.id] ?? 0}
                        onChange={(e) => handleVoteChange(c.id, e.target.value)}
                        className='w-24 text-right font-extrabold text-sm text-primary font-mono'
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload Act Photo */}
              <div className='space-y-2'>
                <Label className='text-xs font-semibold'>Foto de Acta de Escrutinio</Label>
                <div className='flex items-center gap-3'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => document.getElementById('actaInputFile')?.click()}
                    className='text-xs font-semibold gap-1.5'
                  >
                    <Upload className='h-3.5 w-3.5 text-primary' /> Adjuntar Foto de Acta
                  </Button>
                  <input
                    id='actaInputFile'
                    type='file'
                    accept='image/*'
                    onChange={handleFileChange}
                    className='hidden'
                  />
                  {actaPreview && (
                    <span className='text-[11px] font-bold text-emerald-600 flex items-center gap-1'>
                      <CheckCircle2 className='h-3.5 w-3.5' /> Imagen Cargada
                    </span>
                  )}
                </div>

                {actaPreview && (
                  <div className='mt-2 rounded-lg overflow-hidden border max-h-36'>
                    <img src={actaPreview} alt='Acta previsualización' className='w-full object-cover' />
                  </div>
                )}
              </div>

              {/* Observaciones */}
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Observaciones del Transcriptor</Label>
                <Textarea
                  placeholder='Observaciones sobre el llenado de mesa o firma de delegados...'
                  value={observacionesInput}
                  onChange={(e) => setObservacionesInput(e.target.value)}
                  className='text-xs h-20'
                />
              </div>

              <DialogFooter className='pt-2'>
                <Button type='button' variant='outline' onClick={() => setOpenDialog(false)} className='text-xs'>
                  Cancelar
                </Button>
                <Button type='submit' className='text-xs font-bold gap-1.5'>
                  <CheckCircle2 className='h-4 w-4' /> Guardar y Publicar Cómputo
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
