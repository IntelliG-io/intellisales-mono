'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { login as loginRequest } from '../../api/endpoints/authApi'
import { useAppDispatch, useAppSelector } from '../../src/store/hooks'
import { setError, setLoading } from '../../src/store/slices/authSlice'


const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginForm({ className }: { className?: string }) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { loading, error } = useAppSelector((s) => s.auth)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const onSubmit = async (values: LoginFormValues) => {
    // Never log sensitive data
    dispatch(setError(null))
    dispatch(setLoading(true))
    try {
      const res = await loginRequest(values)
      // loginRequest already dispatches auth login action and stores tokens
      // Navigate to dashboard/home
      router.replace('/')
      return res
    } catch (e: any) {
      const message = e?.message || 'Login failed. Please try again.'
      dispatch(setError(message))
    } finally {
      dispatch(setLoading(false))
    }
  }

  const btnDisabled = loading || isSubmitting

  return (
    <div className={twMerge('w-full max-w-md mx-auto', className)}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white/80 backdrop-blur border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8"
        noValidate
      >
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
          <p className="text-sm text-slate-500 mt-1">Enter your credentials to access your account.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className={clsx(
                'mt-1 block w-full rounded-lg border px-3 py-2 text-slate-900 placeholder-slate-400 outline-none transition',
                'focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                'hover:border-slate-300',
                errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-200'
              )}
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              className={clsx(
                'mt-1 block w-full rounded-lg border px-3 py-2 text-slate-900 placeholder-slate-400 outline-none transition',
                'focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                'hover:border-slate-300',
                errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-200'
              )}
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={btnDisabled}
          className={clsx(
            'mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm transition',
            'hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
            btnDisabled && 'cursor-not-allowed opacity-70'
          )}
        >
          {btnDisabled && (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          )}
          <span>{btnDisabled ? 'Signing in...' : 'Sign in'}</span>
        </button>

        <p className="mt-4 text-center text-xs text-slate-500">
          By signing in, you agree to our
          <a className="ml-1 text-indigo-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
            Terms & Privacy
          </a>
        </p>
      </form>
    </div>
  )
}
