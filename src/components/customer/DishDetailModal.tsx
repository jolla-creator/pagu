'use client'

import { useState } from 'react'
import { X, Plus, Minus, AlertTriangle } from 'lucide-react'
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

interface DishDetailModalProps {
  item: MenuItem | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (item: MenuItem, quantity: number) => void
}

const allergenIcons: Record<string, string> = {
  glutine: '🌾',
  lattosio: '🥛',
  uova: '🥚',
  soia: '🫘',
  frutta: '🥜',
  pesce: '🐟',
  crostacei: '🦐',
  sedano: '🥬',
  senape: '🟡',
  sesamo: '⚪',
}

export function DishDetailModal({ item, isOpen, onClose, onAddToCart }: DishDetailModalProps) {
  const [quantity, setQuantity] = useState(1)

  if (!isOpen || !item) return null

  const handleAddToCart = () => {
    onAddToCart(item, quantity)
    setQuantity(1)
    onClose()
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div
          className="bg-surface-card w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl animate-slide-up overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            {item.imageUrl ? (
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[4/3] w-full bg-neutral-100 flex items-center justify-center">
                <span className="text-6xl">🍽️</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            >
              <X className="w-5 h-5 text-neutral-700" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h2 className="text-xl font-bold text-neutral-900 leading-tight">
                {item.name}
              </h2>
              <span className="text-xl font-bold text-brand-600 whitespace-nowrap">
                {formatPrice(item.price)}
              </span>
            </div>

            {item.description && (
              <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                {item.description}
              </p>
            )}

            {item.allergens.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-neutral-700">Allergeni</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.allergens.map((allergen) => (
                    <div
                      key={allergen}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-full text-sm text-amber-800"
                    >
                      <span>{allergenIcons[allergen.toLowerCase()] || '⚠️'}</span>
                      <span className="capitalize">{allergen}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!item.available && (
              <div className="bg-neutral-100 rounded-2xl p-4 text-center mb-4">
                <p className="text-neutral-500 font-medium">Non disponibile</p>
              </div>
            )}
          </div>

          {item.available && (
            <div className="sticky bottom-0 bg-surface-card border-t border-neutral-100 p-4 safe-bottom">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 bg-neutral-100 rounded-2xl p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white transition-colors"
                  >
                    <Minus className="w-5 h-5 text-neutral-600" />
                  </button>
                  <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white hover:bg-neutral-50 transition-colors"
                  >
                    <Plus className="w-5 h-5 text-neutral-600" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-brand-600 text-white py-4 rounded-2xl font-semibold hover:bg-brand-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Aggiungi · {formatPrice(item.price * quantity)}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
