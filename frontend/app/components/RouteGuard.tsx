'use client'

import clsx from 'clsx'
import { useRouter, usePathname } from 'next/navigation'
import React from 'react'

import { getAccessToken } from '../../api/apiClient'
import { useAppSelector } from '../../src/store/hooks'


export type RouteGuardProps = {
  children: React.ReactNode
  /** If true, authenticated users will be redirected away (e.g., from /login) */
  publicOnly?: boolean
  /** Custom redirect target. Defaults to '/' for publicOnly, and '/login' for private */
  redirectTo?: string
}

export default function RouteGuard({ children, publicOnly = false, redirectTo }: RouteGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated } = useAppSelector((s) => s.auth)
  const token = typeof window !== 'undefined' ? getAccessToken() : null

  // When a token exists but auth state not yet restored, wait to avoid flicker
  const isBootstrapping = !!token && !isAuthenticated

  React.useEffect(() => {
    if (isBootstrapping) return
    if (publicOnly && isAuthenticated) {
      router.replace(redirectTo || '/')
    } else if (!publicOnly && !isAuthenticated) {
      router.replace(redirectTo || '/login')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isBootstrapping, publicOnly, router, redirectTo, pathname])

  if (isBootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="inline-flex items-center gap-2 text-slate-500">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span>Loading...</span>
        </span>
      </div>
    )
  }

  if (publicOnly && isAuthenticated) return null
  if (!publicOnly && !isAuthenticated) return null

  return <>{children}</>
}
