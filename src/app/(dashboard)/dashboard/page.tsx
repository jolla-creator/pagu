'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { OrderCard } from '@/components/dashboard/OrderCard'
import { Spinner } from '@/components/ui/Spinner'

interface Order {
  id: string
  table?: { number: number }
  status: string
  total: number
  createdAt: string
  items: { id: string; quantity: number; price: number; notes: string | null; menuItem?: { name: string } }[]
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      if (data.orders) setOrders(data.orders)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchOrders()
  }

  const activeOrders = orders.filter((o) => o.status !== 'PAID' && o.status !== 'CANCELLED')
  const completedOrders = orders.filter((o) => o.status === 'PAID' || o.status === 'CANCELLED')

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 bg-neutral-50 pt-16 md:pt-4 pb-24 md:pb-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Ordini</h1>
          <p className="text-neutral-500 text-sm">Gestisci gli ordini in tempo reale</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-base font-semibold text-neutral-900 mb-3">
                In corso <span className="text-neutral-400 font-normal">({activeOrders.length})</span>
              </h2>
              {activeOrders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-neutral-100">
                  <p className="text-neutral-400 text-sm">Nessun ordine attivo</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {activeOrders.map((order) => (
                    <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                  ))}
                </div>
              )}
            </div>

            {completedOrders.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-neutral-900 mb-3">
                  Completati <span className="text-neutral-400 font-normal">({completedOrders.length})</span>
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 opacity-50">
                  {completedOrders.slice(0, 6).map((order) => (
                    <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
