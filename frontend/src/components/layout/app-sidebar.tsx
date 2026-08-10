import { useLayout } from '@/context/layout-provider'
import { useAuthStore } from '@/stores/auth-store'
import { getUserRole } from '@/lib/auth-role'
import { canAccessRoute, type AppRoute } from '@/config/role-permissions'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const role = useAuthStore((state) => getUserRole(state.auth.user))

  const visibleGroups = sidebarData.navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessRoute(role, item.url as AppRoute)),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <AppTitle />
      </SidebarHeader>
      <SidebarContent>
        {visibleGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
