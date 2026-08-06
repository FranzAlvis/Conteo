import {
  LayoutDashboard,
  Vote,
  UserCheck,
  Users,
  Settings,
  Radio,
  FileSpreadsheet,
  Share2,
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
          title: 'Transcripción de Actas',
          url: '/transcripcion',
          icon: FileSpreadsheet,
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
          title: 'Asignaciones & WhatsApp',
          url: '/asignaciones',
          icon: Share2,
        },
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
