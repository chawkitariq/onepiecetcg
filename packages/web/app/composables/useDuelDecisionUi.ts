import type { DuelPlayerView, EffectTargetSelector, PendingEffectDecision, PublicCard } from '@onepiecetcg/shared'
import type {
  DuelDecisionSubmitState,
  DuelEffectChoiceView,
  DuelSelectableContext,
  DuelUiDecision
} from '~/utils/duelDecision'

type DuelDecisionUiOptions = {
  self: ComputedRef<DuelPlayerView | null>
  opponent: ComputedRef<DuelPlayerView | null>
  selfSessionId: ComputedRef<string | null>
  activePlayerSessionId: ComputedRef<string | null>
  isBlockingStep: ComputedRef<boolean>
  isCounteringStep: ComputedRef<boolean>
  isAwaitingTriggerDecision: ComputedRef<boolean>
  isSelfDefender: ComputedRef<boolean>
  pendingEffectDecision: Ref<PendingEffectDecision | null>
  effectDecisionWaitingOnSessionId: Ref<string | null>
  resolveEffectDecision: (response: {
    decisionId: string
    confirmed?: boolean
    selectedCardInstanceIds?: string[]
    selectedChoiceIds?: string[]
  }) => void
}

type CardOwner = 'self' | 'opponent'

function selectorIncludesSession(
  selectorPlayer: EffectTargetSelector['player'],
  controllerSessionId: string,
  candidateSessionId: string,
  opponentSessionId: string | null
) {
  if (selectorPlayer === 'either') {
    return true
  }

  if (selectorPlayer === 'self') {
    return candidateSessionId === controllerSessionId
  }

  return Boolean(opponentSessionId && candidateSessionId === opponentSessionId)
}

function collectZoneCards(player: DuelPlayerView, zone: string): PublicCard[] {
  if (zone === 'leader') {
    return player.leader ? [player.leader] : []
  }

  if (zone === 'stage') {
    return player.stage ? [player.stage] : []
  }

  if (zone === 'characters' || zone === 'cost' || zone === 'trash') {
    return player[zone]
  }

  if (zone === 'hand' || zone === 'life' || zone === 'deck') {
    return player[zone]
  }

  return []
}

function cardMatchesSelectorFilter(
  card: PublicCard,
  filter: EffectTargetSelector['filter'],
  controllerSessionId: string,
  opponentSessionId: string | null
) {
  if (!filter) {
    return true
  }

  if (filter.cardCategory && !filter.cardCategory.includes(card.type)) {
    return false
  }

  if (typeof filter.costMax === 'number' && (card.cost ?? Number.POSITIVE_INFINITY) > filter.costMax) {
    return false
  }

  if (typeof filter.costMin === 'number' && (card.cost ?? Number.NEGATIVE_INFINITY) < filter.costMin) {
    return false
  }

  if (typeof filter.powerMax === 'number' && (card.power ?? Number.POSITIVE_INFINITY) > filter.powerMax) {
    return false
  }

  if (typeof filter.powerMin === 'number' && (card.power ?? Number.NEGATIVE_INFINITY) < filter.powerMin) {
    return false
  }

  if (filter.color && !filter.color.some(color => card.colors.includes(color))) {
    return false
  }

  if (filter.name && !filter.name.includes(card.name)) {
    return false
  }

  if (filter.excludeName && filter.excludeName.includes(card.name)) {
    return false
  }

  if (typeof filter.rested === 'boolean' && card.rested !== filter.rested) {
    return false
  }

  if (filter.owner === 'self' && card.instanceId.split(':')[0] !== controllerSessionId) {
    return false
  }

  if (filter.owner === 'opponent') {
    if (!opponentSessionId) {
      return false
    }

    if (card.instanceId.split(':')[0] !== opponentSessionId) {
      return false
    }
  }

  return true
}

function getSelectableCardsForEffectDecision(
  decision: PendingEffectDecision | null,
  self: DuelPlayerView | null,
  opponent: DuelPlayerView | null
) {
  if (!decision || decision.prompt.type !== 'selectCards' || !self) {
    return []
  }

  const controllerSessionId = decision.playerSessionId
  const opponentSessionId = opponent?.sessionId ?? null
  const selectablePlayers = [self, opponent].filter((player): player is DuelPlayerView => Boolean(player))
  const selectableCards: PublicCard[] = []

  for (const player of selectablePlayers) {
    if (!selectorIncludesSession(
      decision.prompt.selector.player,
      controllerSessionId,
      player.sessionId,
      opponentSessionId
    )) {
      continue
    }

    for (const zone of decision.prompt.selector.zones) {
      for (const card of collectZoneCards(player, zone)) {
        if (cardMatchesSelectorFilter(card, decision.prompt.selector.filter, controllerSessionId, opponentSessionId)) {
          selectableCards.push(card)
        }
      }
    }
  }

  return selectableCards
}

/** Builds a unified UI decision model and local selection state for generic effect prompts. */
export function useDuelDecisionUi(options: DuelDecisionUiOptions) {
  const selectedEffectCardIds = ref<string[]>([])
  const selectedEffectChoiceIds = ref<string[]>([])

  const activeDecision = computed<DuelUiDecision | null>(() => {
    if (options.isAwaitingTriggerDecision.value && options.isSelfDefender.value) {
      return { source: 'combat', kind: 'trigger' }
    }

    if (options.isCounteringStep.value && options.isSelfDefender.value) {
      return { source: 'combat', kind: 'counter' }
    }

    if (options.isBlockingStep.value && options.isSelfDefender.value) {
      return { source: 'combat', kind: 'block' }
    }

    if (options.pendingEffectDecision.value) {
      return { source: 'effect', pending: options.pendingEffectDecision.value }
    }

    return null
  })

  const selectableEffectCards = computed(() =>
    getSelectableCardsForEffectDecision(
      options.pendingEffectDecision.value,
      options.self.value,
      options.opponent.value
    )
  )

  const selectableContext = computed<DuelSelectableContext>(() => {
    if (options.isBlockingStep.value && options.isSelfDefender.value) {
      return {
        source: 'combat',
        kind: 'block',
        selector: null,
        selectableCardInstanceIds: options.self.value?.characters
          .filter(character => !character.rested)
          .map(character => character.instanceId) ?? [],
        revealedCardInstanceIds: []
      }
    }

    const decision = options.pendingEffectDecision.value

    if (decision?.prompt.type === 'selectCards') {
      return {
        source: 'effect',
        kind: 'selectCards',
        selector: decision.prompt.selector,
        selectableCardInstanceIds: selectableEffectCards.value.map(card => card.instanceId),
        revealedCardInstanceIds: decision.prompt.revealedCards ?? []
      }
    }

    return {
      source: null,
      kind: 'none',
      selector: null,
      selectableCardInstanceIds: [],
      revealedCardInstanceIds: []
    }
  })

  const isAwaitingEffectDecision = computed(() =>
    Boolean(options.effectDecisionWaitingOnSessionId.value)
  )

  const effectChoiceViews = computed<DuelEffectChoiceView[]>(() => {
    const decision = options.pendingEffectDecision.value

    if (decision?.prompt.type !== 'selectChoice') {
      return []
    }

    return decision.prompt.choices.map(choice => ({
      ...choice,
      selected: selectedEffectChoiceIds.value.includes(choice.id)
    }))
  })

  const effectDecisionSubmitState = computed<DuelDecisionSubmitState>(() => {
    const decision = options.pendingEffectDecision.value

    if (!decision) {
      return { canSubmit: false, reason: null }
    }

    if (decision.prompt.type === 'confirm') {
      return { canSubmit: true, reason: null }
    }

    if (decision.prompt.type === 'selectCards') {
      const count = selectedEffectCardIds.value.length

      if (count < decision.prompt.min) {
        return {
          canSubmit: false,
          reason: `Sélectionnez au moins ${decision.prompt.min} carte(s).`
        }
      }

      if (count > decision.prompt.max) {
        return {
          canSubmit: false,
          reason: `Sélectionnez au maximum ${decision.prompt.max} carte(s).`
        }
      }

      return { canSubmit: true, reason: null }
    }

    const count = selectedEffectChoiceIds.value.length

    if (count < decision.prompt.min) {
      return {
        canSubmit: false,
        reason: `Sélectionnez au moins ${decision.prompt.min} choix.`
      }
    }

    if (count > decision.prompt.max) {
      return {
        canSubmit: false,
        reason: `Sélectionnez au maximum ${decision.prompt.max} choix.`
      }
    }

    return { canSubmit: true, reason: null }
  })

  function resetSelections() {
    selectedEffectCardIds.value = []
    selectedEffectChoiceIds.value = []
  }

  function toggleEffectCardSelection(instanceId: string) {
    const decision = options.pendingEffectDecision.value

    if (decision?.prompt.type !== 'selectCards') {
      return
    }

    if (!selectableContext.value.selectableCardInstanceIds.includes(instanceId)) {
      return
    }

    if (selectedEffectCardIds.value.includes(instanceId)) {
      selectedEffectCardIds.value = selectedEffectCardIds.value.filter(id => id !== instanceId)
      return
    }

    if (selectedEffectCardIds.value.length >= decision.prompt.max) {
      return
    }

    selectedEffectCardIds.value = [...selectedEffectCardIds.value, instanceId]
  }

  function toggleEffectChoiceSelection(choiceId: string) {
    const decision = options.pendingEffectDecision.value

    if (decision?.prompt.type !== 'selectChoice') {
      return
    }

    if (selectedEffectChoiceIds.value.includes(choiceId)) {
      selectedEffectChoiceIds.value = selectedEffectChoiceIds.value.filter(id => id !== choiceId)
      return
    }

    if (selectedEffectChoiceIds.value.length >= decision.prompt.max) {
      return
    }

    selectedEffectChoiceIds.value = [...selectedEffectChoiceIds.value, choiceId]
  }

  function submitEffectDecision() {
    const decision = options.pendingEffectDecision.value

    if (!decision || !effectDecisionSubmitState.value.canSubmit) {
      return
    }

    if (decision.prompt.type === 'confirm') {
      options.resolveEffectDecision({
        decisionId: decision.id,
        confirmed: true
      })
      resetSelections()
      return
    }

    if (decision.prompt.type === 'selectCards') {
      options.resolveEffectDecision({
        decisionId: decision.id,
        selectedCardInstanceIds: selectedEffectCardIds.value
      })
      resetSelections()
      return
    }

    options.resolveEffectDecision({
      decisionId: decision.id,
      selectedChoiceIds: selectedEffectChoiceIds.value
    })
    resetSelections()
  }

  function declineEffectDecision() {
    const decision = options.pendingEffectDecision.value

    if (decision?.prompt.type !== 'confirm') {
      return
    }

    options.resolveEffectDecision({
      decisionId: decision.id,
      confirmed: false
    })
    resetSelections()
  }

  function cancelEffectDecisionSelection() {
    resetSelections()
  }

  watch(() => options.pendingEffectDecision.value?.id ?? null, () => {
    resetSelections()
  })

  return {
    activeDecision,
    selectableContext,
    selectableEffectCards,
    effectChoiceViews,
    isAwaitingEffectDecision,
    selectedEffectCardIds,
    selectedEffectChoiceIds,
    effectDecisionSubmitState,
    toggleEffectCardSelection,
    toggleEffectChoiceSelection,
    submitEffectDecision,
    declineEffectDecision,
    cancelEffectDecisionSelection
  }
}
