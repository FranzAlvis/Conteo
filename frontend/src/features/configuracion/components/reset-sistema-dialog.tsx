import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'

const CONFIRM_WORD = 'REINICIAR'

type ResetSistemaDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isLoading: boolean
  onConfirm: () => void
}

export function ResetSistemaDialog({
  open,
  onOpenChange,
  isLoading,
  onConfirm,
}: ResetSistemaDialogProps) {
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
      form='reset-sistema-form'
      disabled={value.trim() !== CONFIRM_WORD}
      isLoading={isLoading}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />
          Puesta en 0 del sistema
        </span>
      }
      desc={
        <form
          id='reset-sistema-form'
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>
            Esta acción borrará <strong>todos</strong> los votos y actas cargados hasta
            ahora, y devolverá <strong>todas las mesas</strong> a estado PENDIENTE, como
            si la votación no hubiera comenzado.
            <br />
            Esta acción no guarda respaldo y no se puede deshacer.
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
              Se eliminarán todos los votos, actas y observaciones cargadas. La
              operación queda registrada con su usuario y la hora exacta.
            </AlertDescription>
          </Alert>
        </form>
      }
      confirmText='Poner en 0'
      destructive
    />
  )
}
