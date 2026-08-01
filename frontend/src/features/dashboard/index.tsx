import { useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LiveStatusBadge } from '@/components/live-status-badge'
import { useElectionStore } from '@/stores/election-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Vote, Users, PieChart, Activity, ShieldAlert } from 'lucide-react'
import { CandidatosChart } from './components/candidatos-chart'
import { RecentMesasTable } from './components/recent-mesas-table'
import { io } from 'socket.io-client'

export function Dashboard() {
  const {
    mesasCargadas,
    totalMesas,
    totalVotos,
    totalPadron,
    conteoAbierto,
    updateElectionData,
  } = useElectionStore()

  const porcentajeMesas = totalMesas > 0 ? Math.round((mesasCargadas / totalMesas) * 100) : 0
  const porcentajeParticipacion = totalPadron > 0 ? ((totalVotos / totalPadron) * 100).toFixed(1) : '0'

  // Connect to WebSocket for live updates
  useEffect(() => {
    const socket = io('http://localhost:3000', {
      transports: ['websocket'],
      autoConnect: true,
    })

    socket.on('resumenVotosActualizado', (data) => {
      if (data) {
        updateElectionData(data)
      }
    })

    socket.on('conteoEstadoCambiado', (data) => {
      if (typeof data.abierto === 'boolean') {
        updateElectionData({ conteoAbierto: data.abierto })
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [updateElectionData])

  return (
    <>
      {/* ===== Top Header ===== */}
      <Header>
        <div className='flex items-center gap-3 me-auto'>
          <div className='font-bold text-base tracking-tight text-foreground flex items-center gap-2'>
            <Vote className='h-5 w-5 text-primary' />
            <span>Conteo de Votos — Vicerrectorado 2026</span>
          </div>
          <span className='text-xs text-muted-foreground hidden md:inline-block border-l border-border pl-3'>
            Yamile Hayes Michel
          </span>
        </div>

        <div className='flex items-center gap-3'>
          <LiveStatusBadge />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main Content ===== */}
      <Main className='space-y-6 p-4 sm:p-6'>
        {/* Banner Alert for Status */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5 gap-3 shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-md'>
              <Activity className='h-5 w-5' />
            </div>
            <div>
              <h2 className='text-base font-bold text-foreground'>
                Resumen de Escrutinio Universitario 2026
              </h2>
              <p className='text-xs text-muted-foreground'>
                Candidatura a Vicerrectorado — Transcripción y cómputo de actas en tiempo real.
              </p>
            </div>
          </div>
          <Badge
            variant='outline'
            className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
              conteoAbierto
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                : 'bg-destructive/10 text-destructive border-destructive/30'
            }`}
          >
            {conteoAbierto ? 'Conteo en Proceso' : 'Escrutinio Finalizado'}
          </Badge>
        </div>

        {/* Stat Cards Row */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {/* Card 1: Mesas Cargadas */}
          <Card className='border-border/60 shadow-sm hover:shadow-md transition-shadow'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                Mesas Procesadas
              </CardTitle>
              <Vote className='h-4 w-4 text-primary' />
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='flex items-baseline justify-between'>
                <div className='text-2xl font-extrabold text-foreground'>
                  {mesasCargadas} <span className='text-sm font-normal text-muted-foreground'>/ {totalMesas}</span>
                </div>
                <span className='text-xs font-bold text-primary'>{porcentajeMesas}%</span>
              </div>
              <Progress value={porcentajeMesas} className='h-2 bg-muted' />
              <p className='text-[11px] text-muted-foreground'>
                {totalMesas - mesasCargadas} mesas pendientes por escrutar
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Total Votos Registrados */}
          <Card className='border-border/60 shadow-sm hover:shadow-md transition-shadow'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                Votos Totales
              </CardTitle>
              <Users className='h-4 w-4 text-primary' />
            </CardHeader>
            <CardContent className='space-y-1'>
              <div className='text-2xl font-extrabold text-foreground'>
                {totalVotos.toLocaleString()}
              </div>
              <p className='text-xs text-muted-foreground flex items-center gap-1 pt-1'>
                <span className='inline-block h-1.5 w-1.5 rounded-full bg-emerald-500' />
                Votos válidamente emitidos
              </p>
            </CardContent>
          </Card>

          {/* Card 3: % Participación */}
          <Card className='border-border/60 shadow-sm hover:shadow-md transition-shadow'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                Participación Padronal
              </CardTitle>
              <PieChart className='h-4 w-4 text-primary' />
            </CardHeader>
            <CardContent className='space-y-1'>
              <div className='text-2xl font-extrabold text-foreground'>
                {porcentajeParticipacion}%
              </div>
              <p className='text-xs text-muted-foreground pt-1'>
                {totalVotos.toLocaleString()} de {totalPadron.toLocaleString()} inscritos
              </p>
            </CardContent>
          </Card>

          {/* Card 4: Estado del Conteo */}
          <Card className='border-border/60 shadow-sm hover:shadow-md transition-shadow'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                Estado del Conteo
              </CardTitle>
              <ShieldAlert className='h-4 w-4 text-primary' />
            </CardHeader>
            <CardContent className='space-y-1'>
              <div className='pt-1'>
                <Badge
                  className={`text-sm px-3 py-1 font-bold ${
                    conteoAbierto
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-muted-foreground text-white'
                  }`}
                >
                  {conteoAbierto ? 'ABIERTO' : 'CERRADO'}
                </Badge>
              </div>
              <p className='text-xs text-muted-foreground pt-1.5'>
                {conteoAbierto
                  ? 'Recepción activa de actas de votación'
                  : 'Recepción suspendida o concluida'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts & Recent Tables Grid */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-7'>
          {/* Chart Section (4 cols on lg) */}
          <Card className='col-span-1 lg:col-span-4 border-border/60 shadow-sm'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base font-bold flex items-center justify-between'>
                <span>Resultados de la Elección</span>
                <span className='text-xs font-normal text-muted-foreground'>Por candidatura</span>
              </CardTitle>
              <CardDescription className='text-xs'>
                Distribución de votos acumulados en tiempo real. La candidatura líder se destaca en color institucional.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CandidatosChart />
            </CardContent>
          </Card>

          {/* Recent Mesas Section (3 cols on lg) */}
          <Card className='col-span-1 lg:col-span-3 border-border/60 shadow-sm'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base font-bold flex items-center justify-between'>
                <span>Últimas Mesas Procesadas</span>
                <Badge variant='outline' className='text-[10px] font-semibold'>
                  Actualización Live
                </Badge>
              </CardTitle>
              <CardDescription className='text-xs'>
                Registro cronológico de transcripción de actas en sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentMesasTable />
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
