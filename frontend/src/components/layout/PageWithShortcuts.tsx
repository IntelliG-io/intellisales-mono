"use client"

import React, { useEffect } from 'react'
import { toast } from 'sonner'

export default function PageWithShortcuts({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: React.ReactNode
}) {
  useEffect(() => {
    const onSave = () => toast.success('Saved')
    const onCancel = () => toast('Cancelled', { description: 'Action was cancelled (Esc)' })
    document.addEventListener('app:save', onSave as EventListener)
    document.addEventListener('app:cancel', onCancel as EventListener)
    return () => {
      document.removeEventListener('app:save', onSave as EventListener)
      document.removeEventListener('app:cancel', onCancel as EventListener)
    }
  }, [])

  return (
    <section aria-labelledby="page-title" className="space-y-2">
      <h1 id="page-title" className="text-xl font-semibold tracking-tight">
        {title}
      </h1>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  )
}
