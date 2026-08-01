import { describe, expect, it } from 'vitest'
import {
  extractBlockerCardName,
  extractDonGainFeedback,
  resolveAttackBannerMessage
} from './duelBoardLogFeedback'

describe('resolveAttackBannerMessage', () => {
  it('returns null for unrelated log entries', () => {
    expect(resolveAttackBannerMessage('Texte libre', {
      resolveLeaderNameByDisplayName: () => null
    })).toBeNull()
  })

  it('rewrites character attacks into concise banner copy', () => {
    expect(resolveAttackBannerMessage('Luffy attaque avec Zoro vers Nami.', {
      resolveLeaderNameByDisplayName: () => null
    })).toBe('Zoro attaque Nami')
  })

  it('resolves leader targets through the provided player lookup', () => {
    expect(resolveAttackBannerMessage('Luffy attaque avec Zoro vers le Leader de Kaido.', {
      resolveLeaderNameByDisplayName: displayName => displayName === 'Kaido' ? 'Kaido Leader' : null
    })).toBe('Zoro attaque Kaido Leader')
  })

  it('falls back to a generic leader label when the player lookup misses', () => {
    expect(resolveAttackBannerMessage('Luffy attaque avec Zoro vers le Leader de Kaido.', {
      resolveLeaderNameByDisplayName: () => null
    })).toBe('Zoro attaque le Leader')
  })
})

describe('extractBlockerCardName', () => {
  it('returns the blocker card name for matching log entries', () => {
    expect(extractBlockerCardName('Nami declare Trafalgar Law comme Bloqueur.')).toBe('Trafalgar Law')
  })

  it('returns null for unrelated log entries', () => {
    expect(extractBlockerCardName('Nami joue une carte.')).toBeNull()
  })
})

describe('extractDonGainFeedback', () => {
  it('extracts player, target, and power from DON gain log entries', () => {
    expect(extractDonGainFeedback('Luffy donne 2 DON!! a son Leader (+2000 de puissance).')).toEqual({
      playerDisplayName: 'Luffy',
      targetLabel: 'son Leader',
      power: '2000'
    })
  })

  it('returns null for unrelated log entries', () => {
    expect(extractDonGainFeedback('Luffy termine son tour.')).toBeNull()
  })
})
