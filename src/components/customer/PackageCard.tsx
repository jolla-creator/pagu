'use client'

import { AlertTriangle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface MenuPackageItem {
  name: string
  quantity: number
  menuItem: {
    name: string
    imageUrl: string | null
  }
}

interface MenuPackage {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  items: MenuPackageItem[]
}

interface PackageCardProps {
  package: MenuPackage
  onSelect: () => void
}

export function PackageCard({ package: pkg, onSelect }: PackageCardProps) {
  return (
    <div
      className="flex gap-3 p-3 bg-surface-card rounded-2xl shadow-card hover:shadow-card-hover transition-shadow cursor-pointer border border-neutral-100"
      onClick={onSelect}
    >
      {pkg.imageUrl ? (
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0">
          <img
            src={pkg.imageUrl}
            alt={pkg.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
          <span className="text-3xl">📦</span>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-neutral-900 text-sm sm:text-base leading-tight">
              {pkg.name}
            </h3>
            <span className="font-bold text-brand-600 text-sm sm:text-base whitespace-nowrap">
              {formatPrice(pkg.price)}
            </span>
          </div>
          {pkg.description && (
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 line-clamp-2">
              {pkg.description}
            </p>
          )}
          <div className="mt-2">
            {pkg.items.map((item) => (
              <div key={`${item.menuItem.name}-${item.quantity}`} className="flex items-center gap-1 text-sm text-neutral-600">
                <span className="w-5">{item.quantity}x</span>
                <span>{item.menuItem.name}</span>
                {item.menuItem.imageUrl && (
                  <span className="ml-2 flex items-center gap-1">
                    <img
                      src={item.menuItem.imageUrl}
                      alt={item.menuItem.name}
                      className="w-4 h-4 rounded object-cover"
                    />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end mt-2">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all bg-brand-600 text-white hover:bg-brand-700"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Scegli
          </button>
        </div>
      </div>
    </div>
  )
}
