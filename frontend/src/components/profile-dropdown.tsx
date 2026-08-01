import { useState } from 'react'
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
import { LogOut, KeyRound, User as UserIcon } from 'lucide-react'
import { ChangePasswordDialog } from '@/components/change-password-dialog'
import { toast } from 'sonner'

export function ProfileDropdown() {
  const { auth } = useAuthStore()
  const navigate = useNavigate()
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false)

  const user = auth.user || {
    name: 'Yamile Hayes Michel',
    username: 'admin',
    role: 'ADMIN',
  }

  const roleName = Array.isArray(user.role)
    ? user.role[0]
    : typeof user.role === 'string'
      ? user.role
      : 'VISOR'

  const handleLogout = () => {
    auth.reset()
    toast.info('Sesión cerrada correctamente')
    navigate({ to: '/sign-in', replace: true })
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-9 w-9 rounded-full border border-border/60 hover:bg-accent'>
            <Avatar className='h-8 w-8'>
              <AvatarImage src='/avatars/01.png' alt={user.name} />
              <AvatarFallback className='bg-primary text-primary-foreground font-bold text-xs'>
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'YH'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-64' align='end' forceMount>
          <DropdownMenuLabel className='font-normal p-3'>
            <div className='flex flex-col space-y-1.5'>
              <div className='flex items-center justify-between'>
                <p className='text-sm font-bold text-foreground truncate max-w-[140px]'>
                  {user.name}
                </p>
                <Badge
                  variant='outline'
                  className='text-[10px] uppercase font-black tracking-wider bg-primary/10 text-primary border-primary/30 px-2 py-0.5'
                >
                  {roleName}
                </Badge>
              </div>
              <p className='text-xs text-muted-foreground flex items-center gap-1 font-mono pt-0.5'>
                <UserIcon className='h-3 w-3 text-muted-foreground' />
                @{user.username || 'usuario'}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              className='text-xs cursor-pointer py-2 font-medium'
              onClick={() => setOpenPasswordDialog(true)}
            >
              <KeyRound className='mr-2 h-4 w-4 text-primary' />
              Cambiar contraseña
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant='destructive'
            className='text-xs cursor-pointer py-2 text-destructive font-semibold focus:text-destructive'
            onClick={handleLogout}
          >
            <LogOut className='mr-2 h-4 w-4' />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog para cambio de contraseña */}
      <ChangePasswordDialog
        open={openPasswordDialog}
        onOpenChange={setOpenPasswordDialog}
      />
    </>
  )
}
