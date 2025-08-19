"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

export default function SalesChartPlaceholder() {
  const [period, setPeriod] = React.useState('today')
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sales</CardTitle>
          <Tabs value={period} onValueChange={setPeriod} className="">
            <TabsList>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex h-56 items-center justify-center rounded-md bg-muted/40 text-sm text-muted-foreground">
          Chart placeholder (integrate Recharts later)
        </div>
      </CardContent>
    </Card>
  )
}
