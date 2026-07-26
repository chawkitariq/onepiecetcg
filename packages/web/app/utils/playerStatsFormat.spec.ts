import { describe, expect, it } from 'vitest'
import { formatDuration, formatPercent, streakLabel } from './playerStatsFormat'

describe('formatPercent', () => {
  it('rounds a win-rate fraction to a whole percentage', () => {
    expect(formatPercent(0.5)).toBe('50%')
    expect(formatPercent(1 / 3)).toBe('33%')
    expect(formatPercent(0)).toBe('0%')
    expect(formatPercent(1)).toBe('100%')
  })
})

describe('formatDuration', () => {
  it('shows an em dash when no duration is available', () => {
    expect(formatDuration(null)).toBe('—')
  })

  it('formats seconds as rounded minutes', () => {
    expect(formatDuration(600)).toBe('10 min')
    expect(formatDuration(90)).toBe('2 min')
    expect(formatDuration(0)).toBe('0 min')
  })
})

describe('streakLabel', () => {
  it('reports no streak when null', () => {
    expect(streakLabel(null)).toBe('Aucune')
  })

  it('pluralizes a multi-game win streak', () => {
    expect(streakLabel({ type: 'win', length: 3 })).toBe('3 victoires d\'affilée')
  })

  it('keeps the singular form for a streak of one', () => {
    expect(streakLabel({ type: 'loss', length: 1 })).toBe('1 défaite d\'affilée')
  })

  it('pluralizes a multi-game loss streak', () => {
    expect(streakLabel({ type: 'loss', length: 2 })).toBe('2 défaites d\'affilée')
  })
})
