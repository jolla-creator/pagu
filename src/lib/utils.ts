export const noop = () => {}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`
}

export function timeAgo(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (seconds < 60) return 'adesso'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m fa`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h fa`
  return `${Math.floor(seconds / 86400)}g fa`
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
