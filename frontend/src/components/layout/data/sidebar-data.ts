import {
  LayoutDashboard,
  Vote,
  UserCheck,
  Users,
  Settings,
  Radio
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Yamile Hayes Michel',
    email: 'admin@vicerrectorado2026.edu',
    avatar: '/avatars/01.png',
  },
  teams: [
    {
      name: 'Vicerrectorado 2026',
      logo: Vote,
      plan: 'Yamile Hayes Michel',
    },
  ],
  navGroups: [
    {
      title: 'Principal',
      items: [
        {
          title: 'Resumen',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Resultados Live',
          url: '/resultados',
          icon: Radio,
        },
        {
          title: 'Mesas de Votación',
          url: '/mesas',
          icon: Vote,
        },
        {
          title: 'Delegados',
          url: '/delegados',
          icon: UserCheck,
        },
      ],
    },
    {
      title: 'Administración',
      items: [
        {
          title: 'Gestión de Usuarios',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Configuración / Candidatos',
          url: '/configuracion',
          icon: Settings,
        },
      ],
    },
  ],
}
