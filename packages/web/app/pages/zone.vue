<script setup lang="ts">
definePageMeta({
  layout: 'simulator',
  middleware: 'auth'
})

const { room, reconnect, getStoredReconnectionToken } = useColyseus()
const connecting = ref(!room.value)
const connectionFailed = ref(false)

onMounted(async () => {
  if (room.value) {
    connecting.value = false
    return
  }

  const token = getStoredReconnectionToken()

  if (!token) {
    await navigateTo('/room')
    return
  }

  const reconnected = await reconnect(token)
  connecting.value = false

  if (!reconnected) {
    connectionFailed.value = true
  }
})
</script>

<template>
  <ClientOnly>
    <DuelBoard v-if="room" />
    <UPage
      v-else
      class="grid grid-cols-[1fr_12.25%_1fr] gap-4"
    >
      <UContainer class="grid gap-4">
        <p
          v-if="connectionFailed"
          class="text-sm text-error"
        >
          Impossible de rejoindre la partie. Retournez au lobby pour en rejoindre une nouvelle.
        </p>
        <p
          v-else
          class="text-sm text-muted"
        >
          {{ connecting ? 'Reconnexion à la partie...' : 'Préparation du duel...' }}
        </p>
        <UButton
          v-if="connectionFailed"
          to="/room"
          color="neutral"
        >
          Retour au lobby
        </UButton>
      </UContainer>
    </UPage>
    <template #fallback>
      <UPage class="grid grid-cols-[1fr_12.25%_1fr] gap-4">
        <UContainer class="grid gap-4">
          <p class="text-sm text-muted">
            Préparation du duel...
          </p>
        </UContainer>
      </UPage>
    </template>
  </ClientOnly>
</template>
