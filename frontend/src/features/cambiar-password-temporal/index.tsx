import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { authApi } from '@/lib/api/auth'
import { handleServerError } from '@/lib/handle-server-error'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { KeyRound, Lock, Loader2, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

/**
 * Pantalla obligatoria tras un primer inicio de sesión (o un restablecimiento
 * de contraseña por el admin): bloquea el acceso al resto del sistema hasta
 * que el usuario defina su propia contraseña. La ruta protegida
 * (_authenticated/route.tsx) redirige acá mientras `mustChangePassword` esté
 * activo, sin importar a qué pantalla intente navegar.
 */
export function CambiarPasswordTemporalFeature() {
  const { auth } = useAuthStore()
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      auth.setUser({ ...auth.user, mustChangePassword: false })
      toast.success('Contraseña actualizada. ¡Bienvenido/a!')
      navigate({ to: '/' })
    },
    onError: handleServerError,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Complete todos los campos')
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
    if (newPassword === currentPassword) {
      toast.error('La nueva contraseña debe ser distinta de la temporal')
      return
    }
    changePasswordMutation.mutate({ currentPassword, newPassword })
  }

  return (
    <div className='fixed inset-0 z-100 flex items-center justify-center bg-background p-4'>
      <div className='w-full max-w-md space-y-6'>
        <div className='text-center space-y-2'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary'>
            <ShieldAlert className='h-6 w-6' />
          </div>
          <h1 className='text-lg font-bold text-foreground'>Cambio de Contraseña Obligatorio</h1>
          <p className='text-xs text-muted-foreground max-w-sm mx-auto'>
            Por seguridad, antes de continuar debe reemplazar la contraseña temporal que se le
            asignó por una propia.
          </p>
        </div>

        <Alert>
          <AlertTitle className='text-xs font-bold'>¿Por qué veo esto?</AlertTitle>
          <AlertDescription className='text-xs'>
            Su cuenta usa una contraseña inicial (o fue restablecida por un administrador). No
            podrá usar el sistema hasta definir una nueva.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className='space-y-4 p-5 rounded-xl border bg-card shadow-sm'>
          <div className='space-y-1.5'>
            <Label className='text-xs font-semibold'>Contraseña Temporal Actual</Label>
            <Input
              type='password'
              placeholder='••••••••'
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className='text-xs'
              autoFocus
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

          <Button type='submit' className='w-full text-xs font-bold gap-1.5' disabled={changePasswordMutation.isPending}>
            {changePasswordMutation.isPending ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Lock className='h-4 w-4' />
            )}
            Guardar y Continuar
          </Button>
        </form>

        <p className='text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1'>
          <KeyRound className='h-3 w-3' /> Sistema de Conteo de Votos — Vicerrectorado 2026
        </p>
      </div>
    </div>
  )
}
