import { useState } from 'react'
import type { CandidatoResultado } from '@/lib/api/types'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react'

const PIE_COLORS = [
  'hsl(350, 65%, 38%)', // Primary Wine Red (Leader)
  '#3b82f6', // Slate Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#64748b', // Muted Slate
]

interface CandidatosChartProps {
  candidatos: CandidatoResultado[]
  totalVotosPonderados: number
  totalVotosEstudiantiles: number
  totalVotosDocentes: number
  activeSector?: 'ponderado' | 'estudiantil' | 'docente'
}

export function CandidatosChart({
  candidatos,
  totalVotosPonderados,
  totalVotosEstudiantiles,
  totalVotosDocentes,
  activeSector = 'ponderado',
}: CandidatosChartProps) {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar')

  const totalSectorVotos =
    activeSector === 'ponderado'
      ? totalVotosPonderados
      : activeSector === 'estudiantil'
        ? totalVotosEstudiantiles
        : totalVotosDocentes

  // Get vote count for each candidate based on sector
  const getVotesForSector = (c: (typeof candidatos)[0]) => {
    if (activeSector === 'ponderado') return c.votosPonderados
    if (activeSector === 'estudiantil') return c.votosEstudiantiles
    return c.votosDocentes
  }

  // Determine highest vote count for dynamic --primary highlight
  const maxVotos = Math.max(...candidatos.map((c) => getVotesForSector(c)), 1)

  const data = candidatos.map((c, index) => {
    const votosVal = getVotesForSector(c)
    const porcentaje = totalSectorVotos > 0 ? ((votosVal / totalSectorVotos) * 100).toFixed(1) : '0'
    const isLeader = votosVal === maxVotos && votosVal > 0
    return {
      id: c.id,
      nombre: c.nombre,
      lista: c.lista,
      votos: votosVal,
      porcentaje: Number(porcentaje),
      isLeader,
      esPropio: c.esPropio,
      color: isLeader ? 'hsl(350, 65%, 38%)' : PIE_COLORS[(index + 1) % PIE_COLORS.length],
    }
  })

  // Custom Pie Label to render percentage directly on the chart sectors
  interface PieLabelProps {
    cx?: number
    cy?: number
    midAngle?: number
    innerRadius?: number
    outerRadius?: number
    percent?: number
  }

  const renderCustomizedPieLabel = ({
    cx = 0,
    cy = 0,
    midAngle = 0,
    innerRadius = 0,
    outerRadius = 0,
    percent = 0,
  }: PieLabelProps) => {
    if (percent === 0) return null
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill='#ffffff'
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline='central'
        className='text-xs font-black drop-shadow-md'
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    )
  }

  return (
    <div className='w-full space-y-4'>
      {/* Chart View Toggle Switch */}
      <div className='flex items-center justify-between pb-2 border-b border-border/40'>
        <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
          Vista Gráfica ({activeSector.toUpperCase()})
        </span>
        <div className='inline-flex items-center rounded-lg border bg-muted/30 p-1 text-muted-foreground gap-1'>
          <Button
            type='button'
            variant={chartType === 'bar' ? 'default' : 'ghost'}
            size='sm'
            onClick={() => setChartType('bar')}
            className='h-7 text-xs px-2.5 font-bold gap-1.5'
          >
            <BarChart3 className='h-3.5 w-3.5' />
            Barras
          </Button>
          <Button
            type='button'
            variant={chartType === 'pie' ? 'default' : 'ghost'}
            size='sm'
            onClick={() => setChartType('pie')}
            className='h-7 text-xs px-2.5 font-bold gap-1.5'
          >
            <PieChartIcon className='h-3.5 w-3.5' />
            Torta / Porcentajes
          </Button>
        </div>
      </div>

      {/* Dynamic Render: Bar Chart or Pie Chart */}
      <div className='h-[300px] w-full pt-2'>
        <ResponsiveContainer width='100%' height='100%'>
          {chartType === 'bar' ? (
            <BarChart
              layout='vertical'
              data={data}
              margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray='3 3' horizontal={false} opacity={0.3} />
              <XAxis type='number' axisLine={false} tickLine={false} />
              <YAxis
                dataKey='nombre'
                type='category'
                width={160}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fontWeight: 500 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload
                    return (
                      <div className='rounded-lg border bg-popover p-3 shadow-xl text-popover-foreground text-xs space-y-1'>
                        <p className='font-bold text-sm'>{d.nombre}</p>
                        <p className='text-muted-foreground'>{d.lista}</p>
                        <div className='pt-1 flex items-center justify-between gap-4 font-semibold'>
                          <span>
                            {activeSector === 'ponderado' ? 'Puntos:' : 'Votos:'}{' '}
                            <strong className='text-primary text-sm'>{d.votos.toLocaleString()}</strong>
                          </span>
                          <span>({d.porcentaje}%)</span>
                        </div>
                        {d.isLeader && (
                          <p className='text-[10px] uppercase tracking-wider font-bold text-primary pt-1'>
                            Líder del Sector
                          </p>
                        )}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey='votos' radius={[0, 6, 6, 0]} barSize={28}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.isLeader
                        ? 'var(--primary)'
                        : 'var(--muted-foreground)'
                    }
                    opacity={entry.isLeader ? 1 : 0.45}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                cx='50%'
                cy='50%'
                labelLine={false}
                label={renderCustomizedPieLabel}
                outerRadius={105}
                innerRadius={35}
                dataKey='votos'
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`pie-cell-${index}`}
                    fill={entry.color}
                    stroke='var(--background)'
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload
                    return (
                      <div className='rounded-lg border bg-popover p-3 shadow-xl text-popover-foreground text-xs space-y-1'>
                        <p className='font-bold text-sm'>{d.nombre}</p>
                        <p className='text-muted-foreground'>{d.lista}</p>
                        <div className='pt-1 flex items-center justify-between gap-4 font-semibold'>
                          <span>
                            {activeSector === 'ponderado' ? 'Puntos Ponderados:' : 'Votos:'}{' '}
                            <strong className='text-primary text-sm'>{d.votos.toLocaleString()}</strong>
                          </span>
                          <span className='font-bold text-primary'>({d.porcentaje}%)</span>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend
                verticalAlign='bottom'
                height={36}
                formatter={(value: string) => {
                  const item = data.find((d) => d.nombre === value)
                  return (
                    <span className='text-xs font-semibold text-foreground mr-3'>
                      {value} ({item ? item.porcentaje : 0}%)
                    </span>
                  )
                }}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend / Info Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/50'>
        {data.map((c) => (
          <div
            key={c.id}
            className={`flex items-center justify-between p-3 rounded-lg border text-xs transition-all ${
              c.isLeader
                ? 'bg-primary/5 border-primary/30 shadow-sm'
                : 'bg-card border-border/60'
            }`}
          >
            <div className='space-y-0.5 max-w-[200px]'>
              <p className='font-semibold text-foreground truncate flex items-center gap-1.5'>
                {c.isLeader ? (
                  <span className='h-2.5 w-2.5 rounded-full bg-primary inline-block animate-pulse' />
                ) : (
                  <span
                    className='h-2.5 w-2.5 rounded-full inline-block'
                    style={{ backgroundColor: c.color }}
                  />
                )}
                {c.nombre}
              </p>
              <p className='text-[11px] text-muted-foreground truncate'>{c.lista}</p>
            </div>
            <div className='text-right font-bold'>
              <div className={c.isLeader ? 'text-primary text-base font-extrabold' : 'text-foreground text-sm'}>
                {c.votos.toLocaleString()}
              </div>
              <div className='text-[10px] text-muted-foreground'>{c.porcentaje}% del sector</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
