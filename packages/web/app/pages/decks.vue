<script setup lang="ts">
import type {
  Card,
  CardSearchResponse,
  Deck,
  DeckImportResult,
  DeckListResponse,
  DeckPayload,
  DeckValidation
} from '@onepiecetcg/shared'
import { exportDeckToText, normalizeDeckCards } from '@onepiecetcg/shared'

const api = useApi()
const { profile, refresh: refreshSession } = useSession()

const selectedDeckId = ref<string | null>(null)
const deckName = ref('Nouveau deck')
const leaderCardId = ref('')
const deckCards = ref<Array<{ cardId: string, quantity: number }>>([])
const search = ref('')
const selectedCard = ref<Card | null>(null)
const importText = ref('')
const serverMessage = ref<string | null>(null)
const serverError = ref<string | null>(null)
const saving = ref(false)

onMounted(() => {
  void refreshSession()
})

const { data: catalogData, pending: catalogPending } = await useAsyncData(
  'deck-builder-catalog',
  () => api<CardSearchResponse>('/catalog/cards')
)

const { data: deckListData, refresh: refreshDecks } = await useAsyncData(
  'saved-decks',
  () => api<DeckListResponse>('/decks'),
  { default: () => ({ decks: [] }) }
)

const cards = computed(() => catalogData.value?.cards ?? [])
const cardById = computed(() => new Map(cards.value.map((card) => [card.id, card])))
const leaders = computed(() => cards.value.filter((card) => card.type === 'Leader'))
const savedDecks = computed(() => deckListData.value?.decks ?? [])
const selectedLeader = computed(() => cardById.value.get(leaderCardId.value) ?? null)
const deckLines = computed(() => normalizeDeckCards(deckCards.value))
const mainDeckCount = computed(() => deckLines.value.reduce((sum, card) => sum + card.quantity, 0))

const filteredCards = computed(() => {
  const needle = search.value.trim().toLowerCase()

  return cards.value
    .filter((card) => card.type !== 'Leader' && card.type !== 'DON!!')
    .filter((card) => !needle || card.name.toLowerCase().includes(needle) || card.number.toLowerCase().includes(needle))
    .slice(0, 80)
})

const payload = computed<DeckPayload>(() => ({
  name: deckName.value,
  leaderCardId: leaderCardId.value,
  cards: deckLines.value
}))

const { data: validationData, refresh: refreshValidation } = await useAsyncData(
  'deck-validation',
  () => api<DeckValidation>('/decks/validate', {
    method: 'POST',
    body: payload.value
  }),
  { watch: [payload], immediate: false }
)

watch(payload, () => {
  void refreshValidation()
}, { deep: true, immediate: true })

const exportText = computed(() => exportDeckToText(payload.value))

const leaderItems = computed(() => [
  ...leaders.value.map((leader) => ({
    label: `${leader.number} - ${leader.name}`,
    value: leader.id
  }))
])

function setFromSavedDeck(deck: Deck) {
  selectedDeckId.value = deck.id
  deckName.value = deck.name
  leaderCardId.value = deck.leaderCardId
  deckCards.value = [...deck.cards]
  serverMessage.value = null
  serverError.value = null
}

function resetBuilder() {
  selectedDeckId.value = null
  deckName.value = 'Nouveau deck'
  leaderCardId.value = ''
  deckCards.value = []
  importText.value = ''
  serverMessage.value = null
  serverError.value = null
}

function addCard(card: Card) {
  selectedCard.value = card
  const existing = deckCards.value.find((deckCard) => deckCard.cardId === card.id)

  if (existing) {
    existing.quantity += 1
  } else {
    deckCards.value.push({ cardId: card.id, quantity: 1 })
  }
}

function removeCard(cardId: string) {
  const existing = deckCards.value.find((deckCard) => deckCard.cardId === cardId)

  if (!existing) {
    return
  }

  existing.quantity -= 1

  if (existing.quantity <= 0) {
    deckCards.value = deckCards.value.filter((deckCard) => deckCard.cardId !== cardId)
  }
}

async function saveDeck() {
  saving.value = true
  serverMessage.value = null
  serverError.value = null

  try {
    const route = selectedDeckId.value ? `/decks/${selectedDeckId.value}` : '/decks'
    const method = selectedDeckId.value ? 'PUT' : 'POST'
    const saved = await api<Deck>(route, { method, body: payload.value })

    selectedDeckId.value = saved.id
    serverMessage.value = 'Deck sauvegarde.'
    await refreshDecks()
  } catch (error: unknown) {
    serverError.value = extractErrorMessage(error)
  } finally {
    saving.value = false
  }
}

async function deleteDeck() {
  if (!selectedDeckId.value) {
    return
  }

  saving.value = true
  serverMessage.value = null
  serverError.value = null

  try {
    await api(`/decks/${selectedDeckId.value}`, { method: 'DELETE' })
    resetBuilder()
    await refreshDecks()
    serverMessage.value = 'Deck supprime.'
  } catch (error: unknown) {
    serverError.value = extractErrorMessage(error)
  } finally {
    saving.value = false
  }
}

async function importDeck() {
  serverMessage.value = null
  serverError.value = null

  try {
    const result = await api<DeckImportResult>('/decks/import', {
      method: 'POST',
      body: {
        text: importText.value,
        name: deckName.value
      }
    })

    deckName.value = result.payload.name
    leaderCardId.value = result.payload.leaderCardId
    deckCards.value = [...result.payload.cards]
    validationData.value = result.validation
    serverMessage.value = 'Import applique au builder.'
  } catch (error: unknown) {
    serverError.value = extractErrorMessage(error)
  }
}

function copyExport() {
  importText.value = exportText.value
  serverMessage.value = 'Export copie dans la zone texte.'
}

function extractErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: { validation?: DeckValidation, message?: string } }).data

    if (data?.validation?.errors.length) {
      return data.validation.errors.map((validationError) => validationError.message).join(' ')
    }

    if (data?.message) {
      return data.message
    }
  }

  return 'Action impossible pour le moment.'
}
</script>

<template>
  <UContainer class="py-8">
    <div class="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_340px]">
      <aside class="space-y-4">
        <div class="space-y-2">
          <UBadge icon="i-lucide-boxes" variant="subtle">
            Deck builder
          </UBadge>
          <h1 class="text-3xl font-semibold tracking-normal text-highlighted">
            Mes decks
          </h1>
        </div>

        <UAlert
          v-if="!profile"
          color="warning"
          variant="subtle"
          icon="i-lucide-lock"
          title="Connexion requise"
          description="Les decks sauvegardes sont lies au compte joueur."
        />

        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-base font-semibold text-highlighted">
                Sauvegardes
              </h2>
              <UButton
                icon="i-lucide-plus"
                color="neutral"
                variant="ghost"
                aria-label="Nouveau deck"
                @click="resetBuilder"
              />
            </div>
          </template>

          <div class="space-y-2">
            <button
              v-for="deck in savedDecks"
              :key="deck.id"
              type="button"
              class="w-full rounded-lg border border-muted p-3 text-left transition hover:border-primary hover:bg-accented"
              :class="{ 'border-primary bg-accented': deck.id === selectedDeckId }"
              @click="setFromSavedDeck(deck)"
            >
              <p class="truncate font-medium text-highlighted">
                {{ deck.name }}
              </p>
              <p class="text-sm text-muted">
                {{ deck.leaderCardId }} · {{ deck.cards.reduce((sum, card) => sum + card.quantity, 0) }} cartes
              </p>
            </button>

            <UEmpty
              v-if="savedDecks.length === 0"
              icon="i-lucide-folder-open"
              title="Aucun deck"
              description="Cree un deck valide puis sauvegarde-le."
            />
          </div>
        </UCard>
      </aside>

      <main class="min-w-0 space-y-4">
        <UCard>
          <template #header>
            <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(220px,320px)]">
              <UFormField label="Nom">
                <UInput
                  v-model="deckName"
                  icon="i-lucide-pencil"
                />
              </UFormField>
              <UFormField label="Leader">
                <USelect
                  v-model="leaderCardId"
                  :items="leaderItems"
                  value-key="value"
                  placeholder="Choisir un Leader"
                  class="w-full"
                />
              </UFormField>
            </div>
          </template>

          <div class="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
            <section class="space-y-3">
              <img
                v-if="selectedLeader?.imageUrl"
                :src="selectedLeader.imageUrl"
                :alt="selectedLeader.name"
                class="mx-auto w-full max-w-56 rounded-lg border border-muted"
              >
              <UEmpty
                v-else
                icon="i-lucide-crown"
                title="Leader"
                description="Choisis le Leader avant de sauvegarder."
              />
            </section>

            <section class="space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 class="text-lg font-semibold text-highlighted">
                    Liste principale
                  </h2>
                  <p class="text-sm text-muted">
                    {{ mainDeckCount }} / 50 cartes
                  </p>
                </div>
                <UBadge
                  :color="validationData?.valid ? 'success' : 'error'"
                  variant="subtle"
                >
                  {{ validationData?.valid ? 'Valide' : 'Invalide' }}
                </UBadge>
              </div>

              <UAlert
                v-if="validationData && !validationData.valid"
                color="error"
                variant="subtle"
                icon="i-lucide-circle-alert"
                :description="validationData.errors.map((error) => error.message).join(' ')"
              />

              <div class="grid gap-2">
                <div
                  v-for="line in deckLines"
                  :key="line.cardId"
                  class="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-muted p-3"
                >
                  <div class="min-w-0">
                    <p class="truncate font-medium text-highlighted">
                      {{ cardById.get(line.cardId)?.name ?? line.cardId }}
                    </p>
                    <p class="text-sm text-muted">
                      {{ line.cardId }}
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <UButton
                      icon="i-lucide-minus"
                      color="neutral"
                      variant="outline"
                      size="sm"
                      aria-label="Retirer"
                      @click="removeCard(line.cardId)"
                    />
                    <span class="w-8 text-center text-sm font-medium">{{ line.quantity }}</span>
                    <UButton
                      icon="i-lucide-plus"
                      color="neutral"
                      variant="outline"
                      size="sm"
                      aria-label="Ajouter"
                      @click="addCard(cardById.get(line.cardId)!)"
                    />
                  </div>
                </div>

                <UEmpty
                  v-if="deckLines.length === 0"
                  icon="i-lucide-list-plus"
                  title="Deck vide"
                  description="Ajoute des cartes depuis le catalogue."
                />
              </div>
            </section>
          </div>

          <template #footer>
            <div class="flex flex-wrap gap-2">
              <UButton
                icon="i-lucide-save"
                :loading="saving"
                :disabled="!validationData?.valid"
                @click="saveDeck"
              >
                Sauvegarder
              </UButton>
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="outline"
                :disabled="!selectedDeckId"
                :loading="saving"
                @click="deleteDeck"
              >
                Supprimer
              </UButton>
              <UButton
                icon="i-lucide-rotate-ccw"
                color="neutral"
                variant="ghost"
                @click="resetBuilder"
              >
                Reinitialiser
              </UButton>
            </div>
          </template>
        </UCard>

        <UAlert
          v-if="serverMessage"
          color="success"
          variant="subtle"
          icon="i-lucide-circle-check"
          :description="serverMessage"
        />
        <UAlert
          v-if="serverError"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          :description="serverError"
        />

        <UCard>
          <template #header>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <h2 class="text-base font-semibold text-highlighted">
                Catalogue
              </h2>
              <UInput
                v-model="search"
                icon="i-lucide-search"
                placeholder="Nom ou numero"
                class="w-full sm:w-72"
              />
            </div>
          </template>

          <div
            v-if="catalogPending"
            class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
          >
            <USkeleton
              v-for="index in 9"
              :key="index"
              class="h-32 rounded-lg"
            />
          </div>

          <div
            v-else
            class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
          >
            <button
              v-for="card in filteredCards"
              :key="card.id"
              type="button"
              class="rounded-lg border border-muted bg-elevated p-3 text-left transition hover:border-primary hover:bg-accented"
              @click="addCard(card)"
            >
              <div class="flex gap-3">
                <img
                  v-if="card.imageUrl"
                  :src="card.imageUrl"
                  :alt="card.name"
                  class="h-24 w-16 shrink-0 rounded object-cover"
                  loading="lazy"
                >
                <div class="min-w-0 space-y-2">
                  <div>
                    <p class="truncate text-sm text-muted">
                      {{ card.number }}
                    </p>
                    <h3 class="line-clamp-2 font-medium text-highlighted">
                      {{ card.name }}
                    </h3>
                  </div>
                  <div class="flex flex-wrap gap-1">
                    <UBadge
                      color="neutral"
                      variant="subtle"
                    >
                      {{ card.type }}
                    </UBadge>
                    <UBadge
                      v-for="color in card.colors"
                      :key="color"
                      variant="soft"
                    >
                      {{ color }}
                    </UBadge>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </UCard>
      </main>

      <aside class="space-y-4">
        <UCard>
          <template #header>
            <h2 class="text-base font-semibold text-highlighted">
              Import / export
            </h2>
          </template>

          <div class="space-y-3">
            <UTextarea
              v-model="importText"
              :rows="12"
              placeholder="1xST01-001&#10;4xST01-002"
            />
            <div class="flex flex-wrap gap-2">
              <UButton
                icon="i-lucide-upload"
                color="neutral"
                variant="outline"
                @click="importDeck"
              >
                Importer
              </UButton>
              <UButton
                icon="i-lucide-download"
                color="neutral"
                variant="outline"
                @click="copyExport"
              >
                Exporter
              </UButton>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold text-highlighted">
              Apercu export
            </h2>
          </template>

          <pre class="max-h-96 overflow-auto rounded-lg bg-muted p-3 text-xs text-toned">{{ exportText || 'Aucun contenu.' }}</pre>
        </UCard>
      </aside>
    </div>
  </UContainer>
</template>
