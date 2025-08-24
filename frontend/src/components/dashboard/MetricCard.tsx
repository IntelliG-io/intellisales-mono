"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { cn } from '../../lib/utils'

export interface MetricCardProps {
  title: string
  value: string
  delta?: string
  icon?: React.ReactNode
  intent?: 'default' | 'success' | 'warning' | 'error' | 'info'
  onActivate?: () => void
}

const intentStyles: Record<NonNullable<MetricCardProps['intent']>, string> = {
  default: 'border-border',
  success: 'border-emerald-500/60',
  warning: 'border-amber-500/60',
  error: 'border-red-500/60',
  info: 'border-sky-500/60',
}

export default function MetricCard({ title, value, delta, icon, intent = 'default', onActivate }: MetricCardProps) {
  const handleActivate = React.useCallback(() => {
    onActivate?.()
  }, [onActivate])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleActivate()
    }
  }

  return (
    <Card
      tabIndex={0}
      role={onActivate ? 'button' : undefined}
      aria-label={`${title}: ${value}${delta ? `, ${delta}` : ''}`}
      onKeyDown={onKeyDown}
      onClick={handleActivate}
      className={cn('focus-ring group h-full overflow-hidden border-l-4 transition-colors', intentStyles[intent])}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        {delta ? <p className="text-xs text-muted-foreground">{delta}</p> : null}
      </CardContent>
    </Card>
  )
}
