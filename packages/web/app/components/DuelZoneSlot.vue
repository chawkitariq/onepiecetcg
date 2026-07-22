<script setup lang="ts">
/**
 * Replaces UCard as the container for a duel board zone (life, character, leader, stage, deck,
 * don, cost, trash, main). Renders as a dashed placeholder frame (no fill background), with the
 * label faded behind the zone's content.
 *
 * `hugCard` (leader, stage, deck, don, trash, life) shrinks the frame itself to the card's exact
 * width/height (5:7 ratio) instead of stretching to the grid column, so the block always matches
 * the card size precisely. Multi-card zones (character, cost, main) leave it off and stay
 * stretched to their track so several cards can lay out inside.
 *
 * `count`, when set, is only exposed through a hover tooltip so zone overlays stay clear.
 */
const { label, flipped, hugCard = false, count } = defineProps<{
  label?: string
  flipped?: boolean
  hugCard?: boolean
  count?: number
}>()

const countTooltip = computed(() => count?.toString() ?? '')
</script>

<template>
  <UTooltip
    v-if="count !== undefined"
    :text="countTooltip"
    :delay-duration="0"
    :ui="{ content: 'text-sm' }"
  >
    <div
      class="h-full relative overflow-hidden rounded-lg border border-dashed border-muted"
      :class="hugCard ? 'w-auto aspect-5/7 max-w-full justify-self-center' : ''"
    >
      <p
        v-if="label"
        class="uppercase text-xs absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-[-1]"
        :class="flipped ? '-scale-x-100 -scale-y-100' : ''"
      >
        {{ label }}
      </p>
      <div class="relative h-full">
        <slot />
      </div>
    </div>
  </UTooltip>
  <div
    v-else
    class="h-full relative overflow-hidden rounded-lg border border-dashed border-muted"
    :class="hugCard ? 'w-auto aspect-5/7 max-w-full justify-self-center' : ''"
  >
    <p
      v-if="label"
      class="uppercase text-xs absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-[-1]"
      :class="flipped ? '-scale-x-100 -scale-y-100' : ''"
    >
      {{ label }}
    </p>
    <div class="relative h-full">
      <slot />
    </div>
  </div>
</template>
