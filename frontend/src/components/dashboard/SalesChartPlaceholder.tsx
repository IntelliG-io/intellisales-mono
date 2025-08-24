"use client"

import * as React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

export default function SalesChartPlaceholder() {
  const [period, setPeriod] = React.useState('3m')
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3 h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>Total Visitors</CardTitle>
            <p className="text-sm text-muted-foreground">Total for the last 3 months</p>
          </div>
          <Tabs value={period} onValueChange={setPeriod} className="">
            <TabsList>
              <TabsTrigger value="3m">Last 3 months</TabsTrigger>
              <TabsTrigger value="30d">Last 30 days</TabsTrigger>
              <TabsTrigger value="7d">Last 7 days</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="relative h-56 overflow-hidden rounded-md border bg-gradient-to-b from-muted/60 to-background">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Chart placeholder (integrate Recharts later)
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
