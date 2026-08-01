import { useSearch } from '@tanstack/react-router'
import { Vote, BarChart3, ShieldCheck } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ThemeSwitch } from '@/components/theme-switch'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const search = useSearch({ strict: false }) as { redirect?: string }

  return (
    <div className='relative min-h-svh w-full lg:grid lg:grid-cols-2 bg-background'>
      {/* Left Column: Institutional Panel */}
      <div className='relative hidden flex-col justify-between p-10 lg:flex bg-primary text-primary-foreground overflow-hidden'>
        {/* Subtle decorative background pattern */}
        <div className='absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80 opacity-95' />
        <div className='absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-white/5 blur-3xl pointer-events-none' />
        <div className='absolute -left-20 -top-20 h-96 w-96 rounded-full bg-black/10 blur-3xl pointer-events-none' />

        {/* Top Header */}
        <div className='relative z-10 flex items-center gap-3 text-lg font-semibold tracking-wide'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 shadow-inner'>
            <Vote className='h-6 w-6 text-white' />
          </div>
          <span>Elecciones Universitarias 2026</span>
        </div>

        {/* Middle Hero Content */}
        <div className='relative z-10 my-auto max-w-lg space-y-6'>
          <div className='inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md border border-white/15 shadow-sm'>
            <ShieldCheck className='h-3.5 w-3.5 text-emerald-300' />
            Plataforma de Control Oficial
          </div>

          <h1 className='text-4xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight'>
            Conteo de Votos — Vicerrectorado 2026
          </h1>

          <p className='text-base text-white/90 font-normal leading-relaxed'>
            Sistema interno de transcripción de actas, consolidación de datos y visualización de resultados en tiempo real.
          </p>

          <div className='pt-4 border-t border-white/15'>
            <p className='text-sm font-medium text-white/80 uppercase tracking-wider text-xs mb-1'>
              Proceso Electoral
            </p>
            <p className='text-lg font-semibold text-white flex items-center gap-2'>
              <BarChart3 className='h-5 w-5 text-white/90' />
              Yamile Hayes Michel — Candidata a Vicerrectorado
            </p>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className='relative z-10 text-xs text-white/70 flex justify-between items-center border-t border-white/10 pt-4'>
          <span>© 2026 Sistema de Conteo Electoral</span>
          <span>Acceso restringido solo a personal autorizado</span>
        </div>
      </div>

      {/* Right Column: Authentication Form */}
      <div className='relative flex min-h-svh flex-col items-center justify-center p-6 sm:p-12 lg:p-16'>
        {/* Top bar theme switch */}
        <div className='absolute right-6 top-6 z-20 flex items-center gap-2'>
          <ThemeSwitch />
        </div>

        {/* Mobile Header (Visible only on small screens) */}
        <div className='mb-8 text-center lg:hidden max-w-sm'>
          <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md'>
            <Vote className='h-7 w-7' />
          </div>
          <h2 className='text-xl font-bold text-foreground'>Conteo de Votos 2026</h2>
          <p className='text-xs text-muted-foreground mt-1'>
            Yamile Hayes Michel — Candidata a Vicerrectorado
          </p>
        </div>

        {/* Form Container Card */}
        <Card className='w-full max-w-md border-border/60 shadow-xl backdrop-blur-sm'>
          <CardHeader className='space-y-1 text-center sm:text-left'>
            <CardTitle className='text-2xl font-bold tracking-tight'>
              Iniciar sesión
            </CardTitle>
            <CardDescription className='text-muted-foreground text-sm'>
              Ingrese sus credenciales asignadas por el administrador para acceder al sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserAuthForm redirectTo={search?.redirect} />
          </CardContent>
        </Card>

        {/* Footer info for mobile */}
        <p className='mt-8 text-center text-xs text-muted-foreground max-w-xs'>
          Sistema interno seguro. Las actividades son registradas por el módulo de trazabilidad.
        </p>
      </div>
    </div>
  )
}
