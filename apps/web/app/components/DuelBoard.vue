<script setup lang="ts">
import type { DuelPlayerView, PrivateCard, PublicCard } from '@onepiecetcg/shared'
import type { TransitionGhost } from '~/utils/duelTransitions'
import type { DuelActionModalState } from '~/components/DuelActionModal.vue'
import { getDuelLogLevelPresentation } from '~/utils/duelLogs'
import {
  formatMatchDurationLabel,
  formatMatchupLabel,
  formatResultTurnLabel,
  formatTurnButtonLabel,
  resolveWaitingToastText
} from '~/utils/duelBoardPresentation'

const BOARD_TRAVEL_MS = 520
const BOARD_TRAVEL_STAGGER_MS = 90
const ATTACHED_DON_TRAVEL_STAGGER_MS = 70
const DEFAULT_TRAVEL_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)'
const ATTACHED_DON_TRAVEL_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'
const AUTO_ADVANCE_PHASES = new Set(['refresh', 'draw', 'don', 'end'])
const appConfig = useAppConfig()

const {
  self,
  opponent,
  phase,
  turn,
  winnerSessionId,
  startedAt,
  finishedAt,
  isSelfTurn,
  isMainPhase,
  canEndPhase,
  selfUntappedDonCount,
  isSelfCharacterZoneFull,
  logs,
  errorMessage,
  pendingEffectDecision,
  activeDecision,
  isAwaitingEffectDecision,
  selectedEffectCardIds,
  selectableDecisionCardIds,
  selectableRevealedDecisionCardIds,
  selectableEffectCards,
  orderedEffectCards,
  effectChoiceViews,
  effectDecisionSubmitState,
  toggleEffectCardSelection,
  toggleEffectChoiceSelection,
  submitEffectDecision,
  declineEffectDecision,
  cancelEffectDecisionSelection,
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
  resolveTrigger,
  isOpponentDisconnected
} = useDuelRoom()
const { room, status, leave, sendMessage } = useColyseus()
const { confirm } = useConfirmDialog()
const isDevMode = useIsDevMode()
const shouldConfirmLeave = computed(() =>
  Boolean(room.value) && status.value === 'connected' && phase.value !== 'finished'
)
const { leaveWithConfirmation } = useDuelLeaveGuard({
  enabled: shouldConfirmLeave,
  confirm,
  leave
})
const isResultModalOpen = ref(false)

async function confirmLeaveToLobby() {
  const confirmed = await leaveWithConfirmation()

  if (!confirmed) {
    return
  }

  await navigateTo('/lobby')
}

const api = useApi()
const reducedMotion = usePreferredReducedMotion()
const pendingCharacterInstanceId = ref<string | null>(null)
const pendingCounterCardInstanceId = ref<string | null>(null)

const emptyPublicCards: PublicCard[] = []
const emptyPrivateCards: PrivateCard[] = []
const emptyOpponentPreview = computed<DuelPlayerView>(() => ({
  sessionId: 'waiting-opponent',
  displayName: 'Adversaire en attente',
  deckId: '',
  ready: false,
  connected: false,
  mulliganDecided: false,
  hasTakenFirstTurn: false,
  leader: null,
  stage: null,
  characters: emptyPublicCards,
  cost: emptyPublicCards,
  trash: emptyPublicCards,
  donDeckCount: 0,
  hand: emptyPrivateCards,
  handCount: 0,
  deck: emptyPrivateCards,
  deckCount: 0,
  life: emptyPrivateCards,
  lifeCount: 0
}))

const canAttachDon = computed(() =>
  isMainPhase.value && isSelfTurn.value && selfUntappedDonCount.value > 0 && !isCombatInProgress.value
)
const shouldShowSelfHandLane = computed(() =>
  Boolean(self.value) && phase.value !== 'setup'
)
const shouldShowOpponentHandLane = computed(() =>
  Boolean(opponent.value)
)
const selectableHandCardIds = computed(() => {
  if (!self.value) {
    return []
  }

  if (pendingEffectDecision.value?.prompt.type === 'selectCards') {
    return self.value.hand
      .filter(card => selectableEffectCardIdSet.value.has(card.instanceId))
      .map(card => card.instanceId)
  }

  if (!isMainPhase.value || !isSelfTurn.value || isCombatInProgress.value) {
    return []
  }

  return self.value.hand
    .filter(card =>
      ['Character', 'Stage'].includes(card.type)
      && (card.cost ?? Number.POSITIVE_INFINITY) <= selfUntappedDonCount.value
    )
    .map(card => card.instanceId)
})
const selectableEffectCardIdSet = computed(() => new Set(selectableDecisionCardIds.value))
const selectableDonCardIds = computed(() =>
  self.value?.cost
    .filter(card => !card.rested)
    .map(card => card.instanceId) ?? []
)
const isChoosingCharacterToDiscard = computed(() => pendingCharacterInstanceId.value !== null)
const isChoosingCounterCard = computed(() => pendingCounterCardInstanceId.value !== null)
const targetableOpponentCharacterIds = computed(() =>
  isChoosingTarget.value
    ? (opponent.value?.characters.filter(character => character.rested).map(character => character.instanceId) ?? [])
    : opponent.value?.characters
      .filter(character => selectableEffectCardIdSet.value.has(character.instanceId))
      .map(character => character.instanceId) ?? []
)
const selectableSelfCharacterIds = computed(() => {
  if (!self.value) {
    return []
  }

  if (isChoosingCharacterToDiscard.value) {
    return self.value.characters.map(character => character.instanceId)
  }

  if (isBlockingStep.value && isSelfDefender.value) {
    return self.value.characters
      .filter(character => !character.rested)
      .map(character => character.instanceId)
  }

  if (pendingEffectDecision.value?.prompt.type === 'selectCards') {
    return self.value.characters
      .filter(character => selectableEffectCardIdSet.value.has(character.instanceId))
      .map(character => character.instanceId)
  }

  return []
})
const selectableSelfLeader = computed(() =>
  Boolean(self.value?.leader && selectableEffectCardIdSet.value.has(self.value.leader.instanceId))
)
const selectableOpponentLeader = computed(() =>
  Boolean(opponent.value?.leader && selectableEffectCardIdSet.value.has(opponent.value.leader.instanceId))
)
const invalidSelfLeaderPulse = ref(false)
const invalidOpponentLeaderPulse = ref(false)
const invalidSelfCharacterIds = ref<string[]>([])
const invalidOpponentCharacterIds = ref<string[]>([])
const selfTransitionGhosts = ref<TransitionGhost[]>([])
const opponentTransitionGhosts = ref<TransitionGhost[]>([])
const selfRevealedHandCardIds = ref<string[]>([])
const selfDeferredHandCardIds = ref<string[]>([])
const selfDeferredBoardCardIds = ref<string[]>([])
const selfDeferredCostCardIds = ref<string[]>([])
const selfDeferredTrashCardIds = ref<string[]>([])
const opponentDeferredHandTravelIds = ref<string[]>([])
const opponentDeferredBoardCardIds = ref<string[]>([])
const opponentDeferredCostCardIds = ref<string[]>([])
const opponentDeferredTrashCardIds = ref<string[]>([])
const animatedSelfLifeToHandIds = new Set<string>()
const animatedSelfDeckToHandIds = new Set<string>()
const animatedOpponentBoardEntryIds = new Set<string>()
const transientErrorModalState = ref<DuelActionModalState | null>(null)

function dismissTransientErrorModal() {
  transientErrorModalState.value = null
}

const effectDecisionActionModalState = computed<DuelActionModalState | null>(() => {
  const decision = activeDecision.value

  if (!decision || decision.source !== 'effect') {
    return null
  }

  const prompt = decision.pending.prompt

  if (prompt.type === 'confirm') {
    return {
      tone: prompt.optional ? 'decision' : 'danger',
      title: 'Décision d’effet',
      description: undefined,
      actions: [
        { label: prompt.optional ? 'Activer' : 'Confirmer', color: 'primary', onSelect: submitEffectDecision },
        { label: prompt.optional ? 'Ignorer' : 'Annuler', color: 'neutral', onSelect: declineEffectDecision }
      ]
    }
  }

  if (prompt.type === 'selectCards' || prompt.type === 'orderCards') {
    return {
      tone: 'decision',
      title: prompt.type === 'orderCards' ? 'Ordre des cartes' : 'Choix de cartes',
      description: undefined,
      allowBoardInteraction: prompt.type === 'selectCards',
      actions: [
        { label: 'Valider', color: 'primary', onSelect: submitEffectDecision },
        { label: 'Réinitialiser', color: 'neutral', onSelect: cancelEffectDecisionSelection }
      ]
    }
  }

  return {
    tone: 'decision',
    title: 'Choix',
    description: undefined,
    actions: [
      { label: 'Valider', color: 'primary', onSelect: submitEffectDecision },
      { label: 'Réinitialiser', color: 'neutral', onSelect: cancelEffectDecisionSelection }
    ]
  }
})

const decisionActionModalState = computed<DuelActionModalState | null>(() => {
  if (effectDecisionActionModalState.value) {
    return effectDecisionActionModalState.value
  }

  if (isBlockingStep.value && isSelfDefender.value) {
    return {
      tone: 'decision',
      title: 'Étape de Blocage',
      description: 'Cliquez un Personnage redressé sur le plateau pour Bloquer, ou choisissez de ne pas bloquer.',
      allowBoardInteraction: true,
      actions: [{ label: 'Ne pas bloquer', color: 'neutral', onSelect: skipBlock }]
    }
  }

  if (isChoosingCounterCard.value) {
    return {
      tone: 'decision',
      title: 'Choix de carte de Contre',
      description: 'Cliquez une carte avec Contre dans votre main pour la défausser, ou annulez.',
      actions: [
        { label: 'Confirmer', color: 'primary', onSelect: confirmCounter },
        { label: 'Annuler', color: 'neutral', onSelect: cancelCounterSelection }
      ]
    }
  }

  if (isCounteringStep.value && isSelfDefender.value) {
    return {
      tone: 'decision',
      title: 'Étape de Contre',
      description: 'Cliquez une carte avec Contre dans votre main pour la défausser et booster votre défense, ou terminez l\'étape.',
      allowBoardInteraction: true,
      actions: [{ label: 'Terminer l\'étape de Contre', color: 'primary', onSelect: finishCounterStep }]
    }
  }

  if (isAwaitingTriggerDecision.value && isSelfDefender.value) {
    return {
      tone: 'danger',
      title: 'Carte de Vie révélée : [Déclenchement]',
      description: 'Voulez-vous activer le Déclenchement (la carte sera écartée) ou l\'ajouter simplement à votre main ?',
      actions: [
        { label: 'Activer et écarter', color: 'error', onSelect: () => resolveTrigger(true) },
        { label: 'Ajouter à la main', color: 'neutral', onSelect: () => resolveTrigger(false) }
      ]
    }
  }

  return null
})

const actionModalState = computed<DuelActionModalState | null>(() =>
  decisionActionModalState.value ?? transientErrorModalState.value
)

const isFinished = computed(() => phase.value === 'finished')
const isSelfWinner = computed(() =>
  Boolean(self.value && winnerSessionId.value === self.value.sessionId)
)
const resultTurnLabel = computed(() => formatResultTurnLabel(turn.value))

const resultDurationLabel = computed(() =>
  formatMatchDurationLabel(startedAt.value, finishedAt.value)
)

watch(phase, (nextPhase, previousPhase) => {
  if (nextPhase === 'finished' && previousPhase !== 'finished') {
    isResultModalOpen.value = true
  }
}, { immediate: true })

const waitingToastText = computed(() =>
  resolveWaitingToastText({
    isOpponentDisconnected: isOpponentDisconnected.value,
    isBlockingStep: isBlockingStep.value,
    isSelfAttacker: isSelfAttacker.value,
    isCounteringStep: isCounteringStep.value,
    isAwaitingTriggerDecision: isAwaitingTriggerDecision.value,
    isAwaitingEffectDecision: isAwaitingEffectDecision.value,
    hasPendingEffectDecision: Boolean(pendingEffectDecision.value)
  })
)

const matchupLabel = computed(() =>
  formatMatchupLabel(self.value?.displayName, opponent.value?.displayName)
)

const turnButtonLabel = computed(() =>
  formatTurnButtonLabel(isSelfTurn.value, canEndPhase.value)
)

const turnButtonColor = computed(() => (isSelfTurn.value ? 'primary' : 'neutral'))
const turnButtonVariant = 'solid' as const

const {
  pendingAttackerInstanceId,
  confirmedAttackArrow,
  isChoosingTarget,
  attackArrowFromInstanceId,
  attackArrowToInstanceId,
  attackArrowToPoint,
  shouldRenderAttackArrow,
  onBoardPointerMove,
  beginAttackDrag,
  cancelTargetSelection,
  confirmLeaderTarget,
  confirmCharacterTarget
} = useDuelAttackTargeting({
  combat,
  canDeclareAttack,
  selfSessionId: computed(() => self.value?.sessionId ?? null),
  selfLeaderInstanceId: computed(() => self.value?.leader?.instanceId ?? null),
  opponentLeaderInstanceId: computed(() => opponent.value?.leader?.instanceId ?? null),
  targetableOpponentCharacterIds,
  onDeclareLeaderAttack: attackerInstanceId => declareAttack(attackerInstanceId, 'leader'),
  onDeclareCharacterAttack: (attackerInstanceId, targetInstanceId) =>
    declareAttack(attackerInstanceId, 'character', targetInstanceId),
  onInvalidTarget: targetInstanceId => pulseCharacter(invalidOpponentCharacterIds, targetInstanceId)
})

const {
  attachedDonOverlayTarget,
  boardTravelOverlays,
  boardTravelOverlayStyle,
  cacheAttachedDonTravelSources,
  cacheBoardTravelSource,
  cacheOpponentHandTravelSources,
  cacheSelfHandTravelSources,
  cacheTrashTravelSource,
  createReadableAttachedDonDestinationRect,
  createTravelOverlay,
  createTravelOverlayFromRect,
  deriveRemovedUntappedCostSourceRects,
  nextAttachedDonOverlayKey,
  nextOpponentHiddenHandOverlayInstanceId,
  pendingAttachedDonTravelSources,
  pendingBoardTravelSources,
  pendingOpponentHandTravelSources,
  pendingSelfHandTravelSources,
  pendingTrashTravelSources,
  pruneAttachedDonTravelSources,
  pruneOpponentHandTravelSources,
  pruneSelfHandTravelSources,
  pruneTrashTravelSources,
  queryAttachedDonSlotElement,
  queryCardElement,
  queryCharacterZoneCardElement,
  queryLifeStackElement,
  queryOpponentCostCardElement,
  queryOpponentDeckElement,
  queryOpponentDonDeckElement,
  queryOpponentHandElement,
  queryOpponentHandTopCardElement,
  queryOpponentUntappedCostCardElement,
  querySelfCostCardElement,
  querySelfDeckElement,
  querySelfDonDeckElement,
  querySelfUntappedCostCardElement,
  queryTrashCardElement,
  revealDeferredVisibleCard,
  setBoardTravelOverlayElement
} = useDuelBoardTravel({
  reducedMotion,
  boardTravelMs: BOARD_TRAVEL_MS,
  defaultTravelEasing: DEFAULT_TRAVEL_EASING,
  attachedDonTravelEasing: ATTACHED_DON_TRAVEL_EASING
})

const {
  cacheMulliganDeckToHandTravelSources,
  mergeRevealedHandCards,
  queueAttachedDonTravelOverlays,
  queueDonDeckToCostTravelOverlays,
  queueOpponentAttachedDonTravelOverlays,
  queueOpponentDeckToHandTravelOverlays,
  queueOpponentHandToBoardTravelOverlays,
  queueOpponentLifeToHandTravelOverlays,
  queuePendingBoardTravelOverlays,
  queueSelfHandTravelOverlays,
  queueTrashTravelOverlay
} = useDuelBoardTravelQueues({
  phase,
  reducedMotion,
  boardTravelStaggerMs: BOARD_TRAVEL_STAGGER_MS,
  attachedDonTravelStaggerMs: ATTACHED_DON_TRAVEL_STAGGER_MS,
  selfRevealedHandCardIds,
  selfDeferredHandCardIds,
  selfDeferredBoardCardIds,
  selfDeferredCostCardIds,
  selfDeferredTrashCardIds,
  opponentDeferredHandTravelIds,
  opponentDeferredBoardCardIds,
  opponentDeferredCostCardIds,
  opponentDeferredTrashCardIds,
  animatedSelfLifeToHandIds,
  animatedSelfDeckToHandIds,
  animatedOpponentBoardEntryIds,
  pendingSelfHandTravelSources,
  pendingBoardTravelSources,
  pendingOpponentHandTravelSources,
  pendingTrashTravelSources,
  pendingAttachedDonTravelSources,
  cacheSelfHandTravelSources,
  pruneSelfHandTravelSources,
  pruneOpponentHandTravelSources,
  pruneTrashTravelSources,
  pruneAttachedDonTravelSources,
  nextOpponentHiddenHandOverlayInstanceId,
  nextAttachedDonOverlayKey,
  attachedDonOverlayTarget,
  revealDeferredVisibleCard,
  createReadableAttachedDonDestinationRect,
  createTravelOverlay,
  createTravelOverlayFromRect,
  deriveRemovedUntappedCostSourceRects,
  queryCardElement,
  queryLifeStackElement,
  queryOpponentCostCardElement,
  queryOpponentDeckElement,
  queryOpponentDonDeckElement,
  queryOpponentHandElement,
  queryOpponentHandTopCardElement,
  queryOpponentUntappedCostCardElement,
  querySelfCostCardElement,
  querySelfDeckElement,
  querySelfDonDeckElement,
  querySelfUntappedCostCardElement,
  queryAttachedDonSlotElement,
  queryTrashCardElement
})

const {
  draggedHandCard,
  draggedHandCardCount,
  draggedHandCardInstanceId,
  draggableHandCardIds,
  invalidHandCardIds,
  pulseHandCard,
  selectedHandCardIds,
  clearPendingHandPlayQueue,
  clearSelectedHandCards,
  onInvalidHandCardDragAttempt,
  onSelfCharacterZoneDrop,
  onSelfHandCardClick,
  onSelfHandCardDragEnd,
  onSelfHandCardDragStart,
  onSelfStageZoneDrop,
  syncPendingHandPlayQueue
} = useDuelHandInteraction({
  self,
  phase,
  isSelfTurn,
  isMainPhase,
  isCombatInProgress,
  selfUntappedDonCount,
  isSelfCharacterZoneFull,
  selectableHandCardIds,
  pendingCharacterInstanceId,
  onCacheBoardTravelSource: cacheBoardTravelSource,
  onPlayCard: playCard
})

const {
  draggedDonCardCount,
  draggedDonCardInstanceId,
  selectedDonCardIds,
  attachDonToTarget,
  clearDraggedDonCard,
  clearSelectedDonCards,
  onSelfCharacterDonDrop,
  onSelfDonCardDragEnd: endSelfDonCardDrag,
  onSelfDonCardDragStart,
  onSelfDonCardSelectionHover,
  onSelfDonCardSelectionStart,
  onSelfLeaderDonDrop
} = useDuelDonInteraction({
  canAttachDon,
  selectableDonCardIds,
  onAttachDon: (target, targetInstanceId, count) => attachDon(target, targetInstanceId, count),
  onCacheAttachedDonTravelSources: cacheAttachedDonTravelSources,
  onInvalidLeaderTarget: () => pulseLeader(invalidSelfLeaderPulse),
  onInvalidCharacterTarget: instanceId => pulseCharacter(invalidSelfCharacterIds, instanceId)
})

const {
  hoveredCard,
  hoveredCardRows,
  effectPromptLinkedPreviewInstanceId,
  effectPromptLinkedSelectedInstanceIds,
  isHoveredCardDetailPending,
  previewEffectPromptCard,
  clearEffectPromptPreview,
  resolvedHoveredCard
} = useDuelCardInspection({
  api,
  pendingEffectDecisionId: computed(() => pendingEffectDecision.value?.id ?? null),
  pendingEffectPromptType: computed(() => pendingEffectDecision.value?.prompt.type ?? null),
  selectedEffectCardIds
})

watch(errorMessage, (message) => {
  if (!message) {
    return
  }

  clearPendingHandPlayQueue()
  spawnBannerFeedback(message, 'error')
  transientErrorModalState.value = {
    tone: 'danger',
    title: 'Action impossible',
    description: message,
    actions: [
      { label: 'Compris', color: 'neutral', onSelect: dismissTransientErrorModal }
    ]
  }
  clearError()
})

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

const {
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
  skipBlock
} = useDuelBoardInteractions({
  self,
  opponent,
  canAttachDon,
  canDeclareAttack,
  isBlockingStep,
  isCounteringStep,
  isSelfDefender,
  isChoosingCharacterToDiscard,
  pendingCharacterInstanceId,
  pendingCounterCardInstanceId,
  pendingEffectDecision,
  selectableEffectCardIdSet,
  selectedDonCardIds,
  invalidSelfLeaderPulse,
  invalidOpponentLeaderPulse,
  invalidSelfCharacterIds,
  invalidOpponentCharacterIds,
  pulseHandCard,
  clearSelectedHandCards,
  clearSelectedDonCards,
  clearDraggedDonCard,
  endSelfDonCardDrag,
  onSelfHandCardClick,
  attachDonToTarget,
  beginAttackDrag,
  confirmLeaderTarget,
  confirmCharacterTarget,
  cancelTargetSelection,
  cacheBoardTravelSource,
  cacheTrashTravelSource,
  playCard,
  declareBlock,
  declareCounter,
  toggleEffectCardSelection
})

useDuelBoardSelectionShell({
  isChoosingCharacterToDiscard,
  isChoosingTarget,
  selectedHandCardIds,
  selectedDonCardIds,
  querySelfCostCardElement,
  cancelDiscardSelection,
  cancelTargetSelection,
  clearSelectedHandCards,
  clearSelectedDonCards,
  clearTransientBoardSelections
})

const {
  bannerFeedbacks,
  cardFeedbacks,
  floatingNumbers,
  isTurnFeedbackVisible,
  bannerFeedbackClasses,
  cardFeedbackClasses,
  clearTurnFeedbackTimeout,
  removeFloatingNumber,
  setBannerFeedbackElement,
  setCardFeedbackElement,
  showTurnFeedback,
  spawnBannerFeedback,
  spawnCardFeedback,
  spawnCardFeedbackAtPosition,
  spawnLifeLossFloatingNumber
} = useDuelBoardFeedback({
  appConfig,
  reducedMotion,
  queryCardElement
})

useDuelBoardTurnFlow({
  phase,
  isSelfTurn,
  isCombatInProgress,
  isAwaitingEffectDecision,
  pendingEffectDecision,
  autoAdvancePhases: AUTO_ADVANCE_PHASES,
  showTurnFeedback,
  clearTurnFeedbackTimeout,
  endPhase
})

const { handleNewLogEntries } = useDuelLogFeedback({
  self,
  opponent,
  blockerInstanceId: computed(() => combat.value?.blockerInstanceId ?? null),
  spawnBannerFeedback,
  spawnCardFeedback
})

const {
  formatLogTime,
  getLogActor,
  getLogMessageText
} = useDuelLogPresentation({
  self,
  opponent
})

const {
  isJournalOpen,
  onJournalPointerDown,
  onJournalPointerMove,
  endJournalDrag,
  unseenLogCount
} = useDuelJournal({
  logs,
  reducedMotion,
  onNewEntries: handleNewLogEntries
})

const {
  activeTrashCards,
  activeTrashPlayer,
  closeTrashModal,
  openTrashModal,
  openedTrashSide,
  selectedTrashCardInstanceId,
  trashModalCardSize
} = useDuelTrashModal({
  self,
  opponent,
  queryCharacterZoneCardElement,
  queryTrashCardElement
})

const {
  activeDeckCards,
  closeDeckDebugModal,
  deckDebugModalCardSize,
  deckDebugSearchQuery,
  openDeckDebugModal,
  toggleDeckDebugModal,
  openedDeckDebug,
  selectedDeckCardInstanceId
} = useDuelDeckDebugModal({
  self,
  queryDeckCardElement: querySelfDeckElement
})

function drawDebugDeckCard(instanceId: string) {
  if (!instanceId) {
    return
  }

  sendMessage('debugDrawFromDeck', {
    instanceId
  })
  hoveredCard.value = null
  closeDeckDebugModal()
}

useDuelBoardStateWatchers({
  self,
  opponent,
  phase,
  selfTransitionGhosts,
  opponentTransitionGhosts,
  selfRevealedHandCardIds,
  selfDeferredCostCardIds,
  selfDeferredTrashCardIds,
  opponentDeferredCostCardIds,
  opponentDeferredTrashCardIds,
  animatedSelfLifeToHandIds,
  animatedSelfDeckToHandIds,
  animatedOpponentBoardEntryIds,
  mergeRevealedHandCards,
  pruneSelfHandTravelSources,
  cacheSelfHandTravelSources,
  cacheMulliganDeckToHandTravelSources,
  queryLifeStackElement,
  querySelfDeckElement,
  queueSelfHandTravelOverlays,
  queuePendingBoardTravelOverlays,
  queueDonDeckToCostTravelOverlays,
  queueAttachedDonTravelOverlays,
  queueTrashTravelOverlay,
  syncPendingHandPlayQueue,
  pruneOpponentHandTravelSources,
  cacheOpponentHandTravelSources,
  queueOpponentLifeToHandTravelOverlays,
  queueOpponentDeckToHandTravelOverlays,
  queueOpponentHandToBoardTravelOverlays,
  queueOpponentAttachedDonTravelOverlays,
  queryCardElement,
  spawnCardFeedback,
  spawnCardFeedbackAtPosition,
  spawnLifeLossFloatingNumber
})
</script>

<template>
  <div class="flex flex-col h-full min-h-0 min-w-0 overflow-hidden">
    <UHeader class="static shrink-0" :ui="{
      center: 'flex min-w-0 justify-center',
      container: 'mx-auto w-full max-w-[2000px] px-4 lg:px-6'
    }">
      <template #left>
        <div class="flex items-center gap-3 min-w-0">
          <UButton icon="i-lucide-scroll-text" size="sm" color="neutral" variant="ghost" aria-label="Journal"
            @click="isJournalOpen = true">
            <UBadge v-if="unseenLogCount > 0" color="primary" variant="solid" size="sm">
              {{ unseenLogCount }}
            </UBadge>
          </UButton>
          <div v-if="opponent" class="flex items-center gap-2 min-w-0">
            <UBadge color="neutral" variant="subtle" size="sm">
              Deck {{ opponent.deckCount }}
            </UBadge>
            <UBadge color="neutral" variant="subtle" size="sm">
              DON!! {{ opponent.donDeckCount }}
            </UBadge>
            <UBadge color="neutral" variant="subtle" size="sm">
              Main {{ opponent.handCount }}
            </UBadge>
            <UBadge color="neutral" variant="subtle" size="sm">
              Vie {{ opponent.lifeCount }}
            </UBadge>
          </div>
          <p v-else class="text-sm text-muted">
            En attente d'un adversaire...
          </p>
        </div>
      </template>

      <div class="px-2 sm:px-4">
        {{ matchupLabel }}
      </div>

      <template #right>
        <div class="flex items-center gap-3">
          <UButton
            v-if="isDevMode && self?.deck.length"
            data-test="debug-draw-toggle"
            icon="i-lucide-bug"
            size="sm"
            color="neutral"
            variant="ghost"
            aria-label="Outil de pioche debug"
            @click="toggleDeckDebugModal"
          >
            Pioche debug
          </UButton>
          <div v-if="self" class="flex items-center gap-1.5 rounded-full bg-elevated px-3 py-1">
            <UIcon name="i-lucide-zap" class="size-4 text-warning" />
            <span class="text-sm font-semibold tabular-nums">{{ selfUntappedDonCount }}</span>
          </div>
          <UButton data-test="turn-toggle" size="sm" :color="turnButtonColor" :variant="turnButtonVariant"
            :disabled="!canEndPhase" @click="endPhase">
            {{ turnButtonLabel }}
          </UButton>
          <UButton data-test="leave-to-lobby" icon="i-lucide-log-out" size="sm" color="neutral" variant="ghost"
            aria-label="Retour au lobby" @click="confirmLeaveToLobby" />
        </div>
      </template>
    </UHeader>

    <DuelActionModal :state="actionModalState">
      <template v-if="activeDecision?.source === 'effect' && pendingEffectDecision" #content>
        <DuelDecisionConfirm v-if="pendingEffectDecision.prompt.type === 'confirm'"
          :message="pendingEffectDecision.prompt.message" />
        <DuelDecisionCardPicker v-else-if="pendingEffectDecision.prompt.type === 'selectCards'"
          :message="pendingEffectDecision.prompt.message" :cards="selectableEffectCards"
          :selected-card-ids="selectedEffectCardIds" :revealed-card-ids="selectableRevealedDecisionCardIds"
          :submit-disabled-reason="effectDecisionSubmitState.reason" @inspect="previewEffectPromptCard"
          @clear-inspect="clearEffectPromptPreview" @toggle="toggleEffectCardSelection" />
        <DuelDecisionCardOrderPicker v-else-if="pendingEffectDecision.prompt.type === 'orderCards'"
          :message="pendingEffectDecision.prompt.message" v-model:cards="orderedEffectCards"
          :submit-disabled-reason="effectDecisionSubmitState.reason" @inspect="previewEffectPromptCard"
          @clear-inspect="clearEffectPromptPreview" />
        <DuelDecisionChoicePicker v-else :message="pendingEffectDecision.prompt.message" :choices="effectChoiceViews"
          :submit-disabled-reason="effectDecisionSubmitState.reason" @toggle="toggleEffectChoiceSelection" />
      </template>
    </DuelActionModal>

    <DuelWaitingToast v-if="waitingToastText" :text="waitingToastText"
      :tone="isOpponentDisconnected ? 'warning' : 'neutral'" />

    <DuelResultModal :open="isFinished && isResultModalOpen" :victory="isSelfWinner" :turn-label="resultTurnLabel"
      :duration-label="resultDurationLabel" @leave="confirmLeaveToLobby" />

    <USlideover v-model:open="isJournalOpen" :ui="{ header: 'hidden' }" :modal="false" side="left">
      <template #body>
        <div class="flex h-full min-h-0 flex-col gap-2">
          <div class="flex min-h-0 flex-1 cursor-grab touch-none active:cursor-grabbing"
            data-test="journal-scroll-drag-area" @pointerdown="onJournalPointerDown" @pointermove="onJournalPointerMove"
            @pointerup="endJournalDrag" @pointercancel="endJournalDrag">
            <UScrollArea ref="journal-scroll-area" class="journal-scroll-root flex-1 min-h-0"
              data-test="journal-scroll-area"
              :ui="{ root: 'min-h-0 flex-1 overflow-y-scroll overflow-x-hidden', viewport: 'flex min-h-full flex-col pr-1' }">
              <div class="mt-auto flex flex-col">
                <ul class="flex flex-col text-xs">
                  <li v-if="logs.length === 0" class="text-muted">
                    Aucun événement.
                  </li>
                  <template v-for="(entry, index) in logs" :key="entry.id">
                    <li class="py-2" data-test="journal-entry">
                      <div class="flex items-start gap-3">
                        <time :datetime="entry.createdAt" class="shrink-0 tabular-nums text-[11px]"
                          :class="getDuelLogLevelPresentation(entry.level).toneClass">
                          {{ formatLogTime(entry.createdAt) }}
                        </time>
                        <p class="min-w-0 flex-1 leading-relaxed"
                          :class="getDuelLogLevelPresentation(entry.level).toneClass">
                          <span v-if="getLogActor(entry)" class="mr-2 text-[10px] font-medium tracking-[0.04em]"
                            :class="getLogActor(entry)?.classes" data-test="journal-actor">
                            [{{ getLogActor(entry)?.displayName }}]
                          </span>
                          <span>{{ getLogMessageText(entry) }}</span>
                        </p>
                      </div>
                    </li>
                    <USeparator v-if="index < logs.length - 1" class="opacity-60" />
                  </template>
                </ul>
                <div ref="journal-end" aria-hidden="true" class="h-px w-full" />
              </div>
            </UScrollArea>
          </div>

          <div v-if="status === 'connecting'" class="text-[11px] text-muted shrink-0">
            Reconnexion en cours...
          </div>
        </div>
      </template>
    </USlideover>

    <div
      class="mx-auto grid h-full min-h-0 w-full max-w-[2000px] flex-1 gap-4 overflow-hidden p-4 lg:grid-cols-[minmax(220px,0.34fr)_minmax(0,1fr)_minmax(260px,0.25fr)]">
      <div class="hidden min-h-0 lg:grid lg:grid-rows-[auto_minmax(0,1fr)_auto] lg:gap-4 lg:overflow-hidden lg:py-2">
        <div class="w-full max-w-[26rem] justify-self-end">
          <DuelHand v-if="shouldShowOpponentHandLane && opponent" hidden :hand-count="opponent.handCount"
            :deferred-hidden-count="opponentDeferredHandTravelIds.length" align="start" />
        </div>

        <div class="min-h-0" />

        <div class="w-full max-w-[26rem] justify-self-end">
          <DuelHand v-if="shouldShowSelfHandLane && self" :hand="self.hand" align="start"
            :draggable-hand-card-ids="draggableHandCardIds" :selected-hand-card-ids="selectedHandCardIds"
            :linked-preview-instance-id="effectPromptLinkedPreviewInstanceId"
            :linked-selected-instance-ids="effectPromptLinkedSelectedInstanceIds"
            :dragged-hand-card-count="draggedHandCardCount" :invalid-hand-card-ids="invalidHandCardIds"
            :revealed-hand-card-ids="selfRevealedHandCardIds" :deferred-hand-card-ids="selfDeferredHandCardIds"
            @card-hover="hoveredCard = $event" @card-click="onSelfHandCardOrCounterClick"
            @card-drag-start="onSelfHandCardDragStart" @card-drag-end="onSelfHandCardDragEnd"
            @invalid-card-drag-attempt="onInvalidHandCardDragAttempt" />
        </div>
      </div>

      <div class="flex h-full min-h-0 min-w-0 flex-1 overflow-hidden lg:col-start-2">
        <div ref="board-container" class="relative flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden"
          @pointermove="onBoardPointerMove">
          <div class="pointer-events-none fixed inset-0 z-[130]">
            <div v-for="overlay in boardTravelOverlays" :key="overlay.key"
              :ref="(value: Element | null) => setBoardTravelOverlayElement(overlay.key, value)"
              :data-board-travel-instance-id="overlay.instanceId" :data-board-travel-settled="String(overlay.settled)"
              :data-board-travel-variant="overlay.variant"
              class="duel-board-travel-overlay absolute overflow-hidden rounded-lg"
              :style="boardTravelOverlayStyle(overlay)">
              <DuelCard :src="overlay.imageUrl" :rotated="overlay.rotated" />
            </div>
          </div>
          <div class="pointer-events-none fixed inset-0 z-[135]">
            <div v-for="entry in cardFeedbacks" :key="entry.key"
              :ref="(value: Element | null) => setCardFeedbackElement(entry.key, value)"
              :data-test="`card-feedback-${entry.label}`" :data-feedback-family="entry.family"
              class="duel-card-feedback absolute rounded-full px-3 py-1 text-sm font-black uppercase tracking-[0.18em] sm:text-base"
              :class="cardFeedbackClasses(entry.family)"
              :style="{ left: `${entry.x}px`, top: `${entry.y}px`, translate: '-50% -50%' }">
              {{ entry.label }}
            </div>
          </div>
          <div class="pointer-events-none fixed inset-x-0 top-18 z-[136] flex flex-col items-center gap-2 px-4">
            <div v-for="entry in bannerFeedbacks" :key="entry.key"
              :ref="(value: Element | null) => setBannerFeedbackElement(entry.key, value)"
              :data-test="entry.family === 'error' ? 'error-feedback' : 'global-feedback'"
              :data-feedback-family="entry.family"
              class="duel-banner-feedback max-w-[min(92vw,44rem)] rounded-full px-4 py-2 text-center text-sm font-semibold sm:text-base"
              :class="bannerFeedbackClasses(entry.family)">
              {{ entry.message }}
            </div>
          </div>
          <div class="pointer-events-none absolute inset-0 z-[137] flex items-center justify-center">
            <Transition enter-active-class="transition duration-250 ease-out"
              enter-from-class="opacity-0 translate-y-3 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="opacity-100 translate-y-0 scale-100"
              leave-to-class="opacity-0 -translate-y-2 scale-[0.98]">
              <div v-if="isTurnFeedbackVisible" data-test="turn-feedback" class="duel-turn-feedback text-center">
                Votre tour
              </div>
            </Transition>
          </div>
          <DuelAttackArrow v-if="shouldRenderAttackArrow" :from-instance-id="attackArrowFromInstanceId"
            :to-instance-id="attackArrowToInstanceId" :to-point="attackArrowToPoint"
            :variant="pendingAttackerInstanceId ? 'drag' : 'confirmed'"
            :animation-key="confirmedAttackArrow?.key ?? null" />
          <DuelFloatingNumber v-for="entry in floatingNumbers" :key="entry.key" :value="entry.value" :x="entry.x"
            :y="entry.y" :family="entry.family" @done="removeFloatingNumber(entry.key)" />
          <DuelSetupOverlay v-if="phase === 'mulligan'" />
          <DuelCardPickerModal
            :open="openedTrashSide !== null && activeTrashPlayer !== null"
            modal-test-id="trash-modal"
            card-test-id="trash-modal-card"
            :cards="activeTrashCards"
            :selected-card-instance-id="selectedTrashCardInstanceId"
            :card-size="trashModalCardSize"
            @close="closeTrashModal"
            @hover="hoveredCard = $event"
            @select="selectedTrashCardInstanceId = $event"
          />
          <DuelCardPickerModal
            :open="openedDeckDebug && self !== null"
            modal-test-id="debug-deck-modal"
            card-test-id="debug-deck-modal-card"
            title="Pioche debug"
            description="Choisissez une carte du deck à piocher directement dans votre main."
            :cards="activeDeckCards"
            :selected-card-instance-id="selectedDeckCardInstanceId"
            :card-size="deckDebugModalCardSize"
            show-search
            v-model:search-query="deckDebugSearchQuery"
            search-placeholder="Rechercher une carte du deck..."
            search-empty-label="Aucune carte du deck ne correspond à votre recherche."
            @close="closeDeckDebugModal"
            @hover="hoveredCard = $event"
            @select="drawDebugDeckCard"
          />
          <PlayZone v-if="opponent || self" class="flex-1 min-h-0" :player="opponent ?? emptyOpponentPreview" :side="1"
            :is-owner-turn="!isSelfTurn" :is-adversary="Boolean(opponent)"
            :transition-ghosts="opponent ? opponentTransitionGhosts : []"
            :deferred-board-card-ids="opponentDeferredBoardCardIds"
            :deferred-cost-card-ids="opponentDeferredCostCardIds"
            :deferred-trash-card-ids="opponentDeferredTrashCardIds"
            :is-targetable="Boolean(opponent) && isChoosingTarget"
            :is-selectable="selectableOpponentLeader || targetableOpponentCharacterIds.length > 0"
            :targetable-leader="Boolean(opponent) && (isChoosingTarget || selectableOpponentLeader)"
            :targetable-character-ids="opponent ? targetableOpponentCharacterIds : []"
            :selectable-leader="selectableOpponentLeader"
            :selectable-character-ids="opponent ? targetableOpponentCharacterIds : []"
            :invalid-leader-pulse="opponent ? invalidOpponentLeaderPulse : false"
            :invalid-character-ids="opponent ? invalidOpponentCharacterIds : []"
            :linked-preview-instance-id="effectPromptLinkedPreviewInstanceId"
            :linked-selected-instance-ids="effectPromptLinkedSelectedInstanceIds" @card-hover="hoveredCard = $event"
            @trash-click="openTrashModal" @leader-click="onOpponentLeaderClick"
            @character-click="onOpponentCharacterClick" />
          <div v-else class="flex flex-1 min-h-0 items-center justify-center text-sm text-muted">
            En attente d'un adversaire...
          </div>
          <USeparator class="shrink-0" />
          <PlayZone v-if="self" class="flex-1 min-h-0" :player="self" :side="0" :is-owner-turn="isSelfTurn"
            :selected-don-card-ids="selectedDonCardIds" :dragged-hand-card-instance-id="draggedHandCardInstanceId"
            :dragged-don-card-instance-id="draggedDonCardInstanceId" :dragged-don-card-count="draggedDonCardCount"
            :can-drop-on-character-zone="isMainPhase && isSelfTurn && !isCombatInProgress && draggedHandCard?.type === 'Character'"
            :can-drop-on-stage-zone="isMainPhase && isSelfTurn && !isCombatInProgress && draggedHandCard?.type === 'Stage'"
            :can-drop-don-on-leader="canAttachDon" :can-drop-don-on-character="canAttachDon"
            :transition-ghosts="selfTransitionGhosts"
            :attacker-id="combat && isSelfAttacker ? combat.attackerInstanceId : null"
            :is-selectable="isChoosingCharacterToDiscard || (isBlockingStep && isSelfDefender) || (isCounteringStep && isSelfDefender) || selectableSelfCharacterIds.length > 0 || selectableSelfLeader"
            :attackable-leader="Boolean(self.leader && canDeclareAttack && !isCombatInProgress && isMainPhase && isSelfTurn && !self.leader.rested)"
            :attackable-character-ids="self.characters.filter(character => canDeclareAttack && isMainPhase && isSelfTurn && !isCombatInProgress && !character.rested && !character.playedThisTurn).map(character => character.instanceId)"
            :selectable-leader="selectableSelfLeader" :selectable-character-ids="selectableSelfCharacterIds"
            :invalid-leader-pulse="invalidSelfLeaderPulse" :invalid-character-ids="invalidSelfCharacterIds"
            :linked-preview-instance-id="effectPromptLinkedPreviewInstanceId"
            :linked-selected-instance-ids="effectPromptLinkedSelectedInstanceIds"
            :deferred-board-card-ids="selfDeferredBoardCardIds" :deferred-cost-card-ids="selfDeferredCostCardIds"
            :deferred-trash-card-ids="selfDeferredTrashCardIds" @card-hover="hoveredCard = $event"
            @trash-click="openTrashModal" @hand-card-drop-on-characters="onSelfCharacterZoneDrop"
            @hand-card-drop-on-stage="onSelfStageZoneDrop" @don-card-selection-start="onSelfDonCardSelectionStart"
            @don-card-selection-hover="onSelfDonCardSelectionHover" @don-card-drag-start="onSelfDonCardDragStart"
            @don-card-drag-end="onSelfDonCardDragEnd" @don-card-drop-on-leader="onSelfLeaderDonDrop"
            @don-card-drop-on-character="onSelfCharacterDonDrop" @leader-attack-start="onSelfLeaderAttackStart"
            @character-attack-start="onSelfCharacterAttackStart" @leader-click="onSelfLeaderClick"
            @character-click="onSelfCharacterClick" />
        </div>
      </div>

      <CardDetailsPanel class="lg:col-start-3" :card="resolvedHoveredCard" :rows="hoveredCardRows"
        :loading-description="isHoveredCardDetailPending" empty-message="Survolez une carte du plateau." />
    </div>

    <div class="mx-auto flex w-full max-w-[2000px] shrink-0 flex-col gap-4 px-4 pb-4 lg:hidden">
      <div class="w-full">
        <DuelHand v-if="shouldShowOpponentHandLane && opponent" hidden :hand-count="opponent.handCount"
          :deferred-hidden-count="opponentDeferredHandTravelIds.length" align="start" />
      </div>

      <div class="w-full">
        <DuelHand v-if="shouldShowSelfHandLane && self" :hand="self.hand" align="start"
          :draggable-hand-card-ids="draggableHandCardIds" :selected-hand-card-ids="selectedHandCardIds"
          :linked-preview-instance-id="effectPromptLinkedPreviewInstanceId"
          :linked-selected-instance-ids="effectPromptLinkedSelectedInstanceIds"
          :dragged-hand-card-count="draggedHandCardCount" :invalid-hand-card-ids="invalidHandCardIds"
          :revealed-hand-card-ids="selfRevealedHandCardIds" :deferred-hand-card-ids="selfDeferredHandCardIds"
          @card-hover="hoveredCard = $event" @card-click="onSelfHandCardOrCounterClick"
          @card-drag-start="onSelfHandCardDragStart" @card-drag-end="onSelfHandCardDragEnd"
          @invalid-card-drag-attempt="onInvalidHandCardDragAttempt" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.duel-board-travel-overlay {
  transform-origin: top left;
  transition-property: transform, opacity;
  transition-timing-function: ease-in-out;
  will-change: transform, opacity;
}

.duel-board-travel-overlay[data-board-travel-variant='attachedDon'] {
  filter: drop-shadow(0 10px 18px rgb(15 23 42 / 0.22));
}

.duel-card-feedback {
  will-change: transform, opacity;
}

.duel-banner-feedback {
  will-change: transform, opacity;
}

.duel-turn-feedback {
  color: color-mix(in oklab, var(--ui-success) 68%, white 32%);
  text-shadow:
    0 1px 0 rgb(255 255 255 / 0.7),
    0 3px 10px rgb(15 23 42 / 0.3),
    0 12px 28px rgb(15 23 42 / 0.16);
  font-size: clamp(1.75rem, 2vw + 1rem, 2.75rem);
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

:deep(.journal-scroll-root) {
  scrollbar-width: thin;
  scrollbar-color: rgb(71 85 105 / 0.9) transparent;
}

:deep(.journal-scroll-root::-webkit-scrollbar) {
  width: 10px;
}

:deep(.journal-scroll-root::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.journal-scroll-root::-webkit-scrollbar-thumb) {
  border: 2px solid transparent;
  border-radius: 9999px;
  background-clip: padding-box;
  background-color: rgb(71 85 105 / 0.9);
}

:deep(.journal-scroll-root::-webkit-scrollbar-thumb:hover) {
  background-color: rgb(100 116 139 / 1);
}

@media (prefers-reduced-motion: reduce) {
  .duel-card-feedback,
  .duel-banner-feedback,
  .duel-turn-feedback {
    animation: none;
    will-change: auto;
  }
}
</style>
