import { createFileRoute } from '@tanstack/react-router'
import { requireRouteAccess } from '@/lib/route-guards'
import { AsignacionesFeature } from '@/features/asignaciones'

export const Route = createFileRoute('/_authenticated/asignaciones')({
  beforeLoad: () => requireRouteAccess('/asignaciones'),
  component: AsignacionesFeature,
})
