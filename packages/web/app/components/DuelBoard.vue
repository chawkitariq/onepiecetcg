<script setup lang="ts">
import type { Card, DuelPlayerView, PrivateCard, PublicCard } from '@onepiecetcg/shared'
import type { PlayerTransitionDiff, TransitionGhost } from '~/utils/duelTransitions'
import type { DuelActionModalState } from '~/components/DuelActionModal.vue'
import { animate } from 'animejs'
import cardBackRegular from '~/assets/card-back-regular.png'
import cardFrontDon from '~/assets/don.png'
import { deriveAttachedDonTravelTargetIds } from '~/utils/attachedDonTransitions'
import { derivePlayerTransitionDiff } from '~/utils/duelTransitions'
import { mergeHoveredDuelCardDetails, type HoveredDuelCard } from '~/utils/hoveredDuelCard'
import { createStaggeredTravelPlan } from '~/utils/travelStagger'

type BoardTravelOverlay = {
  key: string
  instanceId: string
  imageUrl: string
  sourceRect: DOMRect
  destinationRect: DOMRect
  translateX: number
  translateY: number
  scaleX: number
  scaleY: number
  settled: boolean
  durationMs: number
  easing: string
  variant: 'default' | 'attachedDon'
  opacity: number
  rotated?: boolean
}

type CardFeedbackTone = 'power' | 'warning' | 'danger'

type CardFeedbackInstance = {
  key: number
  label: string
  x: number
  y: number
  tone: CardFeedbackTone
}

type BannerFeedbackTone = 'action' | 'error'

type BannerFeedbackInstance = {
  key: number
  message: string
  tone: BannerFeedbackTone
}

const BOARD_TRAVEL_MS = 520
const BOARD_TRAVEL_STAGGER_MS = 90
const ATTACHED_DON_TRAVEL_STAGGER_MS = 70
const DEFAULT_TRAVEL_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)'
const ATTACHED_DON_TRAVEL_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'
const AUTO_ADVANCE_PHASES = new Set(['refresh', 'draw', 'don', 'end'])

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
const { room, status, leave } = useColyseus()
const { confirm } = useConfirmDialog()
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

async function replayMatch() {
  const confirmed = await leaveWithConfirmation()

  if (!confirmed) {
    return
  }

  await navigateTo('/lobby')
}

const phaseLabels: Record<string, string> = {
  setup: 'Préparation',
  mulligan: 'Mulligan',
  refresh: 'Recharge',
  draw: 'Pioche',
  don: 'DON!!',
  main: 'Principale',
  end: 'Fin',
  finished: 'Terminée'
}

type ScrollAreaInstance = {
  $el?: HTMLElement
}

const api = useApi()
const hoveredCard = ref<HoveredDuelCard | null>(null)
const hoveredCardCatalogDetails = reactive<Record<string, Pick<Card, 'text' | 'trigger'> | undefined>>({})
const pendingHoveredCardDetailIds = ref<string[]>([])
const failedHoveredCardDetailIds = new Set<string>()
const reducedMotion = usePreferredReducedMotion()
const journalScrollArea = useTemplateRef<ScrollAreaInstance>('journal-scroll-area')
const isJournalOpen = ref(false)
const seenLogCount = ref(0)
const unseenLogCount = computed(() => Math.max(logs.value.length - seenLogCount.value, 0))
const pendingCharacterInstanceId = ref<string | null>(null)
const pendingAttackerInstanceId = ref<string | null>(null)
const pendingCounterCardInstanceId = ref<string | null>(null)
const counterPowerBonusInput = ref(1000)
const draggedHandCardInstanceId = ref<string | null>(null)
const selectedHandCardIds = ref<string[]>([])
const pendingQueuedHandCardIds = ref<string[]>([])
const queuedHandCardInstanceId = ref<string | null>(null)
const selectedDonCardIds = ref<string[]>([])
const selectedDonAnchorInstanceId = ref<string | null>(null)
const draggedDonCardInstanceId = ref<string | null>(null)
const pointerPosition = ref<{ x: number, y: number } | null>(null)
const declaredAttackTargetInstanceId = ref<string | null>(null)
const confirmedAttackArrow = ref<{ key: number, fromInstanceId: string, toInstanceId: string } | null>(null)
const lastConfirmedAttackArrowSignature = ref<string | null>(null)
let confirmedAttackArrowKey = 0

function onBoardPointerMove(event: PointerEvent) {
  pointerPosition.value = { x: event.clientX, y: event.clientY }
}

function beginAttackDrag(instanceId: string) {
  if (!canDeclareAttack.value) {
    return
  }

  pendingAttackerInstanceId.value = instanceId
  declaredAttackTargetInstanceId.value = null
}

const attackArrowFromInstanceId = computed(() => {
  if (pendingAttackerInstanceId.value) {
    return pendingAttackerInstanceId.value
  }

  return confirmedAttackArrow.value?.fromInstanceId ?? null
})

const attackArrowToInstanceId = computed(() =>
  pendingAttackerInstanceId.value
    ? declaredAttackTargetInstanceId.value
    : confirmedAttackArrow.value?.toInstanceId ?? null
)

const attackArrowToPoint = computed(() =>
  isChoosingTarget.value && !declaredAttackTargetInstanceId.value ? pointerPosition.value : null
)
const shouldRenderAttackArrow = computed(() =>
  Boolean(
    attackArrowFromInstanceId.value
    && (attackArrowToInstanceId.value || attackArrowToPoint.value)
  )
)

function resolveCombatTargetInstanceId() {
  if (!combat.value) {
    return null
  }

  if (combat.value.targetType === 'character') {
    return combat.value.targetInstanceId
  }

  return combat.value.defenderSessionId === self.value?.sessionId
    ? self.value?.leader?.instanceId ?? null
    : opponent.value?.leader?.instanceId ?? null
}

function hasResolvedCombatAttackerAndTarget() {
  if (!combat.value) {
    return false
  }

  return combat.value.attackerInstanceId.length > 0 && resolveCombatTargetInstanceId() !== null
}

function resolveConfirmedAttackArrowSignature() {
  const targetInstanceId = resolveCombatTargetInstanceId()

  if (!combat.value || !targetInstanceId || combat.value.attackerInstanceId.length === 0) {
    return null
  }

  return [
    combat.value.attackerSessionId,
    combat.value.attackerInstanceId,
    combat.value.defenderSessionId,
    combat.value.targetType,
    targetInstanceId
  ].join(':')
}

function showConfirmedAttackArrow(fromInstanceId: string, toInstanceId: string) {
  confirmedAttackArrow.value = {
    key: ++confirmedAttackArrowKey,
    fromInstanceId,
    toInstanceId
  }
}

watch(
  [
    () => combat.value?.step,
    () => combat.value?.attackerInstanceId,
    () => combat.value?.targetType,
    () => combat.value?.targetInstanceId,
    () => combat.value?.defenderSessionId,
    () => self.value?.leader?.instanceId,
    () => opponent.value?.leader?.instanceId
  ],
  ([step, attackerInstanceId], [_previousStep, _previousAttackerInstanceId]) => {
    if (combat.value && attackerInstanceId && hasResolvedCombatAttackerAndTarget()) {
      const targetInstanceId = resolveCombatTargetInstanceId()
      const signature = resolveConfirmedAttackArrowSignature()

      declaredAttackTargetInstanceId.value = targetInstanceId

      if (
        targetInstanceId
        && signature
        && signature !== lastConfirmedAttackArrowSignature.value
      ) {
        lastConfirmedAttackArrowSignature.value = signature
        showConfirmedAttackArrow(attackerInstanceId, targetInstanceId)
      }

      return
    }

    if (!pendingAttackerInstanceId.value) {
      declaredAttackTargetInstanceId.value = null
    }

    if (!attackerInstanceId) {
      confirmedAttackArrow.value = null
    }

    if (!step || !attackerInstanceId) {
      lastConfirmedAttackArrowSignature.value = null
    }
  },
  { immediate: true }
)
const invalidHandCardIds = ref<string[]>([])

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
  if (!self.value || !isMainPhase.value || !isSelfTurn.value || isCombatInProgress.value) {
    return []
  }

  return self.value.hand
    .filter(card =>
      ['Character', 'Stage'].includes(card.type)
      && (card.cost ?? Number.POSITIVE_INFINITY) <= selfUntappedDonCount.value
    )
    .map(card => card.instanceId)
})
const selectableDonCardIds = computed(() =>
  self.value?.cost
    .filter(card => !card.rested)
    .map(card => card.instanceId) ?? []
)
const draggedHandCardCount = computed(() => {
  if (!draggedHandCardInstanceId.value) {
    return 0
  }

  return selectedHandCardIds.value.includes(draggedHandCardInstanceId.value)
    ? Math.max(selectedHandCardIds.value.length, 1)
    : 1
})
const draggedDonCardCount = computed(() => {
  if (!draggedDonCardInstanceId.value) {
    return 0
  }

  return selectedDonCardIds.value.includes(draggedDonCardInstanceId.value)
    ? Math.max(selectedDonCardIds.value.length, 1)
    : 1
})
const isChoosingCharacterToDiscard = computed(() => pendingCharacterInstanceId.value !== null)
const isChoosingTarget = computed(() => pendingAttackerInstanceId.value !== null)
const isChoosingCounterCard = computed(() => pendingCounterCardInstanceId.value !== null)
const targetableOpponentCharacterIds = computed(() =>
  isChoosingTarget.value
    ? (opponent.value?.characters.filter(character => character.rested).map(character => character.instanceId) ?? [])
    : []
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

  return []
})
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
const boardTravelOverlays = ref<BoardTravelOverlay[]>([])
const boardTravelOverlayElements = new Map<string, HTMLElement>()
const cardFeedbackElements = new Map<number, HTMLElement>()
const bannerFeedbackElements = new Map<number, HTMLElement>()
const pendingBoardTravelSources = new Map<string, { imageUrl: string, sourceRect: DOMRect }>()
const pendingTrashTravelSources = new Map<string, { imageUrl: string, sourceRect: DOMRect, expiresAt: number }>()
const pendingAttachedDonTravelSources: Array<{ sourceRect: DOMRect, expiresAt: number }> = []
const pendingSelfHandTravelSources: Array<{ source: 'life' | 'deck', sourceRect: DOMRect, expiresAt: number }> = []
const pendingOpponentHandTravelSources: Array<{ sourceRect: DOMRect, expiresAt: number }> = []
const animatedSelfLifeToHandIds = new Set<string>()
const animatedSelfDeckToHandIds = new Set<string>()
const animatedOpponentBoardEntryIds = new Set<string>()
const attachedDonOverlayTarget = ref<string[]>([])
let attachedDonTravelKey = 0
let opponentHiddenHandTravelKey = 0
const transientErrorModalState = ref<DuelActionModalState | null>(null)
const openedTrashSide = ref<0 | 1 | null>(null)
const selectedTrashCardInstanceId = ref<string | null>(null)
const trashModalCardSize = ref<{ width: number, height: number } | null>(null)

function dismissTransientErrorModal() {
  transientErrorModalState.value = null
}

const decisionActionModalState = computed<DuelActionModalState | null>(() => {
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
      title: 'Valeur de Contre',
      description: 'Confirmez la valeur de Contre à ajouter pour la durée du combat.',
      slot: 'counter-input',
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
const resultTurnLabel = computed(() => {
  if (turn.value <= 0) {
    return '—'
  }

  return `${turn.value} tour${turn.value > 1 ? 's' : ''}`
})
function parseIsoDate(value: string | null) {
  if (!value) {
    return null
  }

  const parsed = new Date(value)

  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatMatchDurationLabel(startIso: string | null, endIso: string | null) {
  const start = parseIsoDate(startIso)
  const end = parseIsoDate(endIso)

  if (!start || !end) {
    return '—'
  }

  const totalSeconds = Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes === 0) {
    return `${seconds} s`
  }

  if (seconds === 0) {
    return `${minutes} min`
  }

  return `${minutes} min ${seconds.toString().padStart(2, '0')} s`
}

const resultDurationLabel = computed(() =>
  formatMatchDurationLabel(startedAt.value, finishedAt.value)
)

const activeTrashPlayer = computed(() => {
  if (openedTrashSide.value === 0) {
    return self.value
  }

  if (openedTrashSide.value === 1) {
    return opponent.value
  }

  return null
})

const activeTrashCards = computed(() => activeTrashPlayer.value?.trash ?? [])

watch(phase, (nextPhase, previousPhase) => {
  if (nextPhase === 'finished' && previousPhase !== 'finished') {
    isResultModalOpen.value = true
  }
}, { immediate: true })

watch(activeTrashCards, (cards) => {
  if (cards.length === 0) {
    openedTrashSide.value = null
    selectedTrashCardInstanceId.value = null
    return
  }

  if (!cards.some(card => card.instanceId === selectedTrashCardInstanceId.value)) {
    selectedTrashCardInstanceId.value = cards[0]?.instanceId ?? null
  }
})

const waitingToastText = computed(() => {
  if (isOpponentDisconnected.value) {
    return 'Adversaire temporairement deconnecte. La partie reste en attente pendant la fenetre de reconnexion.'
  }

  if (isBlockingStep.value && isSelfAttacker.value) {
    return 'En attente de la décision de blocage de l\'adversaire...'
  }

  if (isCounteringStep.value && isSelfAttacker.value) {
    return 'En attente de la décision de contre de l\'adversaire...'
  }

  if (isAwaitingTriggerDecision.value && isSelfAttacker.value) {
    return 'En attente de la décision de Déclenchement du défenseur...'
  }

  return null
})

const matchupLabel = computed(() => {
  const selfName = self.value?.displayName ?? 'Vous'
  const opponentName = opponent.value?.displayName ?? 'Adversaire'

  return `${selfName} vs ${opponentName}`
})

const turnButtonLabel = computed(() => {
  if (!isSelfTurn.value) {
    return 'Tour adverse'
  }

  if (canEndPhase.value) {
    return 'Fin du tour'
  }

  return 'Votre tour'
})

const turnButtonColor = computed(() => (isSelfTurn.value ? 'primary' : 'neutral'))
const turnButtonVariant = computed(() => (isSelfTurn.value ? 'solid' : 'solid'))

const resolvedHoveredCard = computed(() =>
  mergeHoveredDuelCardDetails(
    hoveredCard.value,
    hoveredCard.value ? hoveredCardCatalogDetails[hoveredCard.value.cardId] : null
  )
)
const isHoveredCardDetailPending = computed(() =>
  Boolean(
    hoveredCard.value
    && pendingHoveredCardDetailIds.value.includes(hoveredCard.value.cardId)
  )
)
const hoveredCardRows = computed<Array<[string, string | number]>>(() => {
  if (!resolvedHoveredCard.value) {
    return []
  }

  return [
    ['Numero', resolvedHoveredCard.value.number],
    ['Type', resolvedHoveredCard.value.type],
    ['Couleur', resolvedHoveredCard.value.colors.join(', ') || 'Aucune'],
    ['Cout', resolvedHoveredCard.value.cost ?? '-'],
    ['Puissance', resolvedHoveredCard.value.power ?? '-'],
    ['Contre', resolvedHoveredCard.value.counter ?? '-'],
    ['Vie', resolvedHoveredCard.value.life ?? '-'],
    ['Declenchement', resolvedHoveredCard.value.trigger ?? '-']
  ]
})

watch(
  () => hoveredCard.value?.cardId ?? null,
  async (cardId) => {
    if (!cardId || hoveredCardCatalogDetails[cardId] || failedHoveredCardDetailIds.has(cardId)) {
      return
    }

    if (!pendingHoveredCardDetailIds.value.includes(cardId)) {
      pendingHoveredCardDetailIds.value = [...pendingHoveredCardDetailIds.value, cardId]
    }

    try {
      const card = await api<Card>(`/catalog/cards/${cardId}`)

      hoveredCardCatalogDetails[cardId] = {
        text: card.text,
        trigger: card.trigger
      }
    } catch {
      failedHoveredCardDetailIds.add(cardId)
    } finally {
      pendingHoveredCardDetailIds.value = pendingHoveredCardDetailIds.value.filter(id => id !== cardId)
    }
  },
  { immediate: true }
)

function mergeGhosts(target: Ref<TransitionGhost[]>, ghosts: TransitionGhost[]) {
  if (ghosts.length === 0) {
    return
  }

  const existingKeys = new Set(target.value.map(ghost => `${ghost.source}:${ghost.instanceId}`))
  const freshGhosts = ghosts.filter(ghost => !existingKeys.has(`${ghost.source}:${ghost.instanceId}`))

  if (freshGhosts.length === 0) {
    return
  }

  target.value = [...target.value, ...freshGhosts]

  window.setTimeout(() => {
    const expiredKeys = new Set(freshGhosts.map(ghost => `${ghost.source}:${ghost.instanceId}`))
    target.value = target.value.filter(ghost => !expiredKeys.has(`${ghost.source}:${ghost.instanceId}`))
  }, 520)
}

function mergeRevealedHandCards(target: Ref<string[]>, ids: string[]) {
  if (ids.length === 0) {
    return
  }

  const freshIds = ids.filter(id => !target.value.includes(id))

  if (freshIds.length === 0) {
    return
  }

  target.value = [...target.value, ...freshIds]

  window.setTimeout(() => {
    target.value = target.value.filter(id => !freshIds.includes(id))
  }, 320)
}

function mergeDeferredVisibleCards(target: Ref<string[]>, ids: string[]) {
  if (ids.length === 0) {
    return
  }

  target.value = Array.from(new Set([...target.value, ...ids]))
}

function cacheOpponentHandTravelSources(count: number) {
  if (count <= 0 || reducedMotion.value === 'reduce' || typeof window === 'undefined') {
    return
  }

  const sourceElement = queryOpponentHandTopCardElement()

  if (!sourceElement) {
    return
  }

  const sourceRect = sourceElement.getBoundingClientRect()
  const expiresAt = Date.now() + 3000

  for (let index = 0; index < count; index += 1) {
    pendingOpponentHandTravelSources.push({ sourceRect, expiresAt })
  }
}

function cacheSelfHandTravelSources(source: 'life' | 'deck', count: number, sourceElement: HTMLElement | null) {
  if (count <= 0 || reducedMotion.value === 'reduce' || typeof window === 'undefined' || !sourceElement) {
    return
  }

  const sourceRect = sourceElement.getBoundingClientRect()
  const expiresAt = Date.now() + 5000

  for (let index = 0; index < count; index += 1) {
    pendingSelfHandTravelSources.push({ source, sourceRect, expiresAt })
  }
}

function cacheMulliganDeckToHandTravelSources(current: DuelPlayerView, previous: DuelPlayerView | null) {
  if (!previous || phase.value !== 'mulligan') {
    return
  }

  const previousHandIds = new Set(previous.hand.map(card => card.instanceId))
  const currentHandIds = new Set(current.hand.map(card => card.instanceId))
  const newHandCount = current.hand.filter(card => !previousHandIds.has(card.instanceId)).length
  const replacedHandCount = previous.hand.filter(card => !currentHandIds.has(card.instanceId)).length

  if (newHandCount === 0 || replacedHandCount === 0) {
    return
  }

  cacheSelfHandTravelSources('deck', newHandCount, querySelfDeckElement())
}

function pruneSelfHandTravelSources() {
  const now = Date.now()

  while (pendingSelfHandTravelSources[0] && pendingSelfHandTravelSources[0].expiresAt <= now) {
    pendingSelfHandTravelSources.shift()
  }
}

function pruneOpponentHandTravelSources() {
  const now = Date.now()

  while (pendingOpponentHandTravelSources[0] && pendingOpponentHandTravelSources[0].expiresAt <= now) {
    pendingOpponentHandTravelSources.shift()
  }
}

function pruneTrashTravelSources() {
  const now = Date.now()

  for (const [instanceId, source] of pendingTrashTravelSources) {
    if (source.expiresAt <= now) {
      pendingTrashTravelSources.delete(instanceId)
    }
  }
}

function pruneAttachedDonTravelSources() {
  const now = Date.now()

  while (pendingAttachedDonTravelSources[0] && pendingAttachedDonTravelSources[0].expiresAt <= now) {
    pendingAttachedDonTravelSources.shift()
  }
}

type FloatingNumberInstance = {
  key: number
  value: number
  x: number
  y: number
  tone: 'damage' | 'gain'
}

const floatingNumbers = ref<FloatingNumberInstance[]>([])
const cardFeedbacks = ref<CardFeedbackInstance[]>([])
const bannerFeedbacks = ref<BannerFeedbackInstance[]>([])
let floatingNumberKey = 0
let cardFeedbackKey = 0
let bannerFeedbackKey = 0

function spawnLifeLossFloatingNumber(leaderInstanceId: string | undefined, lifeLoss: number) {
  if (!leaderInstanceId || lifeLoss <= 0) {
    return
  }

  const element = document.querySelector(`[data-instance-id="${CSS.escape(leaderInstanceId)}"]`)

  if (!element) {
    return
  }

  const rect = element.getBoundingClientRect()

  floatingNumbers.value = [...floatingNumbers.value, {
    key: floatingNumberKey++,
    value: lifeLoss,
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    tone: 'damage'
  }]
}

function removeFloatingNumber(key: number) {
  floatingNumbers.value = floatingNumbers.value.filter(entry => entry.key !== key)
}

function spawnCardFeedbackAtPosition(
  x: number,
  y: number,
  label: string,
  tone: CardFeedbackTone
) {
  const key = cardFeedbackKey++

  cardFeedbacks.value = [...cardFeedbacks.value, {
    key,
    label,
    x,
    y,
    tone
  }]

  nextTick(() => {
    const element = cardFeedbackElements.get(key)

    if (!element) {
      return
    }

    animate(element, reducedMotion.value === 'reduce'
      ? {
          opacity: [1, 1, 0],
          duration: 700,
          ease: 'linear',
          onComplete: () => removeCardFeedback(key)
        }
      : {
          opacity: [0, 1, 1, 0],
          y: [6, -20, -28],
          scale: [0.9, 1, 1],
          duration: 1000,
          ease: 'outCubic',
          onComplete: () => removeCardFeedback(key)
        })
  })
}

function spawnCardFeedback(instanceId: string | undefined, label: string, tone: CardFeedbackTone) {
  const element = instanceId ? queryCardElement(instanceId) : null

  if (element) {
    const rect = element.getBoundingClientRect()

    spawnCardFeedbackAtPosition(
      rect.left + rect.width / 2,
      rect.top + Math.min(rect.height * 0.3, 44),
      label,
      tone
    )
    return
  }

  const containerRect = boardContainer.value?.getBoundingClientRect()

  if (!containerRect) {
    return
  }

  spawnCardFeedbackAtPosition(
    containerRect.left + containerRect.width / 2,
    containerRect.top + Math.min(containerRect.height * 0.32, 180),
    label,
    tone
  )
}

function removeCardFeedback(key: number) {
  cardFeedbackElements.delete(key)
  cardFeedbacks.value = cardFeedbacks.value.filter(entry => entry.key !== key)
}

function spawnBannerFeedback(message: string, tone: BannerFeedbackTone) {
  const key = bannerFeedbackKey++

  bannerFeedbacks.value = [...bannerFeedbacks.value, {
    key,
    message,
    tone
  }]

  nextTick(() => {
    const element = bannerFeedbackElements.get(key)

    if (!element) {
      return
    }

    animate(element, reducedMotion.value === 'reduce'
      ? {
          opacity: [1, 1, 0],
          duration: 900,
          ease: 'linear',
          onComplete: () => removeBannerFeedback(key)
        }
      : {
          opacity: [0, 1, 1, 0],
          y: [-10, 0, 0, -6],
          scale: [0.96, 1, 1, 0.99],
          duration: 1400,
          ease: 'outCubic',
          onComplete: () => removeBannerFeedback(key)
        })
  })
}

function removeBannerFeedback(key: number) {
  bannerFeedbackElements.delete(key)
  bannerFeedbacks.value = bannerFeedbacks.value.filter(entry => entry.key !== key)
}

function cardFeedbackToneClass(tone: CardFeedbackTone) {
  return {
    power: 'border-primary/40 bg-primary/15 text-primary',
    warning: 'border-warning/40 bg-warning/15 text-warning',
    danger: 'border-error/40 bg-error/15 text-error'
  }[tone]
}

function bannerFeedbackToneClass(tone: BannerFeedbackTone) {
  return tone === 'error'
    ? 'border-error/50 bg-error/16 text-error'
    : 'border-primary/40 bg-default/90 text-highlighted'
}

function findPlayerByDisplayName(displayName: string) {
  if (self.value?.displayName === displayName) {
    return self.value
  }

  if (opponent.value?.displayName === displayName) {
    return opponent.value
  }

  return null
}

function findVisibleCardInstanceIdByName(name: string) {
  for (const player of [self.value, opponent.value]) {
    if (!player) {
      continue
    }

    if (player.leader?.name === name) {
      return player.leader.instanceId
    }

    if (player.stage?.name === name) {
      return player.stage.instanceId
    }

    const character = player.characters.find(card => card.name === name)

    if (character) {
      return character.instanceId
    }
  }

  return null
}

function resolveGlobalActionMessage(message: string) {
  const attackMatch = message.match(/^(?<attacker>.+?) attaque avec (?<source>.+?) vers (?<target>.+)\.$/u)

  const attackGroups = attackMatch?.groups

  if (attackGroups?.source && attackGroups.target) {
    const source = attackGroups.source.trim()
    const rawTarget = attackGroups.target.trim()
    const leaderMatch = rawTarget.match(/^le Leader de (?<defender>.+)$/u)
    const target = leaderMatch?.groups?.defender
      ? findPlayerByDisplayName(leaderMatch.groups.defender)?.leader?.name ?? 'le Leader'
      : rawTarget

    return `${source} attaque ${target}`
  }

  return null
}

function cardMapFromPlayer(player: DuelPlayerView | null) {
  const map = new Map<string, PublicCard>()

  if (!player) {
    return map
  }

  if (player.leader) {
    map.set(player.leader.instanceId, player.leader)
  }

  if (player.stage) {
    map.set(player.stage.instanceId, player.stage)
  }

  for (const card of player.characters) {
    map.set(card.instanceId, card)
  }

  return map
}

function queueAttachedDonFeedback(current: DuelPlayerView | null, previous: DuelPlayerView | null) {
  const currentCards = cardMapFromPlayer(current)
  const previousCards = cardMapFromPlayer(previous)

  for (const [instanceId, card] of currentCards) {
    const previousAttachedDon = previousCards.get(instanceId)?.attachedDon ?? 0
    const attachedDonGain = card.attachedDon - previousAttachedDon

    if (attachedDonGain <= 0) {
      continue
    }

    nextTick(() => spawnCardFeedback(instanceId, `+${attachedDonGain * 1000}`, 'power'))
  }
}

function queueKoFeedback(current: DuelPlayerView | null, previous: DuelPlayerView | null) {
  if (!previous) {
    return
  }

  const currentCharacterIds = new Set(current?.characters.map(card => card.instanceId) ?? [])

  for (const previousCharacter of previous.characters) {
    if (currentCharacterIds.has(previousCharacter.instanceId)) {
      continue
    }

    const element = queryCardElement(previousCharacter.instanceId)

    if (!element) {
      continue
    }

    const rect = element.getBoundingClientRect()
    spawnCardFeedbackAtPosition(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      'KO',
      'danger'
    )
  }
}

function handleNewLogFeedback(message: string) {
  const globalActionMessage = resolveGlobalActionMessage(message)

  if (globalActionMessage) {
    spawnBannerFeedback(globalActionMessage, 'action')
  }

  const blockerMatch = message.match(/^(?<player>.+?) declare (?<card>.+?) comme Bloqueur\.$/u)
  const blockerCardName = blockerMatch?.groups?.card

  if (blockerCardName) {
    nextTick(() => spawnCardFeedback(
      findVisibleCardInstanceIdByName(blockerCardName) ?? combat.value?.blockerInstanceId ?? undefined,
      'Blocker',
      'warning'
    ))
  }

  const donGainMatch = message.match(/^(?<player>.+?) donne \d+ DON!! a (?<target>.+?) \(\+(?<power>\d+) de puissance\)\.$/u)
  const donGainGroups = donGainMatch?.groups

  if (donGainGroups?.player && donGainGroups.target && donGainGroups.power) {
    const player = findPlayerByDisplayName(donGainGroups.player)
    const targetInstanceId = donGainGroups.target === 'son Leader'
      ? player?.leader?.instanceId ?? undefined
      : findVisibleCardInstanceIdByName(donGainGroups.target) ?? undefined

    nextTick(() => spawnCardFeedback(targetInstanceId, `+${donGainGroups.power}`, 'power'))
  }
}

function syncPlayerTransitions(
  current: DuelPlayerView | null,
  previous: DuelPlayerView | null,
  ghostsTarget: Ref<TransitionGhost[]>,
  revealedHandTarget?: Ref<string[]>,
  skippedGhostSources: TransitionGhost['source'][] = []
) {
  if (!current) {
    return null
  }

  const diff = derivePlayerTransitionDiff(previous, current)
  mergeGhosts(
    ghostsTarget,
    diff.ghosts.filter(ghost => !skippedGhostSources.includes(ghost.source))
  )

  if (revealedHandTarget && !skippedGhostSources.includes('life')) {
    mergeRevealedHandCards(revealedHandTarget, diff.revealedHandCardIds)
  }

  if (diff.lifeLoss > 0) {
    nextTick(() => spawnLifeLossFloatingNumber(current.leader?.instanceId, diff.lifeLoss))
  }

  return diff
}

watch(self, (current, previous) => {
  const currentHandIds = new Set(current?.hand.map(card => card.instanceId) ?? [])

  for (const instanceId of Array.from(animatedSelfLifeToHandIds)) {
    if (!currentHandIds.has(instanceId)) {
      animatedSelfLifeToHandIds.delete(instanceId)
    }
  }

  for (const instanceId of Array.from(animatedSelfDeckToHandIds)) {
    if (!currentHandIds.has(instanceId)) {
      animatedSelfDeckToHandIds.delete(instanceId)
    }
  }

  if (previous && current) {
    pruneSelfHandTravelSources()
    cacheSelfHandTravelSources('life', Math.max(previous.lifeCount - current.lifeCount, 0), queryLifeStackElement(0))
    cacheSelfHandTravelSources('deck', Math.max(previous.deckCount - current.deckCount, 0), querySelfDeckElement())
    cacheMulliganDeckToHandTravelSources(current, previous)
  }

  queueKoFeedback(current, previous)
  const diff = syncPlayerTransitions(current, previous, selfTransitionGhosts, selfRevealedHandCardIds, ['donDeck', 'life'])

  if (current) {
    queueSelfHandTravelOverlays(current, previous)
    queuePendingBoardTravelOverlays(current, previous)
    queueDonDeckToCostTravelOverlays(diff, 0, selfDeferredCostCardIds)
    queueAttachedDonTravelOverlays(current, previous)
  }

  queueTrashTravelOverlay(current, previous, 0, selfDeferredTrashCardIds)
  queueAttachedDonFeedback(current, previous)
  syncPendingHandPlayQueue(current)
})

watch(phase, (currentPhase, previousPhase) => {
  if (currentPhase !== 'mulligan' || previousPhase === 'mulligan' || !self.value) {
    return
  }

  mergeRevealedHandCards(selfRevealedHandCardIds, self.value.hand.map(card => card.instanceId))
})

watch(opponent, (current, previous) => {
  const previousVisibleBoardIds = new Set([
    ...(previous?.characters.map(card => card.instanceId) ?? []),
    ...(previous?.stage ? [previous.stage.instanceId] : [])
  ])
  const currentVisibleBoardIds = new Set([
    ...(current?.characters.map(card => card.instanceId) ?? []),
    ...(current?.stage ? [current.stage.instanceId] : [])
  ])

  for (const instanceId of Array.from(animatedOpponentBoardEntryIds)) {
    if (!currentVisibleBoardIds.has(instanceId) && !previousVisibleBoardIds.has(instanceId)) {
      animatedOpponentBoardEntryIds.delete(instanceId)
    }
  }

  queueKoFeedback(current, previous)
  const diff = syncPlayerTransitions(current, previous, opponentTransitionGhosts)
  const handLoss = previous && current ? Math.max(previous.handCount - current.handCount, 0) : 0

  pruneOpponentHandTravelSources()
  cacheOpponentHandTravelSources(handLoss)

  if (current) {
    queueOpponentLifeToHandTravelOverlays(previous, current)
    queueOpponentDeckToHandTravelOverlays(previous, current)
    queueOpponentHandToBoardTravelOverlays(current, previous)
    queueDonDeckToCostTravelOverlays(diff, 1, opponentDeferredCostCardIds)
    queueOpponentAttachedDonTravelOverlays(current, previous)
  }

  queueTrashTravelOverlay(current, previous, 1, opponentDeferredTrashCardIds)
  queueAttachedDonFeedback(current, previous)
})

function formatLogTime(createdAt: string): string {
  const date = new Date(createdAt)

  if (Number.isNaN(date.getTime())) {
    return '--:--'
  }

  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const logToneClasses = {
  positive: 'text-success',
  negative: 'text-error',
  special: 'text-warning',
  neutral: 'text-muted'
} as const

type LogTone = keyof typeof logToneClasses

function getLogTone(message: string): LogTone {
  if (/(attaque|dégât|dégats|KO|perd|défausse|détruit|impossible|invalide|insuffisant|ne peut|deck-out|pleine|Aucun DON)/i.test(message)) {
    return 'negative'
  }

  if (/(trigger|déclenche|déclenchement|révèle|active|rare|jalon|milestone)/i.test(message)) {
    return 'special'
  }

  if (/(joue|soigne|gagne|récupère|renforce|boost|augmente|remporte)/i.test(message)) {
    return 'positive'
  }

  return 'neutral'
}

async function scrollJournalToLatest(behavior: ScrollBehavior = 'smooth') {
  await nextTick()
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

  const element = journalScrollArea.value?.$el

  if (!element) {
    return
  }

  element.scrollTo({
    top: element.scrollHeight,
    behavior
  })
}

watch(() => logs.value.length, async (newLength, previousLength) => {
  if (newLength <= previousLength) {
    return
  }

  const newEntries = logs.value.slice(previousLength, newLength)

  for (const entry of newEntries) {
    handleNewLogFeedback(entry.message)
  }

  if (isJournalOpen.value) {
    seenLogCount.value = newLength
    await scrollJournalToLatest('smooth')
  }
})

watch(isJournalOpen, async (open) => {
  if (open) {
    seenLogCount.value = logs.value.length
    await scrollJournalToLatest('auto')
  }
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

function pulseHandCard(instanceId: string) {
  invalidHandCardIds.value = Array.from(new Set([...invalidHandCardIds.value, instanceId]))

  window.setTimeout(() => {
    invalidHandCardIds.value = invalidHandCardIds.value.filter(current => current !== instanceId)
  }, 220)
}

function queryCardElement(instanceId: string): HTMLElement | null {
  return document.querySelector(`[data-instance-id="${CSS.escape(instanceId)}"]`)
}

function querySelfDonDeckElement(): HTMLElement | null {
  return document.querySelector('[data-don-deck-side="0"]')
}

function queryOpponentDonDeckElement(): HTMLElement | null {
  return document.querySelector('[data-don-deck-side="1"]')
}

function querySelfDeckElement(): HTMLElement | null {
  return document.querySelector('[data-deck-side="0"][data-deck-top="true"]')
}

function queryOpponentDeckElement(): HTMLElement | null {
  return document.querySelector('[data-deck-side="1"][data-deck-top="true"]')
}

function queryOpponentHandElement(): HTMLElement | null {
  return document.querySelector('[data-opponent-hand="true"]')
}

function queryOpponentHandTopCardElement(): HTMLElement | null {
  return document.querySelector('[data-opponent-hand="true"] [data-hidden-hand-top="true"]')
}

function queryLifeStackElement(side: 0 | 1): HTMLElement | null {
  return document.querySelector(`[data-life-side="${side}"] [data-life-top="true"]`)
}

function querySelfCostCardElement(instanceId: string): HTMLElement | null {
  return document.querySelector(`[data-zone-side="0"][data-instance-id="${CSS.escape(instanceId)}"]`)
}

function queryOpponentCostCardElement(instanceId: string): HTMLElement | null {
  return document.querySelector(`[data-zone-side="1"][data-instance-id="${CSS.escape(instanceId)}"]`)
}

function querySelfUntappedCostCardElement(): HTMLElement | null {
  const matches = Array.from(document.querySelectorAll<HTMLElement>('[data-zone-side="0"][data-cost-state="untapped"]'))

  return matches.at(-1) ?? null
}

function queryOpponentUntappedCostCardElement(): HTMLElement | null {
  const matches = Array.from(document.querySelectorAll<HTMLElement>('[data-zone-side="1"][data-cost-state="untapped"]'))

  return matches.at(-1) ?? null
}

function queryAttachedDonSlotElement(instanceId: string, slotIndex: number): HTMLElement | null {
  return document.querySelector(
    `[data-attached-don-owner="${CSS.escape(instanceId)}"][data-attached-don-slot="${String(slotIndex)}"]`
  )
}

function queryTrashCardElement(side: 0 | 1, instanceId: string): HTMLElement | null {
  return document.querySelector(`[data-trash-side="${side}"] [data-instance-id="${CSS.escape(instanceId)}"]`)
}

function queryCharacterZoneCardElement(side: 0 | 1): HTMLElement | null {
  return document.querySelector(`[data-character-side="${side}"] [data-instance-id]`)
}

function revealDeferredVisibleCard(target: Ref<string[]>, instanceId: string) {
  target.value = target.value.filter(id => id !== instanceId)
}

function removeBoardTravelOverlay(key: string, target: Ref<string[]>, instanceId: string) {
  boardTravelOverlayElements.delete(key)
  boardTravelOverlays.value = boardTravelOverlays.value.filter(overlay => overlay.key !== key)
  revealDeferredVisibleCard(target, instanceId)
}

function boardTravelOverlayStyle(overlay: BoardTravelOverlay) {
  const settledOpacity = overlay.variant === 'attachedDon'
    ? 0.18
    : 1

  return {
    left: `${overlay.sourceRect.left}px`,
    top: `${overlay.sourceRect.top}px`,
    width: `${overlay.sourceRect.width}px`,
    height: `${overlay.sourceRect.height}px`,
    transform: overlay.settled
      ? `translate(${overlay.translateX}px, ${overlay.translateY}px) scale(${overlay.scaleX}, ${overlay.scaleY})`
      : 'translate(0px, 0px) scale(1, 1)',
    opacity: overlay.settled ? settledOpacity : overlay.opacity,
    transitionDuration: `${overlay.durationMs}ms`,
    transitionTimingFunction: overlay.easing
  }
}

function setBoardTravelOverlayElement(key: string, value: Element | null) {
  if (value instanceof HTMLElement) {
    boardTravelOverlayElements.set(key, value)
    return
  }

  boardTravelOverlayElements.delete(key)
}

function setCardFeedbackElement(key: number, value: Element | null) {
  if (value instanceof HTMLElement) {
    cardFeedbackElements.set(key, value)
    return
  }

  cardFeedbackElements.delete(key)
}

function setBannerFeedbackElement(key: number, value: Element | null) {
  if (value instanceof HTMLElement) {
    bannerFeedbackElements.set(key, value)
    return
  }

  bannerFeedbackElements.delete(key)
}

function createTravelOverlayFromRect(
  key: string,
  instanceId: string,
  imageUrl: string,
  sourceRect: DOMRect,
  destinationRect: DOMRect,
  target: Ref<string[]>,
  rotated = false,
  delayMs = 0,
  variant: BoardTravelOverlay['variant'] = 'default',
  onComplete?: () => void
) {
  const translateX = destinationRect.left - sourceRect.left
  const translateY = destinationRect.top - sourceRect.top
  const scaleX = sourceRect.width === 0 ? 1 : destinationRect.width / sourceRect.width
  const scaleY = sourceRect.height === 0 ? 1 : destinationRect.height / sourceRect.height
  const distance = Math.hypot(translateX, translateY)
  const durationMs = variant === 'attachedDon'
    ? Math.min(580, Math.max(340, 320 + distance * 0.18))
    : Math.min(BOARD_TRAVEL_MS, Math.max(220, 200 + distance * 0.16))
  const easing = variant === 'attachedDon'
    ? ATTACHED_DON_TRAVEL_EASING
    : DEFAULT_TRAVEL_EASING
  const opacity = variant === 'attachedDon' ? 0.98 : 1

  window.setTimeout(() => {
    boardTravelOverlays.value = [
      ...boardTravelOverlays.value.filter(overlay => overlay.key !== key),
      {
        key,
        instanceId,
        imageUrl,
        sourceRect,
        destinationRect,
        translateX,
        translateY,
        scaleX,
        scaleY,
        settled: false,
        durationMs,
        easing,
        variant,
        opacity,
        rotated
      }
    ]

    nextTick(() => {
      const element = boardTravelOverlayElements.get(key)

      if (!element) {
        removeBoardTravelOverlay(key, target, instanceId)
        onComplete?.()
        return
      }

      const scheduleOverlayStart = typeof window.requestAnimationFrame === 'function'
        ? window.requestAnimationFrame.bind(window)
        : (callback: FrameRequestCallback) => window.setTimeout(() => callback(performance.now()), 16)

      scheduleOverlayStart(() => {
        boardTravelOverlays.value = boardTravelOverlays.value.map((overlay) => {
          if (overlay.key !== key) {
            return overlay
          }

          return {
            ...overlay,
            settled: true
          }
        })
      })

      window.setTimeout(() => {
        removeBoardTravelOverlay(key, target, instanceId)
        onComplete?.()
      }, durationMs)
    })
  }, delayMs)
}

function createTravelOverlay(
  key: string,
  instanceId: string,
  imageUrl: string,
  sourceRect: DOMRect,
  destinationElement: HTMLElement,
  target: Ref<string[]>,
  rotated = false,
  delayMs = 0,
  variant: BoardTravelOverlay['variant'] = 'default',
  onComplete?: () => void
) {
  createTravelOverlayFromRect(
    key,
    instanceId,
    imageUrl,
    sourceRect,
    destinationElement.getBoundingClientRect(),
    target,
    rotated,
    delayMs,
    variant,
    onComplete
  )
}

function createReadableAttachedDonDestinationRect(sourceRect: DOMRect, destinationElement: HTMLElement) {
  const rect = destinationElement.getBoundingClientRect()
  const width = Math.max(rect.width + 18, sourceRect.width * 0.62)
  const height = Math.max(rect.height + 10, sourceRect.height * 0.62)
  const left = rect.left + (rect.width - width) / 2
  const top = rect.top + (rect.height - height) / 2 - 4

  return new DOMRect(left, top, width, height)
}

function queryCostCardElement(side: 0 | 1, instanceId: string): HTMLElement | null {
  return side === 0
    ? querySelfCostCardElement(instanceId)
    : queryOpponentCostCardElement(instanceId)
}

function deriveRemovedUntappedCostSourceRects(
  previous: DuelPlayerView | null,
  current: DuelPlayerView,
  side: 0 | 1
) {
  if (!previous) {
    return []
  }

  const currentCostIds = new Set(current.cost.map(card => card.instanceId))

  return previous.cost
    .filter(card => !card.rested && !currentCostIds.has(card.instanceId))
    .map(card => queryCostCardElement(side, card.instanceId)?.getBoundingClientRect())
    .filter((rect): rect is DOMRect => Boolean(rect))
}

function queueSelfHandTravelOverlays(current: DuelPlayerView, previous: DuelPlayerView | null) {
  if (!previous || reducedMotion.value === 'reduce' || typeof window === 'undefined') {
    return
  }

  pruneSelfHandTravelSources()

  const previousHandIds = new Set(previous.hand.map(card => card.instanceId))
  const newHandCards = current.hand
    .filter(card => !previousHandIds.has(card.instanceId))
    .filter(card => !animatedSelfLifeToHandIds.has(card.instanceId) && !animatedSelfDeckToHandIds.has(card.instanceId))
    .filter((card): card is PrivateCard & { imageUrl: string } => typeof card.imageUrl === 'string' && card.imageUrl.length > 0)

  if (newHandCards.length === 0 || pendingSelfHandTravelSources.length === 0) {
    return
  }

  const assignments: Array<{
    card: PrivateCard & { imageUrl: string }
    source: 'life' | 'deck'
    sourceRect: DOMRect
  }> = []

  for (const card of newHandCards) {
    const source = pendingSelfHandTravelSources.shift()

    if (!source) {
      break
    }

    assignments.push({
      card,
      source: source.source,
      sourceRect: source.sourceRect
    })
  }

  if (assignments.length === 0) {
    return
  }

  nextTick(() => {
    const destinationRects = new Map<string, DOMRect>()

    for (const { card } of assignments) {
      const destinationElement = queryCardElement(card.instanceId)

      if (destinationElement) {
        destinationRects.set(card.instanceId, destinationElement.getBoundingClientRect())
      }
    }

    if (destinationRects.size === 0) {
      return
    }

    mergeDeferredVisibleCards(
      selfDeferredHandCardIds,
      assignments
        .map(({ card }) => card)
        .filter(card => destinationRects.has(card.instanceId))
        .map(card => card.instanceId)
    )

    for (const { item: assignment, delayMs } of createStaggeredTravelPlan(assignments, BOARD_TRAVEL_STAGGER_MS)) {
      const { card, source, sourceRect } = assignment
      const destinationRect = destinationRects.get(card.instanceId)

      if (!destinationRect) {
        revealDeferredVisibleCard(selfDeferredHandCardIds, card.instanceId)
        continue
      }

      if (source === 'life') {
        animatedSelfLifeToHandIds.add(card.instanceId)
      } else {
        animatedSelfDeckToHandIds.add(card.instanceId)
      }

      createTravelOverlayFromRect(
        `${source}-hand:${card.instanceId}`,
        card.instanceId,
        card.imageUrl,
        sourceRect,
        destinationRect,
        selfDeferredHandCardIds,
        false,
        delayMs,
        'default',
        source === 'life'
          ? () => mergeRevealedHandCards(selfRevealedHandCardIds, [card.instanceId])
          : undefined
      )
    }
  })
}

function queueOpponentHiddenHandTravelOverlays(
  source: 'deck' | 'life',
  count: number,
  sourceElement: HTMLElement | null
) {
  if (count <= 0 || reducedMotion.value === 'reduce' || typeof window === 'undefined' || !sourceElement) {
    return
  }

  const sourceRect = sourceElement.getBoundingClientRect()

  nextTick(() => {
    const destinationElement = queryOpponentHandTopCardElement()

    if (!destinationElement) {
      return
    }

    const destinationRect = destinationElement.getBoundingClientRect()

    for (const { item: index, delayMs } of createStaggeredTravelPlan(
      Array.from({ length: count }, (_, itemIndex) => itemIndex),
      BOARD_TRAVEL_STAGGER_MS
    )) {
      const overlayInstanceId = `opponent-hidden-hand:${source}:${++opponentHiddenHandTravelKey}:${index}`

      mergeDeferredVisibleCards(opponentDeferredHandTravelIds, [overlayInstanceId])

      createTravelOverlayFromRect(
        overlayInstanceId,
        overlayInstanceId,
        cardBackRegular,
        sourceRect,
        destinationRect,
        opponentDeferredHandTravelIds,
        false,
        delayMs
      )
    }
  })
}

function queueOpponentLifeToHandTravelOverlays(previous: DuelPlayerView | null, current: DuelPlayerView) {
  if (!previous) {
    return
  }

  const handGain = Math.max(current.handCount - previous.handCount, 0)
  const lifeLoss = Math.max(previous.lifeCount - current.lifeCount, 0)
  const lifeToHandCount = Math.min(handGain, lifeLoss)

  queueOpponentHiddenHandTravelOverlays('life', lifeToHandCount, queryLifeStackElement(1))
}

function queueOpponentDeckToHandTravelOverlays(previous: DuelPlayerView | null, current: DuelPlayerView) {
  if (!previous) {
    return
  }

  const handGain = Math.max(current.handCount - previous.handCount, 0)
  const lifeLoss = Math.max(previous.lifeCount - current.lifeCount, 0)
  const deckLoss = Math.max(previous.deckCount - current.deckCount, 0)
  const deckToHandCount = Math.min(Math.max(handGain - lifeLoss, 0), deckLoss)

  queueOpponentHiddenHandTravelOverlays('deck', deckToHandCount, queryOpponentDeckElement())
}

function queueTrashTravelOverlay(
  current: DuelPlayerView | null,
  previous: DuelPlayerView | null,
  side: 0 | 1,
  deferredTrashTarget: Ref<string[]>
) {
  if (!current || !previous || reducedMotion.value === 'reduce' || typeof window === 'undefined') {
    return
  }

  pruneTrashTravelSources()

  const topTrash = current.trash[0]

  if (
    !topTrash
    || typeof topTrash.imageUrl !== 'string'
    || topTrash.imageUrl.length === 0
    || previous.trash.some(card => card.instanceId === topTrash.instanceId)
  ) {
    return
  }

  const trashImageUrl = topTrash.imageUrl

  const existedInVisibleZone = previous.characters.some(card => card.instanceId === topTrash.instanceId)
    || previous.stage?.instanceId === topTrash.instanceId
    || previous.cost.some(card => card.instanceId === topTrash.instanceId)
    || (side === 0 && previous.hand.some(card => card.instanceId === topTrash.instanceId))

  if (!existedInVisibleZone) {
    return
  }

  const pendingSource = pendingTrashTravelSources.get(topTrash.instanceId)
  pendingTrashTravelSources.delete(topTrash.instanceId)
  const sourceRect = pendingSource?.sourceRect ?? queryCardElement(topTrash.instanceId)?.getBoundingClientRect()

  if (!sourceRect) {
    return
  }

  mergeDeferredVisibleCards(deferredTrashTarget, [topTrash.instanceId])

  nextTick(() => {
    const destinationElement = queryTrashCardElement(side, topTrash.instanceId)

    if (!destinationElement) {
      revealDeferredVisibleCard(deferredTrashTarget, topTrash.instanceId)
      return
    }

    createTravelOverlay(
      `trash:${side}:${topTrash.instanceId}`,
      topTrash.instanceId,
      trashImageUrl,
      sourceRect,
      destinationElement,
      deferredTrashTarget
    )
  })
}

function cacheBoardTravelSource(card: PrivateCard) {
  if (reducedMotion.value === 'reduce' || typeof window === 'undefined' || !card.imageUrl) {
    return
  }

  const sourceElement = queryCardElement(card.instanceId)

  if (!sourceElement) {
    return
  }

  pendingBoardTravelSources.set(card.instanceId, {
    imageUrl: card.imageUrl,
    sourceRect: sourceElement.getBoundingClientRect()
  })
}

function cacheTrashTravelSource(card: PrivateCard | PublicCard | null | undefined) {
  if (reducedMotion.value === 'reduce' || typeof window === 'undefined' || !card?.imageUrl) {
    return
  }

  const sourceElement = queryCardElement(card.instanceId)

  if (!sourceElement) {
    return
  }

  pendingTrashTravelSources.set(card.instanceId, {
    imageUrl: card.imageUrl,
    sourceRect: sourceElement.getBoundingClientRect(),
    expiresAt: Date.now() + 3000
  })
}

function queuePendingBoardTravelOverlays(current: DuelPlayerView, previous: DuelPlayerView | null) {
  if (!previous || reducedMotion.value === 'reduce' || typeof window === 'undefined') {
    return
  }

  const boardArrivalIds = [
    ...current.characters
      .filter(character =>
        !previous.characters.some(previousCharacter => previousCharacter.instanceId === character.instanceId)
        && pendingBoardTravelSources.has(character.instanceId)
      )
      .map(character => character.instanceId),
    ...(current.stage
      && previous.stage?.instanceId !== current.stage.instanceId
      && pendingBoardTravelSources.has(current.stage.instanceId)
      ? [current.stage.instanceId]
      : [])
  ]
  const pendingArrivals = boardArrivalIds.filter(instanceId => pendingBoardTravelSources.has(instanceId))

  if (pendingArrivals.length === 0) {
    return
  }

  mergeDeferredVisibleCards(selfDeferredBoardCardIds, pendingArrivals)

  nextTick(() => {
    for (const { item: instanceId, delayMs } of createStaggeredTravelPlan(pendingArrivals, BOARD_TRAVEL_STAGGER_MS)) {
      const pendingSource = pendingBoardTravelSources.get(instanceId)
      pendingBoardTravelSources.delete(instanceId)

      const destinationElement = queryCardElement(instanceId)

      if (!pendingSource || !destinationElement) {
        revealDeferredVisibleCard(selfDeferredBoardCardIds, instanceId)
        continue
      }

      createTravelOverlay(
        `board:${instanceId}`,
        instanceId,
        pendingSource.imageUrl,
        pendingSource.sourceRect,
        destinationElement,
        selfDeferredBoardCardIds,
        false,
        delayMs
      )
    }
  })
}

function queueOpponentHandToBoardTravelOverlays(current: DuelPlayerView, previous: DuelPlayerView | null) {
  if (!previous || reducedMotion.value === 'reduce' || typeof window === 'undefined') {
    return
  }

  pruneOpponentHandTravelSources()

  const sourceElement = queryOpponentHandElement()

  if (!sourceElement) {
    return
  }

  const boardArrivalIds = [
    ...current.characters
      .filter(character =>
        !previous.characters.some(previousCharacter => previousCharacter.instanceId === character.instanceId)
        && !animatedOpponentBoardEntryIds.has(character.instanceId)
      )
      .map(character => character.instanceId),
    ...(current.stage && previous.stage?.instanceId !== current.stage.instanceId && !animatedOpponentBoardEntryIds.has(current.stage.instanceId)
      ? [current.stage.instanceId]
      : [])
  ]

  const travelCount = Math.min(boardArrivalIds.length, pendingOpponentHandTravelSources.length)

  if (travelCount === 0) {
    return
  }

  const travellingArrivalIds = boardArrivalIds.slice(0, travelCount)
  travellingArrivalIds.forEach(instanceId => animatedOpponentBoardEntryIds.add(instanceId))
  mergeDeferredVisibleCards(opponentDeferredBoardCardIds, travellingArrivalIds)

  nextTick(() => {
    for (const { item: instanceId, delayMs } of createStaggeredTravelPlan(travellingArrivalIds, BOARD_TRAVEL_STAGGER_MS)) {
      const destinationElement = queryCardElement(instanceId)
      const card = current.characters.find(character => character.instanceId === instanceId)
        ?? (current.stage?.instanceId === instanceId ? current.stage : null)
      const sourceRect = pendingOpponentHandTravelSources.shift()?.sourceRect
        ?? queryOpponentHandTopCardElement()?.getBoundingClientRect()

      if (!destinationElement || !card?.imageUrl || !sourceRect) {
        revealDeferredVisibleCard(opponentDeferredBoardCardIds, instanceId)
        continue
      }

      createTravelOverlay(
        `opponent-board:${instanceId}`,
        instanceId,
        card.imageUrl,
        sourceRect,
        destinationElement,
        opponentDeferredBoardCardIds,
        false,
        delayMs
      )
    }
  })
}

function queueDonDeckToCostTravelOverlays(
  diff: PlayerTransitionDiff | null,
  side: 0 | 1,
  deferredCostTarget: Ref<string[]>
) {
  if (!diff || reducedMotion.value === 'reduce' || typeof window === 'undefined') {
    return
  }

  const donCostIds = diff.ghosts
    .filter(ghost => ghost.source === 'donDeck')
    .map(ghost => ghost.instanceId)

  if (donCostIds.length === 0) {
    return
  }

  const sourceElement = side === 0
    ? querySelfDonDeckElement()
    : queryOpponentDonDeckElement()

  if (!sourceElement) {
    return
  }

  const sourceRect = sourceElement.getBoundingClientRect()
  mergeDeferredVisibleCards(deferredCostTarget, donCostIds)

  nextTick(() => {
    for (const { item: instanceId, delayMs } of createStaggeredTravelPlan(donCostIds, BOARD_TRAVEL_STAGGER_MS)) {
      const destinationElement = side === 0
        ? querySelfCostCardElement(instanceId)
        : queryOpponentCostCardElement(instanceId)

      if (!destinationElement) {
        revealDeferredVisibleCard(deferredCostTarget, instanceId)
        continue
      }

      createTravelOverlay(
        `cost:${side}:${instanceId}`,
        instanceId,
        cardFrontDon,
        sourceRect,
        destinationElement,
        deferredCostTarget,
        false,
        delayMs
      )
    }
  })
}

function cacheAttachedDonTravelSources(instanceIds: string[]) {
  if (reducedMotion.value === 'reduce' || typeof window === 'undefined') {
    return
  }

  pruneAttachedDonTravelSources()

  for (const instanceId of instanceIds) {
    const sourceElement = querySelfCostCardElement(instanceId)

    if (!sourceElement) {
      continue
    }

    pendingAttachedDonTravelSources.push({
      sourceRect: sourceElement.getBoundingClientRect(),
      expiresAt: Date.now() + 3000
    })
  }
}

function clearSelectedDonCards() {
  selectedDonCardIds.value = []
  selectedDonAnchorInstanceId.value = null
}

function clearSelectedHandCards() {
  selectedHandCardIds.value = []
}

function clearPendingHandPlayQueue() {
  pendingQueuedHandCardIds.value = []
  queuedHandCardInstanceId.value = null
}

function clearDraggedDonCard() {
  draggedDonCardInstanceId.value = null
}

function syncSelectedHandCardsWithHand() {
  const selectableIds = new Set(selectableHandCardIds.value)

  selectedHandCardIds.value = selectedHandCardIds.value.filter(id => selectableIds.has(id))

  if (draggedHandCardInstanceId.value && !selectableIds.has(draggedHandCardInstanceId.value)) {
    resetDraggedHandCard()
  }
}

watch(selectableHandCardIds, syncSelectedHandCardsWithHand, { immediate: true })

watch(
  [phase, isSelfTurn],
  ([currentPhase, selfTurn], [previousPhase, previousSelfTurn]) => {
    if (
      currentPhase === 'main'
      && selfTurn
      && (previousPhase !== 'main' || !previousSelfTurn)
    ) {
      clearSelectedHandCards()
      clearPendingHandPlayQueue()
      resetDraggedHandCard()
      invalidHandCardIds.value = []
    }
  },
  { immediate: true }
)

watch(
  [phase, isSelfTurn, isCombatInProgress],
  ([currentPhase, selfTurn, combatInProgress]) => {
    if (
      !selfTurn
      || combatInProgress
      || !AUTO_ADVANCE_PHASES.has(currentPhase)
      || currentPhase === 'finished'
    ) {
      return
    }

    window.setTimeout(() => {
      if (
        isSelfTurn.value
        && !isCombatInProgress.value
        && phase.value === currentPhase
        && AUTO_ADVANCE_PHASES.has(currentPhase)
      ) {
        endPhase()
      }
    }, 0)
  },
  { immediate: true }
)

function syncSelectedDonCardsWithCost() {
  const selectableIds = new Set(selectableDonCardIds.value)

  if (!canAttachDon.value) {
    clearSelectedDonCards()
    clearDraggedDonCard()
    return
  }

  selectedDonCardIds.value = selectedDonCardIds.value.filter(id => selectableIds.has(id))

  if (!selectedDonAnchorInstanceId.value || !selectableIds.has(selectedDonAnchorInstanceId.value)) {
    selectedDonAnchorInstanceId.value = selectedDonCardIds.value.at(-1) ?? null
  }

  if (draggedDonCardInstanceId.value && !selectableIds.has(draggedDonCardInstanceId.value)) {
    clearDraggedDonCard()
  }
}

watch([selectableDonCardIds, canAttachDon], syncSelectedDonCardsWithCost, { immediate: true })

function resolveAttachDonSourceIds(preferredInstanceId?: string) {
  const orderedIds = selectableDonCardIds.value

  if (
    preferredInstanceId
    && selectedDonCardIds.value.length > 0
    && selectedDonCardIds.value.includes(preferredInstanceId)
  ) {
    return orderedIds.filter(id => selectedDonCardIds.value.includes(id))
  }

  if (!preferredInstanceId && selectedDonCardIds.value.length > 0) {
    return orderedIds.filter(id => selectedDonCardIds.value.includes(id))
  }

  if (preferredInstanceId) {
    return orderedIds.includes(preferredInstanceId) ? [preferredInstanceId] : []
  }

  const fallbackId = orderedIds.at(-1)

  return fallbackId ? [fallbackId] : []
}

function consumeAttachDonCount(preferredInstanceId?: string) {
  if (
    selectedDonCardIds.value.length > 0
    && (
      !preferredInstanceId
      || selectedDonCardIds.value.includes(preferredInstanceId)
    )
  ) {
    const count = selectedDonCardIds.value.length
    clearSelectedDonCards()

    return count
  }

  return 1
}

function queueAttachedDonTravelOverlays(current: DuelPlayerView, previous: DuelPlayerView | null) {
  if (reducedMotion.value === 'reduce' || typeof window === 'undefined') {
    pendingAttachedDonTravelSources.length = 0
    return
  }

  const targetIds = deriveAttachedDonTravelTargetIds(previous, current)

  if (targetIds.length === 0) {
    return
  }

  pruneAttachedDonTravelSources()

  const previousAttachedCounts = new Map<string, number>()

  if (previous?.leader) {
    previousAttachedCounts.set(previous.leader.instanceId, previous.leader.attachedDon)
  }

  for (const character of previous?.characters ?? []) {
    previousAttachedCounts.set(character.instanceId, character.attachedDon)
  }

  const currentAttachedCounts = new Map<string, number>()

  if (current.leader) {
    currentAttachedCounts.set(current.leader.instanceId, current.leader.attachedDon)
  }

  for (const character of current.characters) {
    currentAttachedCounts.set(character.instanceId, character.attachedDon)
  }

  const consumedTargetCounts = new Map<string, number>()
  const removedCostSourceRects = deriveRemovedUntappedCostSourceRects(previous, current, 0)

  nextTick(() => {
    for (const { item: instanceId, delayMs } of createStaggeredTravelPlan(targetIds, ATTACHED_DON_TRAVEL_STAGGER_MS)) {
      const previousAttachedCount = previousAttachedCounts.get(instanceId) ?? 0
      const consumedCount = consumedTargetCounts.get(instanceId) ?? 0
      const destinationSlotIndex = previousAttachedCount + consumedCount
      const destinationElement = queryAttachedDonSlotElement(instanceId, destinationSlotIndex)
      const immediateSourceRect = removedCostSourceRects.shift()
      const pendingSource = pendingAttachedDonTravelSources.shift()
      const fallbackSource = querySelfUntappedCostCardElement()
      const sourceRect = immediateSourceRect ?? pendingSource?.sourceRect ?? fallbackSource?.getBoundingClientRect()

      consumedTargetCounts.set(instanceId, consumedCount + 1)

      if (!destinationElement || !sourceRect || !currentAttachedCounts.has(instanceId)) {
        continue
      }

      attachedDonTravelKey += 1

      createTravelOverlayFromRect(
        `attached-don:${attachedDonTravelKey}`,
        `attached-don:${instanceId}:${attachedDonTravelKey}`,
        cardFrontDon,
        sourceRect,
        createReadableAttachedDonDestinationRect(sourceRect, destinationElement),
        attachedDonOverlayTarget,
        false,
        delayMs,
        'attachedDon'
      )
    }
  })
}

function queueOpponentAttachedDonTravelOverlays(current: DuelPlayerView, previous: DuelPlayerView | null) {
  if (!previous || reducedMotion.value === 'reduce' || typeof window === 'undefined') {
    return
  }

  const targetIds = deriveAttachedDonTravelTargetIds(previous, current)

  if (targetIds.length === 0) {
    return
  }

  const previousAttachedCounts = new Map<string, number>()

  if (previous.leader) {
    previousAttachedCounts.set(previous.leader.instanceId, previous.leader.attachedDon)
  }

  for (const character of previous.characters) {
    previousAttachedCounts.set(character.instanceId, character.attachedDon)
  }

  const sourceRects = Array.from(
    deriveRemovedUntappedCostSourceRects(previous, current, 1)
  )

  while (sourceRects.length < targetIds.length) {
    const fallbackRect = queryOpponentUntappedCostCardElement()?.getBoundingClientRect()

    if (!fallbackRect) {
      break
    }

    sourceRects.push(fallbackRect)
  }
  const consumedTargetCounts = new Map<string, number>()

  nextTick(() => {
    for (const { item: instanceId, delayMs } of createStaggeredTravelPlan(targetIds, ATTACHED_DON_TRAVEL_STAGGER_MS)) {
      const previousAttachedCount = previousAttachedCounts.get(instanceId) ?? 0
      const consumedCount = consumedTargetCounts.get(instanceId) ?? 0
      const destinationSlotIndex = previousAttachedCount + consumedCount
      const destinationElement = queryAttachedDonSlotElement(instanceId, destinationSlotIndex)
      const sourceRect = sourceRects.shift()

      consumedTargetCounts.set(instanceId, consumedCount + 1)

      if (!destinationElement || !sourceRect) {
        continue
      }

      attachedDonTravelKey += 1

      createTravelOverlayFromRect(
        `attached-don:${attachedDonTravelKey}`,
        `attached-don:${instanceId}:${attachedDonTravelKey}`,
        cardFrontDon,
        sourceRect,
        createReadableAttachedDonDestinationRect(sourceRect, destinationElement),
        attachedDonOverlayTarget,
        false,
        delayMs,
        'attachedDon'
      )
    }
  })
}

const draggableHandCardIds = computed(() => {
  return selectableHandCardIds.value
})

const draggedHandCard = computed(() =>
  self.value?.hand.find(card => card.instanceId === draggedHandCardInstanceId.value) ?? null
)

function resetDraggedHandCard() {
  draggedHandCardInstanceId.value = null
}

function requestPlayFromHand(instanceId: string) {
  if (!isMainPhase.value || !isSelfTurn.value || isCombatInProgress.value) {
    pulseHandCard(instanceId)
    return false
  }

  const card = self.value?.hand.find(candidate => candidate.instanceId === instanceId)

  if (
    !card
    || !['Character', 'Stage'].includes(card.type)
    || (card.cost ?? Number.POSITIVE_INFINITY) > selfUntappedDonCount.value
  ) {
    pulseHandCard(instanceId)
    return false
  }

  if (card.type === 'Character' && isSelfCharacterZoneFull.value) {
    clearSelectedHandCards()
    pendingCharacterInstanceId.value = instanceId
    return true
  }

  if (card.type === 'Character' || card.type === 'Stage') {
    cacheBoardTravelSource(card)
  }

  clearSelectedHandCards()
  playCard(instanceId)
  return true
}

function resolveSelectedHandPlayIds(targetType: 'Character' | 'Stage', preferredInstanceId: string) {
  const orderedIds = self.value?.hand
    .filter(card => card.type === targetType)
    .map(card => card.instanceId) ?? []

  if (selectedHandCardIds.value.length > 0 && selectedHandCardIds.value.includes(preferredInstanceId)) {
    return orderedIds.filter(id => selectedHandCardIds.value.includes(id))
  }

  return orderedIds.includes(preferredInstanceId) ? [preferredInstanceId] : []
}

function playQueuedHandCards(instanceIds: string[]) {
  const remainingIds = [...instanceIds]

  while (remainingIds.length > 0) {
    const nextInstanceId = remainingIds.shift()

    if (!nextInstanceId) {
      continue
    }

    const isQueued = remainingIds.length > 0
    queuedHandCardInstanceId.value = nextInstanceId
    pendingQueuedHandCardIds.value = remainingIds

    const accepted = requestPlayFromHand(nextInstanceId)

    if (!accepted) {
      clearPendingHandPlayQueue()
      return
    }

    if (!isQueued && !pendingCharacterInstanceId.value) {
      clearPendingHandPlayQueue()
    }

    return
  }

  clearPendingHandPlayQueue()
}

function syncPendingHandPlayQueue(current: DuelPlayerView | null) {
  if (!queuedHandCardInstanceId.value) {
    return
  }

  if (pendingCharacterInstanceId.value === queuedHandCardInstanceId.value) {
    return
  }

  const queuedCardStillInHand = current?.hand.some(card => card.instanceId === queuedHandCardInstanceId.value) ?? false

  if (queuedCardStillInHand) {
    return
  }

  queuedHandCardInstanceId.value = null

  if (pendingQueuedHandCardIds.value.length === 0) {
    clearPendingHandPlayQueue()
    return
  }

  playQueuedHandCards(pendingQueuedHandCardIds.value)
}

function cancelTargetSelection() {
  pendingAttackerInstanceId.value = null
  declaredAttackTargetInstanceId.value = null
}

function attachDonToTarget(target: 'leader' | 'character', targetInstanceId?: string, preferredDonInstanceId?: string) {
  if (!canAttachDon.value) {
    if (target === 'leader') {
      pulseLeader(invalidSelfLeaderPulse)
    } else if (targetInstanceId) {
      pulseCharacter(invalidSelfCharacterIds, targetInstanceId)
    }
    return
  }

  const sourceIds = resolveAttachDonSourceIds(preferredDonInstanceId)

  if (sourceIds.length === 0) {
    if (target === 'leader') {
      pulseLeader(invalidSelfLeaderPulse)
    } else if (targetInstanceId) {
      pulseCharacter(invalidSelfCharacterIds, targetInstanceId)
    }
    return
  }

  const count = consumeAttachDonCount(preferredDonInstanceId)

  cacheAttachedDonTravelSources(sourceIds)
  clearDraggedDonCard()
  attachDon(target, targetInstanceId, count)
}

function onOpponentLeaderTargetClick() {
  if (!isChoosingTarget.value || !pendingAttackerInstanceId.value) {
    return
  }

  declareAttack(pendingAttackerInstanceId.value, 'leader')
  pendingAttackerInstanceId.value = null
}

function onOpponentCharacterTargetClick(instanceId: string) {
  if (!isChoosingTarget.value || !pendingAttackerInstanceId.value) {
    return
  }

  const target = opponent.value?.characters.find(candidate => candidate.instanceId === instanceId)

  if (!target || !target.rested) {
    pulseCharacter(invalidOpponentCharacterIds, instanceId)
    return
  }

  declareAttack(pendingAttackerInstanceId.value, 'character', instanceId)
  pendingAttackerInstanceId.value = null
}

function onBlockerCharacterClick(instanceId: string) {
  if (!isBlockingStep.value || !isSelfDefender.value) {
    return
  }

  const blocker = self.value?.characters.find(candidate => candidate.instanceId === instanceId)

  if (!blocker || blocker.rested) {
    pulseCharacter(invalidSelfCharacterIds, instanceId)
    return
  }

  declareBlock(instanceId)
}

function skipBlock() {
  declareBlock(null)
}

function onCounterHandCardClick(instanceId: string) {
  if (!isCounteringStep.value || !isSelfDefender.value) {
    return
  }

  const card = self.value?.hand.find(candidate => candidate.instanceId === instanceId)

  if (!card) {
    return
  }

  pendingCounterCardInstanceId.value = instanceId
  counterPowerBonusInput.value = card.counter && card.counter > 0 ? card.counter : 1000
}

function confirmCounter() {
  if (!pendingCounterCardInstanceId.value) {
    return
  }

  const counterCard = self.value?.hand.find(candidate => candidate.instanceId === pendingCounterCardInstanceId.value)
  cacheTrashTravelSource(counterCard)
  declareCounter(pendingCounterCardInstanceId.value, counterPowerBonusInput.value)
  pendingCounterCardInstanceId.value = null
}

function cancelCounterSelection() {
  pendingCounterCardInstanceId.value = null
}

function toggleSelectedHandCard(instanceId: string) {
  if (!selectableHandCardIds.value.includes(instanceId)) {
    pulseHandCard(instanceId)
    return
  }

  if (selectedHandCardIds.value.includes(instanceId)) {
    selectedHandCardIds.value = selectedHandCardIds.value.filter(id => id !== instanceId)
    return
  }

  selectedHandCardIds.value = [...selectedHandCardIds.value, instanceId]
}

function onSelfHandCardClick(instanceId: string, options: { ctrlKey: boolean }) {
  if (options.ctrlKey) {
    toggleSelectedHandCard(instanceId)
    return
  }

  clearSelectedHandCards()
  requestPlayFromHand(instanceId)
}

function onSelfLeaderClick(_side: 0 | 1) {
  if (canAttachDon.value && selectedDonCardIds.value.length > 0) {
    attachDonToTarget('leader')
  }
}

function onSelfCharacterClick(_side: 0 | 1, instanceId: string) {
  if (isChoosingCharacterToDiscard.value && pendingCharacterInstanceId.value) {
    const pendingCard = self.value?.hand.find(card => card.instanceId === pendingCharacterInstanceId.value)

    if (pendingCard) {
      cacheBoardTravelSource(pendingCard)
    }

    playCard(pendingCharacterInstanceId.value, instanceId)
    pendingCharacterInstanceId.value = null
    return
  }

  if (isBlockingStep.value && isSelfDefender.value) {
    onBlockerCharacterClick(instanceId)
    return
  }

  if (canAttachDon.value && selectedDonCardIds.value.length > 0) {
    attachDonToTarget('character', instanceId)
  }
}

function onOpponentLeaderClick() {
  onOpponentLeaderTargetClick()
}

function onOpponentCharacterClick(_side: 0 | 1, instanceId: string) {
  onOpponentCharacterTargetClick(instanceId)
}

function onSelfLeaderAttackStart() {
  if (!self.value?.leader || self.value.leader.rested || !canDeclareAttack.value) {
    pulseLeader(invalidSelfLeaderPulse)
    return
  }

  beginAttackDrag(self.value.leader.instanceId)
}

function onSelfCharacterAttackStart(_side: 0 | 1, instanceId: string) {
  const character = self.value?.characters.find(candidate => candidate.instanceId === instanceId)

  if (!character || character.rested || character.playedThisTurn || !canDeclareAttack.value) {
    pulseCharacter(invalidSelfCharacterIds, instanceId)
    return
  }

  beginAttackDrag(instanceId)
}

function resolveAttackDropTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return null
  }

  const cardElement = target.closest<HTMLElement>('[data-instance-id][data-zone-side]')

  if (!cardElement) {
    return null
  }

  return {
    instanceId: cardElement.dataset.instanceId ?? null,
    side: Number(cardElement.dataset.zoneSide)
  }
}

function finishAttackDrag(event: PointerEvent) {
  if (!isChoosingTarget.value || !pendingAttackerInstanceId.value) {
    return
  }

  if (event.button === 2) {
    cancelTargetSelection()
    return
  }

  const pointerTarget = document.elementFromPoint(event.clientX, event.clientY) ?? event.target
  const dropTarget = resolveAttackDropTarget(pointerTarget)

  if (!dropTarget || dropTarget.side !== 1 || !dropTarget.instanceId) {
    cancelTargetSelection()
    return
  }

  if (dropTarget.instanceId === opponent.value?.leader?.instanceId) {
    onOpponentLeaderTargetClick()
    return
  }

  if (!targetableOpponentCharacterIds.value.includes(dropTarget.instanceId)) {
    pulseCharacter(invalidOpponentCharacterIds, dropTarget.instanceId)
    cancelTargetSelection()
    return
  }

  onOpponentCharacterTargetClick(dropTarget.instanceId)
}

function onSelfHandCardOrCounterClick(instanceId: string, options: { ctrlKey: boolean }) {
  if (isCounteringStep.value && isSelfDefender.value) {
    if (!options.ctrlKey) {
      clearSelectedHandCards()
    }

    onCounterHandCardClick(instanceId)
    return
  }

  onSelfHandCardClick(instanceId, options)
}

function selectDonRangeTo(instanceId: string) {
  if (!canAttachDon.value || !selectableDonCardIds.value.includes(instanceId)) {
    return
  }

  const anchorId = selectedDonAnchorInstanceId.value

  if (!anchorId || !selectableDonCardIds.value.includes(anchorId)) {
    selectedDonCardIds.value = [instanceId]
    selectedDonAnchorInstanceId.value = instanceId
    return
  }

  const anchorIndex = selectableDonCardIds.value.indexOf(anchorId)
  const targetIndex = selectableDonCardIds.value.indexOf(instanceId)

  if (anchorIndex === -1 || targetIndex === -1) {
    selectedDonCardIds.value = [instanceId]
    selectedDonAnchorInstanceId.value = instanceId
    return
  }

  const [start, end] = anchorIndex < targetIndex
    ? [anchorIndex, targetIndex]
    : [targetIndex, anchorIndex]

  selectedDonCardIds.value = selectableDonCardIds.value.slice(start, end + 1)
}

function onSelfDonCardSelectionStart(instanceId: string) {
  if (!canAttachDon.value || !selectableDonCardIds.value.includes(instanceId)) {
    return
  }

  selectedDonAnchorInstanceId.value = instanceId
  selectedDonCardIds.value = [instanceId]
}

function onSelfDonCardSelectionHover(instanceId: string) {
  if (!selectedDonAnchorInstanceId.value) {
    return
  }

  selectDonRangeTo(instanceId)
}

function cancelDiscardSelection() {
  pendingCharacterInstanceId.value = null
}

function onSelfHandCardDragStart(instanceId: string) {
  if (!draggableHandCardIds.value.includes(instanceId)) {
    pulseHandCard(instanceId)
    return
  }

  if (!selectedHandCardIds.value.includes(instanceId)) {
    clearSelectedHandCards()
  }

  draggedHandCardInstanceId.value = instanceId
}

function onSelfHandCardDragEnd() {
  clearSelectedHandCards()
  resetDraggedHandCard()
}

function onInvalidHandCardDragAttempt(instanceId: string) {
  clearSelectedHandCards()
  resetDraggedHandCard()
  pulseHandCard(instanceId)
}

function onSelfDonCardDragStart(instanceId: string) {
  if (!canAttachDon.value || !selectableDonCardIds.value.includes(instanceId)) {
    return
  }

  draggedDonCardInstanceId.value = instanceId
}

function onSelfDonCardDragEnd() {
  clearTransientBoardSelections()
}

function closeTrashModal() {
  openedTrashSide.value = null
  selectedTrashCardInstanceId.value = null
  trashModalCardSize.value = null
}

function syncTrashModalCardSize(side: 0 | 1, instanceId: string) {
  if (typeof window === 'undefined') {
    return
  }

  const referenceElement = queryCharacterZoneCardElement(side) ?? queryTrashCardElement(side, instanceId)

  if (!referenceElement) {
    trashModalCardSize.value = null
    return
  }

  const { width, height } = referenceElement.getBoundingClientRect()

  if (width <= 0 || height <= 0) {
    trashModalCardSize.value = null
    return
  }

  trashModalCardSize.value = { width, height }
}

async function openTrashModal(side: 0 | 1) {
  const player = side === 0 ? self.value : opponent.value
  const firstCard = player?.trash[0]

  if (!player || !firstCard) {
    return
  }

  openedTrashSide.value = side
  selectedTrashCardInstanceId.value = firstCard.instanceId
  syncTrashModalCardSize(side, firstCard.instanceId)
}

function onSelfCharacterZoneDrop() {
  if (!draggedHandCardInstanceId.value) {
    return
  }

  const instanceId = draggedHandCardInstanceId.value
  const handPlayIds = resolveSelectedHandPlayIds('Character', instanceId)
  resetDraggedHandCard()
  clearSelectedHandCards()
  playQueuedHandCards(handPlayIds)
}

function onSelfStageZoneDrop() {
  if (!draggedHandCardInstanceId.value) {
    return
  }

  const instanceId = draggedHandCardInstanceId.value
  const handPlayIds = resolveSelectedHandPlayIds('Stage', instanceId)
  resetDraggedHandCard()
  clearSelectedHandCards()
  playQueuedHandCards(handPlayIds)
}

function onSelfLeaderDonDrop() {
  if (!draggedDonCardInstanceId.value) {
    return
  }

  attachDonToTarget('leader', undefined, draggedDonCardInstanceId.value)
}

function onSelfCharacterDonDrop(_side: 0 | 1, instanceId: string) {
  if (!draggedDonCardInstanceId.value) {
    return
  }

  attachDonToTarget('character', instanceId, draggedDonCardInstanceId.value)
}

const isInstructionModeActive = computed(() =>
  isChoosingCharacterToDiscard.value || isChoosingTarget.value
)

function cancelInstructionMode() {
  if (isChoosingCharacterToDiscard.value) {
    cancelDiscardSelection()
    return
  }

  if (isChoosingTarget.value) {
    cancelTargetSelection()
  }
}

function clearTransientBoardSelections() {
  clearSelectedHandCards()
  clearSelectedDonCards()
  clearDraggedDonCard()
}

function isWithinSelectedHandCard(target: EventTarget | null): boolean {
  if (!(target instanceof Node) || selectedHandCardIds.value.length === 0) {
    return false
  }

  return selectedHandCardIds.value.some((instanceId) => {
    const element = document.querySelector(`[data-duel-hand="true"] [data-instance-id="${CSS.escape(instanceId)}"]`)

    return element?.contains(target) ?? false
  })
}

function isWithinSelectedDonCard(target: EventTarget | null): boolean {
  if (!(target instanceof Node) || selectedDonCardIds.value.length === 0) {
    return false
  }

  return selectedDonCardIds.value.some((instanceId) => {
    const element = querySelfCostCardElement(instanceId)

    return element?.contains(target) ?? false
  })
}

function isWithinDonSelectionKeepAliveArea(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return Boolean(
    target.closest('[data-don-attach-target="true"]')
    || target.closest('[data-don-selection-keepalive="true"]')
  )
}

const boardContainer = useTemplateRef<HTMLElement>('board-container')

onClickOutside(boardContainer, () => {
  if (isInstructionModeActive.value) {
    cancelInstructionMode()
  }
})

useEventListener(document, 'pointerdown', (event) => {
  const hasSelectedHandCards = selectedHandCardIds.value.length > 0
  const hasSelectedDonCards = selectedDonCardIds.value.length > 0

  if (!hasSelectedHandCards && !hasSelectedDonCards) {
    return
  }

  if (hasSelectedHandCards) {
    const handElement = document.querySelector('[data-duel-hand="true"]')

    if (isWithinSelectedHandCard(event.target) || (event.ctrlKey && handElement?.contains(event.target as Node))) {
      return
    }
  }

  if (hasSelectedDonCards && (isWithinSelectedDonCard(event.target) || isWithinDonSelectionKeepAliveArea(event.target))) {
    return
  }

  if (hasSelectedHandCards) {
    clearSelectedHandCards()
  }

  if (hasSelectedDonCards) {
    clearSelectedDonCards()
  }
})

useEventListener(document, 'pointerup', (event) => {
  finishAttackDrag(event)
})

useEventListener(document, 'contextmenu', (event) => {
  if (!isChoosingTarget.value) {
    return
  }

  event.preventDefault()
  cancelTargetSelection()
})

defineShortcuts({
  escape: {
    handler: () => {
      if (isInstructionModeActive.value) {
        cancelInstructionMode()
      }

      clearTransientBoardSelections()
    }
  }
})
</script>

<template>
  <div class="flex flex-col h-full min-h-0 min-w-5xl overflow-hidden">
    <UHeader
      class="static shrink-0"
      :ui="{
        center: 'flex min-w-0 justify-center',
        container: 'mx-auto w-full max-w-[2000px] px-4 lg:px-6'
      }"
    >
      <template #left>
        <div class="flex items-center gap-3 min-w-0">
          <UButton
            icon="i-lucide-scroll-text"
            size="sm"
            color="neutral"
            variant="ghost"
            aria-label="Journal"
            @click="isJournalOpen = true"
          >
            <UBadge
              v-if="unseenLogCount > 0"
              color="primary"
              variant="solid"
              size="sm"
            >
              {{ unseenLogCount }}
            </UBadge>
          </UButton>
          <div
            v-if="opponent"
            class="flex items-center gap-2 min-w-0"
          >
            <UBadge
              color="neutral"
              variant="subtle"
              size="sm"
            >
              Deck {{ opponent.deckCount }}
            </UBadge>
            <UBadge
              color="neutral"
              variant="subtle"
              size="sm"
            >
              DON!! {{ opponent.donDeckCount }}
            </UBadge>
            <UBadge
              color="neutral"
              variant="subtle"
              size="sm"
            >
              Main {{ opponent.handCount }}
            </UBadge>
            <UBadge
              color="neutral"
              variant="subtle"
              size="sm"
            >
              Vie {{ opponent.lifeCount }}
            </UBadge>
          </div>
          <p
            v-else
            class="text-sm text-muted"
          >
            En attente d'un adversaire...
          </p>
        </div>
      </template>

      <div class="px-2 sm:px-4">
        {{ matchupLabel }}
      </div>

      <template #right>
        <div class="flex items-center gap-3">
          <div
            v-if="self"
            class="flex items-center gap-1.5 rounded-full bg-elevated px-3 py-1"
          >
            <UIcon
              name="i-lucide-zap"
              class="size-4 text-warning"
            />
            <span class="text-sm font-semibold tabular-nums">{{ selfUntappedDonCount }}</span>
          </div>
          <UButton
            data-test="turn-toggle"
            size="sm"
            :color="turnButtonColor"
            :variant="turnButtonVariant"
            :disabled="!canEndPhase"
            @click="endPhase"
          >
            {{ turnButtonLabel }}
          </UButton>
          <UButton
            data-test="leave-to-lobby"
            icon="i-lucide-log-out"
            size="sm"
            color="neutral"
            variant="ghost"
            aria-label="Retour au lobby"
            @click="confirmLeaveToLobby"
          />
        </div>
      </template>
    </UHeader>

    <DuelActionModal :state="actionModalState">
      <template
        v-if="actionModalState?.slot === 'counter-input'"
        #extra
      >
        <UInputNumber
          v-model="counterPowerBonusInput"
          :min="0"
          :step="1000"
          size="lg"
          class="w-32"
        />
      </template>
    </DuelActionModal>

    <DuelWaitingToast
      v-if="waitingToastText"
      :text="waitingToastText"
      :tone="isOpponentDisconnected ? 'warning' : 'neutral'"
    />

    <DuelResultModal
      :open="isFinished && isResultModalOpen"
      :victory="isSelfWinner"
      :turn-label="resultTurnLabel"
      :duration-label="resultDurationLabel"
      @replay="replayMatch"
      @leave="confirmLeaveToLobby"
    />

    <USlideover
      v-model:open="isJournalOpen"
      title="Journal"
      description="Vue en lecture seule de la partie : zones publiques et compteurs des zones cachées adverses."
      :modal="false"
      side="left"
    >
      <template #body>
        <div class="flex h-full min-h-0 flex-col gap-2">
          <UScrollArea
            ref="journal-scroll-area"
            class="flex-1 min-h-0"
            :ui="{ viewport: 'flex min-h-full flex-col pr-1' }"
          >
            <div class="mt-auto flex flex-col">
              <ul class="flex flex-col text-xs">
                <li
                  v-if="logs.length === 0"
                  class="text-muted"
                >
                  Aucun événement.
                </li>
                <template
                  v-for="(entry, index) in logs"
                  :key="entry.id"
                >
                  <li
                    class="py-2"
                    data-test="journal-entry"
                  >
                    <div class="flex items-start gap-3">
                      <time
                        :datetime="entry.createdAt"
                        class="shrink-0 tabular-nums text-[11px]"
                        :class="logToneClasses[getLogTone(entry.message)]"
                      >
                        {{ formatLogTime(entry.createdAt) }}
                      </time>
                      <p
                        class="min-w-0 flex-1 leading-relaxed"
                        :class="logToneClasses[getLogTone(entry.message)]"
                      >
                        {{ entry.message }}
                      </p>
                    </div>
                  </li>
                  <USeparator
                    v-if="index < logs.length - 1"
                    class="opacity-60"
                  />
                </template>
              </ul>
            </div>
          </UScrollArea>

          <div
            v-if="status === 'connecting'"
            class="text-[11px] text-muted shrink-0"
          >
            Reconnexion en cours...
          </div>
        </div>
      </template>
    </USlideover>

    <div class="mx-auto grid h-full min-h-0 w-full max-w-[2000px] flex-1 grid-cols-[minmax(0,1fr)_minmax(260px,0.25fr)] gap-4 overflow-hidden p-4">
      <div class="min-h-0 min-w-0">
        <div class="grid h-full min-h-0 min-w-0 grid-cols-[minmax(220px,0.42fr)_minmax(0,1fr)] gap-4">
          <div class="flex min-h-0 flex-col justify-between items-end overflow-hidden py-2">
            <div class="w-full max-w-[26rem] shrink-0">
              <DuelHand
                v-if="shouldShowOpponentHandLane && opponent"
                hidden
                :hand-count="opponent.handCount"
                :deferred-hidden-count="opponentDeferredHandTravelIds.length"
                align="start"
              />
            </div>

            <div class="w-full max-w-[26rem] shrink-0">
              <DuelHand
                v-if="shouldShowSelfHandLane && self"
                :hand="self.hand"
                align="start"
                :draggable-hand-card-ids="draggableHandCardIds"
                :selected-hand-card-ids="selectedHandCardIds"
                :dragged-hand-card-count="draggedHandCardCount"
                :invalid-hand-card-ids="invalidHandCardIds"
                :revealed-hand-card-ids="selfRevealedHandCardIds"
                :deferred-hand-card-ids="selfDeferredHandCardIds"
                @card-hover="hoveredCard = $event"
                @card-click="onSelfHandCardOrCounterClick"
                @card-drag-start="onSelfHandCardDragStart"
                @card-drag-end="onSelfHandCardDragEnd"
                @invalid-card-drag-attempt="onInvalidHandCardDragAttempt"
              />
            </div>
          </div>

          <div
            class="flex h-full min-h-0 min-w-0 flex-1 overflow-hidden"
          >
            <div
              ref="board-container"
              class="relative flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden"
              @pointermove="onBoardPointerMove"
            >
              <div class="pointer-events-none fixed inset-0 z-[130]">
                <div
                  v-for="overlay in boardTravelOverlays"
                  :key="overlay.key"
                  :ref="(value: Element | null) => setBoardTravelOverlayElement(overlay.key, value)"
                  :data-board-travel-instance-id="overlay.instanceId"
                  :data-board-travel-settled="String(overlay.settled)"
                  :data-board-travel-variant="overlay.variant"
                  class="duel-board-travel-overlay absolute overflow-hidden rounded-lg"
                  :style="boardTravelOverlayStyle(overlay)"
                >
                  <DuelCard
                    :src="overlay.imageUrl"
                    :rotated="overlay.rotated"
                  />
                </div>
              </div>
              <div class="pointer-events-none fixed inset-0 z-[135]">
                <div
                  v-for="entry in cardFeedbacks"
                  :key="entry.key"
                  :ref="(value: Element | null) => setCardFeedbackElement(entry.key, value)"
                  :data-test="`card-feedback-${entry.label}`"
                  class="duel-card-feedback absolute rounded-full border px-3 py-1 text-sm font-black uppercase tracking-[0.18em] shadow-lg backdrop-blur-[1px] sm:text-base"
                  :class="cardFeedbackToneClass(entry.tone)"
                  :style="{ left: `${entry.x}px`, top: `${entry.y}px`, translate: '-50% -50%' }"
                >
                  {{ entry.label }}
                </div>
              </div>
              <div class="pointer-events-none fixed inset-x-0 top-18 z-[136] flex flex-col items-center gap-2 px-4">
                <div
                  v-for="entry in bannerFeedbacks"
                  :key="entry.key"
                  :ref="(value: Element | null) => setBannerFeedbackElement(entry.key, value)"
                  :data-test="entry.tone === 'error' ? 'error-feedback' : 'global-feedback'"
                  class="duel-banner-feedback max-w-[min(92vw,44rem)] rounded-full border px-4 py-2 text-center text-sm font-semibold shadow-lg backdrop-blur-sm sm:text-base"
                  :class="bannerFeedbackToneClass(entry.tone)"
                >
                  {{ entry.message }}
                </div>
              </div>
              <DuelAttackArrow
                v-if="shouldRenderAttackArrow"
                :from-instance-id="attackArrowFromInstanceId"
                :to-instance-id="attackArrowToInstanceId"
                :to-point="attackArrowToPoint"
                :variant="pendingAttackerInstanceId ? 'drag' : 'confirmed'"
                :animation-key="confirmedAttackArrow?.key ?? null"
              />
              <DuelFloatingNumber
                v-for="entry in floatingNumbers"
                :key="entry.key"
                :value="entry.value"
                :x="entry.x"
                :y="entry.y"
                :tone="entry.tone"
                @done="removeFloatingNumber(entry.key)"
              />
              <DuelSetupOverlay v-if="phase === 'mulligan'" />
              <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
              >
                <div
                  v-if="openedTrashSide !== null && activeTrashPlayer"
                  data-test="trash-modal"
                  class="absolute inset-0 z-[2145] flex items-center justify-center bg-default/90 p-6 backdrop-blur-sm"
                  @click.self="closeTrashModal"
                >
                  <Transition
                    appear
                    enter-active-class="transition duration-250 ease-out"
                    enter-from-class="opacity-0 translate-y-3 scale-95"
                    enter-to-class="opacity-100 translate-y-0 scale-100"
                  >
                    <div class="w-full max-w-[min(100%,1500px)]">
                      <div class="flex flex-wrap items-start justify-center gap-4">
                        <button
                          v-for="card in activeTrashCards"
                          :key="card.instanceId"
                          type="button"
                          data-test="trash-modal-card"
                          class="duel-trash-modal-card group aspect-5/7 text-left transition"
                          :class="card.instanceId === selectedTrashCardInstanceId ? 'scale-[1.02]' : 'hover:scale-[1.01]'"
                          :style="{
                            ...(trashModalCardSize ? { width: `${trashModalCardSize.width}px`, height: `${trashModalCardSize.height}px` } : {}),
                            '--trash-card-index': activeTrashCards.indexOf(card)
                          }"
                          @mouseenter="hoveredCard = card"
                          @mouseleave="hoveredCard = null"
                          @click="selectedTrashCardInstanceId = card.instanceId"
                        >
                          <DuelCard
                            :src="card.imageUrl"
                            :alt="card.name"
                            class="overflow-hidden rounded-lg shadow-2xl group-hover:scale-[1.02]"
                          />
                        </button>
                      </div>
                    </div>
                  </Transition>
                </div>
              </Transition>
              <PlayZone
                v-if="opponent || self"
                class="flex-1 min-h-0"
                :player="opponent ?? emptyOpponentPreview"
                :side="1"
                :is-owner-turn="!isSelfTurn"
                :is-adversary="Boolean(opponent)"
                :transition-ghosts="opponent ? opponentTransitionGhosts : []"
                :deferred-board-card-ids="opponentDeferredBoardCardIds"
                :deferred-cost-card-ids="opponentDeferredCostCardIds"
                :deferred-trash-card-ids="opponentDeferredTrashCardIds"
                :is-targetable="Boolean(opponent) && isChoosingTarget"
                :targetable-leader="Boolean(opponent) && isChoosingTarget"
                :targetable-character-ids="opponent ? targetableOpponentCharacterIds : []"
                :invalid-leader-pulse="opponent ? invalidOpponentLeaderPulse : false"
                :invalid-character-ids="opponent ? invalidOpponentCharacterIds : []"
                @card-hover="hoveredCard = $event"
                @trash-click="openTrashModal"
                @leader-click="onOpponentLeaderClick"
                @character-click="onOpponentCharacterClick"
              />
              <div
                v-else
                class="flex flex-1 min-h-0 items-center justify-center text-sm text-muted"
              >
                En attente d'un adversaire...
              </div>
              <USeparator class="shrink-0" />
              <PlayZone
                v-if="self"
                class="flex-1 min-h-0"
                :player="self"
                :side="0"
                :is-owner-turn="isSelfTurn"
                :selected-don-card-ids="selectedDonCardIds"
                :dragged-hand-card-instance-id="draggedHandCardInstanceId"
                :dragged-don-card-instance-id="draggedDonCardInstanceId"
                :dragged-don-card-count="draggedDonCardCount"
                :can-drop-on-character-zone="isMainPhase && isSelfTurn && !isCombatInProgress && draggedHandCard?.type === 'Character'"
                :can-drop-on-stage-zone="isMainPhase && isSelfTurn && !isCombatInProgress && draggedHandCard?.type === 'Stage'"
                :can-drop-don-on-leader="canAttachDon"
                :can-drop-don-on-character="canAttachDon"
                :transition-ghosts="selfTransitionGhosts"
                :attacker-id="combat && isSelfAttacker ? combat.attackerInstanceId : null"
                :is-selectable="isChoosingCharacterToDiscard || (isBlockingStep && isSelfDefender) || (isCounteringStep && isSelfDefender)"
                :attackable-leader="Boolean(self.leader && canDeclareAttack && !isCombatInProgress && isMainPhase && isSelfTurn && !self.leader.rested)"
                :attackable-character-ids="self.characters.filter(character => canDeclareAttack && isMainPhase && isSelfTurn && !isCombatInProgress && !character.rested && !character.playedThisTurn).map(character => character.instanceId)"
                :selectable-character-ids="selectableSelfCharacterIds"
                :invalid-leader-pulse="invalidSelfLeaderPulse"
                :invalid-character-ids="invalidSelfCharacterIds"
                :deferred-board-card-ids="selfDeferredBoardCardIds"
                :deferred-cost-card-ids="selfDeferredCostCardIds"
                :deferred-trash-card-ids="selfDeferredTrashCardIds"
                @card-hover="hoveredCard = $event"
                @trash-click="openTrashModal"
                @hand-card-drop-on-characters="onSelfCharacterZoneDrop"
                @hand-card-drop-on-stage="onSelfStageZoneDrop"
                @don-card-selection-start="onSelfDonCardSelectionStart"
                @don-card-selection-hover="onSelfDonCardSelectionHover"
                @don-card-drag-start="onSelfDonCardDragStart"
                @don-card-drag-end="onSelfDonCardDragEnd"
                @don-card-drop-on-leader="onSelfLeaderDonDrop"
                @don-card-drop-on-character="onSelfCharacterDonDrop"
                @leader-attack-start="onSelfLeaderAttackStart"
                @character-attack-start="onSelfCharacterAttackStart"
                @leader-click="onSelfLeaderClick"
                @character-click="onSelfCharacterClick"
              />
            </div>
          </div>
        </div>
      </div>

      <CardDetailsPanel
        :card="resolvedHoveredCard"
        :rows="hoveredCardRows"
        :loading-description="isHoveredCardDetailPending"
        empty-message="Survolez une carte du plateau."
      />
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

.duel-trash-modal-card {
  animation: duel-trash-modal-card-appear 220ms ease-out both;
  animation-delay: calc(var(--trash-card-index, 0) * 35ms);
  will-change: transform, opacity;
}

@keyframes duel-trash-modal-card-appear {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .duel-trash-modal-card,
  .duel-card-feedback,
  .duel-banner-feedback {
    animation: none;
    will-change: auto;
  }
}
</style>
