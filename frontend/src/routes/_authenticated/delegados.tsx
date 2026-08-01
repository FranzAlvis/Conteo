// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import { DelegadosFeature } from '@/features/delegados'

export const Route = createFileRoute('/_authenticated/delegados')({
  component: DelegadosFeature,
})
