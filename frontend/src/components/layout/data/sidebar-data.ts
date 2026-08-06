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
      title: 'Cómputo & Resultados',
      items: [
        {
          title: 'Resumen General',
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
      ],
    },
    {
      title: 'Estructura Electoral',
      items: [
        {
          title: 'Mesas de Votación',
          url: '/mesas',
          icon: Vote,
        },
        {
          title: 'Delegados de Mesa',
          url: '/delegados',
          icon: UserCheck,
        },
      ],
    },
    {
      title: 'Administración & Reportes',
      items: [
        {
          title: 'Usuarios & Asignaciones',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Grupos de WhatsApp',
          url: '/asignaciones',
          icon: Share2,
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
