import type { DuelLogEntry, DuelPlayerView, FirstOrSecondChoice, PrivateCard, PublicCard } from '@onepiecetcg/shared'

/** Wire-level shape of a DuelCard as decoded from the shared Colyseus schema. */
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

type PartialWireDuelPlayer = Partial<WireDuelPlayer> & {
  sessionId?: string
  zones?: Partial<WireDuelZones>
}

export type WireDuelCombat = {
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

type DuelRoomState = {
  phase: ComputedRef<string>
  turn: ComputedRef<number>
  winnerSessionId: ComputedRef<string | null>
  startedAt: ComputedRef<string | null>
  finishedAt: ComputedRef<string | null>
  activePlayerSessionId: ComputedRef<string | null>
  startingPlayerSessionId: ComputedRef<string | null>
  firstPlayerSessionId: ComputedRef<string | null>
  isSelfDesignatedToChoose: ComputedRef<boolean>
  isSelfTurnToMulligan: ComputedRef<boolean>
  players: ComputedRef<DuelPlayerView[]>
  self: ComputedRef<DuelPlayerView | null>
  opponent: ComputedRef<DuelPlayerView | null>
  selfSessionId: ComputedRef<string | null>
  isSelfTurn: ComputedRef<boolean>
  isMainPhase: ComputedRef<boolean>
  canEndPhase: ComputedRef<boolean>
  selfUntappedDonCount: ComputedRef<number>
  isSelfCharacterZoneFull: ComputedRef<boolean>
  logs: ComputedRef<DuelLogEntry[]>
  combat: ComputedRef<WireDuelCombat | null>
  isCombatInProgress: ComputedRef<boolean>
  isSelfAttacker: ComputedRef<boolean>
  isSelfDefender: ComputedRef<boolean>
  canDeclareAttack: ComputedRef<boolean>
  isBlockingStep: ComputedRef<boolean>
  isCounteringStep: ComputedRef<boolean>
  isAwaitingTriggerDecision: ComputedRef<boolean>
  isOpponentDisconnected: ComputedRef<boolean>
  cardPower: (card: PublicCard, isOwnerTurn: boolean) => number
  chooseFirstOrSecond: (choice: FirstOrSecondChoice) => void
  mulligan: (shouldMulligan: boolean) => void
  endPhase: () => void
  playCard: (instanceId: string, discardCharacterInstanceId?: string) => void
  attachDon: (target: 'leader' | 'character', targetInstanceId?: string, count?: number) => void
  declareAttack: (attackerInstanceId: string, targetType: 'leader' | 'character', targetInstanceId?: string) => void
  declareBlock: (blockerInstanceId: string | null) => void
  declareCounter: (discardInstanceId: string, counterPowerBonus: number) => void
  finishCounterStep: () => void
  resolveTrigger: (activate: boolean) => void
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
    baseCost: card.baseCost === -1 ? null : card.baseCost,
    basePower: card.basePower === -1 ? null : card.basePower,
    power: card.power === -1 ? null : card.power,
    life: card.life === -1 ? null : card.life,
    counter: card.counter === -1 ? null : card.counter,
    attributes: [...card.attributes],
    families: [...card.families],
    imageUrl: card.imageUrl || null,
    rested: card.rested,
    attachedDon: card.attachedDon,
    playedThisTurn: card.playedThisTurn,
    hasRush: card.hasRush,
    hasDoubleAttack: card.hasDoubleAttack,
    hasBanish: card.hasBanish,
    canAttackActiveCharacters: card.canAttackActiveCharacters,
    mustBeAttackTarget: card.mustBeAttackTarget,
    cannotAttack: card.cannotAttack,
    cannotAttackLeaderOnTurnPlayed: card.cannotAttackLeaderOnTurnPlayed,
    cannotBlock: card.cannotBlock,
    cannotBeKoedInBattle: card.cannotBeKoedInBattle,
    cannotBeKoedByEffects: card.cannotBeKoedByEffects,
    cannotBeKoedBySlashInBattle: card.cannotBeKoedBySlashInBattle,
    cannotBeKoedByStrikeInBattle: card.cannotBeKoedByStrikeInBattle,
    winOnDeckOut: card.winOnDeckOut,
    cannotAttackUntilTurn: card.cannotAttackUntilTurn,
    skipNextRefreshPhases: card.skipNextRefreshPhases
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

function hasInitializedZones(
  player: PartialWireDuelPlayer
): player is WireDuelPlayer {
  return Boolean(
    player.sessionId
    && player.zones
    && player.zones.leader
    && player.zones.stage
    && player.zones.deck
    && player.zones.donDeck
    && player.zones.hand
    && player.zones.life
    && player.zones.characters
    && player.zones.cost
    && player.zones.trash
  )
}

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

/** Maps structural room state into the flat duel view consumed by the board. */
export function useDuelRoomState(version: Ref<number>): DuelRoomState {
  const { room, sendMessage } = useColyseus()

  const phase = computed(() => {
    void version.value

    return room.value?.state.phase ?? 'setup'
  })

  const turn = computed(() => {
    void version.value

    const state = room.value?.state as unknown as { turn?: number } | undefined

    return state?.turn ?? 0
  })

  const activePlayerSessionId = computed(() => {
    void version.value

    const state = room.value?.state as unknown as { activePlayerSessionId?: string } | undefined

    return state?.activePlayerSessionId || null
  })

  const winnerSessionId = computed(() => {
    void version.value

    const state = room.value?.state as unknown as { winnerSessionId?: string } | undefined

    return state?.winnerSessionId || null
  })

  const startedAt = computed(() => {
    void version.value

    const state = room.value?.state as unknown as { startedAt?: string } | undefined

    return state?.startedAt || null
  })

  const finishedAt = computed(() => {
    void version.value

    const state = room.value?.state as unknown as { finishedAt?: string } | undefined

    return state?.finishedAt || null
  })

  const players = computed(() => {
    void version.value

    return colyseusMapValues<PartialWireDuelPlayer>(room.value?.state.players)
      .filter(hasInitializedZones)
      .map(toDuelPlayerView)
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

  const isMainPhase = computed(() => phase.value === 'main')
  const canEndPhase = computed(() => isSelfTurn.value && phase.value === 'main')
  const selfUntappedDonCount = computed(() =>
    self.value?.cost.filter(card => !card.rested).length ?? 0
  )

  /** Mirrors the server-side DON!! power gate, which only applies during the owner's turn. */
  function cardPower(card: PublicCard, isOwnerTurn: boolean): number {
    const donBonus = isOwnerTurn ? card.attachedDon * 1000 : 0

    return (card.power ?? 0) + donBonus
  }

  const isSelfCharacterZoneFull = computed(() => (self.value?.characters.length ?? 0) >= 5)

  const combat = computed(() => {
    void version.value

    const state = room.value?.state as unknown as { combat?: WireDuelCombat } | undefined
    const wireCombat = state?.combat

    if (!wireCombat || !wireCombat.attackerInstanceId) {
      return null
    }

    return { ...wireCombat }
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
  const isOpponentDisconnected = computed(() => Boolean(opponent.value && !opponent.value.connected))

  function chooseFirstOrSecond(choice: FirstOrSecondChoice) {
    sendMessage('chooseFirstOrSecond', { choice })
  }

  function mulligan(shouldMulligan: boolean) {
    sendMessage('mulligan', { mulligan: shouldMulligan })
  }

  function endPhase() {
    sendMessage('endPhase', {})
  }

  function playCard(instanceId: string, discardCharacterInstanceId?: string) {
    sendMessage('playCard', { instanceId, discardCharacterInstanceId })
  }

  function attachDon(target: 'leader' | 'character', targetInstanceId?: string, count?: number) {
    sendMessage('attachDon', { target, targetInstanceId, count })
  }

  function declareAttack(attackerInstanceId: string, targetType: 'leader' | 'character', targetInstanceId?: string) {
    sendMessage('declareAttack', { attackerInstanceId, targetType, targetInstanceId })
  }

  function declareBlock(blockerInstanceId: string | null) {
    sendMessage('declareBlock', { blockerInstanceId })
  }

  function declareCounter(discardInstanceId: string, counterPowerBonus: number) {
    sendMessage('declareCounter', { discardInstanceId, counterPowerBonus })
  }

  function finishCounterStep() {
    sendMessage('finishCounterStep', {})
  }

  function resolveTrigger(activate: boolean) {
    sendMessage('resolveTrigger', { activate })
  }

  return {
    phase,
    turn,
    winnerSessionId,
    startedAt,
    finishedAt,
    activePlayerSessionId,
    startingPlayerSessionId,
    firstPlayerSessionId,
    isSelfDesignatedToChoose,
    isSelfTurnToMulligan,
    players,
    self,
    opponent,
    selfSessionId,
    isSelfTurn,
    isMainPhase,
    canEndPhase,
    selfUntappedDonCount,
    isSelfCharacterZoneFull,
    logs,
    combat,
    isCombatInProgress,
    isSelfAttacker,
    isSelfDefender,
    canDeclareAttack,
    isBlockingStep,
    isCounteringStep,
    isAwaitingTriggerDecision,
    isOpponentDisconnected,
    cardPower,
    chooseFirstOrSecond,
    mulligan,
    endPhase,
    playCard,
    attachDon,
    declareAttack,
    declareBlock,
    declareCounter,
    finishCounterStep,
    resolveTrigger
  }
}
