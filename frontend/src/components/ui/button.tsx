"use client"

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-ring disabled:pointer-events-none disabled:opacity-50',
    'h-9 px-4 py-2',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:opacity-95',
        secondary: 'bg-secondary text-secondary-foreground hover:opacity-95',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:opacity-95',
        success: 'bg-success text-success-foreground hover:opacity-95',
        warning: 'bg-warning text-warning-foreground hover:opacity-95',
      },
      size: {
        sm: 'h-8 rounded-md px-3',
        md: 'h-9 px-4',
        lg: 'h-10 rounded-md px-6',
        xl: 'h-11 rounded-md px-7 text-base',
        icon: 'h-9 w-9',
      },
      density: {
        comfortable: '',
        compact: 'h-8 px-3 text-[13px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      density: 'comfortable',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, density, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, density }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
