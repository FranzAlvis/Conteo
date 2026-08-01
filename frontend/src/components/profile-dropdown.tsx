import { useAuthStore } from '@/stores/auth-store'
import { useNavigate } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User as UserIcon, Shield } from 'lucide-react'

export function ProfileDropdown() {
  const { auth } = useAuthStore()
  const navigate = useNavigate()

  const user = auth.user || {
    name: 'Usuario Conteo',
    username: 'invitado',
    role: 'ADMIN',
  }

  const roleName = Array.isArray(user.role)
    ? user.role[0]
    : typeof user.role === 'string'
      ? user.role
      : 'VISOR'

  const handleLogout = () => {
    auth.reset()
    navigate({ to: '/sign-in', replace: true })
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-9 w-9 rounded-full border border-border/60 hover:bg-accent'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src='/avatars/01.png' alt={user.name} />
            <AvatarFallback className='bg-primary text-primary-foreground font-semibold text-xs'>
              {user.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-60' align='end' forceMount>
        <DropdownMenuLabel className='font-normal p-3'>
          <div className='flex flex-col space-y-1.5'>
            <p className='text-sm leading-none font-semibold text-foreground flex items-center justify-between'>
              {user.name}
              <Badge variant='outline' className='ml-2 text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary border-primary/20 px-1.5 py-0.5'>
                {roleName}
              </Badge>
            </p>
            <p className='text-xs leading-none text-muted-foreground flex items-center gap-1 pt-1'>
              <UserIcon className='h-3 w-3' />
              @{user.username || 'usuario'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className='text-xs cursor-pointer' onClick={() => navigate({ to: '/' })}>
            <Shield className='mr-2 h-4 w-4 text-muted-foreground' />
            Panel de Control
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant='destructive' className='text-xs cursor-pointer text-destructive focus:text-destructive' onClick={handleLogout}>
          <LogOut className='mr-2 h-4 w-4' />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
