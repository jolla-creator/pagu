'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { MenuItemCard } from '@/components/customer/MenuItemCard'
import { CartBar } from '@/components/customer/CartBar'
import { DishDetailModal } from '@/components/customer/DishDetailModal'
import { Spinner } from '@/components/ui/Spinner'
import { MapPin, Receipt, ShoppingBag, Check } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  allergens: string[]
  available: boolean
}

interface MenuCategory {
  id: string
  name: string
  items: MenuItem[]
}

interface CartItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  notes: string
  imageUrl?: string | null
}

interface OrderItem {
  id: string
  quantity: number
  price: number
  menuItem?: { name: string; id: string }
}

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  items: OrderItem[]
}

export default function TablePage() {
  const params = useParams()
  const tableId = params.tableId as string

  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [restaurantName, setRestaurantName] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [activeCategory, setActiveCategory] = useState('')
  const [activeTab, setActiveTab] = useState<'menu' | 'conto'>('menu')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/tables/${tableId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.orders) setOrders(data.orders)
      }
    } catch {}
  }, [tableId])

  useEffect(() => {
    fetch('/api/menu')
      .then((r) => r.json())
      .then((menuData) => {
        if (menuData.error) {
          setError(menuData.error)
        } else {
          const availableCategories = menuData.categories
            .map((cat: MenuCategory) => ({
              ...cat,
              items: cat.items.filter((item: MenuItem) => item.available),
            }))
            .filter((cat: MenuCategory) => cat.items.length > 0)

          setCategories(availableCategories)
          setRestaurantName(menuData.restaurant?.name ?? 'Ristorante')

          if (availableCategories.length > 0) {
            setActiveCategory(availableCategories[0].id)
          }
        }
      })
      .catch(() => setError('Errore caricamento'))
      .finally(() => setLoading(false))

    fetch(`/api/tables/${tableId}`)
      .then((r) => r.json())
      .then((tableData) => {
        if (tableData.orders) setOrders(tableData.orders)
      })

    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [tableId, fetchOrders])

  useEffect(() => {
    const saved = sessionStorage.getItem(`cart-${tableId}`)
    if (saved) setCart(JSON.parse(saved))
  }, [tableId])

  useEffect(() => {
    sessionStorage.setItem(`cart-${tableId}`, JSON.stringify(cart))
  }, [cart, tableId])

  const addToCart = (item: MenuItem, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id)
      if (existing) {
        return prev.map((c) =>
          c.menuItemId === item.id ? { ...c, quantity: c.quantity + quantity } : c
        )
      }
      return [
        ...prev,
        { menuItemId: item.id, name: item.name, price: item.price, quantity, notes: '', imageUrl: item.imageUrl },
      ]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === itemId)
      if (!existing) return prev
      if (existing.quantity <= 1) return prev.filter((c) => c.menuItemId !== itemId)
      return prev.map((c) => (c.menuItemId === itemId ? { ...c, quantity: c.quantity - 1 } : c))
    })
  }

  const getItemQuantity = (itemId: string) => {
    return cart.find((c) => c.menuItemId === itemId)?.quantity ?? 0
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleOrder = async () => {
    if (cart.length === 0 || submitting) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId,
          items: cart.map((c) => ({ menuItemId: c.menuItemId, quantity: c.quantity, notes: c.notes })),
          customerName: 'Cliente',
        }),
      })

      if (res.ok) {
        setCart([])
        sessionStorage.removeItem(`cart-${tableId}`)
        fetchOrders()
      } else {
        setError('Errore invio ordine')
      }
    } catch {
      setError('Errore di connessione')
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate totals
  const ordersTotal = orders.reduce((sum, order) => sum + order.total, 0)
  const ordersItemCount = orders.reduce((sum, order) => sum + order.items.reduce((s, i) => s + i.quantity, 0), 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">{error}</p>
          <p className="text-neutral-400 text-sm">Riprova o contatta il personale</p>
        </div>
      </div>
    )
  }

  const activeItems = categories.find((c) => c.id === activeCategory)?.items ?? []

  return (
    <div className="min-h-screen bg-surface pb-28 md:pb-6">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md z-30 border-b border-neutral-100 shadow-sm">
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            {restaurantName}
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-sm text-neutral-500">Tavolo {tableId.replace('tavolo-', '')}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'menu'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Menu
            </button>
            <button
              onClick={() => setActiveTab('conto')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition-all relative ${
                activeTab === 'conto'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <Receipt className="w-4 h-4" />
              Il Conto
              {ordersItemCount > 0 && (
                <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                  activeTab === 'conto' ? 'bg-white text-brand-600' : 'bg-brand-600 text-white'
                }`}>
                  {ordersItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {activeTab === 'menu' ? (
          <>
            {/* Category Tabs - Horizontal scrollable on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Menu Items */}
            <div className="space-y-3">
              {activeItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-neutral-400">Nessun piatto in questa categoria</p>
                </div>
              ) : (
                activeItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    quantity={getItemQuantity(item.id)}
                    onAdd={() => addToCart(item)}
                    onRemove={() => removeFromCart(item.id)}
                    onClick={() => setSelectedItem(item)}
                  />
                ))
              )}
            </div>
          </>
        ) : (
          /* Bill View */
          <BillView
            orders={orders}
            cart={cart}
            cartTotal={cartTotal}
            tableId={tableId}
            onAddToCart={(itemId) => {
              const item = categories.flatMap((c) => c.items).find((i) => i.id === itemId)
              if (item) addToCart(item)
            }}
            onRemoveFromCart={removeFromCart}
            onContinueShopping={() => setActiveTab('menu')}
          />
        )}
      </div>

      <CartBar
        cart={cart}
        orders={orders}
        itemCount={cartCount}
        total={cartTotal}
        onAdd={(id) => {
          const item = categories.flatMap((c) => c.items).find((i) => i.id === id)
          if (item) addToCart(item)
        }}
        onRemove={removeFromCart}
        onCheckout={handleOrder}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <DishDetailModal
        item={selectedItem}
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        onAddToCart={(item, qty) => addToCart(item, qty)}
      />

      {submitting && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-3 text-neutral-600 font-medium">Invio ordine...</p>
          </div>
        </div>
      )}
    </div>
  )
}

function BillView({
  orders,
  cart,
  cartTotal,
  tableId,
  onAddToCart,
  onRemoveFromCart,
  onContinueShopping,
}: {
  orders: Order[]
  cart: CartItem[]
  cartTotal: number
  tableId: string
  onAddToCart: (id: string) => void
  onRemoveFromCart: (id: string) => void
  onContinueShopping: () => void
}) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [paymentMode, setPaymentMode] = useState<'full' | 'personal' | null>(null)
  const [processing, setProcessing] = useState(false)

  const paidOrders = orders.filter(o => o.status === 'PAID')
  const unpaidOrders = orders.filter(o => o.status !== 'PAID')
  const paidTotal = paidOrders.reduce((sum, order) => sum + order.total, 0)
  const unpaidTotal = unpaidOrders.reduce((sum, order) => sum + order.total, 0)

  const handleCheckout = async () => {
    setProcessing(true)
    try {
      const itemsToPay = paymentMode === 'personal'
        ? Array.from(selectedItems).map(itemId => {
            const item = orders.flatMap(o => o.items).find(i => i.id === itemId)
            return { name: item?.menuItem?.name || 'Articolo', price: item?.price || 0, quantity: item?.quantity || 1 }
          })
        : [
            ...orders.flatMap(o => o.items.map(i => ({ name: i.menuItem?.name || 'Articolo', price: i.price, quantity: i.quantity }))),
            ...cart.map(c => ({ name: c.name, price: c.price, quantity: c.quantity }))
          ]

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToPay, tableId, customerName: 'Cliente' })
      })

      const data = await res.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Errore nel pagamento')
      }
    } catch {
      alert('Errore di connessione')
    } finally {
      setProcessing(false)
    }
  }

  const ordersTotal = orders.reduce((sum, order) => sum + order.total, 0)
  const totalToPay = paymentMode === 'personal' 
    ? Array.from(selectedItems).reduce((sum, itemId) => {
        const item = orders.flatMap(o => o.items).find(i => i.id === itemId)
        return sum + (item ? item.price * item.quantity : 0)
      }, 0)
    : unpaidTotal + cartTotal

  const allOrderItems = orders.flatMap(order => 
    order.items.map(item => ({
      ...item,
      orderId: order.id,
      orderStatus: order.status,
      createdAt: order.createdAt
    }))
  )

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  if (orders.length === 0 && cart.length === 0) {
    return (
      <div className="text-center py-12">
        <Receipt className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
        <h3 className="text-lg font-semibold text-neutral-700 mb-2">Nessun ordine ancora</h3>
        <p className="text-neutral-500 text-sm mb-6">Aggiungi piatti dal menu per iniziare</p>
        <button
          onClick={onContinueShopping}
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          Vai al Menu
        </button>
      </div>
    )
  }

  const groupedItems = allOrderItems.reduce((acc, item) => {
    const name = item.menuItem?.name || 'Articolo'
    if (!acc[name]) {
      acc[name] = { quantity: 0, price: item.price, items: [], isPaid: item.orderStatus === 'PAID' }
    }
    acc[name].quantity += item.quantity
    acc[name].items.push(item.id)
    acc[name].isPaid = acc[name].isPaid || item.orderStatus === 'PAID'
    return acc
  }, {} as Record<string, { quantity: number; price: number; items: string[], isPaid: boolean }>)

  const toggleGroupSelection = (name: string) => {
    const group = groupedItems[name]
    if (!group || group.isPaid) return
    
    const allSelected = group.items.every(id => selectedItems.has(id))
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      group.items.forEach(id => {
        if (allSelected) {
          newSet.delete(id)
        } else {
          newSet.add(id)
        }
      })
      return newSet
    })
  }

  return (
    <div className="space-y-4">
      {paidOrders.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800">Già pagato</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{formatPrice(paidTotal)}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-4 py-4 bg-neutral-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Il tuo conto</p>
              <p className="text-3xl font-bold text-white">{formatPrice(ordersTotal + cartTotal)}</p>
            </div>
            <div className="text-right">
              <p className="text-neutral-400 text-sm">{orders.length} ordini</p>
              <p className="text-neutral-400 text-sm">{allOrderItems.reduce((s, i) => s + i.quantity, 0)} piatti</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
          {Object.entries(groupedItems).map(([name, data]) => {
            const isSelected = data.items.some(id => selectedItems.has(id))
            const isPartial = data.items.some(id => selectedItems.has(id)) && !data.items.every(id => selectedItems.has(id))
            return (
              <div key={name} className={`flex items-center justify-between ${data.isPaid ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3">
                  {paymentMode === 'personal' && !data.isPaid ? (
                    <button
                      onClick={() => toggleGroupSelection(name)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'bg-brand-600 border-brand-600' : 'border-neutral-300 hover:border-brand-500'
                      }`}
                    >
                      {isSelected && <span className="text-white text-xs">✓</span>}
                    </button>
                  ) : data.isPaid ? (
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                  ) : null}
                  <span className="text-neutral-700">{data.quantity}x</span>
                  <span className="text-neutral-900 font-medium">{name}</span>
                  {data.isPaid && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">pagato</span>}
                </div>
                <span className="text-neutral-600">{formatPrice(data.price * data.quantity)}</span>
              </div>
            )
          })}
          {cart.length > 0 && (
            <>
              <div className="border-t border-neutral-200 my-2"></div>
              {cart.map((item) => (
                <div key={item.menuItemId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-700">{item.quantity}x</span>
                    <span className="text-neutral-900 font-medium">{item.name}</span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">in arrivo</span>
                  </div>
                  <span className="text-neutral-600">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {unpaidTotal > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-amber-800 font-medium">Da pagare</span>
            <span className="text-2xl font-bold text-amber-700">{formatPrice(unpaidTotal + cartTotal)}</span>
          </div>
        </div>
      )}

      {!paymentMode && unpaidTotal + cartTotal > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setPaymentMode('full')}
            className="w-full py-4 px-6 bg-brand-600 text-white rounded-2xl font-semibold text-lg hover:bg-brand-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-3"
          >
            <Receipt className="w-5 h-5" />
            Paga tutto ({formatPrice(unpaidTotal + cartTotal)})
          </button>
          
          <button
            onClick={() => {
              setPaymentMode('personal')
              const newSelected = new Set<string>()
              Object.values(groupedItems).forEach(group => {
                if (!group.isPaid) {
                  group.items.forEach(id => newSelected.add(id))
                }
              })
              setSelectedItems(newSelected)
            }}
            className="w-full py-4 px-6 bg-white border-2 border-neutral-200 text-neutral-700 rounded-2xl font-semibold text-lg hover:bg-neutral-50 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Paga solo la tua parte
          </button>
        </div>
      )}

      {paymentMode === 'personal' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border-2 border-brand-600 p-4">
            <p className="text-sm text-neutral-600 mb-3">Seleziona i piatti che hai consumato:</p>
            <p className="text-2xl font-bold text-brand-600">{formatPrice(totalToPay)}</p>
          </div>
          
          <button
            className="w-full py-4 px-6 bg-brand-600 text-white rounded-2xl font-semibold text-lg hover:bg-brand-700 active:scale-[0.98] transition-all shadow-lg disabled:opacity-50"
            onClick={handleCheckout}
            disabled={processing}
          >
            {processing ? 'Elaborazione...' : `Paga ${formatPrice(totalToPay)}`}
          </button>
          
          <button
            onClick={() => setPaymentMode(null)}
            className="w-full py-3 text-neutral-500 text-sm hover:text-neutral-700"
          >
            ← Torna al conto completo
          </button>
        </div>
      )}

      {paymentMode === 'full' && (
        <div className="space-y-3">
          <button
            className="w-full py-4 px-6 bg-brand-600 text-white rounded-2xl font-semibold text-lg hover:bg-brand-700 active:scale-[0.98] transition-all shadow-lg disabled:opacity-50"
            onClick={handleCheckout}
            disabled={processing}
          >
            {processing ? 'Elaborazione...' : `Paga ${formatPrice(totalToPay)}`}
          </button>
          
          <button
            onClick={() => setPaymentMode(null)}
            className="w-full py-3 text-neutral-500 text-sm hover:text-neutral-700"
          >
            ← Cambia modalità di pagamento
          </button>
        </div>
      )}
    </div>
  )
}
