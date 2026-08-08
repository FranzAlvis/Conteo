import { useState } from 'react'
import { AxiosError } from 'axios'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { Loader2, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { authApi } from '@/lib/api/auth'
import type { ApiErrorBody } from '@/lib/api/types'
import { useAuthStore } from '@/stores/auth-store'
import { getUserRole } from '@/lib/auth-role'
import { defaultRouteForRole } from '@/config/role-permissions'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const formSchema = z.object({
  username: z.string().min(1, 'El nombre de usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorBody | undefined
    if (data?.message) {
      return Array.isArray(data.message) ? data.message[0] : data.message
    }
    if (error.code === 'ERR_NETWORK') {
      return 'No se pudo conectar con el servidor. Verifique que el backend esté corriendo.'
    }
  }
  return 'Usuario o contraseña incorrectos.'
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (result) => {
      auth.setUser(result.user)
      auth.setAccessToken(result.accessToken)
      toast.success(`Bienvenido, ${result.user.name}`)
      navigate({ to: redirectTo || defaultRouteForRole(getUserRole(result.user)), replace: true })
    },
    onError: (error) => {
      setErrorMessage(extractErrorMessage(error))
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    setErrorMessage(null)
    loginMutation.mutate(data)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-4', className)}
        {...props}
      >
        {errorMessage && (
          <Alert variant='destructive' className='py-2'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle className='text-sm font-semibold'>Error de autenticación</AlertTitle>
            <AlertDescription className='text-xs'>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usuario</FormLabel>
              <FormControl>
                <Input placeholder='Ingrese su nombre de usuario' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <div className='relative'>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder='••••••••'
                    {...field}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground'
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                    <span className='sr-only'>
                      {showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className='w-full mt-2 font-semibold' disabled={loginMutation.isPending}>
          {loginMutation.isPending ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <LogIn className='mr-2 h-4 w-4' />
          )}
          Iniciar sesión
        </Button>
      </form>
    </Form>
  )
}
