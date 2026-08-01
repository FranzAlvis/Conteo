// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import { ResultadosFeature } from '@/features/resultados'

export const Route = createFileRoute('/_authenticated/resultados')({
  component: ResultadosFeature,
})
