<script setup lang="ts">
import type { GamePhase } from '@onepiecetcg/shared'

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
  clearError
} = useDuelRoom()

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

const phaseSteps: GamePhase[] = ['refresh', 'draw', 'don', 'main', 'end']

const canAttachDon = computed(() => isMainPhase.value && isSelfTurn.value && selfUntappedDonCount.value > 0)
const isChoosingCharacterToDiscard = computed(() => pendingCharacterInstanceId.value !== null)

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

  if (!isAttachingDon.value) {
    return
  }

  attachDon('character', instanceId)
  isAttachingDon.value = false
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
        container: 'max-w-none px-4'
      }"
    >
      <template #left>
        <div
          v-if="opponent"
          class="flex items-center gap-2 min-w-0"
        >
          <span
            class="h-2 w-2 rounded-full shrink-0"
            :class="opponent.connected ? 'bg-success' : 'bg-muted'"
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

      <div class="flex items-center gap-1 min-w-0">
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
      v-if="isChoosingCharacterToDiscard"
      color="warning"
      variant="subtle"
      title="Zone Personnage pleine (5 max)"
      description="Choisissez un Personnage a defausser pour jouer la carte selectionnee."
      class="shrink-0"
      :close="{ color: 'neutral', variant: 'link' }"
      @update:open="cancelDiscardSelection"
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
          v-if="opponent"
          class="flex-1 min-h-0"
          :player="opponent"
          :side="1"
          is-adversary
          @card-hover="hoveredCard = $event"
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
          :is-selectable="isAttachingDon || isChoosingCharacterToDiscard"
          @card-hover="hoveredCard = $event"
          @hand-card-click="onSelfHandCardClick"
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
        </UCard>
      </template>
    </UPage>
  </div>
</template>
