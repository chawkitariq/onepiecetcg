<script setup lang="ts">
import type { CardColor, DuelPlayerView, PublicCard, PrivateCard } from '@onepiecetcg/shared'
import type { TransitionGhost } from '~/utils/duelTransitions'
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
  await navigateTo('/room')
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
const pendingCharacterInstanceId = ref<string | null>(null)
const isSelectingAttacker = ref(false)
const pendingAttackerInstanceId = ref<string | null>(null)
const pendingCounterCardInstanceId = ref<string | null>(null)
const counterPowerBonusInput = ref(1000)
const draggedHandCardInstanceId = ref<string | null>(null)
const invalidHandCardIds = ref<string[]>([])

const phaseSteps = ['refresh', 'draw', 'don', 'main', 'end'] as const
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

function getCardColorStyle(color: CardColor) {
  const palette: Record<CardColor, string> = {
    Red: 'border-color: color-mix(in oklab, var(--ui-error) 45%, transparent); color: var(--ui-error);',
    Green: 'border-color: color-mix(in oklab, var(--ui-success) 45%, transparent); color: var(--ui-success);',
    Blue: 'border-color: color-mix(in oklab, var(--ui-info) 45%, transparent); color: var(--ui-info);',
    Purple: 'border-color: color-mix(in oklab, var(--ui-secondary) 45%, transparent); color: var(--ui-secondary);',
    Black: 'border-color: color-mix(in oklab, var(--ui-text-dimmed) 55%, transparent); color: var(--ui-text-highlighted);',
    Yellow: 'border-color: color-mix(in oklab, var(--ui-warning) 45%, transparent); color: var(--ui-warning);'
  }

  return palette[color]
}

watch(() => logs.value.length, async (newLength, previousLength) => {
  if (newLength <= previousLength) {
    return
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

function onSelfHandCardClick(_side: 0 | 1, instanceId: string) {
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

function onSelfHandCardOrCounterClick(side: 0 | 1, instanceId: string) {
  if (isCounteringStep.value && isSelfDefender.value) {
    onCounterHandCardClick(instanceId)
    return
  }

  onSelfHandCardClick(side, instanceId)
}

function cancelDiscardSelection() {
  pendingCharacterInstanceId.value = null
}

function onSelfHandCardDragStart(_side: 0 | 1, instanceId: string) {
  if (!draggableHandCardIds.value.includes(instanceId)) {
    pulseHandCard(instanceId)
    return
  }

  draggedHandCardInstanceId.value = instanceId
}

function onSelfHandCardDragEnd() {
  resetDraggedHandCard()
}

function onInvalidHandCardDragAttempt(_side: 0 | 1, instanceId: string) {
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
      </template>

      <div class="flex items-center gap-1 min-w-0 px-2 sm:px-4">
        <UBadge
          v-for="step in phaseSteps"
          :key="step"
          color="neutral"
          :variant="phase === step ? 'solid' : 'subtle'"
          size="sm"
        >
          {{ phaseLabels[step] }}
        </UBadge>
      </div>

      <template #right>
        <div class="flex items-center gap-2">
          <UBadge
            v-if="self"
            color="neutral"
            variant="subtle"
            size="sm"
          >
            DON!! {{ selfUntappedDonCount }}
          </UBadge>
          <p class="text-sm text-muted whitespace-nowrap">
            {{ isSelfTurn ? 'Votre tour' : "Tour de l'adversaire" }}
          </p>
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

    <UAlert
      v-if="isChoosingCharacterToDiscard"
      color="warning"
      variant="subtle"
      title="Zone Personnage pleine (5 max)"
      description="Choisissez un Personnage a defausser pour jouer la carte selectionnee."
      class="shrink-0"
      :close="{ color: 'neutral', variant: 'link' }"
      @update:open="cancelDiscardSelection"
    />

    <UAlert
      v-if="isSelectingAttacker"
      color="info"
      variant="subtle"
      title="Choisissez votre attaquant"
      description="Selectionnez votre Leader ou un Personnage redresse n'ayant pas ete joue ce tour-ci."
      class="shrink-0"
      :close="{ color: 'neutral', variant: 'link' }"
      @update:open="cancelTargetSelection"
    />

    <UAlert
      v-if="isChoosingTarget"
      color="info"
      variant="subtle"
      title="Choisissez la cible"
      description="Selectionnez le Leader adverse ou un Personnage adverse epuise."
      class="shrink-0"
      :close="{ color: 'neutral', variant: 'link' }"
      @update:open="cancelTargetSelection"
    />

    <UAlert
      v-if="isBlockingStep && isSelfDefender"
      color="warning"
      variant="subtle"
      title="Etape de Blocage"
      description="Designez un Personnage redresse comme Bloqueur, ou ne bloquez pas."
      class="shrink-0"
    >
      <template #actions>
        <UButton
          size="sm"
          color="neutral"
          variant="subtle"
          @click="skipBlock"
        >
          Ne pas bloquer
        </UButton>
      </template>
    </UAlert>

    <UAlert
      v-if="isBlockingStep && isSelfAttacker"
      color="neutral"
      variant="subtle"
      title="Etape de Blocage"
      description="En attente de la decision de blocage de l'adversaire..."
      class="shrink-0"
    />

    <UAlert
      v-if="isCounteringStep && isSelfDefender"
      color="warning"
      variant="subtle"
      title="Etape de Contre"
      description="Defaussez une carte avec Contre depuis votre main pour booster votre puissance de defense, ou terminez l'etape."
      class="shrink-0"
    >
      <template #actions>
        <UButton
          size="sm"
          color="primary"
          variant="subtle"
          @click="finishCounterStep"
        >
          Terminer l'etape de Contre
        </UButton>
      </template>
    </UAlert>

    <UAlert
      v-if="isChoosingCounterCard"
      color="warning"
      variant="subtle"
      title="Valeur de Contre"
      description="Confirmez la valeur de Contre a ajouter pour la duree du combat."
      class="shrink-0"
    >
      <template #actions>
        <UInputNumber
          v-model="counterPowerBonusInput"
          :min="0"
          :step="1000"
          size="sm"
        />
        <UButton
          size="sm"
          color="primary"
          variant="subtle"
          @click="confirmCounter"
        >
          Confirmer
        </UButton>
        <UButton
          size="sm"
          color="neutral"
          variant="ghost"
          @click="cancelCounterSelection"
        >
          Annuler
        </UButton>
      </template>
    </UAlert>

    <UAlert
      v-if="isCounteringStep && isSelfAttacker"
      color="neutral"
      variant="subtle"
      title="Etape de Contre"
      description="En attente de la decision de contre de l'adversaire..."
      class="shrink-0"
    />

    <UAlert
      v-if="isAwaitingTriggerDecision && isSelfDefender"
      color="error"
      variant="subtle"
      title="Carte de Vie revelee : [Declenchement]"
      description="Voulez-vous activer le Declenchement (la carte sera ecartee) ou l'ajouter simplement a votre main ?"
      class="shrink-0"
    >
      <template #actions>
        <UButton
          size="sm"
          color="error"
          variant="subtle"
          @click="resolveTrigger(true)"
        >
          Activer et ecarter
        </UButton>
        <UButton
          size="sm"
          color="neutral"
          variant="subtle"
          @click="resolveTrigger(false)"
        >
          Ajouter a la main
        </UButton>
      </template>
    </UAlert>

    <UAlert
      v-if="isAwaitingTriggerDecision && isSelfAttacker"
      color="neutral"
      variant="subtle"
      title="Carte de Vie revelee"
      description="En attente de la decision de Declenchement du defenseur..."
      class="shrink-0"
    />

    <UPage class="grid grid-cols-[1fr_12.25%_1fr] grid-rows-[minmax(0,1fr)] gap-4 flex-1 min-h-0 overflow-hidden">
      <template #left>
        <UCard
          class="h-full overflow-hidden"
          :ui="{ body: 'flex flex-col gap-2 h-full min-h-0 overflow-hidden' }"
        >
          <p class="text-sm font-medium text-primary shrink-0">
            Journal
          </p>
          <p class="text-xs text-muted shrink-0">
            Vue en lecture seule de la partie : zones publiques et compteurs des zones cachées adverses.
          </p>
          <div class="flex flex-col gap-2 flex-1 min-h-0 overflow-hidden">
            <UScrollArea
              ref="journal-scroll-area"
              class="flex-1 min-h-0"
              :ui="{ viewport: 'pr-1' }"
            >
              <ul class="flex flex-col justify-end gap-2 min-h-full text-xs">
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
            </UScrollArea>
          </div>

          <div
            v-if="status === 'connecting'"
            class="text-[11px] text-muted shrink-0"
          >
            Reconnexion en cours...
          </div>
        </UCard>
      </template>

      <UContainer class="relative flex flex-col w-5xl gap-2 h-full min-h-0 overflow-hidden">
        <DuelSetupOverlay v-if="phase === 'mulligan'" />
        <PlayZone
          v-if="opponent || self"
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
        <div
          v-else
          class="flex-1 min-h-0 flex items-center justify-center text-sm text-muted"
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
          reveal-hand
          :draggable-hand-card-ids="draggableHandCardIds"
          :invalid-hand-card-ids="invalidHandCardIds"
          :dragged-hand-card-instance-id="draggedHandCardInstanceId"
          :can-drop-on-character-zone="isMainPhase && isSelfTurn && !isCombatInProgress"
          :transition-ghosts="selfTransitionGhosts"
          :revealed-hand-card-ids="selfRevealedHandCardIds"
          :attacker-id="pendingAttackerInstanceId ?? (combat && isSelfAttacker ? combat.attackerInstanceId : null)"
          :is-selectable="isChoosingCharacterToDiscard || isSelectingAttacker || (isBlockingStep && isSelfDefender) || (isCounteringStep && isSelfDefender)"
          :leader-action-popover-items="selfLeaderActionPopoverItems"
          :selectable-leader="selectableSelfLeader"
          :selectable-character-ids="selectableSelfCharacterIds"
          :character-action-popover-items="selfCharacterActionPopoverItems"
          :invalid-leader-pulse="invalidSelfLeaderPulse"
          :invalid-character-ids="invalidSelfCharacterIds"
          @card-hover="hoveredCard = $event"
          @hand-card-click="onSelfHandCardOrCounterClick"
          @hand-card-drag-start="onSelfHandCardDragStart"
          @hand-card-drag-end="onSelfHandCardDragEnd"
          @invalid-hand-card-drag-attempt="onInvalidHandCardDragAttempt"
          @hand-card-drop-on-characters="onSelfCharacterZoneDrop"
          @leader-click="onSelfLeaderClick"
          @character-click="onSelfCharacterClick"
        />
      </UContainer>

      <template #right>
        <UCard
          class="h-full overflow-hidden"
          :ui="{ root: 'h-full flex flex-col overflow-hidden', body: 'min-h-0 flex-1 overflow-hidden' }"
        >
          <template #header>
            <div class="space-y-3">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <h2 class="text-base font-semibold text-highlighted">
                    Details
                  </h2>
                  <p class="text-sm text-muted">
                    {{ hoveredCard?.number ?? 'Aucune carte' }}
                  </p>
                </div>
                <UBadge
                  v-if="hoveredCard"
                  color="neutral"
                  variant="subtle"
                >
                  {{ hoveredCard.type }}
                </UBadge>
              </div>
            </div>
          </template>

          <div
            v-if="hoveredCard"
            class="flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-1"
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

            <div class="flex min-h-0 min-w-0 flex-col gap-4">
              <div class="min-w-0 space-y-3">
                <div>
                  <h3 class="text-base font-semibold text-highlighted">
                    {{ hoveredCard.name }}
                  </h3>
                  <div class="mt-2 flex flex-wrap gap-1">
                    <UBadge
                      v-for="color in hoveredCard.colors"
                      :key="color"
                      variant="outline"
                      :style="getCardColorStyle(color)"
                    >
                      {{ color }}
                    </UBadge>
                  </div>
                </div>

                <p class="max-h-36 overflow-y-auto whitespace-pre-line text-sm text-muted">
                  {{ hoveredCard.text || 'Pas de texte.' }}
                </p>
              </div>

              <dl class="grid gap-2 text-sm">
                <div
                  v-for="[label, value] in hoveredCardRows"
                  :key="label"
                  class="grid grid-cols-[92px_minmax(0,1fr)] gap-3"
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
          </div>

          <div
            v-else
            class="flex h-full min-h-0 flex-col gap-4"
          >
            <div class="flex-1 min-h-0 overflow-y-auto pr-1">
              <div class="flex min-h-full flex-col gap-4">
                <div class="flex aspect-[4/5] w-full items-center justify-center rounded-lg bg-elevated/50 p-6 text-center text-muted">
                  <div class="flex flex-col items-center gap-3">
                    <UIcon
                      name="i-lucide-square-mouse-pointer"
                      class="size-10"
                    />
                    <div class="space-y-1">
                      <p class="text-sm font-medium text-highlighted">
                        Aucune carte
                      </p>
                      <p class="text-sm">
                        Survolez une carte du plateau.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </template>
    </UPage>
  </div>
</template>
