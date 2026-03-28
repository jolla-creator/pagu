'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  ClipboardList,
  UtensilsCrossed,
  Users,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Ordini', icon: ClipboardList },
  { href: '/dashboard/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/dashboard/tavoli', label: 'Tavoli', icon: Users },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/recensioni', label: 'Recensioni', icon: MessageSquare },
  { href: '/dashboard/impostazioni', label: 'Impostazioni', icon: Settings },
  { href: '/dashboard/abbonamento', label: 'Abbonamento', icon: ClipboardList },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [subState, setSubState] = useState<any | null>(null)

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/stripe/subscription', { credentials: 'include' })
        if (!mounted) return
        if (res.ok) {
          const json = await res.json()
          const s = json?.subscription ?? json ?? null
          if (mounted) setSubState(s)
        }
      } catch {
        // ignore
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/login', { method: 'DELETE' })
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 bg-neutral-950 text-white z-40 safe-bottom">
        <div className="flex items-center justify-between px-4 h-14">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Pagù</h1>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'w-64 bg-neutral-950 text-white min-h-screen p-4 flex flex-col relative z-50 transition-transform duration-300',
          'fixed md:relative',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Pagù</h1>
            <p className="text-xs text-neutral-500 mt-0.5">Dashboard</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            const isSubscriptionLink = item.href === '/dashboard/abbonamento'
            let badge: JSX.Element | null = null
            if (isSubscriptionLink && subState) {
              const st = (subState.status ?? "").toString().toLowerCase()
              if (st.includes("trial")) {
                badge = (
                  <span className="ml-auto inline-block bg-yellow-200 text-yellow-800 text-xs px-2 py-0.5 rounded-full">In prova</span>
                )
              } else if (subState.nextBillingDate) {
                try {
                  const end = new Date(subState.nextBillingDate).getTime()
                  const diffDays = Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24))
                  if (diffDays <= 7 && diffDays >= 0) {
                    badge = (
                      <span className="ml-auto inline-block bg-orange-200 text-orange-800 text-xs px-2 py-0.5 rounded-full">Scadenza</span>
                    )
                  }
                } catch {
                }
              }
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-white text-neutral-900'
                    : 'text-neutral-400 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className="w-4.5 h-4.5" />
                {item.label}
                {badge}
              </Link>
            )
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-500 hover:text-white hover:bg-white/10 transition-all"
        >
          <LogOut className="w-4.5 h-4.5" />
          Esci
        </button>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 z-40 safe-bottom">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-colors min-w-[56px]',
                  active ? 'text-brand-600' : 'text-neutral-400'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
