"use client"

import { Plus, SlidersHorizontal } from 'lucide-react'
import * as React from 'react'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { SimplePagination } from '../ui/pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'

interface Row {
  name: string
  category: string
  qty: number
  revenue: string
  pct: string
  margin: string
}

const rows: Row[] = [
  { name: 'Espresso Beans', category: 'Grocery', qty: 124, revenue: '$1,240', pct: '12%', margin: '22%' },
  { name: 'Milk 1L', category: 'Dairy', qty: 98, revenue: '$490', pct: '6%', margin: '18%' },
  { name: 'Croissant', category: 'Bakery', qty: 65, revenue: '$325', pct: '4%', margin: '35%' },
]

export default function TopProductsTable() {
  const [page, setPage] = React.useState(1)
  const pageCount = 1

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-2 h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>Top Products</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Tabs defaultValue="outline" className="sm:max-w-[460px]">
              <TabsList className="overflow-x-auto whitespace-nowrap">
                <TabsTrigger value="outline">Outline</TabsTrigger>
                <TabsTrigger value="past">Past Performance</TabsTrigger>
                <TabsTrigger value="key">Key Personnel</TabsTrigger>
                <TabsTrigger value="focus">Focus Documents</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="mr-2 h-4 w-4" /> Customize Columns
              </Button>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Section
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">% of total</TableHead>
                <TableHead className="text-right">Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.name} tabIndex={0}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{r.name}</span>
                      <Badge variant="secondary">{r.category}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{r.qty}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.revenue}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.pct}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.margin}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <SimplePagination page={page} pageCount={pageCount} onPageChange={setPage} />
      </CardContent>
    </Card>
  )
}
