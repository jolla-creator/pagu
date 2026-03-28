'use client'

import { formatPrice, timeAgo } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

interface OrderItem {
  id: string
  quantity: number
  price: number
  notes: string | null
  menuItem?: { name: string }
}

interface OrderData {
  id: string
  table?: { number: number }
  status: string
  total: number
  createdAt: string
  items: OrderItem[]
}

interface OrderCardProps {
  order: OrderData
  onStatusChange: (id: string, status: string) => void
}

const statusFlow: Record<string, string> = {
  PENDING: 'PREPARING',
  PREPARING: 'READY',
}

const statusLabels: Record<string, string> = {
  PENDING: 'In attesa',
  PREPARING: 'In preparazione',
  READY: 'Pronto',
  PAID: 'Completato',
  CANCELLED: 'Annullato',
}

const statusBadge: Record<string, 'warning' | 'info' | 'success' | 'default'> = {
  PENDING: 'warning',
  PREPARING: 'info',
  READY: 'success',
  PAID: 'default',
  CANCELLED: 'default',
}

export function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const nextStatus = statusFlow[order.status]

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-base font-bold text-neutral-900">
            Tavolo {order.table?.number ?? '?'}
          </span>
          <Badge variant={statusBadge[order.status]}>{statusLabels[order.status]}</Badge>
        </div>
        <span className="text-xs text-neutral-400">{timeAgo(order.createdAt)}</span>
      </div>

      <div className="space-y-1.5 mb-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-neutral-700">
              {item.quantity}x {item.menuItem?.name ?? 'Articolo'}
              {item.notes && <span className="text-neutral-400 ml-1">({item.notes})</span>}
            </span>
            <span className="text-neutral-500">{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
        <span className="font-bold text-neutral-900">{formatPrice(order.total)}</span>
        {nextStatus && (
          <button
            onClick={() => onStatusChange(order.id, nextStatus)}
            className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 active:scale-95 transition-all"
          >
            {nextStatus === 'PREPARING' ? 'Inizia' : 'Pronto'}
          </button>
        )}
      </div>
    </div>
  )
}
