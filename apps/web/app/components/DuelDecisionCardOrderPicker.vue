<script setup lang="ts">
import { useSortable } from '@vueuse/integrations/useSortable'
import type { PublicCard } from '@onepiecetcg/shared'

/**
 * Draggable card list used when an effect asks the player to reorder cards
 * before they are placed on top/bottom of the deck.
 */
const props = withDefaults(defineProps<{
  cards: readonly PublicCard[]
  message: string
  submitDisabledReason?: string | null
}>(), {
  submitDisabledReason: null,
})

const emit = defineEmits<{
  'update:cards': [cards: PublicCard[]]
  inspect: [card: PublicCard]
  clearInspect: []
}>()

const sortableCards = ref<PublicCard[]>([])

function hasSameCardOrder(left: readonly PublicCard[], right: readonly PublicCard[]) {
  return left.length === right.length
    && left.every((card, index) => card.instanceId === right[index]?.instanceId)
}

watch(
  () => props.cards,
  (cards) => {
    if (!hasSameCardOrder(sortableCards.value, cards)) {
      sortableCards.value = [...cards]
    }
  },
  { immediate: true },
)

watch(
  sortableCards,
  (cards) => {
    if (!hasSameCardOrder(cards, props.cards)) {
      emit('update:cards', [...cards])
    }
  },
  { deep: true },
)

const { option } = useSortable('#duel-decision-card-order-picker-list', sortableCards, {
  handle: '.duel-decision-card-order-picker__handle',
})

option('animation', 180)
</script>

<template>
  <div class="flex w-full flex-col gap-3">
    <p class="text-sm leading-6 text-muted">
      {{ message }}
    </p>

    <UScrollArea
      class="max-h-[min(52vh,28rem)]"
      :ui="{ root: 'min-h-0', viewport: 'pr-1' }"
    >
      <div
        id="duel-decision-card-order-picker-list"
        class="flex flex-col gap-2"
      >
        <div
          v-for="(card, index) in sortableCards"
          :key="card.instanceId"
          class="flex items-stretch gap-2 rounded-xl border border-default bg-default/70 p-2 text-left shadow-sm transition hover:border-primary/40"
          :data-test="`effect-decision-order-card-${card.instanceId}`"
          :style="{ animationDelay: `${index * 24}ms` }"
          @mouseenter="emit('inspect', card)"
          @mouseleave="emit('clearInspect')"
          @focusin="emit('inspect', card)"
          @focusout="emit('clearInspect')"
        >
          <DuelCard
            :src="card.imageUrl"
            :alt="card.name"
            class="h-20 w-[5.3rem] shrink-0 overflow-hidden rounded-lg shadow-lg"
          />

          <button
            type="button"
            class="min-w-0 flex-1 rounded-lg px-3 py-2 text-left"
            @click="emit('inspect', card)"
          >
            <span class="block truncate text-sm font-semibold text-highlighted">
              {{ card.name }}
            </span>
            <span class="block text-xs text-muted">
              {{ card.type }} · {{ card.number }}
            </span>
            <span class="mt-1 block text-[11px] uppercase tracking-[0.18em] text-muted">
              Position {{ index + 1 }}
            </span>
          </button>

          <button
            type="button"
            class="duel-decision-card-order-picker__handle inline-flex items-center justify-center rounded-lg border border-default bg-elevated/70 px-2 text-muted transition hover:border-primary/50 hover:text-highlighted"
            aria-label="Déplacer la carte"
          >
            <UIcon
              name="i-lucide-grip-vertical"
              class="size-4"
            />
          </button>
        </div>
      </div>
    </UScrollArea>

    <p
      v-if="submitDisabledReason"
      class="text-xs text-warning"
    >
      {{ submitDisabledReason }}
    </p>
  </div>
</template>
