import { useState } from 'react'
import { Vote } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'

const CONFIRM_WORD = 'SEGUNDA VUELTA'

type IniciarSegundaVueltaDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isLoading: boolean
  onConfirm: () => void
}

export function IniciarSegundaVueltaDialog({
  open,
  onOpenChange,
  isLoading,
  onConfirm,
}: IniciarSegundaVueltaDialogProps) {
  const [value, setValue] = useState('')

  const handleSubmit = () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Escriba "${CONFIRM_WORD}" para confirmar.`)
      return
    }
    onConfirm()
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) setValue('')
      }}
      form='iniciar-segunda-vuelta-form'
      disabled={value.trim() !== CONFIRM_WORD}
      isLoading={isLoading}
      title={
        <span className='text-destructive'>
          <Vote className='me-1 inline-block stroke-destructive' size={18} />
          Iniciar Segunda Vuelta
        </span>
      }
      desc={
        <form
          id='iniciar-segunda-vuelta-form'
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>
            Esta acción <strong>no borra</strong> los votos ni las actas de la primera
            vuelta: quedarán guardados y podrán consultarse luego en Resultados. Todas
            las mesas volverán a estado PENDIENTE para que se cargue el conteo de la
            segunda vuelta desde cero.
            <br />
            Esta acción no se puede deshacer.
          </p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span>
              Escriba &quot;{CONFIRM_WORD}&quot; para confirmar:
            </span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Escriba "${CONFIRM_WORD}"`}
              autoFocus
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>¡Atención!</AlertTitle>
            <AlertDescription>
              Antes de continuar, verifique que ya dio de baja en Candidatos y Listas a
              quienes no pasaron a la segunda vuelta. La operación queda registrada con
              su usuario y la hora exacta.
            </AlertDescription>
          </Alert>
        </form>
      }
      confirmText='Iniciar Segunda Vuelta'
      destructive
    />
  )
}
