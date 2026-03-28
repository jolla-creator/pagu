'use client'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 bg-neutral-50 pt-16 md:pt-4 pb-24 md:pb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">Impostazioni</h1>

        <div className="max-w-xl space-y-4">
          <Card>
            <h2 className="font-semibold text-neutral-900 mb-4">Dati ristorante</h2>
            <div className="space-y-3">
              <Input label="Nome ristorante" defaultValue="Pizzeria da Luigi" />
              <Input label="Indirizzo" defaultValue="Via Roma 1, 80100 Napoli NA" />
              <Input label="Telefono" defaultValue="+39 081 1234567" />
              <Input label="Email" defaultValue="info@pizzeriadaluigi.it" />
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
              <Input label="Stripe Secret Key" type="password" placeholder="sk_test_..." />
              <Input label="Stripe Publishable Key" type="password" placeholder="pk_test_..." />
              <Button size="sm">Salva chiavi Stripe</Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
