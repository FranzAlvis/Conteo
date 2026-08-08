import { createFileRoute } from '@tanstack/react-router'
import { requireRouteAccess } from '@/lib/route-guards'
import { ConfiguracionFeature } from '@/features/configuracion'

export const Route = createFileRoute('/_authenticated/configuracion')({
  beforeLoad: () => requireRouteAccess('/configuracion'),
  component: ConfiguracionFeature,
})
