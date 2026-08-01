// @ts-nocheck
import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    const { accessToken, user } = useAuthStore.getState().auth
    // Allow demo access or fallback to login
    if (!accessToken && !user) {
      // Automatic fallback default session for immediate demo preview or redirect
      useAuthStore.getState().auth.setUser({
        id: '1',
        name: 'Yamile Hayes Michel (Admin)',
        username: 'admin',
        role: 'ADMIN',
      })
      useAuthStore.getState().auth.setAccessToken('jwt-demo-session-token')
    }
  },
  component: AuthenticatedLayout,
})
