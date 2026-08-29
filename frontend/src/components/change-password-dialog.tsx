import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KeyRound, Lock, Loader2 } from 'lucide-react'
import { authApi } from '@/lib/api/auth'
import { handleServerError } from '@/lib/handle-server-error'
import { toast } from 'sonner'

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      toast.success('Contraseña actualizada exitosamente')
      onOpenChange(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    },
    onError: handleServerError,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Complete todos los campos de contraseña')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('La nueva contraseña y su confirmación no coinciden')
      return
    }

    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    changePasswordMutation.mutate({ currentPassword, newPassword })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-lg font-bold flex items-center gap-2'>
            <KeyRound className='h-5 w-5 text-primary' />
            Cambiar Contraseña
          </DialogTitle>
          <DialogDescription className='text-xs'>
            Actualice la contraseña de su cuenta de usuario en el sistema de conteo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 py-2'>
          <div className='space-y-1.5'>
            <Label className='text-xs font-semibold'>Contraseña Actual</Label>
            <Input
              type='password'
              placeholder='••••••••'
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className='text-xs'
            />
          </div>

          <div className='space-y-1.5'>
            <Label className='text-xs font-semibold'>Nueva Contraseña</Label>
            <Input
              type='password'
              placeholder='••••••••'
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className='text-xs'
            />
          </div>

          <div className='space-y-1.5'>
            <Label className='text-xs font-semibold'>Confirmar Nueva Contraseña</Label>
            <Input
              type='password'
              placeholder='••••••••'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='text-xs'
            />
          </div>

          <DialogFooter className='pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              className='text-xs'
            >
              Cancelar
            </Button>
            <Button type='submit' className='text-xs font-bold' disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending ? (
                <Loader2 className='h-4 w-4 animate-spin mr-1' />
              ) : (
                <Lock className='h-4 w-4 mr-1' />
              )}
              Actualizar Contraseña
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
