'use client'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const [restaurant, setRestaurant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stripeStatus, setStripeStatus] = useState<'disconnected' | 'connected' | 'pending'>('disconnected')

  useEffect(() => {
    async function loadRestaurant() {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        
        const restaurantRes = await fetch('/api/restaurant')
        const restaurantData = await restaurantRes.json()
        
        setRestaurant(restaurantData)
        setLoading(false)
        
        if (restaurantData.stripeAccountId) {
          setStripeStatus('connected')
        } else {
          setStripeStatus('disconnected')
        }
      } catch (error) {
        console.error('Failed to load restaurant:', error)
        setLoading(false)
      }
    }
    
    loadRestaurant()
  }, [])

  const handleConnectStripe = async () => {
    try {
      const res = await fetch('/api/stripe/connect/onboarding', {
        method: 'POST',
      })
      
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Stripe connect error:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 bg-neutral-50 pt-16 md:pt-4 pb-24 md:pb-6">
          <h1 className="text-2xl font-bold text-neutral-900 mb-6">Impostazioni</h1>
          <div className="max-w-xl space-y-4">
            <Card>
              <h2 className="font-semibold text-neutral-900 mb-4">Dati ristorante</h2>
              <p className="text-neutral-500">Caricamento...</p>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 bg-neutral-50 pt-16 md:pt-4 pb-24 md:pb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">Impostazioni</h1>

        <div className="max-w-xl space-y-4">
          <Card>
            <h2 className="font-semibold text-neutral-900 mb-4">Dati ristorante</h2>
            <div className="space-y-3">
              <Input label="Nome ristorante" defaultValue={restaurant?.name || ''} />
              <Input label="Indirizzo" defaultValue={restaurant?.address || ''} />
              <Input label="Telefono" defaultValue={restaurant?.phone || ''} />
              <Input label="Email" defaultValue={restaurant?.email || ''} />
              <Button size="sm">Salva modifiche</Button>
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-neutral-900 mb-4">Dati fiscali (SDI)</h2>
            <div className="space-y-3">
              <Input label="Partita IVA" placeholder="01234567890" />
              <Input label="Codice destinatario" placeholder="XXXXXXX" />
              <Input label="Ragione sociale" placeholder="Pizzeria da Luigi S.r.l." />
              <div className="grid grid-cols-3 gap-3">
                <Input label="CAP" placeholder="80100" />
                <Input label="Città" placeholder="Napoli" />
                <Input label="Provincia" placeholder="NA" />
              </div>
              <Button variant="secondary" size="sm">Salva dati fiscali</Button>
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-neutral-900 mb-2">Pagamenti</h2>
            <p className="text-sm text-neutral-400 mb-4">
              Configura Stripe per accettare pagamenti con carta, Apple Pay e Google Pay.
            </p>
            <div className="space-y-3">
              {stripeStatus === 'connected' ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Stripe connesso</span>
                </div>
              ) : (
                <Button size="sm" onClick={handleConnectStripe}>
                  {stripeStatus === 'pending' ? 'Connessione in corso...' : 'Connetti a Stripe'}
                </Button>
              )}
              
              <div className="mt-3">
                <Input label="Stripe Secret Key" type="password" placeholder="sk_test_..." />
                <Input label="Stripe Publishable Key" type="password" placeholder="pk_test_..." />
                <Button size="sm">Salva chiavi Stripe</Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}