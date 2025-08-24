import * as React from 'react'
import { cn } from '../../lib/utils'

export function Separator({ orientation = 'horizontal', className, ...props }: { orientation?: 'horizontal' | 'vertical' } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className
      )}
      {...props}
    />
  )
}
