<script setup lang="ts">
import type { GamePhase } from '@onepiecetcg/shared'

type ScrollAreaInstance = {
  $el?: HTMLElement
}

const {
  players,
  phase,
  activePlayerIndex,
  turnsTaken,
  logs,
  winner,
  attackerSelection,
  nextPhase,
  playCard,
  attachDon,
  selectAttacker,
  declareAttack,
  cancelAttack,
  surrender,
  resetGame
} = useMockDuel()

const viewingPlayerIndex = ref<0 | 1>(0)
const donMode = ref(false)
const hoveredCard = ref<{ imageUrl: string, alt?: string } | null>(null)
const journalScrollArea = useTemplateRef<ScrollAreaInstance>('journal-scroll-area')

const phaseLabels: Record<string, string> = {
  refresh: 'Recharge',
  draw: 'Pioche',
  don: 'DON!!',
  main: 'Principale',
  end: 'Fin',
  finished: 'Terminée'
}

const phaseSteps: GamePhase[] = ['refresh', 'draw', 'don', 'main', 'end']

const turnNumber = computed(() => turnsTaken.value[0] + turnsTaken.value[1])
const isViewerTurn = computed(() => activePlayerIndex.value === viewingPlayerIndex.value)

const logToneClasses = {
  combat: {
    marker: 'bg-warning',
    text: 'text-warning'
  },
  error: {
    marker: 'bg-error',
    text: 'text-error'
  },
  resource: {
    marker: 'bg-info',
    text: 'text-info'
  },
  success: {
    marker: 'bg-success',
    text: 'text-success'
  },
  turn: {
    marker: 'bg-primary',
    text: 'text-primary'
  },
  card: {
    marker: 'bg-secondary',
    text: 'text-secondary'
  },
  neutral: {
    marker: 'bg-muted',
    text: 'text-muted'
  }
} as const

type LogTone = keyof typeof logToneClasses

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

function getLogTone(message: string): LogTone {
  if (/(impossible|invalide|insuffisant|ne peut|deck-out|pleine|Aucun DON)/i.test(message)) {
    return 'error'
  }

  if (/(remporte|abandonne)/i.test(message)) {
    return 'success'
  }

  if (/(attaque|KO|Puissance|repoussée|Vie)/i.test(message)) {
    return 'combat'
  }

  if (/(DON!!|pioche)/i.test(message)) {
    return 'resource'
  }

  if (/(joue|active|révèle)/i.test(message)) {
    return 'card'
  }

  if (/(commence|termine)/i.test(message)) {
    return 'turn'
  }

  return 'neutral'
}

watch(() => logs.value.length, async (newLength, previousLength) => {
  if (newLength <= previousLength) {
    return
  }

  await nextTick()
  journalScrollArea.value?.$el?.scrollTo({ top: 0, behavior: 'smooth' })
})

function opponentOf(side: 0 | 1): 0 | 1 {
  return side === 0 ? 1 : 0
}

function endTurn() {
  const currentActive = activePlayerIndex.value

  while (activePlayerIndex.value === currentActive && phase.value !== 'finished') {
    nextPhase()
  }
}

function toggleDonMode() {
  donMode.value = !donMode.value
  cancelAttack()
}

function onLeaderClick(side: 0 | 1) {
  if (donMode.value && side === activePlayerIndex.value) {
    attachDon(side, 'leader')
    donMode.value = false
    return
  }

  if (attackerSelection.value && side !== activePlayerIndex.value) {
    declareAttack(activePlayerIndex.value, 'leader')
    return
  }

  if (side === activePlayerIndex.value && players.value[side].leader) {
    selectAttacker(side, players.value[side].leader!.instanceId)
  }
}

function onCharacterClick(side: 0 | 1, instanceId: string) {
  if (donMode.value && side === activePlayerIndex.value) {
    attachDon(side, 'character', instanceId)
    donMode.value = false
    return
  }

  if (attackerSelection.value && side !== activePlayerIndex.value) {
    declareAttack(activePlayerIndex.value, 'character', instanceId)
    return
  }

  if (side === activePlayerIndex.value) {
    selectAttacker(side, instanceId)
  }
}

function onHandCardClick(side: 0 | 1, instanceId: string) {
  if (side !== activePlayerIndex.value) {
    return
  }

  playCard(side, instanceId)
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
        <div class="flex items-center gap-2 min-w-0">
          <span
            class="h-2 w-2 rounded-full shrink-0"
            :class="players[opponentOf(viewingPlayerIndex)].connected ? 'bg-success' : 'bg-muted'"
          />
          <span class="text-sm font-medium truncate">
            {{ players[opponentOf(viewingPlayerIndex)].displayName }}
          </span>
          <UBadge
            color="neutral"
            variant="subtle"
            size="sm"
          >
            Deck {{ players[opponentOf(viewingPlayerIndex)].deckCount }}
          </UBadge>
          <UBadge
            color="neutral"
            variant="subtle"
            size="sm"
          >
            DON!! {{ players[opponentOf(viewingPlayerIndex)].donDeckCount }}
          </UBadge>
          <UBadge
            color="neutral"
            variant="subtle"
            size="sm"
          >
            Main {{ players[opponentOf(viewingPlayerIndex)].handCount }}
          </UBadge>
          <UBadge
            color="neutral"
            variant="subtle"
            size="sm"
          >
            Vie {{ players[opponentOf(viewingPlayerIndex)].lifeCount }}
          </UBadge>
        </div>
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
        <div class="flex items-center gap-3 shrink-0">
          <p class="text-sm text-muted whitespace-nowrap">
            Tour {{ turnNumber }} - {{ isViewerTurn ? 'Votre tour' : "Tour de l'adversaire" }}
          </p>
          <UButton
            color="neutral"
            :disabled="phase === 'finished'"
            @click="endTurn"
          >
            Terminer le tour
          </UButton>
          <UButton
            color="error"
            variant="ghost"
            :disabled="phase === 'finished'"
            @click="surrender(activePlayerIndex)"
          >
            Abandonner
          </UButton>
        </div>
      </template>
    </UHeader>

    <UPage class="grid grid-cols-[1fr_12.25%_1fr] grid-rows-[minmax(0,1fr)] gap-4 flex-1 min-h-0 overflow-hidden">
      <template #left>
        <UCard class="flex flex-col gap-3 h-full overflow-y-auto">
          <p class="text-sm font-medium text-primary">
            Mock — sans room ni auth
          </p>
          <p class="text-xs text-muted">
            Simule un duel local à deux joueurs pour tester le plateau, avant le branchement à la room Colyseus réelle.
          </p>

          <USeparator />

          <div class="flex flex-col gap-1 text-sm">
            <p>Tour de <strong>{{ players[activePlayerIndex].displayName }}</strong></p>
            <p>Phase : <strong>{{ phaseLabels[phase] }}</strong></p>
            <p
              v-if="winner !== null"
              class="text-primary font-semibold"
            >
              {{ players[winner].displayName }} remporte la partie !
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton
              :disabled="phase === 'finished'"
              @click="nextPhase"
            >
              Phase suivante
            </UButton>
            <UButton
              color="neutral"
              variant="subtle"
              :disabled="phase !== 'main'"
              @click="toggleDonMode"
            >
              {{ donMode ? 'Annuler don DON!!' : 'Donner un DON!!' }}
            </UButton>
            <UButton
              v-if="attackerSelection"
              color="error"
              variant="subtle"
              @click="cancelAttack"
            >
              Annuler l'attaque
            </UButton>
            <UButton
              color="neutral"
              variant="ghost"
              @click="resetGame"
            >
              Réinitialiser
            </UButton>
          </div>

          <USeparator />

          <div class="flex flex-col gap-1 text-sm">
            <p class="font-medium">
              Point de vue
            </p>
            <div class="flex gap-1">
              <UButton
                v-for="index in [0, 1] as const"
                :key="index"
                :variant="viewingPlayerIndex === index ? 'solid' : 'outline'"
                @click="viewingPlayerIndex = index"
              >
                {{ players[index].displayName }}
              </UButton>
            </div>
          </div>
        </UCard>
      </template>

      <UContainer class="flex flex-col w-5xl gap-2 h-full min-h-0 overflow-hidden">
        <PlayZone
          class="flex-1 min-h-0"
          :player="players[opponentOf(viewingPlayerIndex)]"
          :side="opponentOf(viewingPlayerIndex)"
          :attacker-id="attackerSelection"
          :is-targetable="!!attackerSelection && activePlayerIndex === viewingPlayerIndex"
          is-adversary
          @leader-click="onLeaderClick"
          @character-click="onCharacterClick"
          @hand-card-click="onHandCardClick"
          @card-hover="hoveredCard = $event"
        />
        <USeparator class="shrink-0" />
        <PlayZone
          class="flex-1 min-h-0"
          :player="players[viewingPlayerIndex]"
          :side="viewingPlayerIndex"
          :attacker-id="attackerSelection"
          :is-targetable="!!attackerSelection && activePlayerIndex !== viewingPlayerIndex"
          reveal-hand
          @leader-click="onLeaderClick"
          @character-click="onCharacterClick"
          @hand-card-click="onHandCardClick"
          @card-hover="hoveredCard = $event"
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
            <UScrollArea
              ref="journal-scroll-area"
              class="flex-1 min-h-0"
              :ui="{ viewport: 'pr-1' }"
            >
              <ul class="flex flex-col gap-1 text-xs">
                <li
                  v-for="entry in logs"
                  :key="entry.id"
                  class="grid grid-cols-[0.5rem_3.25rem_1fr] gap-2 border-b border-default pb-1"
                >
                  <span
                    class="mt-1.5 size-1.5 rounded-full"
                    :class="logToneClasses[getLogTone(entry.message)].marker"
                  />
                  <time
                    :datetime="entry.createdAt"
                    class="tabular-nums"
                    :class="logToneClasses[getLogTone(entry.message)].text"
                  >
                    {{ formatLogTime(entry.createdAt) }}
                  </time>
                  <span :class="logToneClasses[getLogTone(entry.message)].text">
                    {{ entry.message }}
                  </span>
                </li>
              </ul>
            </UScrollArea>
          </div>
        </UCard>
      </template>
    </UPage>
  </div>
</template>
