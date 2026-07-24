<script setup lang="ts">
definePageMeta({
  layout: 'simulator',
  middleware: 'auth'
})

const route = useRoute()
const roomId = computed(() => String(route.params.roomId))

const { room, reconnect, getStoredReconnectionToken, status } = useColyseus()
const connecting = ref(!room.value)
const connectionFailed = ref(false)

onMounted(async () => {
  // Already connected to the exact room this URL points at (e.g. navigated
  // here straight from /room in the same session) -- nothing to reconnect.
  if (room.value && room.value.roomId === roomId.value) {
    connecting.value = false
    return
  }

  // A live room exists but doesn't match the URL (e.g. this tab is mid-duel
  // in a different room and the URL was edited by hand) -- the URL isn't a
  // valid join target on its own (joining requires a deck, chosen back on
  // /room), so there's nothing safe to reconnect to.
  if (room.value) {
    connecting.value = false
    connectionFailed.value = true
    return
  }

  const token = getStoredReconnectionToken()

  if (!token) {
    await navigateTo('/lobby')
    return
  }

  const reconnected = await reconnect(token)
  connecting.value = false

  if (!reconnected || reconnected.roomId !== roomId.value) {
    connectionFailed.value = true
  }
})
</script>

<template>
  <ClientOnly>
    <DuelBoard v-if="room && room.roomId === roomId" />
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
          {{ status === 'connecting' || connecting ? 'Reconnexion à la partie...' : 'Préparation du duel...' }}
        </p>
        <UButton
          v-if="connectionFailed"
          to="/lobby"
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
