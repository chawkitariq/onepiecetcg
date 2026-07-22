<script setup lang="ts">
import type { Card, CardSearchResponse, Deck, DeckListResponse } from '@onepiecetcg/shared'

const colorDotClasses: Record<string, string> = {
  Red: 'bg-red-500',
  Green: 'bg-green-500',
  Blue: 'bg-blue-500',
  Purple: 'bg-purple-500',
  Black: 'bg-neutral-900 dark:bg-neutral-100',
  Yellow: 'bg-yellow-400'
}

const api = useApi()
const { profile, refresh } = useSession()
const { room, status, error, joinDuel, createPrivateRoom, joinPrivateRoom, leave } = useColyseus()

const decks = ref<Deck[]>([])
const cards = ref<Card[]>([])
const selectedDeckId = ref('')
const deckSearch = ref('')
const roomCodeInput = ref('')
const createdRoomCode = ref('')
const roomVersion = ref(0)
const loadingDecks = ref(false)
const deckError = ref('')

await refresh()
await loadDecks()

const cardById = computed(() => new Map(cards.value.map(card => [card.id, card])))

const deckSummaries = computed(() => decks.value.map((deck) => {
  const leader = cardById.value.get(deck.leaderCardId) ?? null
  const cardCount = deck.cards.reduce((sum, card) => sum + card.quantity, 0)

  return {
    deck,
    leader,
    cardCount
  }
}))

const selectedDeckSummary = computed(() =>
  deckSummaries.value.find(summary => summary.deck.id === selectedDeckId.value) ?? null
)

const filteredDeckSummaries = computed(() => {
  const needle = deckSearch.value.trim().toLowerCase()

  if (!needle) {
    return deckSummaries.value
  }

  return deckSummaries.value.filter(summary =>
    summary.deck.name.toLowerCase().includes(needle)
    || (summary.leader?.name.toLowerCase().includes(needle) ?? false))
})

const players = computed(() => {
  void roomVersion.value
  const state = room.value?.state as { players?: Map<string, unknown> } | undefined

  return Array.from(state?.players?.values() ?? []) as Array<{
    sessionId: string
    displayName: string
    connected: boolean
    ready: boolean
  }>
})

const logs = computed(() => {
  void roomVersion.value
  const state = room.value?.state as { logs?: unknown[] } | undefined

  return Array.from(state?.logs ?? []) as Array<{ id: string, message: string, createdAt: string }>
})

function dotClass(leader: Card | null) {
  return colorDotClasses[leader?.colors[0] ?? ''] ?? 'bg-neutral-400'
}

async function loadDecks() {
  loadingDecks.value = true
  deckError.value = ''

  try {
    const [deckResponse, catalogResponse] = await Promise.all([
      api<DeckListResponse>('/decks'),
      api<CardSearchResponse>('/catalog/cards')
    ])
    decks.value = deckResponse.decks
    cards.value = catalogResponse.cards
    selectedDeckId.value = selectedDeckId.value || deckResponse.decks[0]?.id || ''
  } catch {
    deckError.value = 'Impossible de charger les decks sauvegardés.'
  } finally {
    loadingDecks.value = false
  }
}

function watchRoom() {
  room.value?.onStateChange(() => {
    roomVersion.value += 1
  })
}

async function quickMatch() {
  if (!profile.value?.user.id || !selectedDeckId.value) {
    return
  }

  await joinDuel({
    authUserId: profile.value.user.id,
    displayName: profile.value.profile.displayName,
    deckId: selectedDeckId.value
  })
  watchRoom()
}

async function createRoom() {
  if (!profile.value?.user.id || !selectedDeckId.value) {
    return
  }

  const joinedRoom = await createPrivateRoom({
    authUserId: profile.value.user.id,
    displayName: profile.value.profile.displayName,
    deckId: selectedDeckId.value
  })

  createdRoomCode.value = joinedRoom?.roomId ?? ''
  watchRoom()
}

async function joinRoomByCode() {
  if (!profile.value?.user.id || !selectedDeckId.value || !roomCodeInput.value) {
    return
  }

  await joinPrivateRoom(roomCodeInput.value.trim(), {
    authUserId: profile.value.user.id,
    displayName: profile.value.profile.displayName,
    deckId: selectedDeckId.value
  })
  watchRoom()
}

async function leaveRoom() {
  await leave()
  createdRoomCode.value = ''
  roomCodeInput.value = ''
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
    <header>
      <h1 class="text-2xl font-bold text-highlighted">
        Choisissez votre deck
      </h1>
      <p class="mt-1 text-sm text-muted">
        Sélectionnez un deck sauvegardé pour rejoindre une partie.
      </p>
    </header>

    <UAlert
      v-if="!profile"
      icon="i-lucide-lock"
      color="warning"
      title="Connexion requise"
      description="Connecte-toi pour charger tes decks sauvegardés et rejoindre une partie."
    />

    <UAlert
      v-else-if="deckError || error"
      icon="i-lucide-circle-alert"
      color="error"
      :title="deckError || error"
    />

    <div class="grid gap-6 lg:grid-cols-[22rem_1fr]">
      <UCard :ui="{ body: 'p-0' }">
        <div class="flex items-center justify-between px-4 py-3 border-b border-default">
          <p class="text-xs font-medium tracking-wide text-muted uppercase">
            {{ decks.length }} decks sauvegardés
          </p>
          <UButton
            icon="i-lucide-refresh-cw"
            color="neutral"
            variant="ghost"
            size="xs"
            :loading="loadingDecks"
            @click="loadDecks"
          />
        </div>

        <div class="px-4 py-3 border-b border-default">
          <UInput
            v-model="deckSearch"
            icon="i-lucide-search"
            placeholder="Rechercher un deck..."
            class="w-full"
          />
        </div>

        <ul class="max-h-112 overflow-y-auto">
          <li
            v-if="filteredDeckSummaries.length === 0"
            class="px-4 py-6 text-center text-sm text-muted"
          >
            Aucun deck ne correspond à cette recherche.
          </li>
          <li
            v-for="summary in filteredDeckSummaries"
            :key="summary.deck.id"
          >
            <button
              type="button"
              class="flex w-full items-center gap-3 px-4 py-3 text-left border-b border-default last:border-b-0 hover:bg-elevated transition-colors"
              :class="selectedDeckId === summary.deck.id ? 'bg-primary/10' : ''"
              @click="selectedDeckId = summary.deck.id"
            >
              <span
                class="h-2.5 w-2.5 shrink-0 rounded-full"
                :class="dotClass(summary.leader)"
              />
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-medium text-highlighted">
                  {{ summary.deck.name }}
                </span>
                <span class="block truncate text-xs text-muted">
                  {{ summary.leader?.name ?? 'Leader inconnu' }}
                </span>
              </span>
              <span
                class="shrink-0 text-xs font-medium"
                :class="summary.cardCount === 50 ? 'text-muted' : 'text-error'"
              >
                {{ summary.cardCount }}/50
              </span>
              <URadio
                :model-value="selectedDeckId === summary.deck.id"
                :value="true"
                tabindex="-1"
              />
            </button>
          </li>
        </ul>
      </UCard>

      <div class="flex flex-col gap-6">
        <UCard v-if="selectedDeckSummary">
          <div class="flex items-stretch gap-4">
            <span
              class="w-1 shrink-0 rounded-full"
              :class="dotClass(selectedDeckSummary.leader)"
            />
            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-lg font-semibold text-highlighted">
                    {{ selectedDeckSummary.deck.name }}
                  </p>
                  <p class="truncate text-sm text-muted">
                    {{ selectedDeckSummary.leader?.name ?? 'Leader inconnu' }}
                  </p>
                </div>
                <UButton
                  to="/decks"
                  color="primary"
                  variant="link"
                  size="sm"
                >
                  Modifier le deck
                </UButton>
              </div>
              <UBadge
                class="mt-3"
                color="neutral"
                variant="subtle"
              >
                {{ selectedDeckSummary.cardCount }}/50 cartes
              </UBadge>
            </div>
          </div>
        </UCard>

        <div class="grid gap-6 sm:grid-cols-2">
          <UCard>
            <p class="text-sm font-semibold text-highlighted">
              Partie rapide
            </p>
            <p class="mt-1 text-sm text-muted">
              Rejoignez la file d'attente et affrontez un adversaire choisi au hasard.
            </p>
            <UButton
              class="mt-4"
              color="neutral"
              block
              :loading="status === 'connecting'"
              :disabled="!profile || !selectedDeckId || Boolean(room)"
              @click="quickMatch"
            >
              Rechercher une partie
            </UButton>
          </UCard>

          <UCard>
            <p class="text-sm font-semibold text-highlighted">
              Room privée
            </p>
            <p class="mt-1 text-sm text-muted">
              Créez un code à partager ou entrez celui d'un ami.
            </p>

            <UButton
              class="mt-4"
              color="neutral"
              block
              :loading="status === 'connecting'"
              :disabled="!profile || !selectedDeckId || Boolean(room)"
              @click="createRoom"
            >
              Créer un code de room
            </UButton>

            <div
              v-if="createdRoomCode"
              class="mt-3 rounded-md bg-primary/10 px-3 py-2 text-center text-sm font-semibold tracking-widest text-primary"
            >
              {{ createdRoomCode }}
            </div>

            <div class="mt-3 flex gap-2">
              <UInput
                v-model="roomCodeInput"
                placeholder="Code de room"
                class="flex-1"
                :disabled="!profile || !selectedDeckId || Boolean(room)"
              />
              <UButton
                color="neutral"
                :loading="status === 'connecting'"
                :disabled="!profile || !selectedDeckId || !roomCodeInput || Boolean(room)"
                @click="joinRoomByCode"
              >
                Rejoindre
              </UButton>
            </div>
          </UCard>
        </div>
        <UCard v-if="room">
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm font-semibold text-highlighted">
                Room {{ createdRoomCode || room.roomId }}
              </p>
              <UButton
                icon="i-lucide-log-out"
                color="neutral"
                variant="soft"
                size="sm"
                @click="leaveRoom"
              >
                Quitter
              </UButton>
            </div>
          </template>

          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="player in players"
              :key="player.sessionId"
              :color="player.connected ? 'success' : 'warning'"
              variant="soft"
            >
              {{ player.displayName }} — {{ player.ready ? 'Prêt' : 'En attente' }}
            </UBadge>
            <p
              v-if="players.length === 0"
              class="text-sm text-muted"
            >
              En attente d'un adversaire...
            </p>
          </div>

          <USeparator class="my-4" />

          <ul class="space-y-1 text-sm text-default">
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
      </div>
    </div>
  </div>
</template>
