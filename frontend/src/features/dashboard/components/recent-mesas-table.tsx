import { useElectionStore } from '@/stores/election-store'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react'

export function RecentMesasTable() {
  const { ultimasMesas } = useElectionStore()

  return (
    <div className='rounded-md border border-border/60 overflow-hidden'>
      <Table>
        <TableHeader className='bg-muted/40'>
          <TableRow>
            <TableHead className='w-[100px] font-semibold text-xs'>Mesa</TableHead>
            <TableHead className='font-semibold text-xs'>Facultad</TableHead>
            <TableHead className='font-semibold text-xs'>Transcriptor</TableHead>
            <TableHead className='font-semibold text-xs text-center'>Hora</TableHead>
            <TableHead className='font-semibold text-xs text-right'>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ultimasMesas.slice(0, 5).map((mesa) => (
            <TableRow key={mesa.id} className='hover:bg-muted/30 transition-colors'>
              <TableCell className='font-bold text-xs text-foreground'>
                {mesa.codigo}
              </TableCell>
              <TableCell className='text-xs text-muted-foreground'>
                {mesa.facultad}
              </TableCell>
              <TableCell className='text-xs text-foreground font-medium'>
                {mesa.transcriptor}
              </TableCell>
              <TableCell className='text-xs text-muted-foreground text-center font-mono'>
                {mesa.hora}
              </TableCell>
              <TableCell className='text-right'>
                {mesa.estado === 'CARGADA' && (
                  <Badge variant='outline' className='bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] uppercase font-bold gap-1'>
                    <CheckCircle2 className='h-3 w-3' /> Cargada
                  </Badge>
                )}
                {mesa.estado === 'EN_CARGA' && (
                  <Badge variant='outline' className='bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] uppercase font-bold gap-1 animate-pulse'>
                    <Clock className='h-3 w-3' /> En Edición
                  </Badge>
                )}
                {mesa.estado === 'PENDIENTE' && (
                  <Badge variant='outline' className='bg-slate-500/10 text-slate-500 border-slate-500/30 text-[10px] uppercase font-bold gap-1'>
                    <AlertCircle className='h-3 w-3' /> Pendiente
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
