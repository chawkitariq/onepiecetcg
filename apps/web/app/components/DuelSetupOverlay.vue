<script setup lang="ts">
const {
  self,
  opponent,
  isSelfDesignatedToChoose,
  isSelfTurnToMulligan,
  firstPlayerSessionId,
  chooseFirstOrSecond,
  mulligan
} = useDuelRoom()

const waitingLabel = computed(() => {
  if (!firstPlayerSessionId.value) {
    return `En attente du choix de ${opponent.value?.displayName ?? 'l\'adversaire'}...`
  }

  if (self.value?.mulliganDecided && !isSelfTurnToMulligan.value) {
    return `En attente de la decision de mulligan de ${opponent.value?.displayName ?? 'l\'adversaire'}...`
  }

  return null
})
</script>

<template>
  <div class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-default/90 backdrop-blur-sm">
    <template v-if="isSelfDesignatedToChoose && !firstPlayerSessionId">
      <div class="flex flex-col items-center gap-4 text-center">
        <p class="text-lg font-bold text-highlighted">
          Vous avez ete designe pour choisir
        </p>

        <div class="flex gap-2">
          <UButton
            size="lg"
            @click="chooseFirstOrSecond('first')"
          >
            Jouer en premier
          </UButton>
          <UButton
            size="lg"
            color="neutral"
            variant="subtle"
            @click="chooseFirstOrSecond('second')"
          >
            Jouer en second
          </UButton>
        </div>
      </div>
    </template>

    <template v-else-if="isSelfTurnToMulligan">
      <div class="flex flex-col items-center gap-4 text-center">
        <p class="text-lg font-bold text-highlighted">
          Votre main de depart
        </p>

        <div class="flex gap-2">
          <UButton
            size="lg"
            @click="mulligan(true)"
          >
            Faire un mulligan
          </UButton>
          <UButton
            size="lg"
            color="neutral"
            variant="subtle"
            @click="mulligan(false)"
          >
            Garder ma main
          </UButton>
        </div>
      </div>
    </template>

    <template v-else>
      <UCard class="w-full max-w-md">
        <p class="text-sm text-muted text-center">
          {{ waitingLabel ?? 'Mise en place de la partie en cours...' }}
        </p>
      </UCard>
    </template>
  </div>
</template>
