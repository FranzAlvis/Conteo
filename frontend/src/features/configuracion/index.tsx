import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { candidatosApi } from '@/lib/api/candidatos'
import { mesasApi } from '@/lib/api/mesas'
import { configuracionApi } from '@/lib/api/configuracion'
import { handleServerError } from '@/lib/handle-server-error'
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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Settings, PlusCircle, Award, Building, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export function ConfiguracionFeature() {
  const queryClient = useQueryClient()
  const [openCandidatoModal, setOpenCandidatoModal] = useState(false)
  const [nombreCandidato, setNombreCandidato] = useState('')
  const [nombreLista, setNombreLista] = useState('')
  const [esPropio, setEsPropio] = useState(false)

  const { data: candidatos = [], isPending: candidatosPending } = useQuery({
    queryKey: ['candidatos', 'all'],
    queryFn: () => candidatosApi.list(true),
  })
  const { data: mesas = [], isPending: mesasPending } = useQuery({
    queryKey: ['mesas'],
    queryFn: () => mesasApi.list(),
  })
  const { data: configuracion } = useQuery({
    queryKey: ['configuracion'],
    queryFn: configuracionApi.get,
  })

  const crearCandidatoMutation = useMutation({
    mutationFn: candidatosApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidatos'] })
      toast.success(`Candidato "${nombreCandidato}" registrado exitosamente`)
      setOpenCandidatoModal(false)
      setNombreCandidato('')
      setNombreLista('')
      setEsPropio(false)
    },
    onError: handleServerError,
  })

  const desactivarCandidatoMutation = useMutation({
    mutationFn: candidatosApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidatos'] })
      toast.success('Candidato dado de baja de la boleta')
    },
    onError: handleServerError,
  })

  const toggleConteoMutation = useMutation({
    mutationFn: configuracionApi.setConteoAbierto,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['configuracion'] })
      toast.info(data.conteoAbierto ? 'Conteo de votos ABIERTO' : 'Conteo de votos CERRADO')
    },
    onError: handleServerError,
  })

  const handleCrearCandidato = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombreCandidato || !nombreLista) {
      toast.error('Complete todos los campos del candidato')
      return
    }
    crearCandidatoMutation.mutate({ nombre: nombreCandidato, lista: nombreLista, esPropio })
  }

  const conteoAbierto = configuracion?.conteoAbierto ?? true

  return (
    <>
      <Header>
        <div className='flex items-center gap-3 me-auto'>
          <Settings className='h-5 w-5 text-primary' />
          <h1 className='text-base font-bold tracking-tight'>Parametrización y Configuración</h1>
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
            <h2 className='text-2xl font-bold tracking-tight'>Configuración del Proceso Electoral</h2>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Parametrización de candidatos, cargos y mesas del proceso electoral.
            </p>
          </div>
          <div className='flex items-center gap-3 bg-card p-2 rounded-lg border shadow-sm'>
            <Label className='text-xs font-bold text-foreground'>Estado Global del Conteo:</Label>
            <div className='flex items-center gap-2'>
              <Switch
                checked={conteoAbierto}
                disabled={toggleConteoMutation.isPending}
                onCheckedChange={(val) => toggleConteoMutation.mutate(val)}
              />
              <Badge className={conteoAbierto ? 'bg-emerald-600 text-white' : 'bg-muted-foreground text-white'}>
                {conteoAbierto ? 'ABIERTO' : 'CERRADO'}
              </Badge>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Seccion Candidatos */}
          <Card className='border-border/60 shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <div>
                <CardTitle className='text-base font-bold flex items-center gap-2'>
                  <Award className='h-5 w-5 text-primary' />
                  Candidatos y Listas
                </CardTitle>
                <CardDescription className='text-xs'>
                  Opciones electorales habilitadas en la boleta.
                </CardDescription>
              </div>
              <Button size='sm' onClick={() => setOpenCandidatoModal(true)} className='text-xs gap-1.5'>
                <PlusCircle className='h-3.5 w-3.5' /> Agregar Candidato
              </Button>
            </CardHeader>
            <CardContent>
              {candidatosPending ? (
                <Skeleton className='h-48 w-full' />
              ) : (
                <div className='rounded-md border overflow-hidden'>
                  <Table>
                    <TableHeader className='bg-muted/40'>
                      <TableRow>
                        <TableHead className='font-semibold text-xs'>Candidato</TableHead>
                        <TableHead className='font-semibold text-xs'>Lista</TableHead>
                        <TableHead className='font-semibold text-xs text-center'>Propio</TableHead>
                        <TableHead className='font-semibold text-xs text-center'>Estado</TableHead>
                        <TableHead className='font-semibold text-xs text-right'>Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {candidatos.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className='font-bold text-xs'>{c.nombre}</TableCell>
                          <TableCell className='text-xs text-muted-foreground'>{c.lista}</TableCell>
                          <TableCell className='text-center'>
                            {c.esPropio ? (
                              <Badge className='bg-primary text-primary-foreground text-[10px]'>Sí</Badge>
                            ) : (
                              <Badge variant='outline' className='text-[10px] text-muted-foreground'>No</Badge>
                            )}
                          </TableCell>
                          <TableCell className='text-center'>
                            {c.isActive ? (
                              <Badge variant='outline' className='text-[10px] text-emerald-600 border-emerald-500/30'>Activo</Badge>
                            ) : (
                              <Badge variant='outline' className='text-[10px] text-muted-foreground'>Baja</Badge>
                            )}
                          </TableCell>
                          <TableCell className='text-right'>
                            {c.isActive && (
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => desactivarCandidatoMutation.mutate(c.id)}
                                className='h-7 w-7 p-0 text-destructive'
                              >
                                <Trash2 className='h-3.5 w-3.5' />
                              </Button>
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

          {/* Seccion Mesas Habilitadas */}
          <Card className='border-border/60 shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <div>
                <CardTitle className='text-base font-bold flex items-center gap-2'>
                  <Building className='h-5 w-5 text-primary' />
                  Mesas y Padrones
                </CardTitle>
                <CardDescription className='text-xs'>
                  Catálogo de mesas habilitadas por facultad.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {mesasPending ? (
                <Skeleton className='h-48 w-full' />
              ) : (
                <div className='rounded-md border overflow-hidden max-h-96 overflow-y-auto'>
                  <Table>
                    <TableHeader className='bg-muted/40'>
                      <TableRow>
                        <TableHead className='font-semibold text-xs'>Mesa</TableHead>
                        <TableHead className='font-semibold text-xs'>Facultad</TableHead>
                        <TableHead className='font-semibold text-xs text-right'>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mesas.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className='font-bold text-xs'>{m.codigo}</TableCell>
                          <TableCell className='text-xs text-muted-foreground'>{m.facultad}</TableCell>
                          <TableCell className='text-right'>
                            <Badge variant='outline' className='text-[10px] font-bold uppercase'>
                              {m.estado}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Main>

      {/* Modal Nuevo Candidato */}
      <Dialog open={openCandidatoModal} onOpenChange={setOpenCandidatoModal}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold flex items-center gap-2'>
              <Award className='h-5 w-5 text-primary' />
              Registrar Nuevo Candidato
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Agregue un nuevo candidato para la boleta de votación.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCrearCandidato} className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Nombre del Candidato</Label>
              <Input
                placeholder='Ej. Dr. Andrés Morales'
                value={nombreCandidato}
                onChange={(e) => setNombreCandidato(e.target.value)}
                className='text-xs'
              />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Nombre de Lista / Frente</Label>
              <Input
                placeholder='Ej. Frente Innovación Docente (Lista 4)'
                value={nombreLista}
                onChange={(e) => setNombreLista(e.target.value)}
                className='text-xs'
              />
            </div>

            <div className='flex items-center justify-between pt-2 border-t'>
              <Label className='text-xs font-semibold'>¿Es candidatura propia?</Label>
              <Switch checked={esPropio} onCheckedChange={setEsPropio} />
            </div>

            <DialogFooter className='pt-2'>
              <Button type='button' variant='outline' onClick={() => setOpenCandidatoModal(false)} className='text-xs'>
                Cancelar
              </Button>
              <Button type='submit' disabled={crearCandidatoMutation.isPending} className='text-xs font-bold'>
                Guardar Candidato
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
