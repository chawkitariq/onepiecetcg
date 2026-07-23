import { describe, expect, it } from 'vitest'
import type { CardColor, CardType } from '@onepiecetcg/shared'

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

function createFakeRoom(options: {
  sessionId: string
  phase: string
  startingPlayerSessionId: string
  firstPlayerSessionId: string
  activePlayerSessionId?: string
  players: Array<ReturnType<typeof createFakePlayer>>
  send?: (type: string, message: unknown) => void
}) {
  return {
    sessionId: options.sessionId,
    state: {
      phase: options.phase,
      startingPlayerSessionId: options.startingPlayerSessionId,
      firstPlayerSessionId: options.firstPlayerSessionId,
      activePlayerSessionId: options.activePlayerSessionId ?? '',
      players: {
        values: () => options.players.values()
      },
      logs: []
    },
    onStateChange: Object.assign(() => {}, { remove: () => {} }),
    onMessage: () => {},
    send: options.send ?? (() => {})
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
  it('only allows ending the phase during an active, in-progress turn', () => {
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

  it('computes displayed power as base power plus 1000 per attached DON!!', () => {
    const { cardPower } = useDuelRoom()

    expect(cardPower(createFakeCard({ power: 3000, attachedDon: 2 }))).toBe(5000)
    expect(cardPower(createFakeCard({ power: 1000, attachedDon: 0 }))).toBe(1000)
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
