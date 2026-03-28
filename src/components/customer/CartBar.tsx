'use client'

import { useState } from 'react'
import { ShoppingBag, X, Plus, Minus, Clock, ChefHat, Check, CreditCard, Star, Send } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface CartItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  notes: string
  imageUrl?: string | null
}

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  items: { id: string; quantity: number; price: number; menuItem?: { name: string } }[]
  review?: { id: string } | null
}

interface CartBarProps {
  cart: CartItem[]
  orders: Order[]
  itemCount: number
  total: number
  onAdd: (id: string) => void
  onRemove: (id: string) => void
  onCheckout: () => void
  activeTab?: 'menu' | 'conto'
  onTabChange?: (tab: 'menu' | 'conto') => void
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; color: string; bg: string; step: number }> = {
  PENDING: { label: 'Ordinato', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', step: 1 },
  PREPARING: { label: 'In cucina', icon: ChefHat, color: 'text-blue-600', bg: 'bg-blue-50', step: 2 },
  READY: { label: 'Arriva', icon: Check, color: 'text-green-600', bg: 'bg-green-50', step: 3 },
  PAID: { label: 'Pagato', icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50', step: 4 },
  CANCELLED: { label: 'Annullato', icon: X, color: 'text-red-600', bg: 'bg-red-50', step: 0 },
}

export function CartBar({ cart, orders, itemCount, total, onAdd, onRemove, onCheckout, activeTab, onTabChange }: CartBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  const ordersTotal = orders.reduce((sum, order) => sum + order.total, 0)
  const hasOrders = orders.length > 0
  const hasCart = cart.length > 0
  const totalItems = itemCount + (hasOrders ? orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0) : 0)

  const ordersForReview = orders.filter(o => (o.status === 'READY' || o.status === 'PAID') && !o.review)

  if (!hasCart && !hasOrders) return null

  const handleBarClick = () => {
    if (activeTab === 'conto' && onTabChange) {
      setIsOpen(false)
    } else {
      setIsOpen(true)
    }
  }

  const StatusIcon = (status: string) => {
    const config = statusConfig[status] || statusConfig.PENDING
    return <config.icon className={`w-4 h-4 ${config.color}`} />
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 p-3 pb-6 z-40 safe-bottom">
        <button
          onClick={handleBarClick}
          className="w-full bg-neutral-900 text-white py-4 px-5 rounded-2xl font-semibold flex items-center justify-between shadow-cart-bar active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              {totalItems}
            </div>
            <span className="hidden sm:inline">Il tuo ordine</span>
            <span className="sm:hidden">Ordine</span>
          </div>
          <span className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            {formatPrice(total + ordersTotal)}
          </span>
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '85vh' }}
      >
        <div className="sticky top-0 bg-white border-b border-neutral-100 px-4 py-3 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-lg font-bold text-neutral-900">Il tuo ordine</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
          >
            <X className="w-4 h-4 text-neutral-600" />
          </button>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 140px)' }}>
          {hasCart && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                Da ordinare
              </h3>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.menuItemId}
                    className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl"
                  >
                    {item.imageUrl && (
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-neutral-500">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-white rounded-lg p-0.5 border border-neutral-200">
                      <button
                        onClick={() => onRemove(item.menuItemId)}
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-neutral-100 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5 text-neutral-600" />
                      </button>
                      <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => onAdd(item.menuItemId)}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasOrders && (
            <div className="p-4 border-t border-neutral-100">
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                I tuoi ordini
              </h3>
              <div className="space-y-4">
                {orders.map((order) => {
                  const config = statusConfig[order.status] || statusConfig.PENDING
                  const Icon = config.icon
                  const currentStep = config.step
                  const steps = [
                    { num: 1, label: 'Ordine', status: 'PENDING' },
                    { num: 2, label: 'Cucina', status: 'PREPARING' },
                    { num: 3, label: 'Arriva', status: 'READY' },
                    { num: 4, label: 'Pagato', status: 'PAID' },
                  ]
                  return (
                    <div key={order.id} className="p-3 bg-neutral-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        {steps.map((step, idx) => {
                          const isCompleted = currentStep > step.num
                          const isCurrent = currentStep === step.num
                          return (
                            <div key={step.num} className="flex items-center flex-1">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                isCompleted ? 'bg-green-500 text-white' : 
                                isCurrent ? `${config.bg} ${config.color}` : 
                                'bg-neutral-200 text-neutral-400'
                              }`}>
                                {isCompleted ? '✓' : step.num}
                              </div>
                              {idx < steps.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-1 ${isCompleted ? 'bg-green-500' : 'bg-neutral-200'}`} />
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full ${config.bg} flex items-center justify-center`}>
                            <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                          </div>
                          <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                        </div>
                        <span className="text-xs text-neutral-400">
                          {new Date(order.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span className="text-neutral-600">
                              {item.quantity}x {item.menuItem?.name || 'Articolo'}
                            </span>
                            <span className="text-neutral-500">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t border-neutral-200 flex items-center justify-between">
                        <span className="text-xs text-neutral-500">Totale ordine</span>
                        <span className="font-semibold text-neutral-900">{formatPrice(order.total)}</span>
                      </div>
                      {(order.status === 'READY' || order.status === 'PAID') && !order.review && (
                        <button
                          onClick={() => {
                            setReviewOrder(order)
                            setShowReviewModal(true)
                          }}
                          className="mt-2 w-full py-2 text-sm text-brand-600 font-medium hover:bg-brand-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <Star className="w-4 h-4" />
                          Lascia una recensione
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {hasCart && activeTab !== 'conto' && (
          <div className="sticky bottom-0 bg-white border-t border-neutral-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-neutral-600">Totale da ordinare</span>
              <span className="text-xl font-bold text-neutral-900">{formatPrice(total)}</span>
            </div>
            <button
              onClick={() => {
                onCheckout()
                setIsOpen(false)
              }}
              className="w-full bg-brand-600 text-white py-4 rounded-2xl font-semibold hover:bg-brand-700 active:scale-[0.98] transition-all"
            >
              Invia ordine · {formatPrice(total)}
            </button>
          </div>
        )}

        {activeTab === 'conto' && !hasCart && (
          <div className="sticky bottom-0 bg-white border-t border-neutral-100 p-4">
            <p className="text-center text-neutral-500 text-sm">Vai al Menu per aggiungere piatti</p>
          </div>
        )}
      </div>

      {showReviewModal && reviewOrder && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-900">Lascia una recensione</h3>
              <button onClick={() => setShowReviewModal(false)} className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            {reviewSubmitted ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <p className="font-medium text-neutral-900">Grazie per la tua recensione!</p>
                <p className="text-sm text-neutral-500 mt-1">Il ristorante apprezza il tuo feedback.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-8 h-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Commento (opzionale)"
                  className="w-full p-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 mb-4"
                  rows={3}
                />

                <button
                  onClick={async () => {
                    setSubmittingReview(true)
                    try {
                      const res = await fetch('/api/reviews', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderId: reviewOrder.id, rating, comment: comment || null }),
                      })
                      if (res.ok) {
                        setReviewSubmitted(true)
                        setTimeout(() => {
                          setShowReviewModal(false)
                          setReviewSubmitted(false)
                          setComment('')
                          setRating(5)
                        }, 2000)
                      }
                    } finally {
                      setSubmittingReview(false)
                    }
                  }}
                  disabled={submittingReview}
                  className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submittingReview ? (
                    'Invio...'
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Invia recensione
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
