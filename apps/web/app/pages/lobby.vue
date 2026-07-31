<script setup lang="ts">
import type { Card, CardSearchResponse, Deck, DeckListResponse, DescribedRoomListResponse, DescribedRoomSummary, DuelLogEntry, DuelPlayerView } from '@onepiecetcg/shared'
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'
import {
  getDuelLogLevelPresentation,
  getDuelLogMessageText,
  resolveDuelLogActorPresentation
} from '~/utils/duelLogs'

definePageMeta({
  layout: 'lobby',
  middleware: 'auth'
})

const createLobbySchema = z.object({
  description: z.string().trim().min(1, 'Décris ta lobby pour la publier')
})

type CreateLobbySchema = z.output<typeof createLobbySchema>

const joinCodeSchema = z.object({
  code: z.string().trim().min(1, 'Entre un code de room')
})

type JoinCodeSchema = z.output<typeof joinCodeSchema>

const colorTokens: Record<string, { dot: string, hex: string }> = {
  Red: { dot: 'bg-red-500', hex: '#ef4444' },
  Green: { dot: 'bg-green-500', hex: '#22c55e' },
  Blue: { dot: 'bg-blue-500', hex: '#3b82f6' },
  Purple: { dot: 'bg-purple-500', hex: '#a855f7' },
  Black: { dot: 'bg-neutral-900 dark:bg-neutral-100', hex: '#a1a1aa' },
  Yellow: { dot: 'bg-yellow-400', hex: '#eab308' }
}
const fallbackColorToken = { dot: 'bg-neutral-400', hex: '#8b5cf6' }

const api = useApi()
const toast = useToast()
const { profile, refresh } = useSession()
const { room, status, error, joinDuel, createPrivateRoom, joinPrivateRoom, leave } = useColyseus()

const decks = ref<Deck[]>([])
const cards = ref<Card[]>([])
const selectedDeckId = ref('')
const deckSearch = ref('')
const deckPickerOpen = ref(false)
const createdRoomCode = ref('')
const roomVersion = ref(0)
const loadingDecks = ref(false)
const deckError = ref('')
const createLobbyState = reactive<Partial<CreateLobbySchema>>({ description: '' })
const joinCodeState = reactive<Partial<JoinCodeSchema>>({ code: '' })
const describedRooms = ref<DescribedRoomSummary[]>([])
const loadingDescribedRooms = ref(false)
const describedRoomsError = ref('')
const joiningRoomId = ref('')
let watchedRoom: typeof room.value | null = null

const cardById = computed(() => new Map(cards.value.map(card => [card.id, card])))

const deckSummaries = computed(() => decks.value.map((deck) => {
  const leader = cardById.value.get(deck.leaderCardId) ?? null
  const cardCount = deck.cards.reduce((sum, card) => sum + card.quantity, 0)

  return {
    deck,
    leader,
    cardCount,
    isComplete: cardCount === 50
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

  return colyseusMapValues<DuelPlayerView>(room.value?.state.players)
})

const logs = computed(() => {
  void roomVersion.value

  return colyseusArrayValues<DuelLogEntry>(room.value?.state.logs)
})

const accentToken = computed(() => colorTokens[selectedDeckSummary.value?.leader?.colors[0] ?? ''] ?? fallbackColorToken)
const accentStyle = computed(() => ({ '--accent': accentToken.value.hex }))

const canPlay = computed(() => Boolean(profile.value && selectedDeckId.value && selectedDeckSummary.value?.isComplete))
const isBusy = computed(() => status.value === 'connecting')
const isInRoom = computed(() => Boolean(room.value))

await refresh()
await loadDecks()
await loadDescribedRooms()

function dotClass(leader: Card | null) {
  return (colorTokens[leader?.colors[0] ?? ''] ?? fallbackColorToken).dot
}

function resolveLogActor(sessionId: string) {
  return resolveDuelLogActorPresentation(sessionId, {
    self: players.value[0] ?? null,
    opponent: players.value[1] ?? null
  })
}

function getLogMessageText(log: DuelLogEntry) {
  return getDuelLogMessageText(log, resolveLogActor(log.actorSessionId))
}

function selectDeck(deckId: string) {
  selectedDeckId.value = deckId
  deckPickerOpen.value = false
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
    deckError.value = 'Impossible de charger tes decks sauvegardés.'
  } finally {
    loadingDecks.value = false
  }
}

async function loadDescribedRooms() {
  loadingDescribedRooms.value = true
  describedRoomsError.value = ''

  try {
    const response = await api<DescribedRoomListResponse>('/lobby/rooms')
    describedRooms.value = response.rooms
  } catch {
    describedRoomsError.value = 'Impossible de charger les lobbies en ligne.'
  } finally {
    loadingDescribedRooms.value = false
  }
}

function onRoomStateChange() {
  roomVersion.value += 1

  if (players.value.length === 2 && players.value.every(player => player.ready) && room.value) {
    void navigateTo(`/zone/${room.value.roomId}`)
  }
}

function watchRoom() {
  watchedRoom?.onStateChange.remove(onRoomStateChange)
  watchedRoom = room.value
  watchedRoom?.onStateChange(onRoomStateChange)
  onRoomStateChange()
}

async function quickMatch() {
  if (!profile.value?.user.id || !selectedDeckId.value) {
    return
  }

  await joinDuel({
    displayName: profile.value.profile.displayName,
    deckId: selectedDeckId.value
  })

  if (error.value) {
    toast.add({ title: 'Impossible de rejoindre la file', description: error.value, color: 'error' })

    return
  }

  watchRoom()
}

async function createRoom(event: FormSubmitEvent<JoinCodeSchema> | null) {
  void event

  if (!profile.value?.user.id || !selectedDeckId.value) {
    return
  }

  const joinedRoom = await createPrivateRoom({
    displayName: profile.value.profile.displayName,
    deckId: selectedDeckId.value
  })

  if (!joinedRoom) {
    toast.add({ title: 'Impossible de créer la room', description: error.value, color: 'error' })

    return
  }

  createdRoomCode.value = joinedRoom.roomId
  watchRoom()
}

async function createDescribedRoom(event: FormSubmitEvent<CreateLobbySchema>) {
  if (!profile.value?.user.id || !selectedDeckId.value) {
    return
  }

  const joinedRoom = await createPrivateRoom({
    displayName: profile.value.profile.displayName,
    deckId: selectedDeckId.value,
    description: event.data.description
  })

  if (!joinedRoom) {
    toast.add({ title: 'Impossible de publier la lobby', description: error.value, color: 'error' })

    return
  }

  createdRoomCode.value = joinedRoom.roomId
  createLobbyState.description = ''
  toast.add({ title: 'Lobby publiée', description: 'Ta room est visible dans la liste.', color: 'success' })
  watchRoom()
  await loadDescribedRooms()
}

async function joinRoomByCode(event: FormSubmitEvent<JoinCodeSchema>) {
  if (!profile.value?.user.id || !selectedDeckId.value) {
    return
  }

  await joinPrivateRoom(event.data.code.trim(), {
    displayName: profile.value.profile.displayName,
    deckId: selectedDeckId.value
  })

  if (error.value) {
    toast.add({ title: 'Room introuvable', description: 'Vérifie le code et réessaie.', color: 'error' })

    return
  }

  joinCodeState.code = ''
  watchRoom()
}

async function joinDescribedRoom(roomId: string) {
  if (!profile.value?.user.id || !selectedDeckId.value) {
    return
  }

  joiningRoomId.value = roomId

  await joinPrivateRoom(roomId, {
    displayName: profile.value.profile.displayName,
    deckId: selectedDeckId.value
  })

  joiningRoomId.value = ''

  if (error.value) {
    toast.add({ title: 'Impossible de rejoindre', description: 'Cette lobby est peut-être déjà complète.', color: 'error' })

    return
  }

  watchRoom()
}

async function leaveRoom() {
  watchedRoom?.onStateChange.remove(onRoomStateChange)
  watchedRoom = null
  await leave()
  createdRoomCode.value = ''
  joinCodeState.code = ''
  createLobbyState.description = ''
}

async function copyRoomCode() {
  await navigator.clipboard.writeText(createdRoomCode.value)
  toast.add({ title: 'Code copié', color: 'success' })
}

onBeforeUnmount(() => {
  watchedRoom?.onStateChange.remove(onRoomStateChange)
  watchedRoom = null
})
</script>

<template>
  <div
    class="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6"
    :style="accentStyle"
  >
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-highlighted">
          Salle d'attente
        </h1>
        <p class="mt-1 text-sm text-muted">
          Choisis ton deck, puis lance une partie ou rejoins un adversaire.
        </p>
      </div>
    </header>

    <UAlert
      v-if="!profile"
      icon="i-lucide-lock"
      color="warning"
      title="Connexion requise"
      description="Connecte-toi pour charger tes decks sauvegardés et rejoindre une partie."
    />

    <UAlert
      v-else-if="deckError"
      icon="i-lucide-circle-alert"
      color="error"
      :title="deckError"
    />

    <template v-else>
      <!-- Deck picker: compact chip that expands into a searchable list -->
      <UPopover v-model:open="deckPickerOpen">
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-lg border border-default bg-elevated px-4 py-3 text-left transition-colors hover:border-(--accent)/60 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loadingDecks || decks.length === 0"
        >
          <span
            class="h-3 w-3 shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-elevated"
            :class="dotClass(selectedDeckSummary?.leader ?? null)"
            :style="{ '--tw-ring-color': 'var(--accent)' }"
          />

          <span class="min-w-0 flex-1">
            <span class="block text-[0.65rem] font-medium tracking-wide text-muted uppercase">
              Deck sélectionné
            </span>
            <span
              v-if="selectedDeckSummary"
              class="flex items-baseline gap-2"
            >
              <span class="truncate text-sm font-semibold text-highlighted">
                {{ selectedDeckSummary.deck.name }}
              </span>
              <span class="shrink-0 text-xs text-muted">
                {{ selectedDeckSummary.leader?.name ?? 'Leader inconnu' }}
              </span>
            </span>
            <span
              v-else
              class="text-sm text-muted"
            >
              {{ loadingDecks ? 'Chargement des decks…' : 'Aucun deck sauvegardé' }}
            </span>
          </span>

          <UBadge
            v-if="selectedDeckSummary && !selectedDeckSummary.isComplete"
            color="error"
            variant="subtle"
            size="sm"
          >
            {{ selectedDeckSummary.cardCount }}/50
          </UBadge>

          <UIcon
            name="i-lucide-chevron-down"
            class="size-4 shrink-0 text-muted"
          />
        </button>

        <template #content>
          <div class="w-80 max-w-[90vw]">
            <div class="border-b border-default p-2">
              <UInput
                v-model="deckSearch"
                icon="i-lucide-search"
                placeholder="Rechercher un deck…"
                class="w-full"
                autofocus
              />
            </div>

            <ul class="max-h-80 overflow-y-auto p-1">
              <li
                v-if="filteredDeckSummaries.length === 0"
                class="px-3 py-6 text-center text-sm text-muted"
              >
                Aucun deck ne correspond à cette recherche.
              </li>
              <li
                v-for="summary in filteredDeckSummaries"
                :key="summary.deck.id"
              >
                <button
                  type="button"
                  class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-elevated"
                  :class="selectedDeckId === summary.deck.id ? 'bg-elevated' : ''"
                  @click="selectDeck(summary.deck.id)"
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
                    :class="summary.isComplete ? 'text-muted' : 'text-error'"
                  >
                    {{ summary.cardCount }}/50
                  </span>
                </button>
              </li>
            </ul>

            <div class="border-t border-default p-2">
              <UButton
                :to="{ path: '/decks', query: selectedDeckId ? { deckId: selectedDeckId } : {} }"
                icon="i-lucide-layers-3"
                color="neutral"
                variant="ghost"
                size="sm"
                block
              >
                Gérer mes decks
              </UButton>
            </div>
          </div>
        </template>
      </UPopover>

      <UAlert
        v-if="selectedDeckSummary && !selectedDeckSummary.isComplete"
        icon="i-lucide-triangle-alert"
        color="error"
        variant="subtle"
        title="Ce deck n'est pas jouable"
        :description="`Il lui manque ${50 - selectedDeckSummary.cardCount} carte(s) pour atteindre 50. Complète-le avant de jouer.`"
      >
        <template #actions>
          <UButton
            :to="{ path: '/decks', query: { deckId: selectedDeckSummary.deck.id } }"
            color="error"
            variant="subtle"
            size="xs"
          >
            Modifier le deck
          </UButton>
        </template>
      </UAlert>

      <UAlert
        v-if="decks.length === 0 && !loadingDecks"
        icon="i-lucide-layers-3"
        color="neutral"
        variant="subtle"
        title="Tu n'as pas encore de deck"
        description="Construis un deck de 50 cartes pour pouvoir rejoindre une partie."
      >
        <template #actions>
          <UButton
            to="/decks"
            color="neutral"
            variant="subtle"
            size="xs"
          >
            Créer un deck
          </UButton>
        </template>
      </UAlert>

      <UAlert
        v-if="error"
        icon="i-lucide-circle-alert"
        color="error"
        :title="error"
      />

      <!-- Primary action: this is the one thing most players came here to do -->
      <div
        class="relative overflow-hidden rounded-xl border border-default bg-elevated p-6"
        style="background: radial-gradient(120% 140% at 0% 0%, color-mix(in oklab, var(--accent) 16%, transparent), transparent 60%)"
      >
        <p class="text-xs font-medium tracking-wide text-muted uppercase">
          Partie rapide
        </p>
        <p class="mt-1 max-w-md text-sm text-muted">
          Rejoins la file d'attente et affronte le premier adversaire disponible avec
          <span class="font-medium text-highlighted">{{ selectedDeckSummary?.deck.name ?? 'ton deck' }}</span>.
        </p>
        <UButton
          class="mt-4"
          data-test="quick-match"
          size="lg"
          :ui="{ base: 'bg-(--accent) hover:bg-(--accent)/90 text-white disabled:bg-(--accent)/40' }"
          :loading="isBusy"
          :disabled="!canPlay || isInRoom"
          @click="quickMatch"
        >
          Rechercher une partie
          <template #trailing>
            <UIcon name="i-lucide-arrow-right" />
          </template>
        </UButton>
      </div>

      <div class="flex items-center gap-3 text-xs text-muted">
        <div class="h-px flex-1 bg-default" />
        ou rejoins un salon
        <div class="h-px flex-1 bg-default" />
      </div>

      <div class="grid gap-6 sm:grid-cols-2">
        <UCard :ui="{ body: 'p-0' }">
          <div class="border-b border-default px-4 py-3">
            <p class="text-sm font-semibold text-highlighted">
              Code privé
            </p>
            <p class="mt-1 text-xs text-muted">
              Partage un code à un ami ou entre celui qu'on t'a donné.
            </p>
          </div>

          <div class="flex flex-col gap-3 p-4">
            <UButton
              color="neutral"
              variant="subtle"
              icon="i-lucide-plus"
              block
              :loading="isBusy"
              :disabled="!canPlay || isInRoom"
              @click="createRoom(null)"
            >
              Générer un code
            </UButton>

            <div
              v-if="createdRoomCode"
              class="flex items-center justify-between gap-2 rounded-md bg-primary/10 px-3 py-2"
            >
              <span class="font-mono text-sm font-semibold tracking-widest text-primary">
                {{ createdRoomCode }}
              </span>
              <UButton
                icon="i-lucide-copy"
                color="primary"
                variant="ghost"
                size="xs"
                @click="copyRoomCode"
              />
            </div>

            <UForm
              :schema="joinCodeSchema"
              :state="joinCodeState"
              data-test="join-code-form"
              class="flex items-start gap-2"
              @submit="joinRoomByCode"
            >
              <UFormField
                name="code"
                class="flex-1"
              >
                <UInput
                  v-model="joinCodeState.code"
                  data-test="join-code-input"
                  placeholder="Code de room"
                  class="w-full"
                  :disabled="!canPlay || isInRoom"
                />
              </UFormField>
              <UButton
                type="submit"
                color="neutral"
                class="shrink-0"
                :loading="isBusy"
                :disabled="!canPlay || isInRoom"
              >
                Rejoindre
              </UButton>
            </UForm>
          </div>
        </UCard>

        <UCard :ui="{ body: 'p-0' }">
          <div class="flex items-center justify-between gap-2 border-b border-default px-4 py-3">
            <div>
              <p class="text-sm font-semibold text-highlighted">
                Lobbies publiques
              </p>
              <p class="mt-1 text-xs text-muted">
                Rooms ouvertes avec une description libre.
              </p>
            </div>
            <UButton
              icon="i-lucide-refresh-cw"
              color="neutral"
              variant="ghost"
              size="xs"
              :loading="loadingDescribedRooms"
              @click="loadDescribedRooms"
            />
          </div>

          <UAlert
            v-if="describedRoomsError"
            class="m-4"
            icon="i-lucide-circle-alert"
            color="error"
            :title="describedRoomsError"
          />

          <UForm
            :schema="createLobbySchema"
            :state="createLobbyState"
            data-test="create-lobby-form"
            class="flex items-start gap-2 border-b border-default p-4"
            @submit="createDescribedRoom"
          >
            <UFormField
              name="description"
              class="flex-1"
            >
              <UInput
                v-model="createLobbyState.description"
                data-test="lobby-description-input"
                placeholder="Ex : Débutants bienvenus"
                class="w-full"
                :disabled="!canPlay || isInRoom"
              />
            </UFormField>
            <UButton
              type="submit"
              icon="i-lucide-plus"
              color="neutral"
              variant="subtle"
              class="shrink-0"
              :loading="isBusy"
              :disabled="!canPlay || isInRoom"
            >
              Publier
            </UButton>
          </UForm>

          <ul class="max-h-64 overflow-y-auto">
            <li
              v-if="describedRooms.length === 0 && !describedRoomsError && !loadingDescribedRooms"
              class="px-4 py-6 text-center text-sm text-muted"
            >
              Aucune lobby ouverte pour l'instant. Sois le premier à en publier une.
            </li>
            <li
              v-for="describedRoom in describedRooms"
              :key="describedRoom.roomId"
              class="flex items-center gap-3 px-4 py-3 border-b border-default last:border-b-0"
            >
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-medium text-highlighted">
                  {{ describedRoom.description }}
                </span>
                <span class="block text-xs text-muted">
                  {{ describedRoom.clients }}/{{ describedRoom.maxClients }} joueur(s)
                </span>
              </span>
              <UButton
                color="neutral"
                variant="subtle"
                size="sm"
                :loading="joiningRoomId === describedRoom.roomId"
                :disabled="!canPlay || isInRoom"
                @click="joinDescribedRoom(describedRoom.roomId)"
              >
                Rejoindre
              </UButton>
            </li>
          </ul>
        </UCard>
      </div>

      <UCard v-if="room">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span class="relative flex size-2">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--accent) opacity-75 motion-reduce:animate-none" />
                <span class="relative inline-flex size-2 rounded-full bg-(--accent)" />
              </span>
              <p class="text-sm font-semibold text-highlighted">
                Room {{ createdRoomCode || room.roomId }}
              </p>
            </div>
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
            class="flex items-start gap-2"
          >
            <span
              v-if="resolveLogActor(log.actorSessionId)"
              class="mt-0.5 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]"
              :class="resolveLogActor(log.actorSessionId)?.classes"
            >
              {{ resolveLogActor(log.actorSessionId)?.displayName }}
            </span>
            <span :class="getDuelLogLevelPresentation(log.level).toneClass">{{ getLogMessageText(log) }}</span>
          </li>
          <li
            v-if="logs.length === 0"
            class="text-muted"
          >
            Aucun événement.
          </li>
        </ul>
      </UCard>
    </template>
  </div>
</template>
