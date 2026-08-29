import { createFileRoute } from '@tanstack/react-router'
import { CambiarPasswordTemporalFeature } from '@/features/cambiar-password-temporal'

export const Route = createFileRoute('/_authenticated/cambiar-password-temporal')({
  component: CambiarPasswordTemporalFeature,
})
