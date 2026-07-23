import { describe, expect, it } from 'vitest'

type FakeCard = {
  instanceId: string
  cardId: string
  number: string
  name: string
  type: string
  colors: string[]
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
      deck: [],
      donDeck: [],
      hand: [],
      life: [],
      characters: [],
      cost: [],
      trash: [],
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
  players: Array<ReturnType<typeof createFakePlayer>>
}) {
  return {
    sessionId: options.sessionId,
    state: {
      phase: options.phase,
      startingPlayerSessionId: options.startingPlayerSessionId,
      firstPlayerSessionId: options.firstPlayerSessionId,
      activePlayerSessionId: '',
      players: {
        values: () => options.players.values()
      },
      logs: []
    },
    onStateChange: Object.assign(() => {}, { remove: () => {} }),
    send: () => {}
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
