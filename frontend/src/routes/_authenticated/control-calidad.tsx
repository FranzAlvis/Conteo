import { createFileRoute } from '@tanstack/react-router'
import { requireRouteAccess } from '@/lib/route-guards'
import { ControlCalidadFeature } from '@/features/control-calidad'

export const Route = createFileRoute('/_authenticated/control-calidad')({
  beforeLoad: () => requireRouteAccess('/control-calidad'),
  component: ControlCalidadFeature,
})
