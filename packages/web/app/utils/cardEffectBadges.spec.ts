import { describe, expect, it } from 'vitest'
import { extractCardEffectBadges } from './cardEffectBadges'

describe('extractCardEffectBadges', () => {
  it('maps French glossary tags to official badge labels', () => {
    expect(extractCardEffectBadges('[Jouee] [Contre] [Une fois par tour] Gagne +1000.')).toEqual([
      { label: 'On Play', tone: 'blue' },
      { label: 'Counter', tone: 'red' },
      { label: 'Once Per Turn', tone: 'pink' }
    ])
  })

  it('extracts DON and combat keywords with the glossary colors', () => {
    expect(extractCardEffectBadges('[DON!! x1] [Double attaque] [Exil]')).toEqual([
      { label: 'DON!!×1', tone: 'black' },
      { label: 'Double Attack', tone: 'orange' },
      { label: 'Banish', tone: 'orange' }
    ])
  })

  it('extracts Trigger only when it appears in the description text', () => {
    expect(extractCardEffectBadges('[Actif : Principale] [Déclenchement] Faites quelque chose.')).toEqual([
      { label: 'Activate:Main', tone: 'blue' },
      { label: 'Trigger', tone: 'yellow' }
    ])
  })

  it('keeps unknown bracketed effects as neutral badges', () => {
    expect(extractCardEffectBadges('[When Attacking] Do something.')).toEqual([
      { label: 'When Attacking', tone: 'neutral' }
    ])
  })
})
