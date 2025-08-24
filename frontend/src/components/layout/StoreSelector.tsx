"use client"

import * as React from 'react'

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select'

const stores = [
  { id: 'store-1', name: 'Downtown' },
  { id: 'store-2', name: 'Airport' },
  { id: 'store-3', name: 'Mall' },
]

export default function StoreSelector({ className }: { className?: string }) {
  const [value, setValue] = React.useState<string>('store-1')
  return (
    <div className={`w-32 sm:w-40 ${className || ''}`}>
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger aria-label="Select store">
          <SelectValue placeholder="Select store" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Stores</SelectLabel>
            {stores.map((s) => (
              <SelectItem key={s.id} value={s.id} aria-label={s.name}>
                {s.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
