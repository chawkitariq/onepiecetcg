<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
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
import { exportDeckToText, normalizeDeckCards, parseDeckText } from '@onepiecetcg/shared'
import { CARD_COLOR_ACCENTS, getCardColorStyle } from '~/utils/cardColors'
import { fromBuilderDraft, toBuilderDraft } from '../utils/deckBuilderDraft'
import { findDeckByRouteQuery } from '../utils/deckRouteSelection'

definePageMeta({
  layout: 'lobby',
  middleware: 'auth'
})

const api = useApi()
const { confirm } = useConfirmDialog()
const { profile, refresh: refreshSession } = useSession()
const route = useRoute()
const toast = useToast()

const selectedDeckId = ref<string | null>(null)
const deckName = ref('Nouveau deck')
const leaderCardId = ref('')
const deckCards = ref<Array<{ cardId: string, quantity: number }>>([])
const search = ref('')
const allFilter = '__all'
const catalogFilterStorageKey = 'onepiecetcg:deck-builder:catalog-filters'
const persistedCatalogFilters = useLocalStorage<PersistedCatalogFilters>(catalogFilterStorageKey, {})
const builderStateStorageKey = 'onepiecetcg:deck-builder:state'
// `useLocalStorage` infers the serializer from the *default* value's type,
// and locks it in from then on -- a `null` default guesses "any" (which
// serializes with String(), producing "[object Object]" for real writes),
// so a JSON serializer must be passed explicitly instead of relying on
// inference from a null default.
const persistedBuilderState = useLocalStorage<unknown>(builderStateStorageKey, null, {
  serializer: {
    read: value => JSON.parse(value) as unknown,
    write: value => JSON.stringify(value)
  }
})
const selectedSet = ref(allFilter)
const selectedType = ref<CardType | typeof allFilter>(allFilter)
const selectedColor = ref<CardColor | typeof allFilter>(allFilter)
const selectedCost = ref<string>(allFilter)
const selectedCard = ref<Card | null>(null)
const {
  previewCard,
  selectCard,
  previewHoveredCard,
  clearHoveredCard
} = useCardPreview(selectedCard)
const builderNotice = ref<string | null>(null)
const saving = ref(false)
const deleting = ref(false)
const importing = ref(false)
const exporting = ref(false)
const mobilePanel = ref<'catalog' | 'details' | 'builder'>('catalog')

type PersistedCatalogFilters = {
  search?: string
  set?: string
  type?: CardType | typeof allFilter
  color?: CardColor | typeof allFilter
  cost?: string
}

function createDeckSavedToast() {
  return {
    title: 'Deck sauvegarde',
    color: 'success' as const,
    icon: 'i-lucide-circle-check'
  }
}

function createRandomDeckGeneratedToast() {
  return {
    title: 'Deck aleatoire genere',
    color: 'success' as const,
    icon: 'i-lucide-shuffle'
  }
}

function createDeckDeletedToast() {
  return {
    title: 'Deck supprime',
    color: 'success' as const,
    icon: 'i-lucide-trash-2'
  }
}

function createDeckActionErrorToast(message: string) {
  return {
    title: 'Action impossible',
    description: message,
    color: 'error' as const,
    icon: 'i-lucide-circle-alert'
  }
}

function createDeckImportedToast() {
  return {
    title: 'Deck importe',
    color: 'success' as const,
    icon: 'i-lucide-download'
  }
}

function createDeckExportedToast() {
  return {
    title: 'Deck copie dans le presse-papiers',
    color: 'success' as const,
    icon: 'i-lucide-clipboard-check'
  }
}

onMounted(async () => {
  await refreshSession()
  await refreshDecks()
  restoreCatalogFilters()

  // A ?deckId= query always wins (handled by the watcher below); only fall
  // back to a locally persisted draft when the page was reached directly
  // (e.g. a plain refresh on /decks with unsaved builder edits).
  if (!route.query.deckId) {
    restoreBuilderState()
  }
})

const { data: catalogData, pending: catalogPending } = await useAsyncData(
  'deck-builder-catalog',
  () => api<CardSearchResponse>('/catalog/cards')
)

const { data: deckListData, pending: deckListPending, refresh: refreshDecks } = await useAsyncData(
  'saved-decks',
  () => api<DeckListResponse>('/decks'),
  {
    watch: [profile],
    default: () => ({ decks: [] })
  }
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
const hasBuilderContent = computed(() =>
  selectedDeckId.value !== null
  || deckName.value !== 'Nouveau deck'
  || leaderCardId.value !== ''
  || deckCards.value.length > 0
)
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
    .filter(card => selectedColor.value === allFilter || card.colors.includes(selectedColor.value as CardColor))
    .filter(card => selectedCost.value === allFilter || (card.cost !== null && String(card.cost) === String(selectedCost.value)))
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

watch([selectedDeckId, deckName, leaderCardId, deckCards], persistBuilderState, { deep: true })

watch(
  [() => route.query.deckId, savedDecks],
  ([deckIdFromRoute, decks]) => {
    const deckToSelect = findDeckByRouteQuery(decks, deckIdFromRoute)

    if (deckToSelect && selectedDeckId.value !== deckToSelect.id) {
      setFromSavedDeck(deckToSelect)
    }
  },
  { immediate: true }
)

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
  ...filters.value.colors.map(color => ({
    label: color,
    value: color,
    chip: {
      color: CARD_COLOR_ACCENTS[color].chip,
      size: 'sm' as const
    }
  }))
])

const costItems = computed(() => [
  { label: 'Tous les couts', value: allFilter },
  ...filters.value.costs.map(cost => ({ label: String(cost), value: String(cost) }))
])

const savedDeckItems = computed(() => savedDecks.value.map(deck => ({
  label: deck.name,
  value: deck.id
})))

const deckBuilderActionItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Aleatoire',
      icon: 'i-lucide-shuffle',
      disabled: catalogPending.value || cards.value.length === 0,
      onSelect: () => {
        void maybeCreateRandomDeck()
      }
    },
    {
      label: 'Reinitialiser',
      icon: 'i-lucide-rotate-ccw',
      onSelect: () => {
        void maybeResetBuilder()
      }
    },
    {
      label: 'Importer',
      icon: 'i-lucide-download',
      disabled: importing.value,
      onSelect: () => {
        void maybeImportDeckFromClipboard()
      }
    },
    {
      label: 'Exporter',
      icon: 'i-lucide-upload',
      disabled: exporting.value,
      onSelect: () => {
        void exportDeckToClipboard()
      }
    }
  ]
])

const deckProgressColor = computed<'neutral' | 'primary' | 'success'>(() => {
  if (mainDeckCount.value === 0) {
    return 'neutral'
  }

  return mainDeckCount.value === 50 ? 'success' : 'primary'
})

const displayedValidationErrors = computed(() => {
  if (!validationData.value || validationData.value.valid) {
    return []
  }

  return validationData.value.errors.map((error) => {
    const card = error.cardId ? cardById.value.get(error.cardId) : undefined

    return card ? `${error.message} (${card.name})` : error.message
  })
})

const selectedCardRows = computed(() => {
  if (!previewCard.value) {
    return []
  }

  return [
    ['Numero', previewCard.value.number],
    ['Set', `${previewCard.value.set.id} - ${previewCard.value.set.name}`],
    ['Type', previewCard.value.type],
    ['Couleur', previewCard.value.colors.join(', ') || 'Aucune'],
    ['Cout', previewCard.value.cost ?? '-'],
    ['Puissance', previewCard.value.power ?? '-'],
    ['Contre', previewCard.value.counter ?? '-'],
    ['Vie', previewCard.value.life ?? '-'],
    ['Rarete', previewCard.value.rarity ?? '-']
  ]
})

function setFromSavedDeck(deck: Deck) {
  selectedDeckId.value = deck.id
  deckName.value = deck.name
  leaderCardId.value = deck.leaderCardId
  deckCards.value = [...deck.cards]
  builderNotice.value = null
  selectedCard.value = cardById.value.get(deck.leaderCardId) ?? null
}

function resetBuilder() {
  selectedDeckId.value = null
  deckName.value = 'Nouveau deck'
  leaderCardId.value = ''
  deckCards.value = []
  builderNotice.value = null
  clearBuilderState()
}

async function maybeResetBuilder() {
  if (!hasBuilderContent.value) {
    resetBuilder()
    return
  }

  const confirmed = await confirm({
    title: 'Reinitialiser le builder ?',
    description: 'Le contenu actuel du builder sera efface.',
    confirmLabel: 'Reinitialiser',
    confirmColor: 'warning'
  })

  if (confirmed) {
    resetBuilder()
  }
}

function applyImportedDeck(payload: DeckPayload) {
  selectedDeckId.value = null
  deckName.value = payload.name
  leaderCardId.value = payload.leaderCardId
  deckCards.value = [...payload.cards]
  selectedCard.value = cardById.value.get(payload.leaderCardId) ?? null
}

function maybeSetFromSavedDeck(deckId: string | number | undefined) {
  const deck = savedDecks.value.find(candidate => candidate.id === deckId)

  if (!deck || deck.id === selectedDeckId.value) {
    return
  }

  setFromSavedDeck(deck)
}

function createRandomDeck() {
  builderNotice.value = null

  const leaders = shuffle(cards.value.filter(card => card.type === 'Leader'))
  const selectedRandomLeader = leaders.find((leader) => {
    const candidateCapacity = getRandomDeckCandidates(leader)
      .reduce(sum => sum + 4, 0)

    return candidateCapacity >= 50
  })

  if (!selectedRandomLeader) {
    toast.add(createDeckActionErrorToast('Impossible de generer un deck aleatoire avec le catalogue charge.'))
    return
  }

  const randomLines = buildRandomDeckLines(selectedRandomLeader)

  if (randomLines.length === 0) {
    toast.add(createDeckActionErrorToast('Impossible de trouver 50 cartes compatibles avec ce Leader.'))
    return
  }

  selectedDeckId.value = null
  deckName.value = `Deck aleatoire - ${selectedRandomLeader.name}`
  leaderCardId.value = selectedRandomLeader.id
  selectedCard.value = selectedRandomLeader
  deckCards.value = randomLines
  toast.add(createRandomDeckGeneratedToast())
}

async function maybeCreateRandomDeck() {
  if (!hasBuilderContent.value) {
    createRandomDeck()
    return
  }

  const confirmed = await confirm({
    title: 'Generer un deck aleatoire ?',
    description: 'Le contenu actuel du builder sera remplace par un nouveau deck aleatoire.',
    confirmLabel: 'Generer',
    confirmColor: 'primary'
  })

  if (confirmed) {
    createRandomDeck()
  }
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
  selectedSet.value = typeof persistedSet === 'string' ? persistedSet : allFilter
  selectedType.value = typeof persistedType === 'string' ? (persistedType as CardType) : allFilter
  selectedColor.value = typeof persistedColor === 'string' ? (persistedColor as CardColor) : allFilter
  selectedCost.value = typeof persistedCost === 'string' || typeof persistedCost === 'number'
    ? String(persistedCost)
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

function restoreBuilderState() {
  const draft = fromBuilderDraft(persistedBuilderState.value)

  if (!draft) {
    return
  }

  selectedDeckId.value = draft.selectedDeckId
  deckName.value = draft.deckName
  leaderCardId.value = draft.leaderCardId
  deckCards.value = draft.deckCards
  selectedCard.value = cardById.value.get(draft.leaderCardId) ?? null
}

function persistBuilderState() {
  persistedBuilderState.value = toBuilderDraft({
    selectedDeckId: selectedDeckId.value,
    deckName: deckName.value,
    leaderCardId: leaderCardId.value,
    deckCards: deckCards.value
  })
}

function clearBuilderState() {
  persistedBuilderState.value = null
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

function addCard(card: Card) {
  selectedCard.value = card
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

  try {
    const route = selectedDeckId.value ? `/decks/${selectedDeckId.value}` : '/decks'
    const method = selectedDeckId.value ? 'PUT' : 'POST'
    const saved = await api<Deck>(route, { method, body: payload.value })

    await refreshDecks()
    selectedDeckId.value = saved.id
    toast.add(createDeckSavedToast())
  } catch (error: unknown) {
    toast.add(createDeckActionErrorToast(extractErrorMessage(error)))
  } finally {
    saving.value = false
  }
}

async function deleteDeck() {
  if (!selectedDeckId.value) {
    return
  }

  deleting.value = true

  try {
    await api<{ deleted: true }>(`/decks/${selectedDeckId.value}`, {
      method: 'DELETE'
    })

    resetBuilder()
    toast.add(createDeckDeletedToast())
    await refreshDecks()
  } catch (error: unknown) {
    toast.add(createDeckActionErrorToast(extractErrorMessage(error)))
  } finally {
    deleting.value = false
  }
}

async function confirmDeleteDeck() {
  if (!selectedDeckId.value) {
    return
  }

  const confirmed = await confirm({
    title: 'Supprimer ce deck ?',
    description: `Le deck "${deckName.value}" sera supprime definitivement.`,
    confirmLabel: 'Supprimer'
  })

  if (confirmed) {
    await deleteDeck()
  }
}

async function importDeckFromClipboard() {
  if (!import.meta.client || !navigator.clipboard) {
    toast.add(createDeckActionErrorToast('Le presse-papiers est indisponible dans ce navigateur.'))
    return
  }

  importing.value = true

  try {
    const text = await navigator.clipboard.readText()

    if (!text.trim()) {
      toast.add(createDeckActionErrorToast('Le presse-papiers ne contient aucun deck a importer.'))
      return
    }

    const imported = parseDeckText(
      text,
      deckName.value === 'Nouveau deck' ? undefined : deckName.value
    )

    applyImportedDeck(imported.payload)
    builderNotice.value = imported.invalidLines.length > 0
      ? `Lignes ignorees : ${imported.invalidLines.map(line => line.line).join(', ')}.`
      : null
    toast.add(createDeckImportedToast())
  } catch (error: unknown) {
    toast.add(createDeckActionErrorToast(extractErrorMessage(error)))
  } finally {
    importing.value = false
  }
}

async function maybeImportDeckFromClipboard() {
  if (!hasBuilderContent.value) {
    void importDeckFromClipboard()
    return
  }

  const confirmed = await confirm({
    title: 'Importer depuis le presse-papiers ?',
    description: 'Le contenu actuel du builder sera remplace par le deck importe.',
    confirmLabel: 'Importer',
    confirmColor: 'primary'
  })

  if (confirmed) {
    await importDeckFromClipboard()
  }
}

async function exportDeckToClipboard() {
  if (!import.meta.client || !navigator.clipboard) {
    toast.add(createDeckActionErrorToast('Le presse-papiers est indisponible dans ce navigateur.'))
    return
  }

  exporting.value = true

  try {
    await navigator.clipboard.writeText(exportDeckToText(payload.value))
    toast.add(createDeckExportedToast())
  } catch {
    toast.add(createDeckActionErrorToast('Impossible de copier le deck dans le presse-papiers.'))
  } finally {
    exporting.value = false
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
  <main class="fixed inset-x-0 bottom-0 top-(--ui-header-height) flex flex-col overflow-hidden px-2.5 py-2">
    <UTabs
      v-model="mobilePanel"
      :content="false"
      :items="[
        { label: 'Catalogue', value: 'catalog', icon: 'i-lucide-layout-grid' },
        { label: 'Details', value: 'details', icon: 'i-lucide-square-mouse-pointer' },
        { label: 'Deck', value: 'builder', icon: 'i-lucide-layers', badge: `${mainDeckCount}/50` }
      ]"
      class="mb-2 shrink-0 xl:hidden"
    />

    <div class="mx-auto grid h-full min-h-0 max-w-[2000px] min-w-0 flex-1 gap-2.5 xl:grid-cols-[minmax(0,1fr)_minmax(244px,19%)_minmax(0,1fr)]">
      <UCard
        class="min-h-0 min-w-0"
        :class="mobilePanel === 'catalog' ? 'flex' : 'hidden xl:flex'"
        :ui="{ root: 'h-full flex-col', body: 'min-h-0 flex-1 overflow-hidden' }"
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
              variant="outline"
              size="sm"
              label="Reinitialiser"
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

            <USelectMenu
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
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <button
              v-for="card in filteredCards"
              :key="card.id"
              type="button"
              class="group relative aspect-[5/7] overflow-hidden rounded-lg border border-muted bg-elevated transition hover:border-primary hover:bg-accented"
              :class="{ 'border-primary ring-2 ring-primary/30': selectedCard?.id === card.id }"
              :aria-label="`Selectionner ${card.name}`"
              @click="selectCard(card)"
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

              <UBadge
                v-if="getCardQuantity(card) > 0"
                color="primary"
                variant="solid"
                size="sm"
                class="absolute right-1 top-1"
              >
                {{ getCardQuantity(card) }}/4
              </UBadge>
              <UBadge
                v-if="card.id === leaderCardId"
                color="warning"
                variant="solid"
                size="sm"
                icon="i-lucide-crown"
                class="absolute left-1 top-1"
              />
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
        :class="mobilePanel === 'details' ? 'flex' : 'hidden xl:flex'"
        :ui="{ root: 'h-full flex-col', body: 'min-h-0 flex-1 overflow-hidden' }"
      >
        <template #header>
          <div class="space-y-3">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-base font-semibold text-highlighted">
                  Details
                </h2>
                <p class="text-sm text-muted">
                  {{ previewCard?.number ?? 'Aucune carte' }}
                </p>
              </div>
              <UBadge
                v-if="previewCard"
                color="neutral"
                variant="subtle"
              >
                {{ previewCard.type }}
              </UBadge>
            </div>
          </div>
        </template>

        <div
          v-if="previewCard"
          class="flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-1"
        >
          <div class="w-full aspect-[4/5]">
            <img
              v-if="previewCard.imageUrl"
              :src="previewCard.imageUrl"
              :alt="previewCard.name"
              class="w-full rounded-lg border border-muted object-cover"
            >
            <div
              v-else
              class="flex w-full items-center justify-center rounded-lg border border-muted bg-elevated text-muted"
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
                  {{ previewCard.name }}
                </h3>
                <div class="mt-2 flex flex-wrap gap-1">
                  <UBadge
                    v-for="color in previewCard.colors"
                    :key="color"
                    variant="outline"
                    :style="getCardColorStyle(color)"
                  >
                    {{ color }}
                  </UBadge>
                </div>
              </div>

              <p class="max-h-36 overflow-y-auto whitespace-pre-line text-sm text-muted">
                {{ previewCard.text || 'Pas de texte.' }}
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
          </div>
        </div>

        <div
          v-else
          class="flex h-full min-h-0 flex-col gap-4"
        >
          <div class="flex-1 min-h-0 overflow-y-auto pr-1">
            <div class="flex min-h-full flex-col gap-4">
              <div class="flex aspect-[4/5] w-full items-center justify-center rounded-lg bg-elevated/50 p-6 text-center text-muted">
                <div class="flex flex-col items-center gap-3">
                  <UIcon
                    name="i-lucide-square-mouse-pointer"
                    class="size-10"
                  />
                  <div class="space-y-1">
                    <p class="text-sm font-medium text-highlighted">
                      Aucune carte
                    </p>
                    <p class="text-sm">
                      Selectionne une carte du catalogue.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div
            v-if="previewCard"
            class="shrink-0"
          >
            <UButton
              v-if="previewCard.type === 'Leader'"
              icon="i-lucide-crown"
              :color="previewCard.id === leaderCardId ? 'success' : 'primary'"
              block
              @click="chooseLeader(previewCard)"
            >
              {{ previewCard.id === leaderCardId ? 'Leader selectionne' : 'Choisir comme Leader' }}
            </UButton>
            <UButton
              v-else
              icon="i-lucide-list-plus"
              :disabled="!canAddCard(previewCard)"
              block
              @click="addCard(previewCard)"
            >
              {{ canAddCard(previewCard) ? 'Ajouter au deck' : 'Limite atteinte' }}
            </UButton>
          </div>
          <UButton
            v-else
            icon="i-lucide-list-plus"
            color="primary"
            block
            disabled
          >
            Ajouter au deck
          </UButton>
        </template>
      </UCard>

      <UCard
        class="min-h-0 min-w-0"
        :class="mobilePanel === 'builder' ? 'flex' : 'hidden xl:flex'"
        :ui="{ root: 'h-full flex-col', body: 'min-h-0 flex-1 overflow-hidden' }"
      >
        <template #header>
          <div class="space-y-3">
            <div class="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:justify-between">
              <div class="min-w-40 flex-1">
                <h2 class="text-base font-semibold text-highlighted">
                  Deck builder
                </h2>
                <p class="text-sm text-muted">
                  {{ mainDeckCount }} / 50 cartes
                </p>
                <UProgress
                  :model-value="mainDeckCount"
                  :max="50"
                  :color="deckProgressColor"
                  size="sm"
                  class="mt-1.5"
                />
              </div>
              <UFormField
                label="Deck sauvegarde"
                class="w-full min-w-0 sm:max-w-full sm:flex-1 xl:w-full xl:max-w-md"
              >
                <UFieldGroup class="w-full">
                  <USelectMenu
                    :model-value="selectedDeckId ?? undefined"
                    :items="savedDeckItems"
                    value-key="value"
                    placeholder="Choisir un deck sauvegarde"
                    class="min-w-0 flex-1"
                    :loading="deckListPending"
                    :disabled="savedDecks.length === 0"
                    @update:model-value="maybeSetFromSavedDeck"
                  />
                  <UButton
                    icon="i-lucide-plus"
                    color="neutral"
                    variant="outline"
                    label="Nouveau"
                    @click="maybeResetBuilder"
                  />
                </UFieldGroup>
              </UFormField>
            </div>
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
          </div>
        </template>

        <div class="flex h-full min-h-0 flex-col gap-4">
          <section
            class="grid shrink-0 grid-cols-[5vmax_minmax(0,1fr)_auto] gap-3"
            @mouseenter="selectedLeader && previewHoveredCard(selectedLeader)"
            @mouseleave="clearHoveredCard(selectedLeader?.id)"
          >
            <img
              v-if="selectedLeader?.imageUrl"
              :src="selectedLeader.imageUrl"
              :alt="selectedLeader.name"
              class="w-full rounded-lg border border-muted"
            >
            <div
              v-else
              class="aspect-[5/7]"
            >
              <div class="flex h-full w-full items-center justify-center rounded-lg bg-elevated/50 text-muted">
                <UIcon
                  name="i-lucide-crown"
                  class="size-7"
                />
              </div>
            </div>

            <div class="min-w-0 space-y-2">
              <p class="truncate text-sm font-medium text-highlighted">
                {{ selectedLeader?.name ?? 'Aucun Leader' }}
              </p>
              <p class="text-sm text-muted">
                Choisis le Leader depuis le catalogue.
              </p>
            </div>

            <div class="flex items-start justify-end">
              <UDropdownMenu
                :items="deckBuilderActionItems"
                :content="{ align: 'end' }"
                :ui="{ content: 'w-52' }"
              >
                <UButton
                  icon="i-lucide-ellipsis-vertical"
                  color="neutral"
                  variant="outline"
                  size="sm"
                  aria-label="Actions du builder"
                />
              </UDropdownMenu>
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
          </div>

          <div class="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            <div
              v-for="line in deckLines"
              :key="line.cardId"
              class="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-muted p-2 transition hover:border-primary/60 hover:bg-accented/40"
              @mouseenter="cardById.get(line.cardId) && previewHoveredCard(cardById.get(line.cardId)!)"
              @mouseleave="clearHoveredCard(line.cardId)"
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

            <div
              v-if="deckLines.length === 0"
              class="flex min-h-20 items-center justify-center rounded-lg bg-elevated/50 px-3 py-2 text-center text-muted"
            >
              <p class="text-sm">
                Selectionne une carte dans le catalogue, puis ajoute-la depuis son detail.
              </p>
            </div>
          </div>

          <footer class="shrink-0 space-y-2 border-t border-muted/70 pt-4">
            <UAlert
              v-if="displayedValidationErrors.length > 0"
              color="info"
              variant="subtle"
              icon="i-lucide-circle-alert"
              title="Deck incomplet"
            >
              <template #description>
                <ul class="list-inside list-disc space-y-0.5">
                  <li
                    v-for="error in displayedValidationErrors"
                    :key="error"
                  >
                    {{ error }}
                  </li>
                </ul>
              </template>
            </UAlert>

            <div class="flex flex-wrap items-center justify-between gap-3">
              <UBadge
                v-if="validationPending"
                color="neutral"
                variant="subtle"
                icon="i-lucide-loader-2"
              >
                Validation
              </UBadge>
              <div
                v-else
                class="h-7"
              />

              <div class="flex flex-1 flex-wrap items-center gap-2">
                <UButton
                  icon="i-lucide-save"
                  size="sm"
                  class="flex-1 justify-center"
                  :loading="saving"
                  :disabled="!validationData?.valid"
                  @click="saveDeck"
                >
                  Sauvegarder
                </UButton>
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="soft"
                  size="sm"
                  class="flex-1 justify-center"
                  :loading="deleting"
                  :disabled="!selectedDeckId"
                  @click="confirmDeleteDeck"
                >
                  Supprimer
                </UButton>
              </div>
            </div>
          </footer>
        </div>
      </UCard>
    </div>
  </main>
</template>
