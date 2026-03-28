'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [restaurantName, setRestaurantName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, restaurantName }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Errore di registrazione')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Errore di connessione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-xs">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-neutral-900 tracking-tight mb-1">Pagù</h1>
          <p className="text-neutral-400 text-sm">Crea il tuo account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@esempio.it"
            autoFocus
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimo 6 caratteri"
          />

          <Input
            label="Nome"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Il tuo nome"
          />

          <Input
            label="Nome Ristorante"
            type="text"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            placeholder="Nome del tuo ristorante"
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Registrati
          </Button>
        </form>

        <p className="text-sm text-neutral-500 text-center mt-6">
          Hai già un account?{' '}
          <a href="/login" className="text-brand-600 hover:underline">
            Accedi
          </a>
        </p>
      </div>
    </div>
  )
}
