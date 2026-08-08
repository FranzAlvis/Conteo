import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { resultadosApi } from '@/lib/api/resultados'
import type { CandidatoResultado } from '@/lib/api/types'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LiveStatusBadge } from '@/components/live-status-badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Radio, Vote, Trophy, Activity, GraduationCap, Award, Zap } from 'lucide-react'
import { CandidatosChart } from '../dashboard/components/candidatos-chart'

export function ResultadosFeature() {
  const { data, isPending } = useQuery({
    queryKey: ['resultados'],
    queryFn: resultadosApi.get,
    refetchInterval: 15_000,
  })

  const [activeSector, setActiveSector] = useState<'ponderado' | 'estudiantil' | 'docente'>('ponderado')

  const candidatos = data?.candidatos ?? []
  const totalVotosPonderados = data?.totalVotosPonderados ?? 0
  const totalVotosEstudiantiles = data?.totalVotosEstudiantiles ?? 0
  const totalVotosDocentes = data?.totalVotosDocentes ?? 0
  const mesasCargadas = data?.mesasCargadas ?? 0
  const totalMesas = data?.totalMesas ?? 0

  const getLeader = (): { candidate: CandidatoResultado | null; votes: number } => {
    let maxVal = -1
    let leadCand: CandidatoResultado | null = null
    candidatos.forEach((c) => {
      const val =
        activeSector === 'ponderado'
          ? c.votosPonderados
          : activeSector === 'estudiantil'
            ? c.votosEstudiantiles
            : c.votosDocentes
      if (val > maxVal && val > 0) {
        maxVal = val
        leadCand = c
      }
    })
    return { candidate: leadCand, votes: maxVal }
  }

  const { candidate: lider, votes: liderVotos } = getLeader()
  const totalSectorVotos =
    activeSector === 'ponderado'
      ? totalVotosPonderados
      : activeSector === 'estudiantil'
        ? totalVotosEstudiantiles
        : totalVotosDocentes

  return (
    <>
      <Header>
        <div className='flex items-center gap-3 me-auto'>
          <Radio className='h-5 w-5 text-primary animate-pulse' />
          <h1 className='text-base font-bold tracking-tight'>Resultados en Tiempo Real — Visor Live Ponderado</h1>
        </div>
        <div className='flex items-center gap-3'>
          <LiveStatusBadge />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='space-y-6 p-4 sm:p-6'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-3 rounded-xl border shadow-xs'>
          <div>
            <h2 className='text-xl font-extrabold tracking-tight flex items-center gap-2'>
              Visor de Conteo General USFX
            </h2>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Fórmulas ponderadas: 1 Voto de Docente equivale a 45 Votos Estudiantiles.
            </p>
          </div>

          <Tabs value={activeSector} onValueChange={(val) => setActiveSector(val as typeof activeSector)} className='w-full sm:w-auto'>
            <TabsList className='grid grid-cols-3 w-full sm:w-auto font-bold text-xs h-9'>
              <TabsTrigger value='ponderado' className='gap-1 text-xs'>
                <Zap className='h-3.5 w-3.5 text-amber-500' /> General Ponderado
              </TabsTrigger>
              <TabsTrigger value='estudiantil' className='gap-1 text-xs'>
                <GraduationCap className='h-3.5 w-3.5 text-blue-500' /> Estudiantes
              </TabsTrigger>
              <TabsTrigger value='docente' className='gap-1 text-xs'>
                <Award className='h-3.5 w-3.5 text-purple-500' /> Docentes (x45)
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isPending ? (
          <Skeleton className='h-32 w-full rounded-2xl' />
        ) : (
          lider && (
            <div className='flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-lg border border-primary/20'>
              <div className='space-y-1.5'>
                <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold uppercase tracking-wider backdrop-blur-sm'>
                  <Trophy className='h-3.5 w-3.5 text-amber-300' />
                  Líder en Sector{' '}
                  {activeSector === 'ponderado' ? 'General Ponderado' : activeSector === 'estudiantil' ? 'Estudiantil' : 'Docente'}
                </div>
                <h2 className='text-3xl font-extrabold tracking-tight'>{lider.nombre}</h2>
                <p className='text-sm text-white/90 font-medium'>{lider.lista}</p>
              </div>

              <div className='text-right'>
                <div className='text-4xl font-extrabold tracking-tight'>{liderVotos.toLocaleString()}</div>
                <p className='text-xs text-white/80 font-medium pt-1'>
                  {activeSector === 'ponderado' ? 'puntos ponderados' : 'votos nominales'} (
                  {totalSectorVotos > 0 ? ((liderVotos / totalSectorVotos) * 100).toFixed(1) : 0}% del cómputo)
                </p>
              </div>
            </div>
          )
        )}

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <Card className='lg:col-span-2 border-border/60 shadow-sm'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-lg font-bold flex items-center gap-2'>
                    <Activity className='h-5 w-5 text-primary' />
                    Porcentajes y Tendencias de la Elección
                  </CardTitle>
                  <CardDescription className='text-xs pt-1'>
                    Distribución porcentual del cómputo con resalte del candidato ganador.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isPending ? (
                <Skeleton className='h-[300px] w-full' />
              ) : (
                <CandidatosChart
                  candidatos={candidatos}
                  totalVotosPonderados={totalVotosPonderados}
                  totalVotosEstudiantiles={totalVotosEstudiantiles}
                  totalVotosDocentes={totalVotosDocentes}
                  activeSector={activeSector}
                />
              )}
            </CardContent>
          </Card>

          <Card className='border-border/60 shadow-sm flex flex-col justify-between'>
            <CardHeader>
              <CardTitle className='text-base font-bold flex items-center gap-2'>
                <Vote className='h-5 w-5 text-primary' />
                Desglose del Escrutinio
              </CardTitle>
              <CardDescription className='text-xs'>
                Cómputo global y desglose por sector estudiantil y docente.
              </CardDescription>
            </CardHeader>

            <CardContent className='space-y-6 my-auto'>
              <div className='text-center py-4 space-y-2 bg-muted/30 rounded-xl border'>
                <div className='text-5xl font-extrabold text-primary'>
                  {totalMesas > 0 ? Math.round((mesasCargadas / totalMesas) * 100) : 0}%
                </div>
                <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Actas Procesadas</p>
                <p className='text-xs text-foreground font-medium'>
                  {mesasCargadas} de {totalMesas} mesas contabilizadas
                </p>
              </div>

              <div className='space-y-3 pt-2 text-xs'>
                <div className='flex justify-between items-center border-b pb-2'>
                  <span className='text-muted-foreground flex items-center gap-1'>
                    <GraduationCap className='h-3.5 w-3.5 text-blue-500' /> Votos Estudiantiles:
                  </span>
                  <span className='font-bold text-foreground text-sm'>{totalVotosEstudiantiles.toLocaleString()}</span>
                </div>

                <div className='flex justify-between items-center border-b pb-2'>
                  <span className='text-muted-foreground flex items-center gap-1'>
                    <Award className='h-3.5 w-3.5 text-purple-500' /> Votos Docentes:
                  </span>
                  <span className='font-bold text-purple-600 dark:text-purple-400 text-sm'>
                    {totalVotosDocentes.toLocaleString()} ({totalVotosDocentes * 45} pts)
                  </span>
                </div>

                <div className='flex justify-between items-center border-b pb-2'>
                  <span className='text-muted-foreground flex items-center gap-1 font-bold text-foreground'>
                    <Zap className='h-3.5 w-3.5 text-amber-500' /> Total Ponderado:
                  </span>
                  <span className='font-extrabold text-primary text-base'>{totalVotosPonderados.toLocaleString()}</span>
                </div>

                <div className='flex justify-between items-center pt-1'>
                  <span className='text-muted-foreground'>Transmisión:</span>
                  <span className='font-bold text-emerald-600 flex items-center gap-1'>
                    <span className='h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block' />
                    WebSocket Live
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
