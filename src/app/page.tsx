"use client";

import Link from 'next/link';

export default function Landing() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white text-gray-900">
      <section className="w-full max-w-4xl p-6 text-center">
        <h1 className="text-4xl font-extrabold mb-4">Pagù – Ristorante digitale</h1>
        <p className="text-lg text-gray-600 mb-6">Soluzione completa per gestire prenotazioni, menu e pagamenti.</p>
        <div className="flex justify-center gap-4">
          <Link href="/register" className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-pink-600 text-white">Inizia Gratis</Link>
          <Link href="/login" className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-pink-600 text-pink-600">Accedi</Link>
        </div>
      </section>
    </main>
  )
}
