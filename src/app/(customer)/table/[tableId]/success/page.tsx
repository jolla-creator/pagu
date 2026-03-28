'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { CheckCircle, Star, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function SuccessPage() {
  const params = useParams()
  const tableId = params.tableId as string

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleReview = async () => {
    if (rating === 0) return

    const cartData = sessionStorage.getItem(`checkout-cart-${tableId}`)
    if (cartData) {
      const { orderId } = JSON.parse(cartData)

      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, rating, comment }),
      })
    }

    sessionStorage.removeItem(`checkout-cart-${tableId}`)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>

        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Ordine inviato!</h1>
        <p className="text-neutral-500 mb-8 text-sm leading-relaxed">
          Il tuo ordine è stato inviato alla cucina. Ti porteremo tutto al tavolo appena pronto.
        </p>

        {!submitted ? (
          <div className="bg-neutral-50 rounded-2xl p-5 mb-6">
            <h2 className="font-semibold text-neutral-900 mb-3 text-sm">Com&apos;era la tua esperienza?</h2>

            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  className="p-1 transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-7 h-7 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Lascia un commento (opzionale)"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 resize-none h-20 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            />

            <Button onClick={handleReview} className="w-full mt-3" disabled={rating === 0} size="sm">
              Invia recensione
            </Button>
          </div>
        ) : (
          <div className="bg-emerald-50 rounded-2xl p-5 mb-6">
            <p className="text-emerald-700 font-medium text-sm">Grazie per la tua recensione!</p>
          </div>
        )}

        <a
          href="https://search.google.com/local/writereview"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700 text-sm font-medium mb-6"
        >
          Lascia una recensione su Google <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <div>
          <Link href={`/table/${tableId}`} className="text-neutral-400 text-sm hover:text-neutral-600 transition-colors">
            Torna al menu
          </Link>
        </div>
      </div>
    </div>
  )
}
