import { useElectionStore } from '@/stores/election-store'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'

export function LiveStatusBadge() {
  const { conteoAbierto, ultimaActualizacion } = useElectionStore()

  return (
    <div className='flex items-center gap-2.5 text-xs font-medium'>
      <Badge
        variant='outline'
        className={`flex items-center gap-1.5 px-2.5 py-1 transition-all ${
          conteoAbierto
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
            : 'bg-muted text-muted-foreground border-border'
        }`}
      >
        <span className='relative flex h-2 w-2'>
          {conteoAbierto && (
            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              conteoAbierto ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
          ></span>
        </span>
        <span className='font-bold tracking-wider text-[11px] uppercase'>
          {conteoAbierto ? 'EN VIVO' : 'CONTEO CERRADO'}
        </span>
      </Badge>

      <span className='hidden sm:flex items-center gap-1 text-muted-foreground text-xs font-normal'>
        <Clock className='h-3.5 w-3.5 opacity-70' />
        <span>Act: {ultimaActualizacion}</span>
      </span>
    </div>
  )
}
