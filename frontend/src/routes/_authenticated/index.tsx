import { createFileRoute } from '@tanstack/react-router'
import { requireRouteAccess } from '@/lib/route-guards'
import { Dashboard } from '@/features/dashboard'

export const Route = createFileRoute('/_authenticated/')({
  beforeLoad: () => requireRouteAccess('/'),
  component: Dashboard,
})
