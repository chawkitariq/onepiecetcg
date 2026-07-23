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
  <div class="absolute inset-0 z-10 flex items-center justify-center bg-default/80 backdrop-blur-sm">
    <UCard class="w-full max-w-md">
      <template v-if="isSelfDesignatedToChoose && !firstPlayerSessionId">
        <div class="flex flex-col gap-4">
          <p class="text-sm font-medium text-primary">
            Vous avez ete designe pour choisir
          </p>
          <p class="text-sm text-muted">
            Souhaitez-vous jouer en premier ou en second ?
          </p>
          <div class="flex gap-2">
            <UButton
              class="flex-1 justify-center"
              @click="chooseFirstOrSecond('first')"
            >
              Jouer en premier
            </UButton>
            <UButton
              class="flex-1 justify-center"
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
        <div class="flex flex-col gap-4">
          <p class="text-sm font-medium text-primary">
            Mulligan
          </p>
          <p class="text-sm text-muted">
            Vous pouvez renvoyer votre main de depart, la remelanger dans le deck et en piocher une nouvelle. Ce choix est unique.
          </p>
          <div class="flex gap-2">
            <UButton
              class="flex-1 justify-center"
              @click="mulligan(true)"
            >
              Faire un mulligan
            </UButton>
            <UButton
              class="flex-1 justify-center"
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
        <p class="text-sm text-muted text-center">
          {{ waitingLabel ?? 'Mise en place de la partie en cours...' }}
        </p>
      </template>
    </UCard>
  </div>
</template>
