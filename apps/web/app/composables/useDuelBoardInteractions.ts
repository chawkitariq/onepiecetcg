import type { DuelPlayerView, PrivateCard } from '@onepiecetcg/shared'
import type { Ref } from 'vue'

type PendingEffectDecision = {
  prompt: {
    type: string
  }
} | null

type UseDuelBoardInteractionsOptions = {
  self: Ref<DuelPlayerView | null>
  opponent: Ref<DuelPlayerView | null>
  canAttachDon: Ref<boolean>
  canDeclareAttack: Ref<boolean>
  isBlockingStep: Ref<boolean>
  isCounteringStep: Ref<boolean>
  isSelfDefender: Ref<boolean>
  isChoosingCharacterToDiscard: Ref<boolean>
  pendingCharacterInstanceId: Ref<string | null>
  pendingCounterCardInstanceId: Ref<string | null>
  pendingEffectDecision: Ref<PendingEffectDecision>
  selectableEffectCardIdSet: Ref<Set<string>>
  selectedDonCardIds: Ref<string[]>
  invalidSelfLeaderPulse: Ref<boolean>
  invalidOpponentLeaderPulse: Ref<boolean>
  invalidSelfCharacterIds: Ref<string[]>
  invalidOpponentCharacterIds: Ref<string[]>
  pulseHandCard: (instanceId: string) => void
  clearSelectedHandCards: () => void
  clearSelectedDonCards: () => void
  clearDraggedDonCard: () => void
  endSelfDonCardDrag: () => void
  onSelfHandCardClick: (instanceId: string, options: { ctrlKey: boolean }) => void
  attachDonToTarget: (target: 'leader' | 'character', targetInstanceId?: string) => void
  beginAttackDrag: (instanceId: string) => void
  confirmLeaderTarget: () => void
  confirmCharacterTarget: (instanceId: string) => void
  cancelTargetSelection: () => void
  cacheBoardTravelSource: (card: PrivateCard) => void
  cacheTrashTravelSource: (card: PrivateCard | null | undefined) => void
  playCard: (instanceId: string, targetInstanceId?: string) => void
  declareBlock: (instanceId: string | null) => void
  declareCounter: (instanceId: string, power: number) => void
  toggleEffectCardSelection: (instanceId: string) => void
}

/**
 * Owns DuelBoard-specific click, drag, and invalid-target interaction handlers.
 */
export function useDuelBoardInteractions(options: UseDuelBoardInteractionsOptions) {
  function pulseLeader(target: Ref<boolean>) {
    target.value = true

    window.setTimeout(() => {
      target.value = false
    }, 220)
  }

  function pulseCharacter(target: Ref<string[]>, instanceId: string) {
    target.value = Array.from(new Set([...target.value, instanceId]))

    window.setTimeout(() => {
      target.value = target.value.filter(current => current !== instanceId)
    }, 220)
  }

  function onOpponentLeaderTargetClick() {
    options.confirmLeaderTarget()
  }

  function onOpponentCharacterTargetClick(instanceId: string) {
    const target = options.opponent.value?.characters.find(candidate => candidate.instanceId === instanceId)

    if (!target || !target.rested) {
      pulseCharacter(options.invalidOpponentCharacterIds, instanceId)
      return
    }

    options.confirmCharacterTarget(instanceId)
  }

  function onBlockerCharacterClick(instanceId: string) {
    if (!options.isBlockingStep.value || !options.isSelfDefender.value) {
      return
    }

    const blocker = options.self.value?.characters.find(candidate => candidate.instanceId === instanceId)

    if (!blocker || blocker.rested) {
      pulseCharacter(options.invalidSelfCharacterIds, instanceId)
      return
    }

    options.declareBlock(instanceId)
  }

  function skipBlock() {
    options.declareBlock(null)
  }

  function onCounterHandCardClick(instanceId: string) {
    if (!options.isCounteringStep.value || !options.isSelfDefender.value) {
      return
    }

    const card = options.self.value?.hand.find(candidate => candidate.instanceId === instanceId)

    if (!card) {
      return
    }

    options.pendingCounterCardInstanceId.value = instanceId
  }

  function confirmCounter() {
    if (!options.pendingCounterCardInstanceId.value) {
      return
    }

    const counterCard = options.self.value?.hand.find(candidate => candidate.instanceId === options.pendingCounterCardInstanceId.value)
    options.cacheTrashTravelSource(counterCard)
    options.declareCounter(options.pendingCounterCardInstanceId.value)
    options.pendingCounterCardInstanceId.value = null
  }

  function cancelCounterSelection() {
    options.pendingCounterCardInstanceId.value = null
  }

  function onSelfLeaderClick(_side: 0 | 1) {
    if (options.pendingEffectDecision.value?.prompt.type === 'selectCards' && options.self.value?.leader) {
      if (!options.selectableEffectCardIdSet.value.has(options.self.value.leader.instanceId)) {
        pulseLeader(options.invalidSelfLeaderPulse)
        return
      }

      options.toggleEffectCardSelection(options.self.value.leader.instanceId)
      return
    }

    if (options.canAttachDon.value && options.selectedDonCardIds.value.length > 0) {
      options.attachDonToTarget('leader')
    }
  }

  function onSelfCharacterClick(_side: 0 | 1, instanceId: string) {
    if (options.isChoosingCharacterToDiscard.value && options.pendingCharacterInstanceId.value) {
      const pendingCard = options.self.value?.hand.find(card => card.instanceId === options.pendingCharacterInstanceId.value)

      if (pendingCard) {
        options.cacheBoardTravelSource(pendingCard)
      }

      options.playCard(options.pendingCharacterInstanceId.value, instanceId)
      options.pendingCharacterInstanceId.value = null
      return
    }

    if (options.isBlockingStep.value && options.isSelfDefender.value) {
      onBlockerCharacterClick(instanceId)
      return
    }

    if (options.pendingEffectDecision.value?.prompt.type === 'selectCards') {
      if (!options.selectableEffectCardIdSet.value.has(instanceId)) {
        pulseCharacter(options.invalidSelfCharacterIds, instanceId)
        return
      }

      options.toggleEffectCardSelection(instanceId)
      return
    }

    if (options.canAttachDon.value && options.selectedDonCardIds.value.length > 0) {
      options.attachDonToTarget('character', instanceId)
    }
  }

  function onOpponentLeaderClick() {
    if (options.pendingEffectDecision.value?.prompt.type === 'selectCards' && options.opponent.value?.leader) {
      if (!options.selectableEffectCardIdSet.value.has(options.opponent.value.leader.instanceId)) {
        pulseLeader(options.invalidOpponentLeaderPulse)
        return
      }

      options.toggleEffectCardSelection(options.opponent.value.leader.instanceId)
      return
    }

    onOpponentLeaderTargetClick()
  }

  function onOpponentCharacterClick(_side: 0 | 1, instanceId: string) {
    if (options.pendingEffectDecision.value?.prompt.type === 'selectCards') {
      if (!options.selectableEffectCardIdSet.value.has(instanceId)) {
        pulseCharacter(options.invalidOpponentCharacterIds, instanceId)
        return
      }

      options.toggleEffectCardSelection(instanceId)
      return
    }

    onOpponentCharacterTargetClick(instanceId)
  }

  function onSelfLeaderAttackStart() {
    if (!options.self.value?.leader || options.self.value.leader.rested || !options.canDeclareAttack.value) {
      pulseLeader(options.invalidSelfLeaderPulse)
      return
    }

    options.beginAttackDrag(options.self.value.leader.instanceId)
  }

  function onSelfCharacterAttackStart(_side: 0 | 1, instanceId: string) {
    const character = options.self.value?.characters.find(candidate => candidate.instanceId === instanceId)

    if (!character || character.rested || character.playedThisTurn || !options.canDeclareAttack.value) {
      pulseCharacter(options.invalidSelfCharacterIds, instanceId)
      return
    }

    options.beginAttackDrag(instanceId)
  }

  function onSelfHandCardOrCounterClick(instanceId: string, clickOptions: { ctrlKey: boolean }) {
    if (options.pendingEffectDecision.value?.prompt.type === 'selectCards') {
      if (!options.selectableEffectCardIdSet.value.has(instanceId)) {
        options.pulseHandCard(instanceId)
        return
      }

      options.toggleEffectCardSelection(instanceId)
      return
    }

    if (options.isCounteringStep.value && options.isSelfDefender.value) {
      if (!clickOptions.ctrlKey) {
        options.clearSelectedHandCards()
      }

      onCounterHandCardClick(instanceId)
      return
    }

    options.onSelfHandCardClick(instanceId, clickOptions)
  }

  function cancelDiscardSelection() {
    options.pendingCharacterInstanceId.value = null
  }

  function clearTransientBoardSelections() {
    options.clearSelectedHandCards()
    options.clearSelectedDonCards()
    options.clearDraggedDonCard()
  }

  function onSelfDonCardDragEnd() {
    clearTransientBoardSelections()
    options.endSelfDonCardDrag()
  }

  return {
    cancelCounterSelection,
    cancelDiscardSelection,
    clearTransientBoardSelections,
    confirmCounter,
    onOpponentCharacterClick,
    onOpponentLeaderClick,
    onSelfCharacterAttackStart,
    onSelfCharacterClick,
    onSelfDonCardDragEnd,
    onSelfHandCardOrCounterClick,
    onSelfLeaderAttackStart,
    onSelfLeaderClick,
    pulseCharacter,
    pulseLeader,
    skipBlock
  }
}
