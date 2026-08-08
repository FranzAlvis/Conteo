import { createFileRoute } from '@tanstack/react-router'
import { requireRouteAccess } from '@/lib/route-guards'
import { DelegadosFeature } from '@/features/delegados'

export const Route = createFileRoute('/_authenticated/delegados')({
  beforeLoad: () => requireRouteAccess('/delegados'),
  component: DelegadosFeature,
})
