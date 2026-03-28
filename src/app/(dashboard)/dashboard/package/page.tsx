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
import { PackageCard } from '@/components/customer/PackageCard'
import { formatPrice } from '@/lib/utils'

interface MenuPackage {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  items: {
    menuItem: {
      id: string
      name: string
      imageUrl: string | null
    }
    quantity: number
  }[]
}

interface MenuItem {
  id: string
  name: string
  imageUrl: string | null
}

interface FormData {
  name: string
  description: string
  price: string
  imageUrl: string | null
}

const emptyForm: FormData = {
  name: '',
  description: '',
  price: '',
  imageUrl: null,
}

export default function PackagePage() {
  const [packages, setPackages] = useState<MenuPackage[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<MenuPackage | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [selectedItems, setSelectedItems] = useState<{ id: string; quantity: number }[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [restaurantId, setRestaurantId] = useState('')

  const fetchData = async () => {
    try {
      const [packagesRes, itemsRes, restaurantRes] = await Promise.all([
        fetch('/api/packages'),
        fetch('/api/menu'),
        fetch('/api/menu'),
      ])
      
      const packagesData = await packagesRes.json()
      const menuData = await itemsRes.json()
      const restaurantData = await restaurantRes.json()
      
      if (packagesData.packages) setPackages(packagesData.packages)
      if (menuData.categories) {
        const allItems = menuData.categories.flatMap((cat: { items: MenuItem[] }) => cat.items)
        setMenuItems(allItems)
      }
      if (restaurantData.restaurant?.id) setRestaurantId(restaurantData.restaurant.id)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenModal = (packageData?: MenuPackage) => {
    if (packageData) {
      setEditingPackage(packageData)
      setForm({
        name: packageData.name,
        description: packageData.description || '',
        price: (packageData.price / 100).toFixed(2),
        imageUrl: packageData.imageUrl,
      })
      setSelectedItems(packageData.items.map(item => ({
        id: item.menuItem.id,
        quantity: item.quantity
      })))
    } else {
      setEditingPackage(null)
      setForm(emptyForm)
      setSelectedItems([])
    }
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingPackage(null)
    setForm(emptyForm)
    setSelectedItems([])
  }

  const handleSave = async () => {
    if (!form.name || !form.price || selectedItems.length === 0) return

    const payload = {
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      imageUrl: form.imageUrl,
      restaurantId,
      items: selectedItems.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity
      }))
    }

    if (editingPackage) {
      await fetch(`/api/packages/${editingPackage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }

    handleCloseModal()
    fetchData()
  }

  const handleAddItem = (itemId: string) => {
    const existing = selectedItems.find(item => item.id === itemId)
    if (existing) {
      setSelectedItems(selectedItems.map(i => 
        i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i
      ))
    } else {
      setSelectedItems([...selectedItems, { id: itemId, quantity: 1 }])
    }
  }

  const handleRemoveItem = (itemId: string) => {
    const existing = selectedItems.find(item => item.id === itemId)
    if (!existing) return
    
    if (existing.quantity <= 1) {
      setSelectedItems(selectedItems.filter(item => item.id !== itemId))
    } else {
      setSelectedItems(selectedItems.map(i => 
        i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      ))
    }
  }

  const handleDelete = async (packageId: string) => {
    await fetch(`/api/packages/${packageId}`, { method: 'DELETE' })
    setDeleteConfirm(null)
    fetchData()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 bg-neutral-50 pt-16 md:pt-4 pb-24 md:pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Pacchetti</h1>
            <p className="text-neutral-500 text-sm">Crea offerte speciali e menu a prezzo fisso</p>
          </div>
          <Button onClick={() => handleOpenModal()} size="sm">
            <Plus className="w-4 h-4" /> Aggiungi pacchetto
          </Button>
        </div>

        {packages.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-neutral-100">
            <p className="text-neutral-400 text-sm">Nessun pacchetto ancora</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900">{pkg.name}</h3>
                    {pkg.description && (
                      <p className="text-sm text-neutral-500 mt-1">{pkg.description}</p>
                    )}
                    <p className="text-lg font-bold text-brand-600 mt-2">{formatPrice(pkg.price)}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {pkg.items.slice(0, 3).map((item, idx) => (
                        <Badge key={idx} variant="default" className="text-xs">
                          {item.quantity}x {item.menuItem.name}
                        </Badge>
                      ))}
                      {pkg.items.length > 3 && (
                        <Badge variant="default" className="text-xs">
                          +{pkg.items.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenModal(pkg)}
                      className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-neutral-500" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(pkg.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal open={modalOpen} onClose={handleCloseModal}>
          <div className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-neutral-900">
              {editingPackage ? 'Modifica pacchetto' : 'Nuovo pacchetto'}
            </h2>

            <ImageUpload
              value={form.imageUrl}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
            />

            <Input
              label="Nome"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Menu Degustazione"
            />
            <Input
              label="Descrizione"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Selezione dello chef di 3 portate"
            />
            <Input
              label="Prezzo (€)"
              type="number"
              step="0.50"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="25.00"
            />

            <div className="mt-4">
              <h3 className="text-sm font-medium text-neutral-700 mb-2">Seleziona i piatti</h3>
              <div className="flex flex-wrap gap-2">
                {menuItems.slice(0, 20).map((item) => {
                  const selected = selectedItems.find(si => si.id === item.id)
                  return (
                    <button
                      key={item.id}
                      onClick={() => selected ? handleRemoveItem(item.id) : handleAddItem(item.id)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selected 
                          ? 'bg-brand-600 text-white' 
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {selected && <span className="text-xs">{selected.quantity}x</span>}
                      {item.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedItems.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-neutral-700 mb-2">Pacchetto attuale</h3>
                <div className="space-y-2">
                  {selectedItems.map((selItem) => {
                    const menuItem = menuItems.find(mi => mi.id === selItem.id)
                    if (!menuItem) return null
                    return (
                      <div key={selItem.id} className="flex items-center justify-between p-2 bg-neutral-50 rounded-xl">
                        <span className="text-sm">{selItem.quantity}x {menuItem.name}</span>
                        <button
                          onClick={() => handleRemoveItem(menuItem.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={handleCloseModal} className="flex-1">
                Annulla
              </Button>
              <Button onClick={handleSave} className="flex-1" disabled={!form.name || !form.price || selectedItems.length === 0}>
                {editingPackage ? 'Salva modifiche' : 'Crea pacchetto'}
              </Button>
            </div>
          </div>
        </Modal>

        <Modal open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)}>
          <div className="p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">Eliminare il pacchetto?</h2>
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
