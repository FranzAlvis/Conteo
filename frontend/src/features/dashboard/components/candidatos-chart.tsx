import { useMemo, useState } from 'react'
import type { CandidatoResultado } from '@/lib/api/types'
import { useTheme } from '@/context/theme-provider'
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
  LabelList,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart3, PieChart as PieChartIcon, Trophy, Star } from 'lucide-react'

/**
 * Paleta categórica validada con el validador de dataviz (ΔE de daltonismo y
 * de visión normal por encima del piso en pares adyacentes, sobre el fondo
 * de card de este tema, luz y oscuro). Debe reflejar los mismos hex que
 * --chart-1..--chart-5 en styles/theme.css. El slot 0 es siempre la marca
 * (candidato propio); 1-4 son azul/naranja/aqua/violeta para el resto.
 */
const CHART_PALETTE = {
  light: ['#a02237', '#2a78d6', '#eb6834', '#1baf7a', '#4a3aa7', '#eda100', '#e87ba4', '#008300'],
  dark: ['#da2f4b', '#3987e5', '#d95926', '#199e70', '#9085e9', '#c98500', '#d55181', '#008300'],
}

/** Elige texto blanco o tinta oscura, el que tenga mayor contraste contra el color de relleno. */
function labelInkFor(hex: string): string {
  const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))
  const [r, g, b] = [1, 3, 5].map((i) => toLinear(parseInt(hex.slice(i, i + 2), 16) / 255))
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  const contrastWith = (otherLuminance: number) => {
    const [hi, lo] = [luminance, otherLuminance].sort((a, z) => z - a)
    return (hi + 0.05) / (lo + 0.05)
  }
  return contrastWith(1) >= contrastWith(0) ? '#ffffff' : '#0b0b0b'
}

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
  const { resolvedTheme } = useTheme()
  const palette = CHART_PALETTE[resolvedTheme]

  const totalSectorVotos =
    activeSector === 'ponderado'
      ? totalVotosPonderados
      : activeSector === 'estudiantil'
        ? totalVotosEstudiantiles
        : totalVotosDocentes

  const getVotesForSector = (c: CandidatoResultado) => {
    if (activeSector === 'ponderado') return c.votosPonderados
    if (activeSector === 'estudiantil') return c.votosEstudiantiles
    return c.votosDocentes
  }

  // Color fijo por identidad de candidato (nunca por su puesto actual): así
  // un color no "salta" de candidato cuando cambia quién va ganando.
  const colorByCandidatoId = useMemo(() => {
    const map = new Map<string, string>()
    let nextSlot = 1
    candidatos.forEach((c) => {
      if (c.esPropio) {
        map.set(c.id, palette[0])
      } else {
        map.set(c.id, palette[nextSlot % palette.length])
        nextSlot += 1
      }
    })
    return map
  }, [candidatos, palette])

  const maxVotos = Math.max(...candidatos.map((c) => getVotesForSector(c)), 1)

  const data = candidatos
    .map((c) => {
      const votosVal = getVotesForSector(c)
      const porcentaje = totalSectorVotos > 0 ? Number(((votosVal / totalSectorVotos) * 100).toFixed(1)) : 0
      return {
        id: c.id,
        nombre: c.nombre,
        lista: c.lista,
        votos: votosVal,
        porcentaje,
        isLeader: votosVal === maxVotos && votosVal > 0,
        esPropio: c.esPropio,
        color: colorByCandidatoId.get(c.id) ?? palette[0],
      }
    })
    // Orden de lectura: quién va primero, arriba/primero. El color no depende de esto.
    .sort((a, b) => b.votos - a.votos)

  interface PieLabelProps {
    cx?: number
    cy?: number
    midAngle?: number
    innerRadius?: number
    outerRadius?: number
    percent?: number
    index?: number
  }

  const renderCustomizedPieLabel = ({
    cx = 0,
    cy = 0,
    midAngle = 0,
    innerRadius = 0,
    outerRadius = 0,
    percent = 0,
    index = 0,
  }: PieLabelProps) => {
    if (percent < 0.03) return null
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill={labelInkFor(data[index]?.color ?? palette[0])}
        textAnchor='middle'
        dominantBaseline='central'
        className='text-[11px] font-bold'
      >
        {`${percent >= 0.995 ? 100 : (percent * 100).toFixed(1)}%`}
      </text>
    )
  }

  const renderTooltip = ({ active, payload }: { active?: boolean; payload?: readonly unknown[] }) => {
    if (!active || !payload || !payload.length) return null
    const d = (payload[0] as { payload: (typeof data)[0] }).payload
    return (
      <div className='rounded-lg border bg-popover p-3 shadow-xl text-popover-foreground text-xs space-y-1.5 max-w-[220px]'>
        <div className='flex items-center gap-1.5'>
          <span className='h-2.5 w-2.5 rounded-full shrink-0' style={{ backgroundColor: d.color }} />
          <p className='font-bold text-sm leading-tight'>{d.nombre}</p>
        </div>
        <p className='text-muted-foreground leading-tight'>{d.lista}</p>
        <div className='pt-1 flex items-center justify-between gap-4 font-semibold border-t border-border/50'>
          <span>
            {activeSector === 'ponderado' ? 'Puntos:' : 'Votos:'}{' '}
            <strong className='text-foreground text-sm'>{d.votos.toLocaleString()}</strong>
          </span>
          <span className='font-bold' style={{ color: d.color }}>
            {d.porcentaje}%
          </span>
        </div>
        {d.isLeader && (
          <p className='text-[10px] uppercase tracking-wider font-bold text-primary pt-0.5 flex items-center gap-1'>
            <Trophy className='h-3 w-3' /> Líder del sector
          </p>
        )}
      </div>
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
      <div className='h-[320px] w-full pt-2'>
        <ResponsiveContainer width='100%' height='100%'>
          {chartType === 'bar' ? (
            <BarChart
              layout='vertical'
              data={data}
              margin={{ top: 10, right: 36, left: 20, bottom: 10 }}
              barCategoryGap='28%'
            >
              <CartesianGrid strokeDasharray='0' horizontal={false} stroke='var(--border)' strokeOpacity={0.6} />
              <XAxis type='number' axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <YAxis
                dataKey='nombre'
                type='category'
                width={168}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fontWeight: 600, fill: 'var(--foreground)' }}
              />
              <Tooltip cursor={{ fill: 'var(--muted)', opacity: 0.4 }} content={renderTooltip} />
              <Bar dataKey='votos' radius={[0, 4, 4, 0]} maxBarSize={24}>
                {data.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
                <LabelList
                  dataKey='porcentaje'
                  position='right'
                  formatter={(value: string | number | boolean | null | undefined) =>
                    value === null || value === undefined ? '' : `${value}%`
                  }
                  style={{ fontSize: 11, fontWeight: 700, fill: 'var(--foreground)' }}
                />
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
                outerRadius={112}
                innerRadius={64}
                dataKey='votos'
                paddingAngle={data.length > 1 ? 2 : 0}
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill={entry.color}
                    stroke='var(--card)'
                    strokeWidth={entry.isLeader ? 3 : 2}
                  />
                ))}
              </Pie>
              <Tooltip content={renderTooltip} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend / Info Cards — también sirve de vista en tabla accesible */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/50'>
        {data.map((c) => (
          <div
            key={c.id}
            className={`flex items-center justify-between gap-2 p-3 rounded-lg border text-xs transition-all ${
              c.isLeader ? 'bg-primary/5 border-primary/30 shadow-sm' : 'bg-card border-border/60'
            }`}
          >
            <div className='flex items-start gap-2 min-w-0'>
              <span
                className='h-3 w-3 rounded-full inline-block shrink-0 mt-0.5'
                style={{ backgroundColor: c.color }}
              />
              <div className='space-y-0.5 min-w-0'>
                <p className='font-semibold text-foreground truncate flex items-center gap-1.5'>
                  <span className='truncate'>{c.nombre}</span>
                  {c.esPropio && <Star className='h-3 w-3 text-amber-500 shrink-0 fill-amber-500' />}
                </p>
                <p className='text-[11px] text-muted-foreground truncate'>{c.lista}</p>
                {c.isLeader && (
                  <Badge variant='outline' className='h-4 px-1.5 text-[9px] font-bold uppercase gap-0.5 border-primary/40 text-primary bg-primary/10'>
                    <Trophy className='h-2.5 w-2.5' /> Líder
                  </Badge>
                )}
              </div>
            </div>
            <div className='text-right font-bold shrink-0'>
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
