// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import { TranscripcionFeature } from '@/features/transcripcion'

export const Route = createFileRoute('/_authenticated/transcripcion')({
  component: TranscripcionFeature,
})
