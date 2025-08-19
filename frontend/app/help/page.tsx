"use client"

import PageWithShortcuts from '../../src/components/layout/PageWithShortcuts'

const globalShortcuts = [
  ['Ctrl+Shift+D', 'Dashboard'],
  ['Ctrl+Shift+S', 'Sales'],
  ['Ctrl+Shift+I', 'Inventory'],
  ['Ctrl+Shift+C', 'Customers'],
  ['Ctrl+Shift+R', 'Reports'],
  ['Ctrl+N', 'New transaction'],
  ['Ctrl+S', 'Save'],
  ['Ctrl+F', 'Focus product search'],
  ['Esc', 'Cancel current action'],
  ['F1', 'Help'],
]

export default function HelpPage() {
  return (
    <PageWithShortcuts title="Keyboard Shortcuts" description="Press keys to navigate and act quickly.">
      <div className="rounded-lg border border-border p-3">
        <ul className="grid gap-1 sm:grid-cols-2">
          {globalShortcuts.map(([key, action]) => (
            <li key={key} className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
              <span className="font-mono">{key}</span>
              <span className="text-muted-foreground">{action}</span>
            </li>
          ))}
        </ul>
      </div>
    </PageWithShortcuts>
  )
}
