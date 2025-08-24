"use client"

import * as React from 'react'
import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'

export default function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const onOpen = () => setOpen(true)
    document.addEventListener('app:command', onOpen as EventListener)
    return () => document.removeEventListener('app:command', onOpen as EventListener)
  }, [])

  const run = (action: () => void) => {
    action()
    setOpen(false)
  }

  return (
    <Command.Dialog open={open} onOpenChange={setOpen} label="Command Menu">
      <Command.Input placeholder="Type a command or search..." />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>
        <Command.Group heading="Navigate">
          <Command.Item onSelect={() => run(() => router.push('/'))}>Dashboard</Command.Item>
          <Command.Item onSelect={() => run(() => router.push('/sales'))}>Sales</Command.Item>
          <Command.Item onSelect={() => run(() => router.push('/inventory'))}>Inventory</Command.Item>
          <Command.Item onSelect={() => run(() => router.push('/customers'))}>Customers</Command.Item>
          <Command.Item onSelect={() => run(() => router.push('/reports'))}>Reports</Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  )
}
