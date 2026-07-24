import type { DuelLogEntry, DuelPlayerView, FirstOrSecondChoice, PrivateCard, PublicCard } from '@onepiecetcg/shared'

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
  mulliganDecided: boolean
  hasTakenFirstTurn: boolean
  handCount: number
  deckCount: number
  lifeCount: number
  zones: WireDuelZones
}

type WireDuelCombat = {
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
    mulliganDecided: player.mulliganDecided,
    hasTakenFirstTurn: player.hasTakenFirstTurn,
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
type ActionErrorMessage = {
  message: string
}

/** Maps the live Colyseus duel room into UI-friendly computed state and actions. */
export function useDuelRoom() {
  const { room, sendMessage } = useColyseus()
  const version = ref(0)
  const errorMessage = ref<string | null>(null)

  function onRoomStateChange() {
    version.value += 1
  }

  function onActionError(payload: ActionErrorMessage) {
    errorMessage.value = payload.message
  }

  watch(room, (nextRoom, previousRoom) => {
    previousRoom?.onStateChange.remove(onRoomStateChange)
    nextRoom?.onStateChange(onRoomStateChange)
    nextRoom?.onMessage?.('actionError', onActionError)

    // A reconnect swaps in a brand-new Room instance carrying the latest
    // full state, but nothing guarantees a fresh onStateChange patch
    // follows immediately -- force a re-render now so the UI can't be left
    // showing a stale combat/phase prompt until the next incremental patch.
    if (nextRoom) {
      version.value += 1
    }
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
  const isOpponentDisconnected = computed(() => Boolean(opponent.value && !opponent.value.connected))

  const logs = computed(() => {
    void version.value

    return colyseusArrayValues<DuelLogEntry>(room.value?.state.logs)
  })

  const startingPlayerSessionId = computed(() => {
    void version.value

    const state = room.value?.state as unknown as { startingPlayerSessionId?: string } | undefined

    return state?.startingPlayerSessionId || null
  })

  const firstPlayerSessionId = computed(() => {
    void version.value

    const state = room.value?.state as unknown as { firstPlayerSessionId?: string } | undefined

    return state?.firstPlayerSessionId || null
  })

  const isSelfDesignatedToChoose = computed(() =>
    selfSessionId.value !== null && startingPlayerSessionId.value === selfSessionId.value
  )

  const isSelfTurnToMulligan = computed(() => {
    if (!firstPlayerSessionId.value || !self.value || self.value.mulliganDecided) {
      return false
    }

    if (selfSessionId.value === firstPlayerSessionId.value) {
      return true
    }

    const firstPlayer = players.value.find(player => player.sessionId === firstPlayerSessionId.value)

    return firstPlayer?.mulliganDecided ?? false
  })

  function chooseFirstOrSecond(choice: FirstOrSecondChoice) {
    sendMessage('chooseFirstOrSecond', { choice })
  }

  function mulligan(shouldMulligan: boolean) {
    sendMessage('mulligan', { mulligan: shouldMulligan })
  }

  const isMainPhase = computed(() => phase.value === 'main')

  const canEndPhase = computed(() =>
    isSelfTurn.value && phase.value !== 'setup' && phase.value !== 'mulligan' && phase.value !== 'finished'
  )

  const selfUntappedDonCount = computed(() =>
    self.value?.cost.filter(card => !card.rested).length ?? 0
  )

  /**
   * DON!! attached to a Leader/Character only grants +1000 power "during
   * your turn" (docs/rule_comprehensive.md 6-5-5-2) -- pass whether it's
   * currently the card owner's turn to include the bonus, mirroring the
   * server-side gate in duel.room.ts cardPower().
   */
  function cardPower(card: PublicCard, isOwnerTurn: boolean): number {
    const donBonus = isOwnerTurn ? card.attachedDon * 1000 : 0

    return (card.power ?? 0) + donBonus
  }

  function endPhase() {
    errorMessage.value = null
    sendMessage('endPhase', {})
  }

  function playCard(instanceId: string, discardCharacterInstanceId?: string) {
    errorMessage.value = null
    sendMessage('playCard', { instanceId, discardCharacterInstanceId })
  }

  const isSelfCharacterZoneFull = computed(() => (self.value?.characters.length ?? 0) >= 5)

  function attachDon(target: 'leader' | 'character', targetInstanceId?: string) {
    errorMessage.value = null
    sendMessage('attachDon', { target, targetInstanceId })
  }

  function clearError() {
    errorMessage.value = null
  }

  const combat = computed(() => {
    void version.value

    const state = room.value?.state as unknown as { combat?: WireDuelCombat } | undefined
    const wireCombat = state?.combat

    if (!wireCombat || !wireCombat.attackerInstanceId) {
      return null
    }

    return wireCombat
  })

  const isCombatInProgress = computed(() => combat.value !== null)

  const isSelfAttacker = computed(() =>
    combat.value !== null && combat.value.attackerSessionId === selfSessionId.value
  )

  const isSelfDefender = computed(() =>
    combat.value !== null && combat.value.defenderSessionId === selfSessionId.value
  )

  const canDeclareAttack = computed(() =>
    isSelfTurn.value
    && isMainPhase.value
    && !isCombatInProgress.value
    && (self.value?.hasTakenFirstTurn ?? false)
  )

  const isBlockingStep = computed(() => combat.value?.step === 'blocked')
  const isCounteringStep = computed(() => combat.value?.step === 'countering')
  const isAwaitingTriggerDecision = computed(() => combat.value?.awaitingTriggerDecision ?? false)

  function declareAttack(attackerInstanceId: string, targetType: 'leader' | 'character', targetInstanceId?: string) {
    errorMessage.value = null
    sendMessage('declareAttack', { attackerInstanceId, targetType, targetInstanceId })
  }

  function declareBlock(blockerInstanceId: string | null) {
    errorMessage.value = null
    sendMessage('declareBlock', { blockerInstanceId })
  }

  function declareCounter(discardInstanceId: string, counterPowerBonus: number) {
    errorMessage.value = null
    sendMessage('declareCounter', { discardInstanceId, counterPowerBonus })
  }

  function finishCounterStep() {
    errorMessage.value = null
    sendMessage('finishCounterStep', {})
  }

  function resolveTrigger(activate: boolean) {
    errorMessage.value = null
    sendMessage('resolveTrigger', { activate })
  }

  return {
    phase,
    activePlayerSessionId,
    startingPlayerSessionId,
    firstPlayerSessionId,
    isSelfDesignatedToChoose,
    isSelfTurnToMulligan,
    players,
    self,
    opponent,
    isOpponentDisconnected,
    selfSessionId,
    isSelfTurn,
    isMainPhase,
    canEndPhase,
    selfUntappedDonCount,
    isSelfCharacterZoneFull,
    logs,
    errorMessage,
    cardPower,
    chooseFirstOrSecond,
    mulligan,
    endPhase,
    playCard,
    attachDon,
    clearError,
    combat,
    isCombatInProgress,
    isSelfAttacker,
    isSelfDefender,
    canDeclareAttack,
    isBlockingStep,
    isCounteringStep,
    isAwaitingTriggerDecision,
    declareAttack,
    declareBlock,
    declareCounter,
    finishCounterStep,
    resolveTrigger
  }
}
