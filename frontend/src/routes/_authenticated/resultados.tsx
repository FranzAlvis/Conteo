import { createFileRoute } from '@tanstack/react-router'
import { requireRouteAccess } from '@/lib/route-guards'
import { ResultadosFeature } from '@/features/resultados'

export const Route = createFileRoute('/_authenticated/resultados')({
  beforeLoad: () => requireRouteAccess('/resultados'),
  component: ResultadosFeature,
})
