'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { QrCode, Download, Plus, Trash2 } from 'lucide-react'

interface Table {
  id: string
  number: number
  qrCode?: string | null
  orders: { id: string }[]
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [bulkCount, setBulkCount] = useState('1')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [restaurantId, setRestaurantId] = useState('')

  const fetchTables = async () => {
    const res = await fetch('/api/tables')
    const data = await res.json()
    if (data.tables) setTables(data.tables)
    setLoading(false)
  }

  const fetchRestaurant = async () => {
    const res = await fetch('/api/menu')
    const data = await res.json()
    if (data.restaurant?.id) setRestaurantId(data.restaurant.id)
  }

  useEffect(() => {
    fetchTables()
    fetchRestaurant()
  }, [])

  const generateQR = async (tableId: string) => {
    const res = await fetch(`/api/tables/${tableId}/qr`)
    const data = await res.json()
    if (data.qrCode) {
      setQrCodes((prev) => ({ ...prev, [tableId]: data.qrCode }))
    }
  }

  const downloadQR = (tableId: string, number: number) => {
    const link = document.createElement('a')
    link.href = qrCodes[tableId]
    link.download = `tavolo-${number}-qr.png`
    link.click()
  }

  const handleCreateTables = async () => {
    const count = parseInt(bulkCount) || 1
    if (count < 1 || !restaurantId) return

    await fetch('/api/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count, restaurantId }),
    })

    setModalOpen(false)
    setBulkCount('1')
    fetchTables()
  }

  const handleDelete = async (tableId: string) => {
    await fetch(`/api/tables?id=${tableId}`, { method: 'DELETE' })
    setDeleteConfirm(null)
    fetchTables()
  }

  const generateAllQRs = async () => {
    for (const table of tables) {
      if (!qrCodes[table.id]) {
        await generateQR(table.id)
      }
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 bg-neutral-50 pt-16 md:pt-4 pb-24 md:pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Tavoli</h1>
            <p className="text-neutral-500 text-sm">{tables.length} tavoli totali</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={generateAllQRs}>
              <QrCode className="w-4 h-4" /> Tutti i QR
            </Button>
            <Button onClick={() => setModalOpen(true)} size="sm">
              <Plus className="w-4 h-4" /> Aggiungi
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {tables.map((table) => (
              <Card key={table.id}>
                <div className="text-center">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xl font-bold text-neutral-900">{table.number}</p>
                    <button
                      onClick={() => setDeleteConfirm(table.id)}
                      className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-neutral-400 hover:text-red-500" />
                    </button>
                  </div>
                  <p className="text-xs text-neutral-400 mb-4">
                    {table.orders.length} {table.orders.length === 1 ? 'ordine' : 'ordini'}
                  </p>

                  {qrCodes[table.id] ? (
                    <div>
                      <img src={qrCodes[table.id]} alt={`QR Tavolo ${table.number}`} className="w-28 h-28 mx-auto mb-2" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadQR(table.id, table.number)}
                      >
                        <Download className="w-3.5 h-3.5" /> Scarica
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => generateQR(table.id)}>
                      <QrCode className="w-3.5 h-3.5" /> QR
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <div className="p-5 space-y-4">
            <h2 className="text-lg font-bold text-neutral-900">Aggiungi tavoli</h2>
            <Input
              label="Numero di tavoli da creare"
              type="number"
              min="1"
              max="50"
              value={bulkCount}
              onChange={(e) => setBulkCount(e.target.value)}
              placeholder="1"
            />
            <p className="text-xs text-neutral-400">
              I tavoli verranno numerati automaticamente a partire dal successivo disponibile.
            </p>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">
                Annulla
              </Button>
              <Button onClick={handleCreateTables} className="flex-1">
                Crea {bulkCount || '1'} {parseInt(bulkCount) === 1 ? 'tavolo' : 'tavoli'}
              </Button>
            </div>
          </div>
        </Modal>

        <Modal open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)}>
          <div className="p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">Eliminare il tavolo?</h2>
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
