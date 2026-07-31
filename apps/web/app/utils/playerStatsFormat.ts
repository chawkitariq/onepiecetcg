import type { PlayerStats } from '@onepiecetcg/shared'

export function formatPercent(rate: number) {
  return `${Math.round(rate * 100)}%`
}

export function formatDuration(seconds: number | null) {
  if (seconds === null) {
    return '—'
  }

  const minutes = Math.round(seconds / 60)

  return `${minutes} min`
}

export function streakLabel(streak: PlayerStats['currentStreak']) {
  if (!streak) {
    return 'Aucune'
  }

  const label = streak.type === 'win' ? 'victoire' : 'défaite'
  const plural = streak.length > 1 ? 's' : ''

  return `${streak.length} ${label}${plural} d'affilée`
}
