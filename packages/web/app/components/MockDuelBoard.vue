<script setup lang="ts">
const {
  players,
  phase,
  activePlayerIndex,
  logs,
  winner,
  attackerSelection,
  nextPhase,
  playCard,
  attachDon,
  selectAttacker,
  declareAttack,
  cancelAttack,
  resetGame
} = useMockDuel()

const viewingPlayerIndex = ref<0 | 1>(0)
const donMode = ref(false)

const phaseLabels: Record<string, string> = {
  refresh: 'Recharge',
  draw: 'Pioche',
  don: 'DON!!',
  main: 'Principale',
  end: 'Fin',
  finished: 'Terminée'
}

function opponentOf(side: 0 | 1): 0 | 1 {
  return side === 0 ? 1 : 0
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
  <UPage class="grid grid-cols-[1fr_12.25%_1fr] grid-rows-[minmax(0,1fr)] gap-4 h-full min-h-0 overflow-hidden">
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

    <UContainer class="flex flex-col gap-2 h-full min-h-0 w-4xl overflow-hidden">
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
      />
    </UContainer>

    <template #right>
      <UCard class="flex flex-col gap-2 h-full overflow-hidden">
        <p class="text-sm font-medium text-primary">
          Journal
        </p>
        <ul class="flex flex-col gap-1 text-xs flex-1 min-h-0 overflow-y-auto">
          <li
            v-for="entry in logs"
            :key="entry.id"
            class="border-b border-default pb-1"
          >
            {{ entry.message }}
          </li>
        </ul>
      </UCard>
    </template>
  </UPage>
</template>
