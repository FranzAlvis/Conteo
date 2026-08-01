// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import { ConfiguracionFeature } from '@/features/configuracion'

export const Route = createFileRoute('/_authenticated/configuracion')({
  component: ConfiguracionFeature,
})
