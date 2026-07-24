<script setup lang="ts">
import type { DuelPlayerView, PublicCard, PrivateCard } from '@onepiecetcg/shared'
import type { TransitionGhost } from '~/utils/duelTransitions'
import { derivePlayerTransitionDiff } from '~/utils/duelTransitions'

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
const { status } = useColyseus()

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

const hoveredCard = ref<{ imageUrl: string, alt?: string } | null>(null)
const isAttachingDon = ref(false)
const pendingCharacterInstanceId = ref<string | null>(null)
const isSelectingAttacker = ref(false)
const pendingAttackerInstanceId = ref<string | null>(null)
const pendingCounterCardInstanceId = ref<string | null>(null)
const counterPowerBonusInput = ref(1000)

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

  if (isAttachingDon.value) {
    return self.value.characters.map(character => character.instanceId)
  }

  return []
})
const selectableSelfLeader = computed(() =>
  Boolean(
    self.value?.leader
    && (
      isAttachingDon.value
      || (isSelectingAttacker.value && !self.value.leader.rested)
    )
  )
)
const invalidSelfLeaderPulse = ref(false)
const invalidOpponentLeaderPulse = ref(false)
const invalidSelfCharacterIds = ref<string[]>([])
const invalidOpponentCharacterIds = ref<string[]>([])
const selfTransitionGhosts = ref<TransitionGhost[]>([])
const opponentTransitionGhosts = ref<TransitionGhost[]>([])
const selfRevealedHandCardIds = ref<string[]>([])

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

function toggleAttachDon() {
  isAttachingDon.value = !isAttachingDon.value
}

function toggleSelectingAttacker() {
  isSelectingAttacker.value = !isSelectingAttacker.value
  pendingAttackerInstanceId.value = null
}

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
  if (!isMainPhase.value || !isSelfTurn.value) {
    return
  }

  if (isSelfCharacterZoneFull.value) {
    pendingCharacterInstanceId.value = instanceId
    return
  }

  playCard(instanceId)
}

function onSelfLeaderClick(_side: 0 | 1) {
  if (isSelectingAttacker.value) {
    onSelfLeaderAttackerClick()
    return
  }

  if (!isAttachingDon.value) {
    return
  }

  attachDon('leader')
  isAttachingDon.value = false
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

  if (!isAttachingDon.value) {
    return
  }

  attachDon('character', instanceId)
  isAttachingDon.value = false
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
            v-if="isMainPhase && isSelfTurn"
            size="sm"
            :color="isAttachingDon ? 'primary' : 'neutral'"
            :variant="isAttachingDon ? 'solid' : 'subtle'"
            :disabled="!canAttachDon && !isAttachingDon"
            @click="toggleAttachDon"
          >
            {{ isAttachingDon ? 'Annuler' : 'Attacher DON!!' }}
          </UButton>
          <UButton
            v-if="isMainPhase && isSelfTurn"
            size="sm"
            :color="isSelectingAttacker || isChoosingTarget ? 'primary' : 'neutral'"
            :variant="isSelectingAttacker || isChoosingTarget ? 'solid' : 'subtle'"
            :disabled="!canDeclareAttack && !isSelectingAttacker && !isChoosingTarget"
            @click="isChoosingTarget ? cancelTargetSelection() : toggleSelectingAttacker()"
          >
            {{ isSelectingAttacker || isChoosingTarget ? 'Annuler' : 'Attaquer' }}
          </UButton>
          <UButton
            size="sm"
            color="primary"
            :disabled="!canEndPhase"
            @click="endPhase"
          >
            {{ phase === 'end' ? 'Terminer le tour' : 'Phase suivante' }}
          </UButton>
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
    />

    <UAlert
      v-if="isChoosingTarget"
      color="info"
      variant="subtle"
      title="Choisissez la cible"
      description="Selectionnez le Leader adverse ou un Personnage adverse epuise."
      class="shrink-0"
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
        <UCard class="flex flex-col gap-3 h-full overflow-y-auto">
          <p class="text-sm font-medium text-primary">
            Room Colyseus
          </p>
          <p class="text-xs text-muted">
            Vue en lecture seule de la partie : zones publiques et compteurs des zones cachées adverses.
          </p>
        </UCard>
      </template>

      <UContainer class="relative flex flex-col w-5xl gap-2 h-full min-h-0 overflow-hidden">
        <DuelSetupOverlay v-if="phase === 'mulligan'" />
        <PlayZone
          v-if="opponent || self"
          class="flex-1 min-h-0"
          :player="opponent ?? emptyOpponentPreview"
          :side="1"
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
          reveal-hand
          :transition-ghosts="selfTransitionGhosts"
          :revealed-hand-card-ids="selfRevealedHandCardIds"
          :attacker-id="pendingAttackerInstanceId ?? (combat && isSelfAttacker ? combat.attackerInstanceId : null)"
          :is-selectable="isAttachingDon || isChoosingCharacterToDiscard || isSelectingAttacker || (isBlockingStep && isSelfDefender) || (isCounteringStep && isSelfDefender)"
          :selectable-leader="selectableSelfLeader"
          :selectable-character-ids="selectableSelfCharacterIds"
          :invalid-leader-pulse="invalidSelfLeaderPulse"
          :invalid-character-ids="invalidSelfCharacterIds"
          @card-hover="hoveredCard = $event"
          @hand-card-click="onSelfHandCardOrCounterClick"
          @leader-click="onSelfLeaderClick"
          @character-click="onSelfCharacterClick"
        />
      </UContainer>

      <template #right>
        <UCard
          class="h-full overflow-hidden"
          :ui="{ body: 'flex flex-col gap-2 h-full min-h-0 overflow-hidden' }"
        >
          <div class="flex flex-col gap-2 h-[700px] shrink-0">
            <p class="text-sm font-medium text-primary">
              Aperçu
            </p>
            <div class="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
              <img
                v-if="hoveredCard"
                :src="hoveredCard.imageUrl"
                :alt="hoveredCard.alt ?? ''"
                class="h-full max-w-full object-contain rounded"
              >
              <p
                v-else
                class="text-xs text-muted text-center px-2"
              >
                Survolez une carte pour l'agrandir ici
              </p>
            </div>
          </div>

          <USeparator class="shrink-0 my-4" />

          <div class="flex flex-col gap-2 flex-1 min-h-0 overflow-hidden">
            <p class="text-sm font-medium text-primary shrink-0">
              Journal
            </p>
            <ul class="flex flex-col gap-1 text-xs overflow-y-auto">
              <li
                v-for="entry in logs"
                :key="entry.id"
                class="grid grid-cols-[3.25rem_1fr] gap-2 border-b border-default pb-1"
              >
                <time
                  :datetime="entry.createdAt"
                  class="tabular-nums text-muted"
                >
                  {{ formatLogTime(entry.createdAt) }}
                </time>
                <span>{{ entry.message }}</span>
              </li>
              <li
                v-if="logs.length === 0"
                class="text-muted"
              >
                Aucun événement.
              </li>
            </ul>
          </div>

          <div
            v-if="status === 'connecting'"
            class="text-[11px] text-muted shrink-0"
          >
            Reconnexion en cours...
          </div>
        </UCard>
      </template>
    </UPage>
  </div>
</template>
