import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
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

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
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

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      // API call to backend auth endpoint (or mock login fallback)
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(() => null)

      if (res && res.ok) {
        const result = await res.json()
        auth.setUser(result.user)
        auth.setAccessToken(result.accessToken)
        toast.success(`Bienvenido, ${result.user.name}`)
        const targetPath = redirectTo || '/'
        navigate({ to: targetPath, replace: true })
      } else if (res && !res.ok) {
        const err = await res.json().catch(() => ({ message: 'Credenciales inválidas' }))
        setErrorMessage(err.message || 'Usuario o contraseña incorrectos.')
      } else {
        // Fallback testing credentials if backend server is starting
        if (data.username === 'admin' && data.password === 'admin123') {
          const mockUser = {
            id: '1',
            name: 'Administrador General',
            username: 'admin',
            role: 'ADMIN',
          }
          auth.setUser(mockUser)
          auth.setAccessToken('jwt-mock-admin-token')
          toast.success('Sesión iniciada como Administrador')
          navigate({ to: redirectTo || '/', replace: true })
        } else if (data.username === 'transcriptor' && data.password === 'trans123') {
          const mockUser = {
            id: '2',
            name: 'Transcriptor de Mesa',
            username: 'transcriptor',
            role: 'TRANSCRIPTOR',
          }
          auth.setUser(mockUser)
          auth.setAccessToken('jwt-mock-transcriptor-token')
          toast.success('Sesión iniciada como Transcriptor')
          navigate({ to: redirectTo || '/', replace: true })
        } else if (data.username === 'visor' && data.password === 'visor123') {
          const mockUser = {
            id: '3',
            name: 'Visor General',
            username: 'visor',
            role: 'VISOR',
          }
          auth.setUser(mockUser)
          auth.setAccessToken('jwt-mock-visor-token')
          toast.success('Sesión iniciada como Visor')
          navigate({ to: redirectTo || '/', replace: true })
        } else {
          setErrorMessage('Credenciales incorrectas. Verifique su usuario y contraseña.')
        }
      }
    } catch (error) {
      setErrorMessage('Error al conectar con el servidor de autenticación.')
    } finally {
      setIsLoading(false)
    }
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

        <Button type='submit' className='w-full mt-2 font-semibold' disabled={isLoading}>
          {isLoading ? (
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
