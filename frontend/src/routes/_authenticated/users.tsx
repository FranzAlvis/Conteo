import { createFileRoute } from '@tanstack/react-router'
import { requireRouteAccess } from '@/lib/route-guards'
import { UsersFeature } from '@/features/users'

export const Route = createFileRoute('/_authenticated/users')({
  beforeLoad: () => requireRouteAccess('/users'),
  component: UsersFeature,
})
