// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import { AsignacionesFeature } from '@/features/asignaciones'

export const Route = createFileRoute('/_authenticated/asignaciones')({
  component: AsignacionesFeature,
})
