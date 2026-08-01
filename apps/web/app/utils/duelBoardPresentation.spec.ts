import { describe, expect, it } from 'vitest'
import {
  formatMatchDurationLabel,
  formatMatchupLabel,
  formatResultTurnLabel,
  formatTurnButtonLabel,
  resolveWaitingToastText
} from './duelBoardPresentation'

describe('formatResultTurnLabel', () => {
  it('shows an em dash when the duel has not advanced to a valid turn', () => {
    expect(formatResultTurnLabel(0)).toBe('—')
  })

  it('pluralizes turn counts greater than one', () => {
    expect(formatResultTurnLabel(1)).toBe('1 tour')
    expect(formatResultTurnLabel(3)).toBe('3 tours')
  })
})

describe('formatMatchDurationLabel', () => {
  it('shows an em dash when a timestamp is missing or invalid', () => {
    expect(formatMatchDurationLabel(null, '2026-08-01T10:01:00.000Z')).toBe('—')
    expect(formatMatchDurationLabel('invalid', '2026-08-01T10:01:00.000Z')).toBe('—')
  })

  it('formats short and multi-minute durations', () => {
    expect(formatMatchDurationLabel('2026-08-01T10:00:00.000Z', '2026-08-01T10:00:42.000Z')).toBe('42 s')
    expect(formatMatchDurationLabel('2026-08-01T10:00:00.000Z', '2026-08-01T10:02:00.000Z')).toBe('2 min')
    expect(formatMatchDurationLabel('2026-08-01T10:00:00.000Z', '2026-08-01T10:02:07.000Z')).toBe('2 min 07 s')
  })
})

describe('formatMatchupLabel', () => {
  it('uses fallback names when player names are unavailable', () => {
    expect(formatMatchupLabel(null, undefined)).toBe('Vous vs Adversaire')
  })

  it('renders both player names when present', () => {
    expect(formatMatchupLabel('Luffy', 'Zoro')).toBe('Luffy vs Zoro')
  })
})

describe('formatTurnButtonLabel', () => {
  it('shows the opponent-turn label when the player cannot act', () => {
    expect(formatTurnButtonLabel(false, false)).toBe('Tour adverse')
  })

  it('distinguishes ending the turn from a still-active local turn', () => {
    expect(formatTurnButtonLabel(true, true)).toBe('Fin du tour')
    expect(formatTurnButtonLabel(true, false)).toBe('Votre tour')
  })
})

describe('resolveWaitingToastText', () => {
  const idleState = {
    isOpponentDisconnected: false,
    isBlockingStep: false,
    isSelfAttacker: false,
    isCounteringStep: false,
    isAwaitingTriggerDecision: false,
    isAwaitingEffectDecision: false,
    hasPendingEffectDecision: false
  }

  it('prioritizes the reconnecting-opponent message', () => {
    expect(resolveWaitingToastText({
      ...idleState,
      isOpponentDisconnected: true
    })).toContain('temporairement deconnecte')
  })

  it('returns the correct waiting copy for each opponent-driven decision point', () => {
    expect(resolveWaitingToastText({
      ...idleState,
      isBlockingStep: true,
      isSelfAttacker: true
    })).toBe('En attente de la décision de blocage de l\'adversaire...')

    expect(resolveWaitingToastText({
      ...idleState,
      isCounteringStep: true,
      isSelfAttacker: true
    })).toBe('En attente de la décision de contre de l\'adversaire...')

    expect(resolveWaitingToastText({
      ...idleState,
      isAwaitingTriggerDecision: true,
      isSelfAttacker: true
    })).toBe('En attente de la décision de Déclenchement du défenseur...')

    expect(resolveWaitingToastText({
      ...idleState,
      isAwaitingEffectDecision: true
    })).toBe('En attente de la résolution de l’effet par l’adversaire...')
  })

  it('stays silent when the local player still has an effect decision pending', () => {
    expect(resolveWaitingToastText({
      ...idleState,
      isAwaitingEffectDecision: true,
      hasPendingEffectDecision: true
    })).toBeNull()
  })
})
