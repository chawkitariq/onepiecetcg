import { describe, expect, it, vi } from 'vitest'
import type { CardColor, CardType, PendingEffectDecision } from '@onepiecetcg/shared'

type FakeCard = {
  instanceId: string
  cardId: string
  number: string
  name: string
  type: CardType
  colors: CardColor[]
  cost: number
  power: number
  life: number
  counter: number
  imageUrl: string
  text: string
  trigger: string
  rested: boolean
  attachedDon: number
  playedThisTurn: boolean
}

function createFakeCard(overrides: Partial<FakeCard> = {}): FakeCard {
  return {
    instanceId: '',
    cardId: '',
    number: '',
    name: '',
    type: 'Character',
    colors: [],
    cost: -1,
    power: -1,
    life: -1,
    counter: -1,
    imageUrl: '',
    text: '',
    trigger: '',
    rested: false,
    attachedDon: 0,
    playedThisTurn: false,
    ...overrides
  }
}

function createFakePlayer(sessionId: string, mulliganDecided: boolean) {
  return {
    sessionId,
    displayName: sessionId,
    deckId: 'deck-1',
    ready: true,
    connected: true,
    mulliganDecided,
    hasTakenFirstTurn: true,
    handCount: 5,
    deckCount: 45,
    lifeCount: 0,
    zones: {
      deck: [] as FakeCard[],
      donDeck: [] as FakeCard[],
      hand: [] as FakeCard[],
      life: [] as FakeCard[],
      characters: [] as FakeCard[],
      cost: [] as FakeCard[],
      trash: [] as FakeCard[],
      leader: createFakeCard(),
      stage: createFakeCard()
    }
  }
}

type FakeCombat = {
  attackerSessionId: string
  attackerInstanceId: string
  defenderSessionId: string
  targetType: 'leader' | 'character'
  targetInstanceId: string
  blockerInstanceId: string
  step: 'declared' | 'blocked' | 'countering' | 'resolving' | 'resolved'
  counterPowerBonus: number
  awaitingTriggerDecision: boolean
}

function createFakeCombat(overrides: Partial<FakeCombat> = {}): FakeCombat {
  return {
    attackerSessionId: '',
    attackerInstanceId: '',
    defenderSessionId: '',
    targetType: 'leader',
    targetInstanceId: '',
    blockerInstanceId: '',
    step: 'declared',
    counterPowerBonus: 0,
    awaitingTriggerDecision: false,
    ...overrides
  }
}

function createFakeRoom(options: {
  sessionId: string
  phase: string
  startingPlayerSessionId: string
  firstPlayerSessionId: string
  activePlayerSessionId?: string
  players: Array<ReturnType<typeof createFakePlayer>>
  combat?: FakeCombat
  send?: (type: string, message: unknown) => void
}) {
  let stateChangeListener: (() => void) | null = null
  const messageListeners = new Map<string, (payload: any) => void>()

  return {
    sessionId: options.sessionId,
    state: {
      phase: options.phase,
      turn: 0,
      winnerSessionId: '',
      endReason: '',
      startedAt: '',
      finishedAt: '',
      startingPlayerSessionId: options.startingPlayerSessionId,
      firstPlayerSessionId: options.firstPlayerSessionId,
      activePlayerSessionId: options.activePlayerSessionId ?? '',
      players: {
        values: () => options.players.values()
      },
      logs: [],
      combat: options.combat ?? createFakeCombat()
    },
    onStateChange: Object.assign(
      (listener: () => void) => {
        stateChangeListener = listener
      },
      { remove: () => { stateChangeListener = null } }
    ),
    /** Simulates a Colyseus ROOM_STATE_PATCH: @colyseus/schema mutates state.combat in place rather than replacing it. */
    emitStatePatch() {
      stateChangeListener?.()
    },
    onMessage: (type: string, listener: (payload: any) => void) => {
      messageListeners.set(type, listener)
    },
    send: options.send ?? (() => {})
    ,
    emitMessage(type: string, payload: any) {
      messageListeners.get(type)?.(payload)
    }
  }
}

function createPendingEffectDecision(overrides: Partial<PendingEffectDecision> = {}): PendingEffectDecision {
  return {
    id: 'decision-1',
    effectId: 'effect-1',
    effectCardId: 'card-1',
    sourceInstanceId: 'source-1',
    playerSessionId: 'session-a',
    createdAt: '2026-07-28T12:00:00.000Z',
    prompt: {
      type: 'confirm',
      message: 'Activer cet effet ?',
      optional: true
    },
    ...overrides
  }
}

describe('useDuelRoom setup helpers', () => {
  it('marks the designated starting player as able to choose first/second', () => {
    const { room } = useColyseus()
    room.value = createFakeRoom({
      sessionId: 'session-a',
      phase: 'mulligan',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: '',
      players: [createFakePlayer('session-a', false), createFakePlayer('session-b', false)]
    }) as never

    const { isSelfDesignatedToChoose, isSelfTurnToMulligan } = useDuelRoom()

    expect(isSelfDesignatedToChoose.value).toBe(true)
    expect(isSelfTurnToMulligan.value).toBe(false)
  })

  it('does not let a non-designated player choose first/second', () => {
    const { room } = useColyseus()
    room.value = createFakeRoom({
      sessionId: 'session-b',
      phase: 'mulligan',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: '',
      players: [createFakePlayer('session-a', false), createFakePlayer('session-b', false)]
    }) as never

    const { isSelfDesignatedToChoose } = useDuelRoom()

    expect(isSelfDesignatedToChoose.value).toBe(false)
  })

  it('lets the first player mulligan before the second player', () => {
    const { room } = useColyseus()
    room.value = createFakeRoom({
      sessionId: 'session-a',
      phase: 'mulligan',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: 'session-a',
      players: [createFakePlayer('session-a', false), createFakePlayer('session-b', false)]
    }) as never

    const { isSelfTurnToMulligan } = useDuelRoom()

    expect(isSelfTurnToMulligan.value).toBe(true)
  })

  it('blocks the second player from mulligan until the first player has decided', () => {
    const { room } = useColyseus()
    room.value = createFakeRoom({
      sessionId: 'session-b',
      phase: 'mulligan',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: 'session-a',
      players: [createFakePlayer('session-a', false), createFakePlayer('session-b', false)]
    }) as never

    const { isSelfTurnToMulligan } = useDuelRoom()

    expect(isSelfTurnToMulligan.value).toBe(false)
  })

  it('lets the second player mulligan once the first player has decided', () => {
    const { room } = useColyseus()
    room.value = createFakeRoom({
      sessionId: 'session-b',
      phase: 'mulligan',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: 'session-a',
      players: [createFakePlayer('session-a', true), createFakePlayer('session-b', false)]
    }) as never

    const { isSelfTurnToMulligan } = useDuelRoom()

    expect(isSelfTurnToMulligan.value).toBe(true)
  })

  it('stops prompting a player who already decided their mulligan', () => {
    const { room } = useColyseus()
    room.value = createFakeRoom({
      sessionId: 'session-a',
      phase: 'mulligan',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: 'session-a',
      players: [createFakePlayer('session-a', true), createFakePlayer('session-b', false)]
    }) as never

    const { isSelfTurnToMulligan } = useDuelRoom()

    expect(isSelfTurnToMulligan.value).toBe(false)
  })
})

describe('useDuelRoom turn/phase helpers (stage 7)', () => {
  it('only allows ending the turn during your main phase', () => {
    const { room } = useColyseus()
    room.value = createFakeRoom({
      sessionId: 'session-a',
      phase: 'main',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: 'session-a',
      activePlayerSessionId: 'session-a',
      players: [createFakePlayer('session-a', true), createFakePlayer('session-b', true)]
    }) as never

    const { canEndPhase } = useDuelRoom()

    expect(canEndPhase.value).toBe(true)
  })

  it('does not allow ending the turn during auto-resolved phases', () => {
    const { room } = useColyseus()
    room.value = createFakeRoom({
      sessionId: 'session-a',
      phase: 'draw',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: 'session-a',
      activePlayerSessionId: 'session-a',
      players: [createFakePlayer('session-a', true), createFakePlayer('session-b', true)]
    }) as never

    const { canEndPhase } = useDuelRoom()

    expect(canEndPhase.value).toBe(false)
  })

  it('does not allow ending the phase on the opponent\'s turn', () => {
    const { room } = useColyseus()
    room.value = createFakeRoom({
      sessionId: 'session-b',
      phase: 'main',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: 'session-a',
      activePlayerSessionId: 'session-a',
      players: [createFakePlayer('session-a', true), createFakePlayer('session-b', true)]
    }) as never

    const { canEndPhase } = useDuelRoom()

    expect(canEndPhase.value).toBe(false)
  })

  it('counts only untapped DON!! cards in the self cost zone', () => {
    const { room } = useColyseus()
    const self = createFakePlayer('session-a', true)
    self.zones.cost = [
      createFakeCard({ instanceId: 'don-1', type: 'DON!!', rested: false }),
      createFakeCard({ instanceId: 'don-2', type: 'DON!!', rested: true }),
      createFakeCard({ instanceId: 'don-3', type: 'DON!!', rested: false })
    ]
    room.value = createFakeRoom({
      sessionId: 'session-a',
      phase: 'main',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: 'session-a',
      activePlayerSessionId: 'session-a',
      players: [self, createFakePlayer('session-b', true)]
    }) as never

    const { selfUntappedDonCount } = useDuelRoom()

    expect(selfUntappedDonCount.value).toBe(2)
  })

  it('flags the opponent as disconnected when their room presence is suspended', () => {
    const { room } = useColyseus()
    const opponent = createFakePlayer('session-b', true)
    opponent.connected = false
    room.value = createFakeRoom({
      sessionId: 'session-a',
      phase: 'main',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: 'session-a',
      activePlayerSessionId: 'session-a',
      players: [createFakePlayer('session-a', true), opponent]
    }) as never

    const { isOpponentDisconnected } = useDuelRoom()

    expect(isOpponentDisconnected.value).toBe(true)
  })

  it('computes displayed power as base power plus 1000 per attached DON!! only during the owner\'s turn', () => {
    const { cardPower } = useDuelRoom()

    expect(cardPower(createFakeCard({ power: 3000, attachedDon: 2 }), true)).toBe(5000)
    expect(cardPower(createFakeCard({ power: 1000, attachedDon: 0 }), true)).toBe(1000)
    expect(cardPower(createFakeCard({ power: 3000, attachedDon: 2 }), false)).toBe(3000)
  })

  it('sends an endPhase message and clears any prior error', () => {
    const sent: Array<{ type: string, message: unknown }> = []
    const { room } = useColyseus()
    room.value = createFakeRoom({
      sessionId: 'session-a',
      phase: 'main',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: 'session-a',
      activePlayerSessionId: 'session-a',
      players: [createFakePlayer('session-a', true), createFakePlayer('session-b', true)],
      send: (type, message) => sent.push({ type, message })
    }) as never

    const { endPhase } = useDuelRoom()
    endPhase()

    expect(sent).toEqual([{ type: 'endPhase', message: {} }])
  })

  it('sends a playCard message with the instanceId', () => {
    const sent: Array<{ type: string, message: unknown }> = []
    const { room } = useColyseus()
    room.value = createFakeRoom({
      sessionId: 'session-a',
      phase: 'main',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: 'session-a',
      activePlayerSessionId: 'session-a',
      players: [createFakePlayer('session-a', true), createFakePlayer('session-b', true)],
      send: (type, message) => sent.push({ type, message })
    }) as never

    const { playCard } = useDuelRoom()
    playCard('card-1')

    expect(sent).toEqual([{ type: 'playCard', message: { instanceId: 'card-1' } }])
  })

  it('sends an attachDon message with the target', () => {
    const sent: Array<{ type: string, message: unknown }> = []
    const { room } = useColyseus()
    room.value = createFakeRoom({
      sessionId: 'session-a',
      phase: 'main',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: 'session-a',
      activePlayerSessionId: 'session-a',
      players: [createFakePlayer('session-a', true), createFakePlayer('session-b', true)],
      send: (type, message) => sent.push({ type, message })
    }) as never

    const { attachDon } = useDuelRoom()
    attachDon('character', 'char-1')

    expect(sent).toEqual([{ type: 'attachDon', message: { target: 'character', targetInstanceId: 'char-1' } }])
  })
})

describe('useDuelRoom combat helpers (stage 8)', () => {
  it('reports no combat in progress when the wire combat has no attacker', () => {
    const { room } = useColyseus()
    room.value = createFakeRoom({
      sessionId: 'session-a',
      phase: 'main',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: 'session-a',
      activePlayerSessionId: 'session-a',
      players: [createFakePlayer('session-a', true), createFakePlayer('session-b', true)]
    }) as never

    const { isCombatInProgress, canDeclareAttack } = useDuelRoom()

    expect(isCombatInProgress.value).toBe(false)
    expect(canDeclareAttack.value).toBe(true)
  })

  it('forbids declaring an attack during the player\'s own first turn (rule_comprehensive.md 6-5-6-1)', () => {
    const { room } = useColyseus()
    const self = createFakePlayer('session-a', true)
    self.hasTakenFirstTurn = false
    room.value = createFakeRoom({
      sessionId: 'session-a',
      phase: 'main',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: 'session-a',
      activePlayerSessionId: 'session-a',
      players: [self, createFakePlayer('session-b', true)]
    }) as never

    const { canDeclareAttack } = useDuelRoom()

    expect(canDeclareAttack.value).toBe(false)
  })

  it('reflects a combat.step change patched onto the same schema instance in place (Colyseus mutates DuelCombat rather than replacing it)', () => {
    const { room } = useColyseus()
    const combat = createFakeCombat({
      attackerSessionId: 'session-a',
      attackerInstanceId: 'attacker-1',
      defenderSessionId: 'session-b',
      step: 'blocked'
    })
    const fakeRoom = createFakeRoom({
      sessionId: 'session-b',
      phase: 'main',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: 'session-a',
      activePlayerSessionId: 'session-a',
      players: [createFakePlayer('session-a', true), createFakePlayer('session-b', true)],
      combat
    })
    room.value = fakeRoom as never

    const { isBlockingStep, isCounteringStep } = useDuelRoom()

    expect(isBlockingStep.value).toBe(true)
    expect(isCounteringStep.value).toBe(false)

    // Mutate the same combat object in place, exactly like @colyseus/schema
    // does on a real ROOM_STATE_PATCH, then emit the patch notification --
    // no new combat object, just a changed field on the existing instance.
    combat.step = 'countering'
    fakeRoom.emitStatePatch()

    expect(isBlockingStep.value).toBe(false)
    expect(isCounteringStep.value).toBe(true)
  })

  it('identifies the attacker and defender roles from the wire combat', () => {
    const { room } = useColyseus()
    room.value = createFakeRoom({
      sessionId: 'session-b',
      phase: 'main',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: 'session-a',
      activePlayerSessionId: 'session-a',
      players: [createFakePlayer('session-a', true), createFakePlayer('session-b', true)],
      combat: createFakeCombat({
        attackerSessionId: 'session-a',
        attackerInstanceId: 'leader-a',
        defenderSessionId: 'session-b',
        step: 'blocked'
      })
    }) as never

    const { isCombatInProgress, isSelfAttacker, isSelfDefender, isBlockingStep, canDeclareAttack } = useDuelRoom()

    expect(isCombatInProgress.value).toBe(true)
    expect(isSelfAttacker.value).toBe(false)
    expect(isSelfDefender.value).toBe(true)
    expect(isBlockingStep.value).toBe(true)
    expect(canDeclareAttack.value).toBe(false)
  })

  it('exposes the countering step and pending trigger decision flags', () => {
    const { room } = useColyseus()
    room.value = createFakeRoom({
      sessionId: 'session-b',
      phase: 'main',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: 'session-a',
      activePlayerSessionId: 'session-a',
      players: [createFakePlayer('session-a', true), createFakePlayer('session-b', true)],
      combat: createFakeCombat({
        attackerSessionId: 'session-a',
        attackerInstanceId: 'leader-a',
        defenderSessionId: 'session-b',
        step: 'countering',
        awaitingTriggerDecision: true
      })
    }) as never

    const { isCounteringStep, isAwaitingTriggerDecision } = useDuelRoom()

    expect(isCounteringStep.value).toBe(true)
    expect(isAwaitingTriggerDecision.value).toBe(true)
  })

  it('sends a declareAttack message with the attacker and target', () => {
    const sent: Array<{ type: string, message: unknown }> = []
    const { room } = useColyseus()
    room.value = createFakeRoom({
      sessionId: 'session-a',
      phase: 'main',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: 'session-a',
      activePlayerSessionId: 'session-a',
      players: [createFakePlayer('session-a', true), createFakePlayer('session-b', true)],
      send: (type, message) => sent.push({ type, message })
    }) as never

    const { declareAttack } = useDuelRoom()
    declareAttack('leader-a', 'character', 'char-b')

    expect(sent).toEqual([{
      type: 'declareAttack',
      message: { attackerInstanceId: 'leader-a', targetType: 'character', targetInstanceId: 'char-b' }
    }])
  })

  it('sends a declareBlock message, allowing a null blocker for "no block"', () => {
    const sent: Array<{ type: string, message: unknown }> = []
    const { room } = useColyseus()
    room.value = createFakeRoom({
      sessionId: 'session-b',
      phase: 'main',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: 'session-a',
      activePlayerSessionId: 'session-a',
      players: [createFakePlayer('session-a', true), createFakePlayer('session-b', true)],
      send: (type, message) => sent.push({ type, message })
    }) as never

    const { declareBlock } = useDuelRoom()
    declareBlock(null)

    expect(sent).toEqual([{ type: 'declareBlock', message: { blockerInstanceId: null } }])
  })

  it('sends a declareCounter message with the discarded card and bonus', () => {
    const sent: Array<{ type: string, message: unknown }> = []
    const { room } = useColyseus()
    room.value = createFakeRoom({
      sessionId: 'session-b',
      phase: 'main',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: 'session-a',
      activePlayerSessionId: 'session-a',
      players: [createFakePlayer('session-a', true), createFakePlayer('session-b', true)],
      send: (type, message) => sent.push({ type, message })
    }) as never

    const { declareCounter } = useDuelRoom()
    declareCounter('hand-1', 2000)

    expect(sent).toEqual([{ type: 'declareCounter', message: { discardInstanceId: 'hand-1', counterPowerBonus: 2000 } }])
  })

  it('sends a finishCounterStep message', () => {
    const sent: Array<{ type: string, message: unknown }> = []
    const { room } = useColyseus()
    room.value = createFakeRoom({
      sessionId: 'session-b',
      phase: 'main',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: 'session-a',
      activePlayerSessionId: 'session-a',
      players: [createFakePlayer('session-a', true), createFakePlayer('session-b', true)],
      send: (type, message) => sent.push({ type, message })
    }) as never

    const { finishCounterStep } = useDuelRoom()
    finishCounterStep()

    expect(sent).toEqual([{ type: 'finishCounterStep', message: {} }])
  })

  it('sends a resolveTrigger message with the activation decision', () => {
    const sent: Array<{ type: string, message: unknown }> = []
    const { room } = useColyseus()
    room.value = createFakeRoom({
      sessionId: 'session-b',
      phase: 'main',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: 'session-a',
      activePlayerSessionId: 'session-a',
      players: [createFakePlayer('session-a', true), createFakePlayer('session-b', true)],
      send: (type, message) => sent.push({ type, message })
    }) as never

    const { resolveTrigger } = useDuelRoom()
    resolveTrigger(true)

    expect(sent).toEqual([{ type: 'resolveTrigger', message: { activate: true } }])
  })
})

describe('useDuelRoom effect decision helpers', () => {
  it('exposes an active effect decision when Colyseus emits one', () => {
    const { room } = useColyseus()
    const fakeRoom = createFakeRoom({
      sessionId: 'session-a',
      phase: 'main',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: 'session-a',
      activePlayerSessionId: 'session-a',
      players: [createFakePlayer('session-a', true), createFakePlayer('session-b', true)]
    })
    room.value = fakeRoom as never

    const {
      pendingEffectDecision,
      activeDecision,
      isAwaitingEffectDecision
    } = useDuelRoom()

    fakeRoom.emitMessage('pendingEffectDecision', createPendingEffectDecision())

    expect(pendingEffectDecision.value?.id).toBe('decision-1')
    expect(activeDecision.value).toEqual({
      source: 'effect',
      pending: pendingEffectDecision.value
    })
    expect(isAwaitingEffectDecision.value).toBe(true)
  })

  it('serializes a selectChoice decision response', () => {
    const send = vi.fn()
    const { room } = useColyseus()
    const fakeRoom = createFakeRoom({
      sessionId: 'session-a',
      phase: 'main',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: 'session-a',
      activePlayerSessionId: 'session-a',
      players: [createFakePlayer('session-a', true), createFakePlayer('session-b', true)],
      send
    })
    room.value = fakeRoom as never

    const {
      toggleEffectChoiceSelection,
      submitEffectDecision,
      selectedEffectChoiceIds
    } = useDuelRoom()

    fakeRoom.emitMessage('pendingEffectDecision', createPendingEffectDecision({
      prompt: {
        type: 'selectChoice',
        message: 'Choisissez.',
        choices: [
          { id: 'choice-a', label: 'A' },
          { id: 'choice-b', label: 'B' }
        ],
        min: 1,
        max: 2
      }
    }))

    toggleEffectChoiceSelection('choice-a')
    submitEffectDecision()

    expect(selectedEffectChoiceIds.value).toEqual([])
    expect(send).toHaveBeenCalledWith('resolveEffectDecision', {
      decisionId: 'decision-1',
      selectedChoiceIds: ['choice-a']
    })
  })

  it('clears local effect decision state on clearPendingEffectDecision', () => {
    const { room } = useColyseus()
    const fakeRoom = createFakeRoom({
      sessionId: 'session-a',
      phase: 'main',
      startingPlayerSessionId: 'session-a',
      firstPlayerSessionId: 'session-a',
      activePlayerSessionId: 'session-a',
      players: [createFakePlayer('session-a', true), createFakePlayer('session-b', true)]
    })
    room.value = fakeRoom as never

    const { pendingEffectDecision, activeDecision } = useDuelRoom()

    fakeRoom.emitMessage('pendingEffectDecision', createPendingEffectDecision())
    fakeRoom.emitMessage('clearPendingEffectDecision', {})

    expect(pendingEffectDecision.value).toBeNull()
    expect(activeDecision.value).toBeNull()
  })
})
