<script setup lang="ts">
import type {
  Card,
  CardColor,
  CardFilterOptions,
  CardSearchResponse,
  CardType,
  Deck,
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
const selectedSet = ref(allFilter)
const selectedType = ref<CardType | typeof allFilter>(allFilter)
const selectedColor = ref<CardColor | typeof allFilter>(allFilter)
const selectedCost = ref<number | typeof allFilter>(allFilter)
const selectedCard = ref<Card | null>(null)
const serverMessage = ref<string | null>(null)
const serverError = ref<string | null>(null)
const builderNotice = ref<string | null>(null)
const saving = ref(false)

onMounted(() => {
  void refreshSession()
})

const { data: catalogData, pending: catalogPending } = await useAsyncData(
  'deck-builder-catalog',
  () => api<CardSearchResponse>('/catalog/cards')
)

const cards = computed(() => catalogData.value?.cards ?? [])
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

function resetBuilder() {
  selectedDeckId.value = null
  deckName.value = 'Nouveau deck'
  leaderCardId.value = ''
  deckCards.value = []
  serverMessage.value = null
  serverError.value = null
  builderNotice.value = null
}

function resetCatalogFilters() {
  search.value = ''
  selectedSet.value = allFilter
  selectedType.value = allFilter
  selectedColor.value = allFilter
  selectedCost.value = allFilter
}

function getCardQuantity(card: Card): number {
  return cardQuantityByNumber.value.get(card.number) ?? 0
}

function canAddCard(card: Card): boolean {
  return card.type !== 'Leader' && getCardQuantity(card) < 4 && mainDeckCount.value < 50
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
  <UContainer class="max-w-[1600px] py-4">
    <UAlert
      v-if="!profile"
      class="mb-3"
      color="warning"
      variant="subtle"
      icon="i-lucide-lock"
      title="Connexion requise"
      description="Les decks sauvegardes sont lies au compte joueur."
    />

    <div class="grid min-h-0 w-full gap-4 overflow-hidden xl:h-[calc(100vh-6rem)] xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.34fr)]">
      <UCard
        class="min-h-0 min-w-0"
        :ui="{ root: 'h-full flex flex-col', body: 'min-h-0 flex-1 overflow-hidden' }"
      >
        <template #header>
          <div class="flex items-center justify-between gap-3">
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
        </template>

        <div class="flex h-full min-h-0 flex-col gap-4">
          <div class="grid shrink-0 gap-3 lg:grid-cols-[minmax(220px,1.2fr)_repeat(4,minmax(0,1fr))]">
            <UFormField
              label="Recherche"
              class="w-full"
            >
              <UInput
                v-model="search"
                icon="i-lucide-search"
                placeholder="Nom, numero, texte"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Set">
              <USelect
                v-model="selectedSet"
                :items="setItems"
                value-key="value"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Type">
              <USelect
                v-model="selectedType"
                :items="typeItems"
                value-key="value"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Couleur">
              <USelect
                v-model="selectedColor"
                :items="colorItems"
                value-key="value"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Cout">
              <USelect
                v-model="selectedCost"
                :items="costItems"
                value-key="value"
                class="w-full"
              />
            </UFormField>
          </div>

          <div class="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px] 2xl:grid-cols-[minmax(0,1fr)_320px]">
            <div class="min-h-0 overflow-y-auto pr-1">
              <div
                v-if="catalogPending"
                class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
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
              />

              <div
                v-else
                class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
              >
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

            <aside class="min-h-0 overflow-y-auto rounded-lg border border-muted p-3">
              <div
                v-if="selectedCard"
                class="space-y-4"
              >
                <img
                  v-if="selectedCard.imageUrl"
                  :src="selectedCard.imageUrl"
                  :alt="selectedCard.name"
                  class="mx-auto w-full max-w-44 rounded-lg border border-muted"
                >

                <div>
                  <p class="text-sm text-muted">
                    {{ selectedCard.number }}
                  </p>
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

                <dl class="grid gap-2 text-sm">
                  <div
                    v-for="[label, value] in selectedCardRows"
                    :key="label"
                    class="grid grid-cols-[84px_minmax(0,1fr)] gap-3"
                  >
                    <dt class="text-muted">
                      {{ label }}
                    </dt>
                    <dd class="min-w-0 text-highlighted">
                      {{ value }}
                    </dd>
                  </div>
                </dl>

                <p class="whitespace-pre-line text-sm text-muted">
                  {{ selectedCard.text || 'Pas de texte.' }}
                </p>

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

              <UEmpty
                v-else
                icon="i-lucide-square-mouse-pointer"
                title="Aucune carte"
                description="Selectionne une carte du catalogue."
              />
            </aside>
          </div>
        </div>
      </UCard>

      <UCard
        class="min-h-0 min-w-0"
        :ui="{ root: 'h-full flex flex-col', body: 'min-h-0 flex-1 overflow-hidden' }"
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
              <UBadge
                :color="validationData?.valid ? 'success' : 'error'"
                variant="subtle"
              >
                {{ validationData?.valid ? 'Valide' : 'Invalide' }}
              </UBadge>
            </div>
          </div>
        </template>

        <div class="flex h-full min-h-0 flex-col gap-4">
          <section class="grid shrink-0 grid-cols-[96px_minmax(0,1fr)] gap-3">
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
    </div>
  </UContainer>
</template>
