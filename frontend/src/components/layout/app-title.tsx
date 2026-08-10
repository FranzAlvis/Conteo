import { Link } from '@tanstack/react-router'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { sidebarData } from './data/sidebar-data'

export function AppTitle() {
  const { setOpenMobile } = useSidebar()
  const team = sidebarData.teams[0]

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          className='hover:bg-transparent active:bg-transparent'
          asChild
        >
          <Link
            to='/'
            onClick={() => setOpenMobile(false)}
            className='flex items-center gap-2'
          >
            <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
              <team.logo className='size-4' />
            </div>
            <div className='grid flex-1 text-start text-sm leading-tight'>
              <span className='truncate font-semibold'>{team.name}</span>
              <span className='truncate text-xs'>{team.plan}</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
