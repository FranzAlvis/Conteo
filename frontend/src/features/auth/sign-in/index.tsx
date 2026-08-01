import { useSearch } from '@tanstack/react-router'
import { Vote, BarChart3, ShieldCheck, Landmark } from 'lucide-react'
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
      {/* Left Column: Institutional USFX Sucre Panel */}
      <div className='relative hidden flex-col justify-between p-10 lg:flex bg-primary text-primary-foreground overflow-hidden'>
        {/* USFX Architectural Background Image */}
        <div
          className='absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105'
          style={{ backgroundImage: `url('/assets/usfx_bg.jpg')` }}
        />

        {/* Elegant Wine Red Gradient Overlay with Glassmorphism */}
        <div className='absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-primary/80 backdrop-blur-[2px]' />
        
        {/* Subtle decorative glow elements */}
        <div className='absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-white/10 blur-3xl pointer-events-none' />
        <div className='absolute -left-20 -top-20 h-96 w-96 rounded-full bg-black/20 blur-3xl pointer-events-none' />

        {/* Top Header */}
        <div className='relative z-10 flex items-center justify-between'>
          <div className='flex items-center gap-3 text-lg font-semibold tracking-wide'>
            <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md border border-white/25 shadow-lg'>
              <Vote className='h-6 w-6 text-white' />
            </div>
            <div>
              <span className='block text-base font-bold text-white leading-none'>
                Elecciones USFX 2026
              </span>
              <span className='text-[11px] font-medium text-white/80 tracking-wider uppercase'>
                Sucre — Bolivia
              </span>
            </div>
          </div>

          <div className='inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-md border border-white/20 shadow-sm'>
            <Landmark className='h-3.5 w-3.5 text-amber-300' />
            USFX Chuquisaca
          </div>
        </div>

        {/* Middle Hero Content */}
        <div className='relative z-10 my-auto max-w-lg space-y-6 pt-8'>
          <div className='inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white/95 backdrop-blur-md border border-white/20 shadow-md'>
            <ShieldCheck className='h-4 w-4 text-emerald-300' />
            Plataforma Oficial de Conteo y Escrutinio
          </div>

          <h1 className='text-4xl font-black tracking-tight text-white sm:text-5xl leading-none drop-shadow-md'>
            Conteo de Votos — Vicerrectorado 2026
          </h1>

          <p className='text-base text-white/90 font-normal leading-relaxed text-shadow-sm'>
            Universidad Mayor, Real y Pontificia de San Francisco Xavier de Chuquisaca. Transcripción de actas y consolidación de resultados en tiempo real.
          </p>

          <div className='pt-5 border-t border-white/20 backdrop-blur-sm bg-white/5 rounded-2xl p-4 border shadow-inner space-y-1.5'>
            <p className='text-xs font-bold text-white/80 uppercase tracking-widest'>
              Candidatura Oficial
            </p>
            <p className='text-xl font-black text-white flex items-center gap-2.5'>
              <BarChart3 className='h-6 w-6 text-amber-300' />
              Yamile Hayes Michel — Candidata a Vicerrectorado
            </p>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className='relative z-10 text-xs text-white/75 flex justify-between items-center border-t border-white/15 pt-4 font-medium'>
          <span>© 2026 USFX — Sucre, Bolivia</span>
          <span>Acceso Restringido</span>
        </div>
      </div>

      {/* Right Column: Authentication Form */}
      <div className='relative flex min-h-svh flex-col items-center justify-center p-6 sm:p-12 lg:p-16'>
        {/* Top bar theme switch */}
        <div className='absolute right-6 top-6 z-20 flex items-center gap-2'>
          <ThemeSwitch />
        </div>

        {/* Mobile Header (Visible only on small screens) */}
        <div className='mb-8 text-center lg:hidden max-w-sm space-y-2'>
          <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg'>
            <Vote className='h-8 w-8' />
          </div>
          <h2 className='text-2xl font-black text-foreground'>Conteo USFX 2026</h2>
          <p className='text-xs font-semibold text-primary uppercase tracking-wider'>
            Yamile Hayes Michel — Candidata a Vicerrectorado
          </p>
          <p className='text-[11px] text-muted-foreground'>
            Universidad Mayor Real y Pontificia de San Francisco Xavier
          </p>
        </div>

        {/* Form Container Card */}
        <Card className='w-full max-w-md border-border/60 shadow-2xl backdrop-blur-sm'>
          <CardHeader className='space-y-1 text-center sm:text-left'>
            <CardTitle className='text-2xl font-bold tracking-tight'>
              Iniciar sesión
            </CardTitle>
            <CardDescription className='text-muted-foreground text-sm'>
              Ingrese sus credenciales autorizadas para acceder al sistema de conteo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserAuthForm redirectTo={search?.redirect} />
          </CardContent>
        </Card>

        {/* Footer info for mobile */}
        <p className='mt-8 text-center text-xs text-muted-foreground max-w-xs font-medium'>
          USFX Sucre — Sistema seguro con auditoría y trazabilidad en tiempo real.
        </p>
      </div>
    </div>
  )
}
