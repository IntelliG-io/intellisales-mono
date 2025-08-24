'use client'

import { ThemeProvider } from 'next-themes'
import React, { useEffect } from 'react'
import { Provider } from 'react-redux'

import { getAccessToken, clearAuthTokens } from '../api/apiClient'
import { getProfile } from '../api/endpoints/userApi'
import { store } from '../src/store'
import { useAppDispatch } from '../src/store/hooks'
import { restoreAuthState, logout, setError } from '../src/store/slices/authSlice'
import 'focus-visible'

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const token = getAccessToken()
        if (!token) {
          if (mounted) dispatch(restoreAuthState(null))
          return
        }
        // Verify token by fetching profile
        const res = await getProfile().catch(() => null)
        if (mounted) {
          if (res?.user) {
            dispatch(restoreAuthState({
              id: res.user.id,
              email: res.user.email,
              name: res.user.name,
              roles: res.user.role ? [res.user.role] : [],
            }))
          } else {
            clearAuthTokens()
            dispatch(logout())
          }
        }
      } catch (e: any) {
        clearAuthTokens()
        if (mounted) {
          dispatch(logout())
          dispatch(setError('Session expired. Please sign in again.'))
        }
      }
    })()
    return () => {
      mounted = false
    }
  }, [dispatch])

  return <>{children}</>
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="dark"
        enableSystem={false}
        themes={['light', 'dark', 'hc']}
      >
        <AuthBootstrap>{children}</AuthBootstrap>
      </ThemeProvider>
    </Provider>
  )
}
