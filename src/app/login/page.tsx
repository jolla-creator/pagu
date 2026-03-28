'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Errore di autenticazione')
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
          <p className="text-neutral-400 text-sm">Dashboard Ristorante</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Inserisci la password"
            autoFocus
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Accedi
          </Button>
        </form>
      </div>
    </div>
  )
}
