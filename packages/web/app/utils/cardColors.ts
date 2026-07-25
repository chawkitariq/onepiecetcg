import type { CardColor } from '@onepiecetcg/shared'

export type CardColorAccent = {
  chip: 'error' | 'success' | 'info' | 'secondary' | 'neutral' | 'warning'
  hex: string
  soft: string
  text: string
}

/**
 * Single source of truth for the six OPTCG card colors, shared between the deck builder
 * (catalogue chips, card-detail badges) and the duel board (card-detail badges, leader accent),
 * so a color reads the same wherever it appears in the app.
 */
export const CARD_COLOR_ACCENTS: Record<CardColor, CardColorAccent> = {
  Red: { chip: 'error', hex: '#e0332f', soft: '#fee2e2', text: '#991b1b' },
  Green: { chip: 'success', hex: '#1f9254', soft: '#dcfce7', text: '#166534' },
  Blue: { chip: 'info', hex: '#2563eb', soft: '#dbeafe', text: '#1e40af' },
  Purple: { chip: 'secondary', hex: '#9333ea', soft: '#f3e8ff', text: '#6b21a8' },
  Black: { chip: 'neutral', hex: '#27272a', soft: '#e5e7eb', text: '#111827' },
  Yellow: { chip: 'warning', hex: '#ca8a04', soft: '#fef9c3', text: '#854d0e' }
}

export function getCardColorStyle(color: CardColor) {
  const accent = CARD_COLOR_ACCENTS[color]

  return { backgroundColor: accent.soft, borderColor: accent.hex, color: accent.text }
}
