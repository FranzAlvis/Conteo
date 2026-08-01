import { useElectionStore } from '@/stores/election-store'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts'

export function CandidatosChart() {
  const { candidatos, totalVotos } = useElectionStore()

  // Determine highest vote count for dynamic --primary highlight
  const maxVotos = Math.max(...candidatos.map((c) => c.votos), 1)

  const data = candidatos.map((c) => {
    const porcentaje = totalVotos > 0 ? ((c.votos / totalVotos) * 100).toFixed(1) : '0'
    const isLeader = c.votos === maxVotos && c.votos > 0
    return {
      id: c.id,
      nombre: c.nombre,
      lista: c.lista,
      votos: c.votos,
      porcentaje: Number(porcentaje),
      isLeader,
      esPropio: c.esPropio,
    }
  })

  return (
    <div className='w-full space-y-4'>
      <div className='h-[280px] w-full'>
        <ResponsiveContainer width='100%' height='100%'>
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
                    <div className='rounded-lg border bg-popover p-3 shadow-md text-popover-foreground text-xs space-y-1'>
                      <p className='font-bold text-sm'>{d.nombre}</p>
                      <p className='text-muted-foreground'>{d.lista}</p>
                      <div className='pt-1 flex items-center justify-between gap-4 font-semibold'>
                        <span>Votos: <strong className='text-primary text-sm'>{d.votos.toLocaleString()}</strong></span>
                        <span>({d.porcentaje}%)</span>
                      </div>
                      {d.isLeader && (
                        <p className='text-[10px] uppercase tracking-wider font-bold text-primary pt-1'>
                          Líder de la Contienda
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
                {c.isLeader && (
                  <span className='h-2 w-2 rounded-full bg-primary inline-block animate-pulse' />
                )}
                {c.nombre}
              </p>
              <p className='text-[11px] text-muted-foreground truncate'>{c.lista}</p>
            </div>
            <div className='text-right font-bold'>
              <div className={c.isLeader ? 'text-primary text-base font-extrabold' : 'text-foreground text-sm'}>
                {c.votos.toLocaleString()}
              </div>
              <div className='text-[10px] text-muted-foreground'>{c.porcentaje}% del total</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
