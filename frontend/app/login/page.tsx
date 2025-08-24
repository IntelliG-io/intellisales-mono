'use client'

import React from 'react'

import LoginForm from '../components/LoginForm'
import RouteGuard from '../components/RouteGuard'

export default function LoginPage() {
  return (
    <RouteGuard publicOnly>
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="mx-auto max-w-xl">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h1>
              <p className="mt-2 text-sm text-slate-600">Sign in to continue to your dashboard.</p>
            </div>
            <LoginForm />
          </div>
        </div>
      </main>
    </RouteGuard>
  )
}
