'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { timeAgo } from '@/lib/utils'
import { Star } from 'lucide-react'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  order?: { table?: { number: number } }
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reviews')
      .then((r) => r.json())
      .then((data) => { if (data.reviews) setReviews(data.reviews) })
      .finally(() => setLoading(false))
  }, [])

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 bg-neutral-50 pt-16 md:pt-4 pb-24 md:pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Recensioni</h1>
            <p className="text-neutral-500 text-sm">Feedback dei tuoi clienti</p>
          </div>
          <Card className="flex items-center gap-3">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <div>
              <p className="text-xl font-bold text-neutral-900">{avgRating}</p>
              <p className="text-[10px] text-neutral-400">{reviews.length} recensioni</p>
            </div>
          </Card>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-neutral-100">
            <p className="text-neutral-400 text-sm">Nessuna recensione ancora</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <Card key={review.id}>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}`}
                    />
                  ))}
                </div>
                {review.comment && (
                  <p className="text-sm text-neutral-700">{review.comment}</p>
                )}
                <p className="text-xs text-neutral-400 mt-2">
                  Tavolo {review.order?.table?.number ?? '?'} · {timeAgo(review.createdAt)}
                </p>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
