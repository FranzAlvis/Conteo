import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { mesasApi } from '@/lib/api/mesas'
import { facultadesApi } from '@/lib/api/facultades'
import type { EstadoMesa } from '@/lib/api/types'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LiveStatusBadge } from '@/components/live-status-badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ClipboardCheck,
  Search,
  Vote,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
} from 'lucide-react'

const ESTADO_FILTROS: { value: EstadoMesa | 'TODOS'; label: string }[] = [
  { value: 'TODOS', label: 'Todos los estados' },
  { value: 'CARGADA', label: 'Cargadas' },
  { value: 'EN_CARGA', label: 'En Edición' },
  { value: 'PENDIENTE', label: 'Pendientes' },
]

export function EstadoMesasFeature() {
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<EstadoMesa | 'TODOS'>('TODOS')
  const [facultadFilter, setFacultadFilter] = useState('TODAS')

  const { data: mesas = [], isPending } = useQuery({
    queryKey: ['mesas'],
    queryFn: () => mesasApi.list(),
    refetchInterval: 20_000,
  })
  const { data: facultades = [] } = useQuery({
    queryKey: ['facultades'],
    queryFn: facultadesApi.list,
  })

  const totalMesas = mesas.length
  const cargadas = mesas.filter((m) => m.estado === 'CARGADA').length
  const enCarga = mesas.filter((m) => m.estado === 'EN_CARGA').length
  const pendientes = mesas.filter((m) => m.estado === 'PENDIENTE').length
  const porcentajeCompletado = totalMesas > 0 ? Math.round((cargadas / totalMesas) * 100) : 0

  const filteredMesas = mesas
    .filter((m) => {
      const matchesSearch =
        m.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.facultad.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesEstado = estadoFilter === 'TODOS' || m.estado === estadoFilter
      const matchesFacultad = facultadFilter === 'TODAS' || m.facultadId === facultadFilter
      return matchesSearch && matchesEstado && matchesFacultad
    })
    .sort((a, b) => a.codigo.localeCompare(b.codigo))

  return (
    <>
      <Header>
        <div className='flex items-center gap-3 me-auto min-w-0'>
          <ClipboardCheck className='h-5 w-5 text-primary shrink-0' />
          <h1 className='text-base font-bold tracking-tight truncate min-w-0'>Estado de Mesas</h1>
        </div>
        <div className='flex items-center gap-3'>
          <LiveStatusBadge />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='space-y-6 p-4 sm:p-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Seguimiento de Escrutinio por Mesa</h2>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Vista en vivo de qué mesas ya transmitieron su acta y cuáles siguen pendientes.
          </p>
        </div>

        {/* Contadores */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card className='border-border/60 shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                Total de Mesas
              </CardTitle>
              <Vote className='h-4 w-4 text-primary' />
            </CardHeader>
            <CardContent>
              {isPending ? <Skeleton className='h-8 w-16' /> : (
                <div className='text-2xl font-extrabold text-foreground'>{totalMesas}</div>
              )}
            </CardContent>
          </Card>

          <Card className='border-emerald-500/30 bg-emerald-500/5 shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400'>
                Cargadas
              </CardTitle>
              <CheckCircle2 className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
            </CardHeader>
            <CardContent>
              {isPending ? <Skeleton className='h-8 w-16' /> : (
                <div className='text-2xl font-extrabold text-emerald-600 dark:text-emerald-400'>
                  {cargadas} <span className='text-sm font-normal text-muted-foreground'>({porcentajeCompletado}%)</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className='border-amber-500/30 bg-amber-500/5 shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400'>
                En Edición
              </CardTitle>
              <Clock className='h-4 w-4 text-amber-600 dark:text-amber-400' />
            </CardHeader>
            <CardContent>
              {isPending ? <Skeleton className='h-8 w-16' /> : (
                <div className='text-2xl font-extrabold text-amber-600 dark:text-amber-400'>{enCarga}</div>
              )}
            </CardContent>
          </Card>

          <Card className='border-slate-500/30 bg-slate-500/5 shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400'>
                Pendientes
              </CardTitle>
              <AlertCircle className='h-4 w-4 text-slate-600 dark:text-slate-400' />
            </CardHeader>
            <CardContent>
              {isPending ? <Skeleton className='h-8 w-16' /> : (
                <div className='text-2xl font-extrabold text-slate-600 dark:text-slate-400'>{pendientes}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className='border-border/60 shadow-sm'>
          <CardContent className='pt-6'>
            <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
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
                <Select value={estadoFilter} onValueChange={(v) => setEstadoFilter(v as EstadoMesa | 'TODOS')}>
                  <SelectTrigger className='w-full sm:w-44 text-xs h-9'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADO_FILTROS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='flex items-center gap-2 w-full sm:w-auto'>
                <Label className='text-xs text-muted-foreground whitespace-nowrap'>Facultad:</Label>
                <Select value={facultadFilter} onValueChange={setFacultadFilter}>
                  <SelectTrigger className='w-full sm:w-56 text-xs h-9'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='TODAS'>Todas las facultades</SelectItem>
                    {facultades.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <span className='text-xs text-muted-foreground sm:ms-auto shrink-0'>
                {filteredMesas.length} de {totalMesas} mesas
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Grid de mesas */}
        {isPending ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className='h-32 w-full' />
            ))}
          </div>
        ) : filteredMesas.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {filteredMesas.map((m) => {
              const isCargada = m.estado === 'CARGADA'
              const isEnCarga = m.estado === 'EN_CARGA'

              return (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-lg border space-y-2.5 shadow-xs ${
                    isCargada
                      ? 'bg-emerald-500/5 border-emerald-500/40'
                      : isEnCarga
                        ? 'bg-amber-500/5 border-amber-500/40'
                        : 'bg-muted/20 border-border/60'
                  }`}
                >
                  <div className='flex items-center justify-between'>
                    <Badge variant='outline' className='font-mono font-bold text-xs bg-primary/10 text-primary border-primary/30'>
                      {m.codigo}
                    </Badge>
                    <Badge
                      variant='outline'
                      className={`text-[10px] uppercase font-bold gap-1 ${
                        isCargada
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : isEnCarga
                            ? 'bg-amber-500 text-white border-amber-500 animate-pulse'
                            : 'bg-slate-500/10 text-slate-500 border-slate-500/30'
                      }`}
                    >
                      {isCargada ? (
                        <CheckCircle2 className='h-3 w-3' />
                      ) : isEnCarga ? (
                        <Clock className='h-3 w-3' />
                      ) : (
                        <AlertCircle className='h-3 w-3' />
                      )}
                      {isCargada ? 'Cargada' : isEnCarga ? 'En Edición' : 'Pendiente'}
                    </Badge>
                  </div>

                  <p className='text-xs font-semibold text-foreground flex items-center gap-1.5 truncate' title={m.facultad}>
                    <Building2 className='h-3.5 w-3.5 text-muted-foreground shrink-0' />
                    {m.facultad}
                  </p>

                  <div className='text-[11px] text-muted-foreground space-y-0.5'>
                    <p>Tipo: <strong className='text-foreground'>{m.tipo === 'DOCENTE' ? 'Docente (x45)' : 'Estudiantil (x1)'}</strong></p>
                    <p>Transcriptor: <strong className='text-foreground'>{m.transcriptorNombre ?? 'Sin asignar'}</strong></p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className='p-12 text-center border border-dashed rounded-xl bg-card space-y-3'>
            <ClipboardCheck className='h-12 w-12 text-muted-foreground mx-auto opacity-50' />
            <h3 className='text-lg font-bold text-foreground'>Sin resultados</h3>
            <p className='text-xs text-muted-foreground max-w-sm mx-auto'>
              Ninguna mesa coincide con los filtros seleccionados.
            </p>
          </div>
        )}
      </Main>
    </>
  )
}
