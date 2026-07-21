<script setup lang="ts">
import type {
  Card,
  CardColor,
  CardFilterOptions,
  CardSearchResponse,
  CardType,
  Deck,
  DeckListResponse,
  DeckPayload,
  DeckValidation
} from '@onepiecetcg/shared'
import { normalizeDeckCards } from '@onepiecetcg/shared'

const api = useApi()
const { profile, refresh: refreshSession } = useSession()

const selectedDeckId = ref<string | null>(null)
const deckName = ref('Nouveau deck')
const leaderCardId = ref('')
const deckCards = ref<Array<{ cardId: string, quantity: number }>>([])
const search = ref('')
const allFilter = '__all'
const catalogFilterStorageKey = 'onepiecetcg:deck-builder:catalog-filters'
const persistedCatalogFilters = useLocalStorage<PersistedCatalogFilters>(catalogFilterStorageKey, {})
const selectedSet = ref(allFilter)
const selectedType = ref<CardType | typeof allFilter>(allFilter)
const selectedColor = ref<CardColor | typeof allFilter>(allFilter)
const selectedCost = ref<number | typeof allFilter>(allFilter)
const selectedCard = ref<Card | null>(null)
const serverMessage = ref<string | null>(null)
const serverError = ref<string | null>(null)
const builderNotice = ref<string | null>(null)
const saving = ref(false)

type PersistedCatalogFilters = {
  search?: string
  set?: string
  type?: CardType | typeof allFilter
  color?: CardColor | typeof allFilter
  cost?: number | typeof allFilter
}

onMounted(() => {
  void refreshSession()
  restoreCatalogFilters()
})

const { data: catalogData, pending: catalogPending } = await useAsyncData(
  'deck-builder-catalog',
  () => api<CardSearchResponse>('/catalog/cards')
)

const { data: deckListData, pending: deckListPending, refresh: refreshDecks } = await useAsyncData(
  'saved-decks',
  () => api<DeckListResponse>('/decks'),
  { default: () => ({ decks: [] }) }
)

const cards = computed(() => catalogData.value?.cards ?? [])
const savedDecks = computed(() => deckListData.value?.decks ?? [])
const filters = computed<CardFilterOptions>(() => catalogData.value?.filters ?? {
  sets: [],
  types: [],
  colors: [],
  costs: []
})
const cardById = computed(() => new Map(cards.value.map(card => [card.id, card])))
const selectedLeader = computed(() => cardById.value.get(leaderCardId.value) ?? null)
const deckLines = computed(() => normalizeDeckCards(deckCards.value))
const mainDeckCount = computed(() => deckLines.value.reduce((sum, card) => sum + card.quantity, 0))
const cardQuantityByNumber = computed(() => {
  const quantities = new Map<string, number>()

  for (const deckCard of deckLines.value) {
    const card = cardById.value.get(deckCard.cardId)
    const key = card?.number ?? deckCard.cardId

    quantities.set(key, (quantities.get(key) ?? 0) + deckCard.quantity)
  }

  return quantities
})

const filteredCards = computed(() => {
  const needle = search.value.trim().toLowerCase()

  return cards.value
    .filter(card => card.type !== 'DON!!')
    .filter(card => !needle
      || card.name.toLowerCase().includes(needle)
      || card.number.toLowerCase().includes(needle)
      || card.text.toLowerCase().includes(needle))
    .filter(card => selectedSet.value === allFilter || card.set.id === selectedSet.value)
    .filter(card => selectedType.value === allFilter || card.type === selectedType.value)
    .filter(card => selectedColor.value === allFilter || card.colors.includes(selectedColor.value))
    .filter(card => selectedCost.value === allFilter || card.cost === selectedCost.value)
    .slice(0, 80)
})

const payload = computed<DeckPayload>(() => ({
  name: deckName.value,
  leaderCardId: leaderCardId.value,
  cards: deckLines.value
}))

const { data: validationData, pending: validationPending, refresh: refreshValidation } = await useAsyncData(
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

watch([search, selectedSet, selectedType, selectedColor, selectedCost], persistCatalogFilters)

const setItems = computed(() => [
  { label: 'Tous les sets', value: allFilter },
  ...filters.value.sets.map(set => ({ label: `${set.id} - ${set.name}`, value: set.id }))
])

const typeItems = computed(() => [
  { label: 'Tous les types', value: allFilter },
  ...filters.value.types
    .filter(type => type !== 'DON!!')
    .map(type => ({ label: type, value: type }))
])

const colorItems = computed(() => [
  { label: 'Toutes les couleurs', value: allFilter },
  ...filters.value.colors.map(color => ({ label: color, value: color }))
])

const costItems = computed(() => [
  { label: 'Tous les couts', value: allFilter },
  ...filters.value.costs.map(cost => ({ label: String(cost), value: cost }))
])

const selectedCardRows = computed(() => {
  if (!selectedCard.value) {
    return []
  }

  return [
    ['Numero', selectedCard.value.number],
    ['Set', `${selectedCard.value.set.id} - ${selectedCard.value.set.name}`],
    ['Type', selectedCard.value.type],
    ['Couleur', selectedCard.value.colors.join(', ') || 'Aucune'],
    ['Cout', selectedCard.value.cost ?? '-'],
    ['Puissance', selectedCard.value.power ?? '-'],
    ['Contre', selectedCard.value.counter ?? '-'],
    ['Vie', selectedCard.value.life ?? '-'],
    ['Rarete', selectedCard.value.rarity ?? '-']
  ]
})

function setFromSavedDeck(deck: Deck) {
  selectedDeckId.value = deck.id
  deckName.value = deck.name
  leaderCardId.value = deck.leaderCardId
  deckCards.value = [...deck.cards]
  serverMessage.value = null
  serverError.value = null
  builderNotice.value = null
}

function resetBuilder() {
  selectedDeckId.value = null
  deckName.value = 'Nouveau deck'
  leaderCardId.value = ''
  deckCards.value = []
  serverMessage.value = null
  serverError.value = null
  builderNotice.value = null
}

function createRandomDeck() {
  serverMessage.value = null
  serverError.value = null
  builderNotice.value = null

  const leaders = shuffle(cards.value.filter(card => card.type === 'Leader'))
  const selectedRandomLeader = leaders.find((leader) => {
    const candidateCapacity = getRandomDeckCandidates(leader)
      .reduce(sum => sum + 4, 0)

    return candidateCapacity >= 50
  })

  if (!selectedRandomLeader) {
    builderNotice.value = 'Impossible de generer un deck aleatoire avec le catalogue charge.'
    return
  }

  const randomLines = buildRandomDeckLines(selectedRandomLeader)

  if (randomLines.length === 0) {
    builderNotice.value = 'Impossible de trouver 50 cartes compatibles avec ce Leader.'
    return
  }

  selectedDeckId.value = null
  deckName.value = `Deck aleatoire - ${selectedRandomLeader.name}`
  leaderCardId.value = selectedRandomLeader.id
  selectedCard.value = selectedRandomLeader
  deckCards.value = randomLines
  builderNotice.value = 'Deck aleatoire genere.'
}

function resetCatalogFilters() {
  search.value = ''
  selectedSet.value = allFilter
  selectedType.value = allFilter
  selectedColor.value = allFilter
  selectedCost.value = allFilter
}

function restoreCatalogFilters() {
  const persistedFilters = persistedCatalogFilters.value
  const persistedSet = persistedFilters.set
  const persistedType = persistedFilters.type
  const persistedColor = persistedFilters.color
  const persistedCost = persistedFilters.cost

  search.value = typeof persistedFilters.search === 'string' ? persistedFilters.search : ''
  selectedSet.value = persistedSet && filters.value.sets.some(set => set.id === persistedSet) ? persistedSet : allFilter
  selectedType.value = persistedType && filters.value.types.includes(persistedType as CardType) ? persistedType as CardType : allFilter
  selectedColor.value = persistedColor && filters.value.colors.includes(persistedColor as CardColor) ? persistedColor as CardColor : allFilter
  selectedCost.value = typeof persistedCost === 'number' && filters.value.costs.includes(persistedCost)
    ? persistedCost
    : allFilter
}

function persistCatalogFilters() {
  persistedCatalogFilters.value = {
    search: search.value,
    set: selectedSet.value,
    type: selectedType.value,
    color: selectedColor.value,
    cost: selectedCost.value
  }
}

function getCardQuantity(card: Card): number {
  return cardQuantityByNumber.value.get(card.number) ?? 0
}

function canAddCard(card: Card): boolean {
  return card.type !== 'Leader' && getCardQuantity(card) < 4 && mainDeckCount.value < 50
}

function getRandomDeckCandidates(leader: Card): Card[][] {
  const leaderColors = new Set(leader.colors)
  const candidatesByNumber = new Map<string, Card[]>()

  for (const card of cards.value) {
    const isMainDeckCard = card.type !== 'Leader' && card.type !== 'DON!!'
    const matchesLeaderColors = card.colors.every(color => leaderColors.has(color))

    if (!isMainDeckCard || !matchesLeaderColors) {
      continue
    }

    const group = candidatesByNumber.get(card.number) ?? []
    group.push(card)
    candidatesByNumber.set(card.number, group)
  }

  return [...candidatesByNumber.values()]
}

function buildRandomDeckLines(leader: Card): Array<{ cardId: string, quantity: number }> {
  const candidateGroups = shuffle(getRandomDeckCandidates(leader))
  const generatedCards = new Map<string, number>()
  let remainingCards = 50

  while (remainingCards > 0 && candidateGroups.length > 0) {
    const group = candidateGroups.shift()

    if (!group) {
      break
    }

    const card = randomItem(group)
    const quantity = Math.min(remainingCards, randomInteger(1, 4))

    generatedCards.set(card.id, (generatedCards.get(card.id) ?? 0) + quantity)
    remainingCards -= quantity
  }

  if (remainingCards > 0) {
    return []
  }

  return [...generatedCards.entries()].map(([cardId, quantity]) => ({ cardId, quantity }))
}

function randomInteger(minimum: number, maximum: number): number {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum
}

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)] as T
}

function shuffle<T>(items: T[]): T[] {
  const shuffledItems = [...items]

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const currentItem = shuffledItems[index] as T
    const swapItem = shuffledItems[swapIndex] as T

    shuffledItems[index] = swapItem
    shuffledItems[swapIndex] = currentItem
  }

  return shuffledItems
}

function getCardColorStyle(color: CardColor) {
  const styles: Record<CardColor, { backgroundColor: string, borderColor: string, color: string }> = {
    Red: { backgroundColor: '#fee2e2', borderColor: '#f87171', color: '#991b1b' },
    Green: { backgroundColor: '#dcfce7', borderColor: '#4ade80', color: '#166534' },
    Blue: { backgroundColor: '#dbeafe', borderColor: '#60a5fa', color: '#1e40af' },
    Purple: { backgroundColor: '#f3e8ff', borderColor: '#c084fc', color: '#6b21a8' },
    Black: { backgroundColor: '#e5e7eb', borderColor: '#6b7280', color: '#111827' },
    Yellow: { backgroundColor: '#fef9c3', borderColor: '#facc15', color: '#854d0e' }
  }

  return styles[color]
}

function addCard(card: Card) {
  selectedCard.value = card
  serverMessage.value = null
  builderNotice.value = null

  if (card.type === 'Leader') {
    chooseLeader(card)
    return
  }

  const currentQuantity = cardQuantityByNumber.value.get(card.number) ?? 0

  if (currentQuantity >= 4) {
    builderNotice.value = `${card.number} est deja a 4 exemplaires.`
    return
  }

  if (mainDeckCount.value >= 50) {
    builderNotice.value = 'Le deck principal contient deja 50 cartes.'
    return
  }

  const existing = deckCards.value.find(deckCard => deckCard.cardId === card.id)

  if (existing) {
    existing.quantity += 1
  } else {
    deckCards.value.push({ cardId: card.id, quantity: 1 })
  }

  builderNotice.value = null
}

function chooseLeader(card: Card) {
  selectedCard.value = card
  serverMessage.value = null
  builderNotice.value = null

  if (card.type !== 'Leader') {
    builderNotice.value = `${card.number} n'est pas une carte Leader.`
    return
  }

  leaderCardId.value = card.id
}

function removeCard(cardId: string) {
  builderNotice.value = null
  const existing = deckCards.value.find(deckCard => deckCard.cardId === cardId)

  if (!existing) {
    return
  }

  existing.quantity -= 1

  if (existing.quantity <= 0) {
    deckCards.value = deckCards.value.filter(deckCard => deckCard.cardId !== cardId)
  }
}

function canIncrementCard(cardId: string): boolean {
  const card = cardById.value.get(cardId)

  return card ? canAddCard(card) : false
}

function incrementCard(cardId: string) {
  const card = cardById.value.get(cardId)

  if (!card) {
    return
  }

  addCard(card)
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

function extractErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: { validation?: DeckValidation, message?: string } }).data

    if (data?.validation?.errors.length) {
      return data.validation.errors.map(validationError => validationError.message).join(' ')
    }

    if (data?.message) {
      return data.message
    }
  }

  return 'Action impossible pour le moment.'
}
</script>

<template>
  <main class="h-screen overflow-hidden px-4 py-3">
    <div class="mx-auto grid h-full max-w-[2400px] min-w-0 gap-4 xl:grid-cols-[minmax(520px,1.35fr)_minmax(300px,0.55fr)_minmax(360px,0.75fr)_minmax(260px,0.45fr)]">
      <UCard
        class="min-h-0 min-w-0"
        :ui="{ root: 'h-full flex flex-col', body: 'min-h-0 flex-1 overflow-hidden' }"
      >
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-base font-semibold text-highlighted">
                Catalogue
              </h2>
              <p class="text-sm text-muted">
                {{ filteredCards.length }} resultat(s)
              </p>
            </div>
            <UButton
              icon="i-lucide-rotate-ccw"
              color="neutral"
              variant="ghost"
              aria-label="Reinitialiser les filtres"
              @click="resetCatalogFilters"
            />
          </div>

          <div class="grid w-full gap-2 2xl:grid-cols-4">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              placeholder="Nom, numero, texte"
              class="w-full 2xl:col-span-4"
            />

            <USelect
              v-model="selectedSet"
              :items="setItems"
              value-key="value"
              aria-label="Set"
              class="w-full"
            />

            <USelect
              v-model="selectedType"
              :items="typeItems"
              value-key="value"
              aria-label="Type"
              class="w-full"
            />

            <USelect
              v-model="selectedColor"
              :items="colorItems"
              value-key="value"
              aria-label="Couleur"
              class="w-full"
            />

            <USelect
              v-model="selectedCost"
              :items="costItems"
              value-key="value"
              aria-label="Cout"
              class="w-full"
            />
          </div>
        </template>

        <div
          v-if="!catalogPending && filteredCards.length > 0"
          class="h-full min-h-0 overflow-y-auto pr-1"
        >
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-4">
            <button
              v-for="card in filteredCards"
              :key="card.id"
              type="button"
              class="group aspect-[5/7] overflow-hidden rounded-lg border border-muted bg-elevated transition hover:border-primary hover:bg-accented"
              :class="{ 'border-primary ring-2 ring-primary/30': selectedCard?.id === card.id }"
              :aria-label="`Selectionner ${card.name}`"
              @click="selectedCard = card"
            >
              <img
                v-if="card.imageUrl"
                :src="card.imageUrl"
                :alt="card.name"
                class="h-full w-full object-cover transition group-hover:scale-[1.02]"
                loading="lazy"
              >
              <div
                v-else
                class="flex h-full w-full items-center justify-center text-muted"
              >
                <UIcon
                  name="i-lucide-image-off"
                  class="size-8"
                />
              </div>
            </button>
          </div>
        </div>

        <div
          v-else-if="catalogPending"
          class="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-4 p-1"
        >
          <USkeleton
            v-for="index in 12"
            :key="index"
            class="aspect-[5/7] rounded-lg"
          />
        </div>

        <UEmpty
          v-else-if="filteredCards.length === 0"
          icon="i-lucide-search-x"
          title="Aucune carte trouvee"
          description="Modifie les filtres pour elargir la recherche."
          class="p-1"
        />
      </UCard>

      <UCard
        class="min-h-0 min-w-0"
        :ui="{ root: 'h-full flex flex-col', body: 'min-h-0 flex-1 overflow-hidden' }"
      >
        <template #header>
          <div class="space-y-3">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-base font-semibold text-highlighted">
                  Carte selectionnee
                </h2>
                <p class="text-sm text-muted">
                  {{ selectedCard?.number ?? 'Aucune carte' }}
                </p>
              </div>
              <UBadge
                v-if="selectedCard"
                color="neutral"
                variant="subtle"
              >
                {{ selectedCard.type }}
              </UBadge>
            </div>
          </div>
        </template>

        <div
          v-if="selectedCard"
          class="flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-1"
        >
          <div class="w-full">
            <img
              v-if="selectedCard.imageUrl"
              :src="selectedCard.imageUrl"
              :alt="selectedCard.name"
              class="aspect-[5/7] w-full rounded-lg border border-muted object-cover"
            >
            <div
              v-else
              class="flex aspect-[5/7] w-full items-center justify-center rounded-lg border border-muted bg-elevated text-muted"
            >
              <UIcon
                name="i-lucide-image-off"
                class="size-8"
              />
            </div>
          </div>

          <div class="flex min-h-0 min-w-0 flex-col gap-4">
            <div class="min-w-0 space-y-3">
              <div>
                <h3 class="text-base font-semibold text-highlighted">
                  {{ selectedCard.name }}
                </h3>
                <div class="mt-2 flex flex-wrap gap-1">
                  <UBadge
                    v-for="color in selectedCard.colors"
                    :key="color"
                    variant="outline"
                    :style="getCardColorStyle(color)"
                  >
                    {{ color }}
                  </UBadge>
                </div>
              </div>

              <p class="max-h-36 overflow-y-auto whitespace-pre-line text-sm text-muted">
                {{ selectedCard.text || 'Pas de texte.' }}
              </p>
            </div>

            <dl class="grid gap-2 text-sm">
              <div
                v-for="[label, value] in selectedCardRows"
                :key="label"
                class="grid grid-cols-[76px_minmax(0,1fr)] gap-3"
              >
                <dt class="text-muted">
                  {{ label }}
                </dt>
                <dd class="min-w-0 text-highlighted">
                  {{ value }}
                </dd>
              </div>
            </dl>

            <UButton
              v-if="selectedCard.type === 'Leader'"
              icon="i-lucide-crown"
              :color="selectedCard.id === leaderCardId ? 'success' : 'primary'"
              block
              @click="chooseLeader(selectedCard)"
            >
              {{ selectedCard.id === leaderCardId ? 'Leader selectionne' : 'Choisir comme Leader' }}
            </UButton>
            <UButton
              v-else
              icon="i-lucide-list-plus"
              :disabled="!canAddCard(selectedCard)"
              block
              @click="addCard(selectedCard)"
            >
              {{ canAddCard(selectedCard) ? 'Ajouter au deck' : 'Limite atteinte' }}
            </UButton>
          </div>
        </div>

        <UEmpty
          v-else
          icon="i-lucide-square-mouse-pointer"
          title="Aucune carte"
          description="Selectionne une carte du catalogue."
        />
      </UCard>

      <UCard
        class="min-h-0 min-w-0"
        :ui="{ root: 'h-full flex flex-col', body: 'min-h-0 flex-1 overflow-hidden', footer: 'shrink-0' }"
      >
        <template #header>
          <div class="space-y-3">
            <UFormField
              label="Nom"
              class="w-full"
            >
              <UInput
                v-model="deckName"
                icon="i-lucide-pencil"
                class="w-full"
              />
            </UFormField>
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-base font-semibold text-highlighted">
                  Deck builder
                </h2>
                <p class="text-sm text-muted">
                  {{ mainDeckCount }} / 50 cartes
                </p>
              </div>
              <div class="flex items-center gap-2">
                <UButton
                  icon="i-lucide-shuffle"
                  color="neutral"
                  variant="outline"
                  size="sm"
                  label="Aleatoire"
                  :disabled="catalogPending || cards.length === 0"
                  @click="createRandomDeck"
                />
                <UBadge
                  v-if="validationPending"
                  color="neutral"
                  variant="subtle"
                  icon="i-lucide-loader-2"
                >
                  Validation
                </UBadge>
                <UBadge
                  v-else
                  :color="validationData?.valid ? 'success' : 'error'"
                  variant="subtle"
                >
                  {{ validationData?.valid ? 'Valide' : 'Invalide' }}
                </UBadge>
              </div>
            </div>
          </div>
        </template>

        <div class="flex h-full min-h-0 flex-col gap-4">
          <section class="grid shrink-0 grid-cols-[72px_minmax(0,1fr)] gap-3">
            <img
              v-if="selectedLeader?.imageUrl"
              :src="selectedLeader.imageUrl"
              :alt="selectedLeader.name"
              class="w-full rounded-lg border border-muted"
            >
            <div
              v-else
              class="flex aspect-[5/7] items-center justify-center rounded-lg border border-muted bg-elevated text-muted"
            >
              <UIcon
                name="i-lucide-crown"
                class="size-7"
              />
            </div>

            <div class="min-w-0 space-y-2">
              <p class="truncate text-sm font-medium text-highlighted">
                {{ selectedLeader?.name ?? 'Aucun Leader' }}
              </p>
              <p class="text-sm text-muted">
                Choisis le Leader depuis le catalogue.
              </p>
            </div>
          </section>

          <div class="shrink-0 space-y-2">
            <UAlert
              v-if="builderNotice"
              color="warning"
              variant="subtle"
              icon="i-lucide-circle-alert"
              :description="builderNotice"
            />
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
          </div>

          <div class="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            <div
              v-for="line in deckLines"
              :key="line.cardId"
              class="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-muted p-2"
            >
              <img
                v-if="cardById.get(line.cardId)?.imageUrl"
                :src="cardById.get(line.cardId)?.imageUrl"
                :alt="cardById.get(line.cardId)?.name ?? line.cardId"
                class="h-16 w-11 rounded border border-muted object-cover"
                loading="lazy"
              >
              <div
                v-else
                class="flex h-16 w-11 items-center justify-center rounded border border-muted bg-elevated text-muted"
              >
                <UIcon
                  name="i-lucide-image-off"
                  class="size-5"
                />
              </div>

              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-highlighted">
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
                  :disabled="!canIncrementCard(line.cardId)"
                  @click="incrementCard(line.cardId)"
                />
              </div>
            </div>

            <UEmpty
              v-if="deckLines.length === 0"
              icon="i-lucide-list-plus"
              title="Deck vide"
              description="Selectionne une carte dans le catalogue, puis ajoute-la depuis son detail."
            />
          </div>
        </div>

        <template #footer>
          <div class="grid grid-cols-2 gap-2">
            <UButton
              icon="i-lucide-save"
              :loading="saving"
              :disabled="!validationData?.valid"
              block
              @click="saveDeck"
            >
              Sauvegarder
            </UButton>
            <UButton
              icon="i-lucide-rotate-ccw"
              color="neutral"
              variant="ghost"
              block
              @click="resetBuilder"
            >
              Reinitialiser
            </UButton>
          </div>
        </template>
      </UCard>

      <UCard
        class="min-h-0 min-w-0"
        :ui="{ root: 'h-full flex flex-col', body: 'min-h-0 flex-1 overflow-hidden' }"
      >
        <template #header>
          <div class="flex shrink-0 items-center justify-between gap-3">
            <div>
              <h2 class="text-base font-semibold text-highlighted">
                Decks sauvegardes
              </h2>
              <p class="text-sm text-muted">
                {{ savedDecks.length }} deck(s)
              </p>
            </div>
            <UButton
              icon="i-lucide-plus"
              color="neutral"
              variant="ghost"
              label="Nouveau"
              @click="resetBuilder"
            />
          </div>
        </template>

        <div class="flex h-full min-h-0 flex-col gap-3">
          <UAlert
            v-if="!profile"
            color="warning"
            variant="subtle"
            icon="i-lucide-lock"
            title="Connexion requise"
            description="Les decks sauvegardes sont lies au compte joueur."
          />

          <div class="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            <div
              v-if="deckListPending"
              class="space-y-2"
            >
              <USkeleton
                v-for="index in 5"
                :key="index"
                class="h-16 w-full rounded-lg"
              />
            </div>

            <template v-else>
              <button
                v-for="deck in savedDecks"
                :key="deck.id"
                type="button"
                class="w-full rounded-lg border border-muted p-3 text-left transition hover:border-primary hover:bg-accented"
                :class="{ 'border-primary bg-accented ring-2 ring-primary/20': deck.id === selectedDeckId }"
                @click="setFromSavedDeck(deck)"
              >
                <p class="truncate text-sm font-medium text-highlighted">
                  {{ deck.name }}
                </p>
                <p class="mt-1 text-xs text-muted">
                  {{ deck.cards.reduce((sum, card) => sum + card.quantity, 0) }} / 50 cartes
                </p>
                <p class="truncate text-xs text-muted">
                  Leader {{ deck.leaderCardId || '-' }}
                </p>
              </button>

              <UEmpty
                v-if="savedDecks.length === 0"
                icon="i-lucide-folder-open"
                title="Aucun deck"
                description="Sauvegarde un deck valide pour le retrouver ici."
              />
            </template>
          </div>
        </div>
      </UCard>
    </div>
  </main>
</template>
