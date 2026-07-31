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
const hasStoredToken = computed(() => Boolean(getStoredReconnectionToken()))

const statusLabel = computed(() =>
  status.value === 'connecting' || connecting.value
    ? 'Reconnexion à la partie...'
    : 'Préparation du duel...'
)

async function attemptReconnect(options: { redirectToLobbyWhenMissingToken?: boolean } = {}) {
  const { redirectToLobbyWhenMissingToken = false } = options

  connectionFailed.value = false
  connecting.value = true

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
    connecting.value = false

    if (redirectToLobbyWhenMissingToken) {
      await navigateTo('/lobby')
      return
    }

    connectionFailed.value = true
    return
  }

  const reconnected = await reconnect(token)
  connecting.value = false

  if (!reconnected || reconnected.roomId !== roomId.value) {
    connectionFailed.value = true
  }
}

onMounted(async () => {
  await attemptReconnect({ redirectToLobbyWhenMissingToken: true })
})
</script>

<template>
  <ClientOnly>
    <DuelBoard v-if="room && room.roomId === roomId" />
    <div
      v-else
      class="flex min-h-dvh items-center justify-center bg-default px-4 py-10"
    >
      <UPageCard class="w-full max-w-lg border shadow-2xl">
        <div class="flex flex-col gap-6">
          <div class="flex flex-col items-start gap-4">
            <div
              class="flex size-14 shrink-0 items-center justify-center rounded-2xl ring-1"
              :class="connectionFailed
                ? 'bg-red-500/12 text-red-300 ring-red-400/30'
                : 'bg-amber-400/12 text-[#e8c766] ring-[#d4af37]/30'"
            >
              <UIcon
                :name="connectionFailed ? 'i-lucide-swords' : 'i-lucide-loader-2'"
                class="size-7"
                :class="connectionFailed ? '' : 'animate-spin'"
              />
            </div>

            <div class="space-y-2">
              <h1 class="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {{ connectionFailed ? 'Impossible de rejoindre cette partie' : statusLabel }}
              </h1>
              <p class="max-w-md text-sm leading-6 text-slate-300 sm:text-base">
                {{
                  connectionFailed
                    ? 'Cette partie n\'est plus disponible. Retournez au lobby pour en lancer une nouvelle.'
                    : 'Restauration de votre session en cours.'
                }}
              </p>
            </div>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <UButton
              v-if="connectionFailed && hasStoredToken"
              color="primary"
              size="xl"
              icon="i-lucide-rotate-cw"
              :loading="connecting"
              @click="attemptReconnect()"
            >
              Réessayer la reconnexion
            </UButton>
            <UButton
              to="/lobby"
              :color="connectionFailed ? 'neutral' : 'primary'"
              :variant="connectionFailed ? 'solid' : 'subtle'"
              size="xl"
              icon="i-lucide-arrow-left"
              class="justify-center"
            >
              Retour au lobby
            </UButton>
          </div>

          <p
            v-if="connectionFailed"
            class="text-xs text-slate-400"
          >
            Room {{ roomId }}
          </p>
        </div>
      </UPageCard>
    </div>
    <template #fallback>
      <div class="flex min-h-dvh items-center justify-center bg-default px-4 py-10">
        <UPageCard class="w-full max-w-xl border shadow-2xl">
          <div class="flex items-center gap-4">
            <div class="flex size-12 items-center justify-center rounded-2xl bg-amber-400/12 text-[#e8c766] ring-1 ring-[#d4af37]/30">
              <UIcon
                name="i-lucide-loader-2"
                class="size-6 animate-spin"
              />
            </div>
            <div class="space-y-1">
              <p class="text-lg font-semibold text-white">
                Préparation du duel...
              </p>
              <p class="text-sm text-slate-300">
                Initialisation de votre session de jeu.
              </p>
            </div>
          </div>
        </UPageCard>
      </div>
    </template>
  </ClientOnly>
</template>
