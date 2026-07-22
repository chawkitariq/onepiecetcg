import type { DuelLogEntry, DuelPlayerView, PrivateCard, PublicCard } from '@onepiecetcg/shared'

/** Wire-level shape of a DuelCard as decoded from packages/api/src/realtime/duel-state.schema.ts. */
type WireDuelCard = {
  instanceId: string
  cardId: string
  number: string
  name: string
  type: PublicCard['type']
  colors: PublicCard['colors']
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

type WireDuelZones = {
  deck: unknown
  donDeck: unknown
  hand: unknown
  life: unknown
  characters: unknown
  cost: unknown
  trash: unknown
  leader: WireDuelCard
  stage: WireDuelCard
}

type WireDuelPlayer = {
  sessionId: string
  displayName: string
  deckId: string
  ready: boolean
  connected: boolean
  handCount: number
  deckCount: number
  lifeCount: number
  zones: WireDuelZones
}

function toPublicCard(card: WireDuelCard): PublicCard {
  return {
    instanceId: card.instanceId,
    cardId: card.cardId,
    number: card.number,
    name: card.name,
    type: card.type,
    colors: card.colors,
    cost: card.cost === -1 ? null : card.cost,
    power: card.power === -1 ? null : card.power,
    life: card.life === -1 ? null : card.life,
    counter: card.counter === -1 ? null : card.counter,
    imageUrl: card.imageUrl || null,
    rested: card.rested,
    attachedDon: card.attachedDon,
    playedThisTurn: card.playedThisTurn
  }
}

function toPrivateCard(card: WireDuelCard): PrivateCard {
  return {
    ...toPublicCard(card),
    text: card.text,
    trigger: card.trigger || null
  }
}

function toOptionalPublicCard(card: WireDuelCard | undefined): PublicCard | null {
  return card && card.instanceId ? toPublicCard(card) : null
}

/** Bridges the real Colyseus wire shape (zones-nested, DuelCard[]) into the flat DuelPlayerView the UI renders. */
function toDuelPlayerView(player: WireDuelPlayer): DuelPlayerView {
  const zones = player.zones

  return {
    sessionId: player.sessionId,
    displayName: player.displayName,
    deckId: player.deckId,
    ready: player.ready,
    connected: player.connected,
    leader: toOptionalPublicCard(zones.leader),
    stage: toOptionalPublicCard(zones.stage),
    characters: colyseusArrayValues<WireDuelCard>(zones.characters).map(toPublicCard),
    cost: colyseusArrayValues<WireDuelCard>(zones.cost).map(toPublicCard),
    trash: colyseusArrayValues<WireDuelCard>(zones.trash).map(toPublicCard),
    donDeckCount: colyseusArrayValues<WireDuelCard>(zones.donDeck).length,
    hand: colyseusArrayValues<WireDuelCard>(zones.hand).map(toPrivateCard),
    handCount: player.handCount,
    deck: colyseusArrayValues<WireDuelCard>(zones.deck).map(toPrivateCard),
    deckCount: player.deckCount,
    life: colyseusArrayValues<WireDuelCard>(zones.life).map(toPrivateCard),
    lifeCount: player.lifeCount
  }
}

/**
 * Derives a plain, reactive snapshot of the connected duel room's state for
 * rendering -- bridging the live Colyseus MapSchema/ArraySchema instances
 * into the flat, ordered [self, opponent] shape PlayZone/DuelBoard expect,
 * keyed off the local client's own sessionId rather than an externally
 * supplied index.
 */
export function useDuelRoom() {
  const { room } = useColyseus()
  const version = ref(0)

  function onRoomStateChange() {
    version.value += 1
  }

  watch(room, (nextRoom, previousRoom) => {
    previousRoom?.onStateChange.remove(onRoomStateChange)
    nextRoom?.onStateChange(onRoomStateChange)
  }, { immediate: true })

  onScopeDispose(() => {
    room.value?.onStateChange.remove(onRoomStateChange)
  })

  const phase = computed(() => {
    void version.value

    return room.value?.state.phase ?? 'setup'
  })

  const activePlayerSessionId = computed(() => {
    void version.value

    // The wire-level DuelState still exposes a flat activePlayerSessionId
    // rather than the nested ActivePlayer shape DuelRoomView declares --
    // read the real field name here rather than the aspirational shared type.
    const state = room.value?.state as unknown as { activePlayerSessionId?: string } | undefined

    return state?.activePlayerSessionId || null
  })

  const players = computed(() => {
    void version.value

    return colyseusMapValues<WireDuelPlayer>(room.value?.state.players).map(toDuelPlayerView)
  })

  const selfSessionId = computed(() => room.value?.sessionId ?? null)

  const self = computed(() =>
    players.value.find(player => player.sessionId === selfSessionId.value) ?? null
  )

  const opponent = computed(() =>
    players.value.find(player => player.sessionId !== selfSessionId.value) ?? null
  )

  const isSelfTurn = computed(() =>
    selfSessionId.value !== null && activePlayerSessionId.value === selfSessionId.value
  )

  const logs = computed(() => {
    void version.value

    return colyseusArrayValues<DuelLogEntry>(room.value?.state.logs)
  })

  return {
    phase,
    activePlayerSessionId,
    players,
    self,
    opponent,
    isSelfTurn,
    logs
  }
}
