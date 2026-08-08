import { createFileRoute } from '@tanstack/react-router'
import { requireRouteAccess } from '@/lib/route-guards'
import { TranscripcionFeature } from '@/features/transcripcion'

export const Route = createFileRoute('/_authenticated/transcripcion')({
  beforeLoad: () => requireRouteAccess('/transcripcion'),
  component: TranscripcionFeature,
})
