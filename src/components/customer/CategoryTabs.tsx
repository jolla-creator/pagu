'use client'

import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
}

interface CategoryTabsProps {
  categories: Category[]
  activeId: string
  onSelect: (id: string) => void
}

export function CategoryTabs({ categories, activeId, onSelect }: CategoryTabsProps) {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex gap-2 min-w-max">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
              activeId === cat.id
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  )
}
