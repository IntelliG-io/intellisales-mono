"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { SimplePagination } from '../ui/pagination'

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
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
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
