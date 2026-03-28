'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, TrendingUp, Users, Euro } from 'lucide-react'

interface Analytics {
  todayOrders: number
  todayRevenue: number
  activeTables: number
  avgPerTable: number
  topItems: { name: string; count: number }[]
  ordersByDay: { date: string; count: number; revenue: number }[]
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center"><Spinner size="lg" /></main>
      </div>
    )
  }

  if (!data) return null

  const maxRevenue = Math.max(...data.ordersByDay.map((d) => d.revenue), 1)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 bg-neutral-50 pt-16 md:pt-4 pb-24 md:pb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">Analytics</h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <Card>
            <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center mb-2">
              <ShoppingCart className="w-4 h-4 text-brand-600" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{data.todayOrders}</p>
            <p className="text-xs text-neutral-500">Ordini oggi</p>
          </Card>
          <Card>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center mb-2">
              <Euro className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{formatPrice(data.todayRevenue)}</p>
            <p className="text-xs text-neutral-500">Fatturato oggi</p>
          </Card>
          <Card>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center mb-2">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{data.activeTables}</p>
            <p className="text-xs text-neutral-500">Tavoli attivi</p>
          </Card>
          <Card>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center mb-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{formatPrice(data.avgPerTable)}</p>
            <p className="text-xs text-neutral-500">Media per tavolo</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <h2 className="font-semibold text-neutral-900 mb-4 text-sm">Ultimi 7 giorni</h2>
            <div className="flex items-end gap-2 h-32">
              {data.ordersByDay.map((day) => (
                <div key={day.date} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-neutral-100 rounded-lg relative overflow-hidden"
                    style={{ height: `${(day.revenue / maxRevenue) * 100}%`, minHeight: '4px' }}
                  >
                    <div
                      className="absolute inset-x-0 bottom-0 bg-brand-500 rounded-lg"
                      style={{ height: `${Math.max((day.count / Math.max(...data.ordersByDay.map(d => d.count), 1)) * 100, 15)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-1 uppercase">{day.date}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-neutral-900 mb-4 text-sm">Top 5 piatti</h2>
            {data.topItems.length === 0 ? (
              <p className="text-neutral-400 text-center py-4 text-sm">Nessun dato</p>
            ) : (
              <div className="space-y-3">
                {data.topItems.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-600 text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="text-sm text-neutral-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-neutral-500">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}
