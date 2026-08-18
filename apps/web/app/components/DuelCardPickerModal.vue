<script setup lang="ts">
type CardPickerCard = {
  instanceId: string
  imageUrl: string | null
  name: string
  number?: string
}

type CardSize = {
  width: number
  height: number
}

const props = withDefaults(defineProps<{
  open: boolean
  cards: readonly CardPickerCard[]
  selectedCardInstanceId: string | null
  cardSize?: CardSize | null
  modalTestId: string
  cardTestId: string
  title?: string
  description?: string
  showSearch?: boolean
  searchQuery?: string
  searchPlaceholder?: string
  searchEmptyLabel?: string
}>(), {
  cardSize: null,
  title: undefined,
  description: undefined,
  showSearch: false,
  searchQuery: '',
  searchPlaceholder: 'Rechercher une carte...',
  searchEmptyLabel: 'Aucune carte ne correspond à votre recherche.'
})

const emit = defineEmits<{
  close: []
  hover: [card: CardPickerCard | null]
  select: [instanceId: string]
  'update:searchQuery': [value: string]
}>()

const searchQueryProxy = computed({
  get: () => props.searchQuery ?? '',
  set: value => emit('update:searchQuery', value)
})

const visibleCards = computed(() => {
  const query = searchQueryProxy.value.trim().toLocaleLowerCase()

  if (!query) {
    return props.cards
  }

  return props.cards.filter((card) => {
    return [card.name, card.number, card.instanceId]
      .filter((candidate): candidate is string => typeof candidate === 'string')
      .some(candidate => candidate.toLocaleLowerCase().includes(query))
  })
})

useEventListener('keydown', (event) => {
  if (props.open && event.key === 'Escape') {
    event.preventDefault()
    emit('close')
  }
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="props.open"
      :data-test="props.modalTestId"
      class="duel-card-picker-modal-overlay"
      @click="emit('close')"
    >
      <Transition
        appear
        enter-active-class="transition duration-250 ease-out"
        enter-from-class="opacity-0 translate-y-3 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
      >
        <div class="flex max-h-[calc(100vh-3rem)] w-full max-w-[min(100%,1500px)] flex-col" @click.stop>
          <div
            v-if="props.title || props.description"
            class="mb-5 text-center"
          >
            <h3
              v-if="props.title"
              class="text-lg font-bold text-highlighted"
            >
              {{ props.title }}
            </h3>
            <p
              v-if="props.description"
              class="text-sm text-muted"
            >
              {{ props.description }}
            </p>
          </div>

          <div
            v-if="props.showSearch"
            class="mb-4 flex w-full justify-center"
          >
            <UInput
              v-model="searchQueryProxy"
              data-test="picker-search-input"
              :placeholder="props.searchPlaceholder"
              leading-icon="i-lucide-search"
              class="w-full max-w-xl"
              :aria-label="props.searchPlaceholder"
            >
              <template #trailing>
                <UButton
                  v-if="searchQueryProxy"
                  icon="i-lucide-x"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  aria-label="Réinitialiser la recherche"
                  @click="emit('update:searchQuery', '')"
                />
              </template>
            </UInput>
          </div>

          <UScrollArea
            orientation="vertical"
            class="duel-card-picker-modal-scroll min-h-0 flex-1"
            :ui="{ root: 'h-full', viewport: 'pr-2' }"
          >
            <div
              v-if="visibleCards.length > 0"
              class="flex flex-wrap items-start justify-center gap-4"
              style="min-height: 100%;"
            >
              <button
                v-for="(card, index) in visibleCards"
                :key="card.instanceId"
                :data-test="props.cardTestId"
                type="button"
                class="duel-card-picker-modal-card group aspect-5/7 text-left transition"
                :class="card.instanceId === props.selectedCardInstanceId ? 'scale-[1.02]' : 'hover:scale-[1.01]'"
                :style="{
                  ...(props.cardSize
                    ? { width: `${props.cardSize.width}px`, height: `${props.cardSize.height}px` }
                    : {}),
                  '--duel-card-picker-index': index
                }"
                @mouseenter="emit('hover', card)"
                @mouseleave="emit('hover', null)"
                @click="emit('select', card.instanceId)"
              >
                <DuelCard
                  :src="card.imageUrl"
                  :alt="card.name"
                  class="overflow-hidden rounded-lg shadow-2xl group-hover:scale-[1.02]"
                />
              </button>
            </div>

            <div
              v-else
              class="flex min-h-full flex-col items-center justify-center px-6 py-10 text-center text-sm text-muted"
              data-test="picker-empty-state"
            >
              {{ props.searchEmptyLabel }}
            </div>
          </UScrollArea>

          <div
            v-if="$slots.actions"
            class="mt-5 flex flex-wrap items-center justify-center gap-2"
          >
            <slot name="actions" />
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.duel-card-picker-modal-overlay {
  position: absolute;
  inset: 0;
  z-index: 2145;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: color-mix(in oklab, var(--ui-bg) 90%, transparent);
  backdrop-filter: blur(8px);
}

.duel-card-picker-modal-card {
  animation: duel-card-picker-modal-card-appear 220ms ease-out both;
  animation-delay: calc(var(--duel-card-picker-index, 0) * 35ms);
  will-change: transform, opacity;
}

@keyframes duel-card-picker-modal-card-appear {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .duel-card-picker-modal-card {
    animation: none;
    will-change: auto;
  }
}
</style>
