'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { Plus, Pencil, Trash2 } from 'lucide-react'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  allergens: string[]
  available: boolean
  categoryId: string
}

interface Category {
  id: string
  name: string
  items: MenuItem[]
}

interface FormData {
  name: string
  description: string
  price: string
  categoryId: string
  allergens: string
  imageUrl: string | null
}

const emptyForm: FormData = {
  name: '',
  description: '',
  price: '',
  categoryId: '',
  allergens: '',
  imageUrl: null,
}

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [restaurantId, setRestaurantId] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchMenu = async () => {
    const res = await fetch('/api/menu')
    const data = await res.json()
    if (data.categories) setCategories(data.categories)
    if (data.restaurant?.id) setRestaurantId(data.restaurant.id)
    setLoading(false)
  }

  useEffect(() => {
    fetchMenu()
  }, [])

  const handleOpenModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item)
      setForm({
        name: item.name,
        description: item.description || '',
        price: (item.price / 100).toFixed(2),
        categoryId: item.categoryId,
        allergens: item.allergens.join(', '),
        imageUrl: item.imageUrl,
      })
    } else {
      setEditingItem(null)
      setForm(emptyForm)
    }
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingItem(null)
    setForm(emptyForm)
  }

  const handleSave = async () => {
    if (!form.name || !form.price || !form.categoryId) return

    const payload = {
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      categoryId: form.categoryId,
      imageUrl: form.imageUrl,
      allergens: form.allergens ? form.allergens.split(',').map((a) => a.trim()).filter(Boolean) : [],
      restaurantId,
    }

    if (editingItem) {
      await fetch(`/api/menu/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }

    handleCloseModal()
    fetchMenu()
  }

  const handleToggleAvailable = async (itemId: string, available: boolean) => {
    await fetch(`/api/menu/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: !available }),
    })
    fetchMenu()
  }

  const handleDelete = async (itemId: string) => {
    await fetch(`/api/menu/${itemId}`, { method: 'DELETE' })
    setDeleteConfirm(null)
    fetchMenu()
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 bg-neutral-50 pt-16 md:pt-4 pb-24 md:pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Menu</h1>
            <p className="text-neutral-500 text-sm">Gestisci i tuoi piatti</p>
          </div>
          <Button onClick={() => handleOpenModal()} size="sm">
            <Plus className="w-4 h-4" /> Aggiungi
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((cat) => (
              <div key={cat.id}>
                <h2 className="text-base font-semibold text-neutral-900 mb-3">{cat.name}</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {cat.items.map((item) => (
                    <Card key={item.id} className="flex gap-3" padding="sm">
                      {item.imageUrl ? (
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">🍽️</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-sm truncate">{item.name}</h3>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleToggleAvailable(item.id, item.available)}
                            >
                              <Badge variant={item.available ? 'success' : 'default'}>
                                {item.available ? 'ON' : 'OFF'}
                              </Badge>
                            </button>
                          </div>
                        </div>
                        {item.description && (
                          <p className="text-xs text-neutral-400 mt-0.5 truncate">{item.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-brand-600 font-bold text-sm">€{(item.price / 100).toFixed(2)}</p>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenModal(item)}
                              className="w-7 h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5 text-neutral-400" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(item.id)}
                              className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-neutral-400 hover:text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal open={modalOpen} onClose={handleCloseModal}>
          <div className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-neutral-900">
              {editingItem ? 'Modifica piatto' : 'Nuovo piatto'}
            </h2>

            <ImageUpload
              value={form.imageUrl}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
            />

            <Input
              label="Nome"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Margherita"
            />
            <Input
              label="Descrizione"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Pomodoro, mozzarella, basilico"
            />
            <Input
              label="Prezzo (€)"
              type="number"
              step="0.50"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="8.00"
            />
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Categoria</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="">Seleziona...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <Input
              label="Allergeni (separati da virgola)"
              value={form.allergens}
              onChange={(e) => setForm({ ...form, allergens: e.target.value })}
              placeholder="glutine, lattosio"
            />
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={handleCloseModal} className="flex-1">
                Annulla
              </Button>
              <Button onClick={handleSave} className="flex-1">
                {editingItem ? 'Salva modifiche' : 'Crea piatto'}
              </Button>
            </div>
          </div>
        </Modal>

        <Modal open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)}>
          <div className="p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">Eliminare il piatto?</h2>
            <p className="text-neutral-500 text-sm mb-6">Questa azione non può essere annullata.</p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="flex-1">
                Annulla
              </Button>
              <Button
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Elimina
              </Button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  )
}
