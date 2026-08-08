import { createFileRoute } from '@tanstack/react-router'
import { requireRouteAccess } from '@/lib/route-guards'
import { MesasFeature } from '@/features/mesas'

export const Route = createFileRoute('/_authenticated/mesas')({
  beforeLoad: () => requireRouteAccess('/mesas'),
  component: MesasFeature,
})
