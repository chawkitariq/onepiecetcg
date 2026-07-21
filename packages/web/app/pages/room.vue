<script setup lang="ts">
import type { Deck, DeckListResponse } from '@onepiecetcg/shared'

const api = useApi()
const { profile, refresh } = useSession()
const { room, status, error, joinDuel, leave } = useColyseus()

const decks = ref<Deck[]>([])
const selectedDeckId = ref('')
const roomVersion = ref(0)
const loadingDecks = ref(false)
const deckError = ref('')

await refresh()
await loadDecks()

const deckItems = computed(() =>
  decks.value.map(deck => ({
    label: deck.name,
    value: deck.id
  }))
)

const players = computed(() => {
  void roomVersion.value
  const state = room.value?.state as { players?: Map<string, unknown> } | undefined

  return Array.from(state?.players?.values() ?? []) as Array<{
    sessionId: string
    displayName: string
    deckId: string
    ready: boolean
    connected: boolean
    zones: {
      leader?: { name?: string, number?: string, imageUrl?: string }
      deck?: unknown[]
      donDeck?: unknown[]
      hand?: Array<{ name?: string, number?: string, imageUrl?: string }>
      life?: unknown[]
      characters?: unknown[]
      stage?: { name?: string }
      cost?: unknown[]
      trash?: unknown[]
    }
  }>
})

const logs = computed(() => {
  void roomVersion.value
  const state = room.value?.state as { logs?: unknown[] } | undefined

  return Array.from(state?.logs ?? []) as Array<{ id: string, message: string, createdAt: string }>
})

async function loadDecks() {
  loadingDecks.value = true
  deckError.value = ''

  try {
    const response = await api<DeckListResponse>('/decks')
    decks.value = response.decks
    selectedDeckId.value = selectedDeckId.value || response.decks[0]?.id || ''
  } catch {
    deckError.value = 'Impossible de charger les decks sauvegardés.'
  } finally {
    loadingDecks.value = false
  }
}

async function joinRoom() {
  if (!profile.value?.user.id || !selectedDeckId.value) {
    return
  }

  const joinedRoom = await joinDuel({
    authUserId: profile.value.user.id,
    displayName: profile.value.profile.displayName,
    deckId: selectedDeckId.value
  })

  joinedRoom?.onStateChange(() => {
    roomVersion.value += 1
  })
}
</script>

<template>
  <main class="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-medium text-primary">
          Étape 5
        </p>
        <h1 class="mt-1 text-2xl font-semibold text-highlighted">
          Room de duel
        </h1>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton
          icon="i-lucide-refresh-cw"
          variant="soft"
          :loading="loadingDecks"
          @click="loadDecks"
        />
        <UButton
          v-if="room"
          icon="i-lucide-log-out"
          color="neutral"
          variant="soft"
          @click="leave"
        />
      </div>
    </header>

    <UAlert
      v-if="!profile"
      icon="i-lucide-lock"
      color="warning"
      title="Connexion requise"
      description="Connecte-toi pour charger tes decks sauvegardés et rejoindre une room."
    />

    <UAlert
      v-else-if="deckError || error"
      icon="i-lucide-circle-alert"
      color="error"
      :title="deckError || error"
    />

    <section class="grid gap-4 lg:grid-cols-[20rem_1fr]">
      <aside class="flex flex-col gap-4 rounded-lg border border-muted bg-elevated p-4">
        <div>
          <label
            for="deck"
            class="mb-2 block text-sm font-medium text-default"
          >
            Deck sauvegardé
          </label>
          <USelect
            id="deck"
            v-model="selectedDeckId"
            :items="deckItems"
            :disabled="!profile || status === 'connecting'"
            class="w-full"
          />
        </div>

        <UButton
          icon="i-lucide-plug"
          :loading="status === 'connecting'"
          :disabled="!profile || !selectedDeckId || Boolean(room)"
          block
          @click="joinRoom"
        >
          Rejoindre
        </UButton>

        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="rounded-md border border-muted p-3">
            <p class="text-muted">
              Statut
            </p>
            <p class="font-medium text-default">
              {{ status }}
            </p>
          </div>
          <div class="rounded-md border border-muted p-3">
            <p class="text-muted">
              Joueurs
            </p>
            <p class="font-medium text-default">
              {{ players.length }}/2
            </p>
          </div>
        </div>
      </aside>

      <section class="flex flex-col gap-4">
        <div class="grid gap-4 md:grid-cols-2">
          <UCard
            v-for="player in players"
            :key="player.sessionId"
          >
            <template #header>
              <div class="flex items-center justify-between gap-3">
                <div>
                  <h2 class="text-base font-semibold text-highlighted">
                    {{ player.displayName }}
                  </h2>
                  <p class="text-sm text-muted">
                    {{ player.ready ? 'Prêt' : 'En attente' }}
                  </p>
                </div>
                <UBadge
                  :color="player.connected ? 'success' : 'warning'"
                  variant="soft"
                >
                  {{ player.connected ? 'Connecté' : 'Déconnecté' }}
                </UBadge>
              </div>
            </template>

            <div class="grid gap-3 text-sm">
              <div class="flex items-center gap-3 rounded-md border border-muted p-3">
                <img
                  v-if="player.zones.leader?.imageUrl"
                  :src="player.zones.leader.imageUrl"
                  :alt="player.zones.leader.name"
                  class="h-20 w-14 rounded object-cover"
                >
                <div>
                  <p class="text-muted">
                    Leader
                  </p>
                  <p class="font-medium text-default">
                    {{ player.zones.leader?.name || 'Leader masqué' }}
                  </p>
                  <p class="text-muted">
                    {{ player.zones.leader?.number }}
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-2">
                <div class="rounded-md border border-muted p-3">
                  <p class="text-muted">
                    Main
                  </p>
                  <p class="font-medium text-default">
                    {{ player.zones.hand?.length ?? 0 }}
                  </p>
                </div>
                <div class="rounded-md border border-muted p-3">
                  <p class="text-muted">
                    Vie
                  </p>
                  <p class="font-medium text-default">
                    {{ player.zones.life?.length ?? 0 }}
                  </p>
                </div>
                <div class="rounded-md border border-muted p-3">
                  <p class="text-muted">
                    Deck
                  </p>
                  <p class="font-medium text-default">
                    {{ player.zones.deck?.length ?? 0 }}
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div class="rounded-md border border-muted p-3">
                  <p class="text-muted">
                    Personnages
                  </p>
                  <p class="font-medium text-default">
                    {{ player.zones.characters?.length ?? 0 }}/5
                  </p>
                </div>
                <div class="rounded-md border border-muted p-3">
                  <p class="text-muted">
                    Lieu
                  </p>
                  <p class="font-medium text-default">
                    {{ player.zones.stage?.name || 'Aucun' }}
                  </p>
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <UBadge
                  v-for="card in player.zones.hand"
                  :key="card.number || card.name"
                  color="neutral"
                  variant="soft"
                >
                  {{ card.name || 'Carte cachée' }}
                </UBadge>
              </div>
            </div>
          </UCard>
        </div>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold text-highlighted">
              Logs
            </h2>
          </template>

          <ul class="space-y-2 text-sm text-default">
            <li
              v-for="log in logs"
              :key="log.id"
            >
              {{ log.message }}
            </li>
            <li
              v-if="logs.length === 0"
              class="text-muted"
            >
              Aucun événement.
            </li>
          </ul>
        </UCard>
      </section>
    </section>
  </main>
</template>
