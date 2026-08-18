import { describe, expect, it, jest } from '@jest/globals'
import { EffectDecisionManager } from './effect-decision-manager'

describe('EffectDecisionManager', () => {
  it('resolves ordered cards in the same order reported by the UI', () => {
    const host = {
      onPendingDecisionChange: jest.fn(),
    }
    const manager = new EffectDecisionManager(host as never, {} as never)
    const resolve = vi.fn()

    manager.orderCards(
      'decision-1',
      'player-1',
      'Placez les cartes.',
      ['card-1', 'card-2'],
      'deck',
      resolve,
    )

    expect(manager.getPendingDecision()).toMatchObject({
      id: 'decision-1',
      prompt: {
        type: 'orderCards',
        cardInstanceIds: ['card-1', 'card-2'],
        destinationZone: 'deck',
      },
    })

    manager.answerDecision({
      decisionId: 'decision-1',
      orderedCardInstanceIds: ['card-2', 'card-1'],
    })

    expect(resolve).toHaveBeenCalledWith(['card-2', 'card-1'])
    expect(host.onPendingDecisionChange).toHaveBeenCalledWith(null)
  })

  it('falls back to the original order when the response is incomplete', () => {
    const manager = new EffectDecisionManager(
      { onPendingDecisionChange: jest.fn() } as never,
      {} as never,
    )
    const resolve = vi.fn()

    manager.orderCards(
      'decision-2',
      'player-1',
      'Placez les cartes.',
      ['card-1', 'card-2'],
      'deck',
      resolve,
    )

    manager.answerDecision({
      decisionId: 'decision-2',
      orderedCardInstanceIds: ['card-2'],
    })

    expect(resolve).toHaveBeenCalledWith(['card-1', 'card-2'])
  })
})
