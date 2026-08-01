// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import { MesasFeature } from '@/features/mesas'

export const Route = createFileRoute('/_authenticated/mesas')({
  component: MesasFeature,
})
