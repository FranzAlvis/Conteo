import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LiveStatusBadge } from '@/components/live-status-badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Radio, Vote, Trophy, Activity } from 'lucide-react'
import { CandidatosChart } from '../dashboard/components/candidatos-chart'
import { useElectionStore } from '@/stores/election-store'

export function ResultadosFeature() {
  const { candidatos, totalVotos, mesasCargadas, totalMesas } = useElectionStore()

  const maxVotos = Math.max(...candidatos.map((c) => c.votos), 0)
  const lider = candidatos.find((c) => c.votos === maxVotos && maxVotos > 0)

  return (
    <>
      <Header>
        <div className='flex items-center gap-3 me-auto'>
          <Radio className='h-5 w-5 text-primary animate-pulse' />
          <h1 className='text-base font-bold tracking-tight'>Resultados en Tiempo Real — Visor Live</h1>
        </div>
        <div className='flex items-center gap-3'>
          <LiveStatusBadge />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='space-y-6 p-4 sm:p-6'>
        {/* Banner Leader Focus */}
        {lider && (
          <div className='flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-lg border border-primary/20'>
            <div className='space-y-1.5'>
              <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider backdrop-blur-sm'>
                <Trophy className='h-3.5 w-3.5 text-amber-300' />
                Tendencia Líder Actual
              </div>
              <h2 className='text-3xl font-extrabold tracking-tight'>{lider.nombre}</h2>
              <p className='text-sm text-white/90 font-medium'>{lider.lista}</p>
            </div>

            <div className='text-right'>
              <div className='text-4xl font-extrabold tracking-tight'>
                {lider.votos.toLocaleString()}
              </div>
              <p className='text-xs text-white/80 font-medium pt-1'>
                votos ({totalVotos > 0 ? ((lider.votos / totalVotos) * 100).toFixed(1) : 0}% del escrutado)
              </p>
            </div>
          </div>
        )}

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Main Chart (2 cols) */}
          <Card className='lg:col-span-2 border-border/60 shadow-sm'>
            <CardHeader>
              <CardTitle className='text-lg font-bold flex items-center gap-2'>
                <Activity className='h-5 w-5 text-primary' />
                Cómputo en Tiempo Real por Candidatura
              </CardTitle>
              <CardDescription className='text-xs'>
                Avance dinámico de la votación con resalte del candidato líder.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CandidatosChart />
            </CardContent>
          </Card>

          {/* Escrutinio Progress Summary Card (1 col) */}
          <Card className='border-border/60 shadow-sm flex flex-col justify-between'>
            <CardHeader>
              <CardTitle className='text-base font-bold flex items-center gap-2'>
                <Vote className='h-5 w-5 text-primary' />
                Avance del Escrutinio
              </CardTitle>
              <CardDescription className='text-xs'>
                Porcentaje global de actas computadas en el sistema.
              </CardDescription>
            </CardHeader>

            <CardContent className='space-y-6 my-auto'>
              <div className='text-center py-4 space-y-2 bg-muted/30 rounded-xl border'>
                <div className='text-5xl font-extrabold text-primary'>
                  {totalMesas > 0 ? Math.round((mesasCargadas / totalMesas) * 100) : 0}%
                </div>
                <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                  Actas Procesadas
                </p>
                <p className='text-xs text-foreground font-medium'>
                  {mesasCargadas} de {totalMesas} mesas contabilizadas
                </p>
              </div>

              <div className='space-y-3 pt-2 text-xs'>
                <div className='flex justify-between items-center border-b pb-2'>
                  <span className='text-muted-foreground'>Total de Votos Registrados:</span>
                  <span className='font-bold text-foreground text-sm'>{totalVotos.toLocaleString()}</span>
                </div>
                <div className='flex justify-between items-center border-b pb-2'>
                  <span className='text-muted-foreground'>Mesas Pendientes:</span>
                  <span className='font-bold text-amber-600 dark:text-amber-400'>{totalMesas - mesasCargadas}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground'>Modo de Actualización:</span>
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
