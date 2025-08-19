import * as React from 'react'
import { cn } from '../../lib/utils'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
}

export function Progress({ value = 0, className, ...props }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div aria-valuemin={0} aria-valuemax={100} aria-valuenow={clamped} role="progressbar" className={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', className)} {...props}>
      <div className="h-full w-full flex-1 bg-primary" style={{ transform: `translateX(-${100 - clamped}%)` }} />
    </div>
  )
}
