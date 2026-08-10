import { createFileRoute } from '@tanstack/react-router'
import { requireRouteAccess } from '@/lib/route-guards'
import { EstadoMesasFeature } from '@/features/estado-mesas'

export const Route = createFileRoute('/_authenticated/estado-mesas')({
  beforeLoad: () => requireRouteAccess('/estado-mesas'),
  component: EstadoMesasFeature,
})
