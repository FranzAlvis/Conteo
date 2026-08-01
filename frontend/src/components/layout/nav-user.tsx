import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ChevronsUpDown, KeyRound, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/stores/auth-store'
import { ChangePasswordDialog } from '@/components/change-password-dialog'
import { toast } from 'sonner'

type NavUserProps = {
  user: {
    name: string
    email: string
    avatar: string
  }
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar()
  const { auth } = useAuthStore()
  const navigate = useNavigate()
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false)

  const currentUser = auth.user || {
    name: user.name || 'Yamile Hayes Michel',
    username: 'admin',
    role: 'ADMIN',
  }

  const roleName = Array.isArray(currentUser.role)
    ? currentUser.role[0]
    : typeof currentUser.role === 'string'
      ? currentUser.role
      : 'VISOR'

  const handleLogout = () => {
    auth.reset()
    toast.info('Sesión cerrada correctamente')
    navigate({ to: '/sign-in', replace: true })
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage src={user.avatar} alt={currentUser.name} />
                  <AvatarFallback className='bg-primary text-primary-foreground font-bold text-xs rounded-lg'>
                    {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'YH'}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-start text-sm leading-tight'>
                  <span className='truncate font-semibold'>{currentUser.name}</span>
                  <span className='truncate text-[11px] text-muted-foreground uppercase font-bold tracking-wider'>
                    Rol: {roleName}
                  </span>
                </div>
                <ChevronsUpDown className='ms-auto size-4 opacity-60' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
              side={isMobile ? 'bottom' : 'right'}
              align='end'
              sideOffset={4}
            >
              <DropdownMenuLabel className='p-2.5 font-normal'>
                <div className='flex items-center gap-2 text-start text-sm'>
                  <Avatar className='h-8 w-8 rounded-lg'>
                    <AvatarImage src={user.avatar} alt={currentUser.name} />
                    <AvatarFallback className='bg-primary text-primary-foreground font-bold text-xs rounded-lg'>
                      {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'YH'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-start text-sm leading-tight'>
                    <span className='truncate font-semibold'>{currentUser.name}</span>
                    <span className='truncate text-xs text-muted-foreground'>
                      @{currentUser.username || 'usuario'}
                    </span>
                  </div>
                  <Badge variant='outline' className='text-[10px] font-bold uppercase bg-primary/10 text-primary border-primary/30 px-1.5 py-0.5'>
                    {roleName}
                  </Badge>
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
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Dialog para cambio de contraseña */}
      <ChangePasswordDialog
        open={openPasswordDialog}
        onOpenChange={setOpenPasswordDialog}
      />
    </>
  )
}
