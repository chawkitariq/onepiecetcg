<script setup lang="ts">
import type { DuelPlayerView, PublicCard, PrivateCard } from '@onepiecetcg/shared'
import type { TransitionGhost } from '~/utils/duelTransitions'
import type { DuelActionModalState } from '~/components/DuelActionModal.vue'
import { LayoutGroup } from 'motion-v'
import { getCardColorStyle } from '~/utils/cardColors'
import { derivePlayerTransitionDiff } from '~/utils/duelTransitions'

type CharacterActionPopoverItem = {
  label: string
  icon?: string
  disabled?: boolean
  onSelect: () => void
}

type LeaderActionPopoverItem = {
  label: string
  icon?: string
  disabled?: boolean
  onSelect: () => void
}

const {
  self,
  opponent,
  phase,
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
const { status, leave } = useColyseus()
const { confirm } = useConfirmDialog()

async function confirmLeaveToLobby() {
  const confirmed = await confirm({
    title: 'Retourner au lobby ?',
    description: 'Vous quitterez la partie en cours.',
    confirmLabel: 'Retourner au lobby'
  })

  if (!confirmed) {
    return
  }

  await leave()
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

type HoveredDuelCard = Pick<PublicCard, 'number' | 'name' | 'type' | 'colors' | 'cost' | 'power' | 'life' | 'counter' | 'imageUrl'>
  & Partial<Pick<PrivateCard, 'text' | 'trigger'>>

const hoveredCard = ref<HoveredDuelCard | null>(null)
const journalScrollArea = useTemplateRef<ScrollAreaInstance>('journal-scroll-area')
const isJournalOpen = ref(false)
const seenLogCount = ref(0)
const unseenLogCount = computed(() => Math.max(logs.value.length - seenLogCount.value, 0))
const pendingCharacterInstanceId = ref<string | null>(null)
const isSelectingAttacker = ref(false)
const pendingAttackerInstanceId = ref<string | null>(null)
const pendingCounterCardInstanceId = ref<string | null>(null)
const counterPowerBonusInput = ref(1000)
const draggedHandCardInstanceId = ref<string | null>(null)
const pointerPosition = ref<{ x: number, y: number } | null>(null)
const declaredAttackTargetInstanceId = ref<string | null>(null)

function onBoardPointerMove(event: PointerEvent) {
  pointerPosition.value = { x: event.clientX, y: event.clientY }
}

const attackArrowFromInstanceId = computed(() => {
  if (pendingAttackerInstanceId.value) {
    return pendingAttackerInstanceId.value
  }

  if (combat.value && isSelfAttacker.value && combat.value.step === 'declared') {
    return combat.value.attackerInstanceId
  }

  return null
})

const attackArrowToInstanceId = computed(() => declaredAttackTargetInstanceId.value)

const attackArrowToPoint = computed(() =>
  isChoosingTarget.value && !declaredAttackTargetInstanceId.value ? pointerPosition.value : null
)

watch(() => combat.value?.step, (step, previousStep) => {
  if (step === previousStep) {
    return
  }

  if (step === 'declared' && combat.value) {
    declaredAttackTargetInstanceId.value = combat.value.targetType === 'leader'
      ? (isSelfAttacker.value ? opponent.value?.leader?.instanceId : self.value?.leader?.instanceId) ?? null
      : combat.value.targetInstanceId
  }

  if (!step) {
    declaredAttackTargetInstanceId.value = null
  }
})
const invalidHandCardIds = ref<string[]>([])

const phaseSteps = ['refresh', 'draw', 'don', 'main', 'end'] as const
const phaseStepLabels = phaseSteps.map(step => phaseLabels[step])
const currentPhaseStepIndex = computed(() => {
  const index = phaseSteps.indexOf(phase.value as typeof phaseSteps[number])

  return index === -1 ? 0 : index
})
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

  if (isSelectingAttacker.value) {
    return self.value.characters
      .filter(character => !character.rested && !character.playedThisTurn)
      .map(character => character.instanceId)
  }

  if (isBlockingStep.value && isSelfDefender.value) {
    return self.value.characters
      .filter(character => !character.rested)
      .map(character => character.instanceId)
  }

  return []
})
const selectableSelfLeader = computed(() =>
  Boolean(self.value?.leader && isSelectingAttacker.value && !self.value.leader.rested)
)
const invalidSelfLeaderPulse = ref(false)
const invalidOpponentLeaderPulse = ref(false)
const invalidSelfCharacterIds = ref<string[]>([])
const invalidOpponentCharacterIds = ref<string[]>([])
const selfTransitionGhosts = ref<TransitionGhost[]>([])
const opponentTransitionGhosts = ref<TransitionGhost[]>([])
const selfRevealedHandCardIds = ref<string[]>([])

const actionModalState = computed<DuelActionModalState | null>(() => {
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

const waitingToastText = computed(() => {
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

const hoveredCardRows = computed(() => {
  if (!hoveredCard.value) {
    return []
  }

  return [
    ['Numero', hoveredCard.value.number],
    ['Type', hoveredCard.value.type],
    ['Couleur', hoveredCard.value.colors.join(', ') || 'Aucune'],
    ['Cout', hoveredCard.value.cost ?? '-'],
    ['Puissance', hoveredCard.value.power ?? '-'],
    ['Contre', hoveredCard.value.counter ?? '-'],
    ['Vie', hoveredCard.value.life ?? '-'],
    ['Declenchement', hoveredCard.value.trigger ?? '-']
  ]
})

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
  }, 280)
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

type FloatingNumberInstance = {
  key: number
  value: number
  x: number
  y: number
  tone: 'damage' | 'gain'
}

const floatingNumbers = ref<FloatingNumberInstance[]>([])
let floatingNumberKey = 0

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

function syncPlayerTransitions(
  current: DuelPlayerView | null,
  previous: DuelPlayerView | null,
  ghostsTarget: Ref<TransitionGhost[]>,
  revealedHandTarget?: Ref<string[]>
) {
  if (!current) {
    return
  }

  const diff = derivePlayerTransitionDiff(previous, current)
  mergeGhosts(ghostsTarget, diff.ghosts)

  if (revealedHandTarget) {
    mergeRevealedHandCards(revealedHandTarget, diff.revealedHandCardIds)
  }

  if (diff.lifeLoss > 0) {
    nextTick(() => spawnLifeLossFloatingNumber(current.leader?.instanceId, diff.lifeLoss))
  }
}

watch(self, (current, previous) => {
  syncPlayerTransitions(current, previous, selfTransitionGhosts, selfRevealedHandCardIds)
})

watch(opponent, (current, previous) => {
  syncPlayerTransitions(current, previous, opponentTransitionGhosts)
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

watch(() => logs.value.length, async (newLength, previousLength) => {
  if (newLength <= previousLength) {
    return
  }

  if (isJournalOpen.value) {
    seenLogCount.value = newLength
  }

  await nextTick()
  const element = journalScrollArea.value?.$el

  if (!element) {
    return
  }

  element.scrollTo({
    top: element.scrollHeight,
    behavior: 'smooth'
  })
})

watch(isJournalOpen, (open) => {
  if (open) {
    seenLogCount.value = logs.value.length
  }
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

const draggableHandCardIds = computed(() => {
  if (!self.value || !isMainPhase.value || !isSelfTurn.value || isCombatInProgress.value) {
    return []
  }

  return self.value.hand
    .filter(card => card.type === 'Character' && (card.cost ?? Number.POSITIVE_INFINITY) <= selfUntappedDonCount.value)
    .map(card => card.instanceId)
})

function resetDraggedHandCard() {
  draggedHandCardInstanceId.value = null
}

function requestPlayFromHand(instanceId: string) {
  if (!isMainPhase.value || !isSelfTurn.value || isCombatInProgress.value) {
    pulseHandCard(instanceId)
    return
  }

  const card = self.value?.hand.find(candidate => candidate.instanceId === instanceId)

  if (!card || card.type !== 'Character' || (card.cost ?? Number.POSITIVE_INFINITY) > selfUntappedDonCount.value) {
    pulseHandCard(instanceId)
    return
  }

  if (isSelfCharacterZoneFull.value) {
    pendingCharacterInstanceId.value = instanceId
    return
  }

  playCard(instanceId)
}

function cancelTargetSelection() {
  pendingAttackerInstanceId.value = null
  isSelectingAttacker.value = false
}

function onSelfLeaderAttackerClick() {
  if (!isSelectingAttacker.value || !self.value?.leader) {
    return
  }

  if (self.value.leader.rested) {
    pulseLeader(invalidSelfLeaderPulse)
    return
  }

  pendingAttackerInstanceId.value = self.value.leader.instanceId
  isSelectingAttacker.value = false
}

function onSelfCharacterAttackerClick(instanceId: string) {
  if (!isSelectingAttacker.value) {
    return
  }

  const character = self.value?.characters.find(candidate => candidate.instanceId === instanceId)

  if (!character || character.rested || character.playedThisTurn) {
    pulseCharacter(invalidSelfCharacterIds, instanceId)
    return
  }

  pendingAttackerInstanceId.value = instanceId
  isSelectingAttacker.value = false
}

function startAttackWithCharacter(instanceId: string) {
  if (!canDeclareAttack.value) {
    pulseCharacter(invalidSelfCharacterIds, instanceId)
    return
  }

  isSelectingAttacker.value = true
  onSelfCharacterAttackerClick(instanceId)
}

function startAttackWithLeader() {
  if (!canDeclareAttack.value) {
    pulseLeader(invalidSelfLeaderPulse)
    return
  }

  isSelectingAttacker.value = true
  onSelfLeaderAttackerClick()
}

function attachDonToLeaderFromPopover() {
  if (!canAttachDon.value) {
    pulseLeader(invalidSelfLeaderPulse)
    return
  }

  attachDon('leader')
}

function attachDonToCharacterFromPopover(instanceId: string) {
  if (!canAttachDon.value) {
    pulseCharacter(invalidSelfCharacterIds, instanceId)
    return
  }

  attachDon('character', instanceId)
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

  declareCounter(pendingCounterCardInstanceId.value, counterPowerBonusInput.value)
  pendingCounterCardInstanceId.value = null
}

function cancelCounterSelection() {
  pendingCounterCardInstanceId.value = null
}

function onSelfHandCardClick(instanceId: string) {
  requestPlayFromHand(instanceId)
}

function onSelfLeaderClick(_side: 0 | 1) {
  if (isSelectingAttacker.value) {
    onSelfLeaderAttackerClick()
  }
}

function onSelfCharacterClick(_side: 0 | 1, instanceId: string) {
  if (isChoosingCharacterToDiscard.value && pendingCharacterInstanceId.value) {
    playCard(pendingCharacterInstanceId.value, instanceId)
    pendingCharacterInstanceId.value = null
    return
  }

  if (isSelectingAttacker.value) {
    onSelfCharacterAttackerClick(instanceId)
    return
  }

  if (isBlockingStep.value && isSelfDefender.value) {
    onBlockerCharacterClick(instanceId)
    return
  }
}

function onOpponentLeaderClick() {
  onOpponentLeaderTargetClick()
}

function onOpponentCharacterClick(_side: 0 | 1, instanceId: string) {
  onOpponentCharacterTargetClick(instanceId)
}

function onSelfHandCardOrCounterClick(instanceId: string) {
  if (isCounteringStep.value && isSelfDefender.value) {
    onCounterHandCardClick(instanceId)
    return
  }

  onSelfHandCardClick(instanceId)
}

function cancelDiscardSelection() {
  pendingCharacterInstanceId.value = null
}

function onSelfHandCardDragStart(instanceId: string) {
  if (!draggableHandCardIds.value.includes(instanceId)) {
    pulseHandCard(instanceId)
    return
  }

  draggedHandCardInstanceId.value = instanceId
}

function onSelfHandCardDragEnd() {
  resetDraggedHandCard()
}

function onInvalidHandCardDragAttempt(instanceId: string) {
  resetDraggedHandCard()
  pulseHandCard(instanceId)
}

function onSelfCharacterZoneDrop() {
  if (!draggedHandCardInstanceId.value) {
    return
  }

  const instanceId = draggedHandCardInstanceId.value
  resetDraggedHandCard()
  requestPlayFromHand(instanceId)
}

const selfCharacterActionPopoverItems = computed<Record<string, CharacterActionPopoverItem[]>>(() => {
  if (
    !self.value
    || !isMainPhase.value
    || !isSelfTurn.value
    || isCombatInProgress.value
    || isChoosingCharacterToDiscard.value
    || isSelectingAttacker.value
    || isChoosingTarget.value
    || isBlockingStep.value
    || isCounteringStep.value
    || isAwaitingTriggerDecision.value
  ) {
    return {}
  }

  return Object.fromEntries(self.value.characters.map((character) => {
    const canCharacterAttack = canDeclareAttack.value && !character.rested && !character.playedThisTurn

    return [
      character.instanceId,
      [
        {
          label: 'Attacher un DON!!',
          icon: 'i-lucide-plus',
          disabled: !canAttachDon.value,
          onSelect: () => attachDonToCharacterFromPopover(character.instanceId)
        },
        {
          label: 'Attaquer avec',
          icon: 'i-lucide-swords',
          disabled: !canCharacterAttack,
          onSelect: () => startAttackWithCharacter(character.instanceId)
        }
      ]
    ]
  }))
})

const selfLeaderActionPopoverItems = computed<LeaderActionPopoverItem[]>(() => {
  if (
    !self.value?.leader
    || !isMainPhase.value
    || !isSelfTurn.value
    || isCombatInProgress.value
    || isChoosingCharacterToDiscard.value
    || isSelectingAttacker.value
    || isChoosingTarget.value
    || isBlockingStep.value
    || isCounteringStep.value
    || isAwaitingTriggerDecision.value
  ) {
    return []
  }

  return [
    {
      label: 'Attacher un DON!!',
      icon: 'i-lucide-plus',
      disabled: !canAttachDon.value,
      onSelect: attachDonToLeaderFromPopover
    },
    {
      label: 'Attaquer avec',
      icon: 'i-lucide-swords',
      disabled: !canDeclareAttack.value || self.value.leader.rested,
      onSelect: startAttackWithLeader
    }
  ]
})

const isInstructionModeActive = computed(() =>
  isChoosingCharacterToDiscard.value || isSelectingAttacker.value || isChoosingTarget.value
)

function cancelInstructionMode() {
  if (isChoosingCharacterToDiscard.value) {
    cancelDiscardSelection()
    return
  }

  if (isSelectingAttacker.value || isChoosingTarget.value) {
    cancelTargetSelection()
  }
}

const boardContainer = useTemplateRef<HTMLElement>('board-container')

onClickOutside(boardContainer, () => {
  if (isInstructionModeActive.value) {
    cancelInstructionMode()
  }
})

onKeyStroke('Escape', () => {
  if (isInstructionModeActive.value) {
    cancelInstructionMode()
  }
})
</script>

<template>
  <div class="flex flex-col h-full min-h-0 overflow-hidden">
    <UHeader
      class="static shrink-0"
      :ui="{
        center: 'flex min-w-0 justify-center',
        container: 'max-w-none px-4 lg:px-6'
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
            <span
              class="h-2.5 w-2.5 rounded-full shrink-0"
              :class="opponent.connected ? 'bg-success' : 'duel-connection-waiting bg-warning'"
            />
            <span class="text-sm font-medium truncate">
              {{ opponent.displayName }}
            </span>
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

      <div class="w-full max-w-xs px-2 sm:px-4">
        <UProgress
          :model-value="currentPhaseStepIndex"
          :max="phaseStepLabels"
          size="sm"
        />
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
          <UBadge
            :color="isSelfTurn ? 'primary' : 'neutral'"
            :variant="isSelfTurn ? 'solid' : 'subtle'"
            size="sm"
          >
            {{ isSelfTurn ? 'Votre tour' : "Tour de l'adversaire" }}
          </UBadge>
          <UButton
            size="sm"
            color="primary"
            :disabled="!canEndPhase"
            @click="endPhase"
          >
            {{ phase === 'end' ? 'Terminer le tour' : 'Phase suivante' }}
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

    <UAlert
      v-if="errorMessage"
      color="error"
      variant="subtle"
      :title="errorMessage"
      class="shrink-0"
      :close="{ color: 'neutral', variant: 'link' }"
      @update:open="clearError"
    />

    <UAlert
      v-if="isOpponentDisconnected"
      color="warning"
      variant="subtle"
      title="Adversaire temporairement deconnecte"
      description="La partie reste en attente pendant la fenetre de reconnexion. Le duel reprend automatiquement si la connexion revient."
      class="shrink-0 duel-connection-banner"
    />

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
              <ul class="flex flex-col gap-2 text-xs">
                <li
                  v-if="logs.length === 0"
                  class="text-muted"
                >
                  Aucun événement.
                </li>
                <li
                  v-for="entry in logs"
                  :key="entry.id"
                  class="rounded-lg border border-default/70 bg-muted/20 px-3 py-2"
                >
                  <div class="flex items-center gap-2 text-[11px]">
                    <time
                      :datetime="entry.createdAt"
                      class="tabular-nums opacity-80"
                    >
                      {{ formatLogTime(entry.createdAt) }}
                    </time>
                  </div>
                  <p class="mt-1 leading-relaxed">
                    {{ entry.message }}
                  </p>
                </li>
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

    <div class="mx-auto grid h-full min-h-0 w-full max-w-7xl flex-1 grid-cols-[1fr_0.25fr] gap-2 overflow-hidden p-2">
      <div
        class="flex h-full min-h-0 min-w-0 flex-1 overflow-hidden rounded-xl border border-default bg-default shadow-sm transition-shadow duration-300"
        :class="isSelfTurn ? 'shadow-[0_0_0_2px_var(--ui-primary)]' : 'shadow-[0_0_0_1px_var(--ui-border)]'"
      >
        <div
          ref="board-container"
          class="relative flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden p-2"
          @pointermove="onBoardPointerMove"
        >
          <DuelAttackArrow
            :from-instance-id="attackArrowFromInstanceId"
            :to-instance-id="attackArrowToInstanceId"
            :to-point="attackArrowToPoint"
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
          <DuelOpponentHand
            v-if="opponent"
            :hand-count="opponent.handCount"
          />
          <LayoutGroup
            v-if="opponent || self"
            :id="`play-zone-${(opponent ?? emptyOpponentPreview).sessionId}`"
          >
            <PlayZone
              class="flex-1 min-h-0"
              :player="opponent ?? emptyOpponentPreview"
              :side="1"
              :is-owner-turn="!isSelfTurn"
              :is-adversary="Boolean(opponent)"
              :transition-ghosts="opponent ? opponentTransitionGhosts : []"
              :is-targetable="Boolean(opponent) && isChoosingTarget"
              :targetable-leader="Boolean(opponent) && isChoosingTarget"
              :targetable-character-ids="opponent ? targetableOpponentCharacterIds : []"
              :invalid-leader-pulse="opponent ? invalidOpponentLeaderPulse : false"
              :invalid-character-ids="opponent ? invalidOpponentCharacterIds : []"
              @card-hover="hoveredCard = $event"
              @leader-click="onOpponentLeaderClick"
              @character-click="onOpponentCharacterClick"
            />
          </LayoutGroup>
          <div
            v-else
            class="flex flex-1 min-h-0 items-center justify-center text-sm text-muted"
          >
            En attente d'un adversaire...
          </div>
          <USeparator class="shrink-0" />
          <LayoutGroup
            v-if="self"
            :id="`play-zone-${self.sessionId}`"
          >
            <PlayZone
              class="flex-1 min-h-0"
              :player="self"
              :side="0"
              :is-owner-turn="isSelfTurn"
              :dragged-hand-card-instance-id="draggedHandCardInstanceId"
              :can-drop-on-character-zone="isMainPhase && isSelfTurn && !isCombatInProgress"
              :transition-ghosts="selfTransitionGhosts"
              :attacker-id="pendingAttackerInstanceId ?? (combat && isSelfAttacker ? combat.attackerInstanceId : null)"
              :is-selectable="isChoosingCharacterToDiscard || isSelectingAttacker || (isBlockingStep && isSelfDefender) || (isCounteringStep && isSelfDefender)"
              :leader-action-popover-items="selfLeaderActionPopoverItems"
              :selectable-leader="selectableSelfLeader"
              :selectable-character-ids="selectableSelfCharacterIds"
              :character-action-popover-items="selfCharacterActionPopoverItems"
              :invalid-leader-pulse="invalidSelfLeaderPulse"
              :invalid-character-ids="invalidSelfCharacterIds"
              @card-hover="hoveredCard = $event"
              @hand-card-drop-on-characters="onSelfCharacterZoneDrop"
              @leader-click="onSelfLeaderClick"
              @character-click="onSelfCharacterClick"
            />
            <DuelHand
              :hand="self.hand"
              :draggable-hand-card-ids="draggableHandCardIds"
              :invalid-hand-card-ids="invalidHandCardIds"
              :revealed-hand-card-ids="selfRevealedHandCardIds"
              @card-hover="hoveredCard = $event"
              @card-click="onSelfHandCardOrCounterClick"
              @card-drag-start="onSelfHandCardDragStart"
              @card-drag-end="onSelfHandCardDragEnd"
              @invalid-card-drag-attempt="onInvalidHandCardDragAttempt"
            />
          </LayoutGroup>
        </div>
      </div>

      <UCard
        class="min-h-0 min-w-0"
        :ui="{ root: 'h-full flex flex-col overflow-hidden', body: 'flex min-h-0 flex-1 flex-col overflow-hidden p-3' }"
      >
        <template #header>
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-medium text-muted">
              {{ hoveredCard?.number ?? 'Details' }}
            </p>
            <UBadge
              v-if="hoveredCard"
              color="neutral"
              variant="subtle"
              size="sm"
            >
              {{ hoveredCard.type }}
            </UBadge>
          </div>
        </template>

        <div
          v-if="hoveredCard"
          class="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto"
        >
          <div class="w-full aspect-[4/5]">
            <img
              v-if="hoveredCard.imageUrl"
              :src="hoveredCard.imageUrl"
              :alt="hoveredCard.name"
              class="w-full rounded-lg border border-muted object-cover"
            >
            <div
              v-else
              class="flex h-full w-full items-center justify-center rounded-lg border border-muted bg-elevated text-muted"
            >
              <UIcon
                name="i-lucide-image-off"
                class="size-8"
              />
            </div>
          </div>

          <div class="min-w-0 space-y-2">
            <h3 class="truncate text-sm font-semibold text-highlighted">
              {{ hoveredCard.name }}
            </h3>
            <div class="flex flex-wrap gap-1">
              <UBadge
                v-for="color in hoveredCard.colors"
                :key="color"
                size="sm"
                :style="getCardColorStyle(color)"
              >
                {{ color }}
              </UBadge>
            </div>
          </div>

          <dl class="grid gap-1 text-xs">
            <div
              v-for="[label, value] in hoveredCardRows"
              :key="label"
              class="grid grid-cols-[64px_minmax(0,1fr)] gap-2"
            >
              <dt class="text-muted">
                {{ label }}
              </dt>
              <dd class="min-w-0 text-highlighted">
                {{ value }}
              </dd>
            </div>
          </dl>
        </div>

        <div
          v-else
          class="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-4 text-center text-muted"
        >
          <UIcon
            name="i-lucide-square-mouse-pointer"
            class="size-8"
          />
          <p class="text-xs">
            Survolez une carte du plateau.
          </p>
        </div>
      </UCard>
    </div>
  </div>
</template>
