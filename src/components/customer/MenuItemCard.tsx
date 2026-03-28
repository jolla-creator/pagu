'use client'

import { Plus, Minus, AlertTriangle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface MenuItemData {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  allergens: string[]
  available: boolean
}

interface MenuItemCardProps {
  item: MenuItemData
  quantity: number
  onAdd: () => void
  onRemove: () => void
  onClick?: () => void
}

const allergenShortcuts: Record<string, string> = {
  glutine: '🌾',
  lattosio: '🥛',
  uova: '🥚',
  soia: '🫘',
  pesce: '🐟',
  crostacei: '🦐',
}

export function MenuItemCard({ item, quantity, onAdd, onRemove, onClick }: MenuItemCardProps) {
  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAdd()
  }

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRemove()
  }

  return (
    <div
      className="flex gap-3 p-3 bg-surface-card rounded-2xl shadow-card hover:shadow-card-hover transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {item.imageUrl ? (
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
          <span className="text-3xl">🍽️</span>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-neutral-900 text-sm sm:text-base leading-tight">
              {item.name}
            </h3>
            <span className="font-bold text-brand-600 text-sm sm:text-base whitespace-nowrap">
              {formatPrice(item.price)}
            </span>
          </div>
          {item.description && (
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 line-clamp-2">
              {item.description}
            </p>
          )}
          {item.allergens.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {item.allergens.slice(0, 4).map((a) => (
                <span
                  key={a}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium flex items-center gap-0.5"
                >
                  <span>{allergenShortcuts[a.toLowerCase()] || '⚠️'}</span>
                  {a}
                </span>
              ))}
              {item.allergens.length > 4 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 font-medium">
                  +{item.allergens.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end mt-2">
          {quantity > 0 ? (
            <div className="flex items-center gap-1 bg-neutral-50 rounded-xl p-0.5">
              <button
                onClick={handleRemoveClick}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors"
              >
                <Minus className="w-4 h-4 text-neutral-600" />
              </button>
              <span className="w-7 text-center font-semibold text-sm">{quantity}</span>
              <button
                onClick={handleAddClick}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddClick}
              disabled={!item.available}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-brand-600 text-white hover:bg-brand-700 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              Aggiungi
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
