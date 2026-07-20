<script setup lang="ts">
import type {
  Card,
  CardColor,
  CardFilterOptions,
  CardSearchResponse,
  CardType
} from '@onepiecetcg/shared'

const api = useApi()

const search = ref('')
const selectedSet = ref<string | undefined>()
const selectedType = ref<CardType | undefined>()
const selectedColor = ref<CardColor | undefined>()
const selectedCost = ref<number | undefined>()
const selectedCard = ref<Card | null>(null)

const query = computed(() => ({
  q: search.value || undefined,
  set: selectedSet.value,
  type: selectedType.value,
  color: selectedColor.value,
  cost: selectedCost.value
}))

const { data, error, pending, refresh } = await useAsyncData(
  'catalog-cards',
  () => api<CardSearchResponse>('/catalog/cards', { query: query.value }),
  { watch: [query] }
)

const filters = computed<CardFilterOptions>(() => data.value?.filters ?? {
  sets: [],
  types: [],
  colors: [],
  costs: []
})

const cards = computed(() => data.value?.cards ?? [])

const setItems = computed(() => [
  { label: 'Tous les sets', value: undefined },
  ...filters.value.sets.map((set) => ({ label: `${set.id} - ${set.name}`, value: set.id }))
])

const typeItems = computed(() => [
  { label: 'Tous les types', value: undefined },
  ...filters.value.types.map((type) => ({ label: type, value: type }))
])

const colorItems = computed(() => [
  { label: 'Toutes les couleurs', value: undefined },
  ...filters.value.colors.map((color) => ({ label: color, value: color }))
])

const costItems = computed(() => [
  { label: 'Tous les couts', value: undefined },
  ...filters.value.costs.map((cost) => ({ label: String(cost), value: cost }))
])

const detailRows = computed(() => {
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
    ['Rareté', selectedCard.value.rarity ?? '-']
  ]
})

function resetFilters() {
  search.value = ''
  selectedSet.value = undefined
  selectedType.value = undefined
  selectedColor.value = undefined
  selectedCost.value = undefined
}
</script>

<template>
  <UContainer class="py-8">
    <div class="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside class="space-y-4">
        <div class="space-y-2">
          <UBadge
            color="primary"
            variant="subtle"
            icon="i-lucide-library"
          >
            Catalogue
          </UBadge>
          <h1 class="text-3xl font-semibold tracking-normal text-highlighted">
            Cartes One Piece TCG
          </h1>
        </div>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-base font-semibold text-highlighted">
                Filtres
              </h2>
              <UButton
                icon="i-lucide-rotate-ccw"
                color="neutral"
                variant="ghost"
                aria-label="Reinitialiser les filtres"
                @click="resetFilters"
              />
            </div>
          </template>

          <div class="space-y-4">
            <UFormField label="Recherche">
              <UInput
                v-model="search"
                icon="i-lucide-search"
                placeholder="Nom, numero, texte"
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
        </UCard>
      </aside>

      <section class="min-w-0 space-y-4">
        <UAlert
          v-if="error"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          title="Catalogue indisponible"
          description="L'API source OPTCG ne repond pas pour le moment."
          :actions="[{ label: 'Reessayer', icon: 'i-lucide-refresh-cw', onClick: () => refresh() }]"
        />

        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm text-muted">
            {{ data?.total ?? 0 }} carte(s)
          </p>
          <p
            v-if="data?.cachedAt"
            class="text-sm text-muted"
          >
            Cache API : {{ new Date(data.cachedAt).toLocaleString('fr-FR') }}
          </p>
        </div>

        <div
          v-if="pending"
          class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <USkeleton
            v-for="index in 9"
            :key="index"
            class="h-52 rounded-lg"
          />
        </div>

        <UEmpty
          v-else-if="cards.length === 0"
          icon="i-lucide-search-x"
          title="Aucune carte trouvee"
          description="Modifie les filtres pour elargir la recherche."
        />

        <div
          v-else
          class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <button
            v-for="card in cards"
            :key="card.id"
            type="button"
            class="rounded-lg border border-muted bg-elevated p-3 text-left transition hover:border-primary hover:bg-accented"
            @click="selectedCard = card"
          >
            <div class="flex gap-3">
              <img
                v-if="card.imageUrl"
                :src="card.imageUrl"
                :alt="card.name"
                class="h-28 w-20 shrink-0 rounded object-cover"
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
                    color="primary"
                    variant="soft"
                  >
                    {{ color }}
                  </UBadge>
                </div>
                <p class="line-clamp-3 text-sm text-muted">
                  {{ card.text || 'Pas de texte.' }}
                </p>
              </div>
            </div>
          </button>
        </div>
      </section>
    </div>

    <USlideover
      :open="Boolean(selectedCard)"
      title="Fiche carte"
      :description="selectedCard?.name"
      @update:open="(open) => { if (!open) selectedCard = null }"
    >
      <template #body>
        <div
          v-if="selectedCard"
          class="space-y-5"
        >
          <img
            v-if="selectedCard.imageUrl"
            :src="selectedCard.imageUrl"
            :alt="selectedCard.name"
            class="mx-auto w-full max-w-72 rounded-lg"
          >

          <dl class="grid gap-2 text-sm">
            <div
              v-for="[label, value] in detailRows"
              :key="label"
              class="flex justify-between gap-4 border-b border-muted pb-2"
            >
              <dt class="text-muted">
                {{ label }}
              </dt>
              <dd class="text-right text-highlighted">
                {{ value }}
              </dd>
            </div>
          </dl>

          <div class="space-y-2">
            <h3 class="text-sm font-semibold text-highlighted">
              Texte
            </h3>
            <p class="whitespace-pre-line text-sm text-muted">
              {{ selectedCard.text || 'Pas de texte.' }}
            </p>
          </div>

          <div
            v-if="selectedCard.trigger"
            class="space-y-2"
          >
            <h3 class="text-sm font-semibold text-highlighted">
              Trigger
            </h3>
            <p class="whitespace-pre-line text-sm text-muted">
              {{ selectedCard.trigger }}
            </p>
          </div>
        </div>
      </template>
    </USlideover>
  </UContainer>
</template>
