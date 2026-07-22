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
 * `count`, when set, renders the zone's card count as a chip pinned to the top-right corner —
 * the only place a zone's count is ever displayed.
 */
const { label, flipped, hugCard = false, count } = defineProps<{
  label?: string
  flipped?: boolean
  hugCard?: boolean
  count?: number
}>()
</script>

<template>
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
    <UBadge
      v-if="count !== undefined"
      color="primary"
      variant="solid"
      size="sm"
      class="absolute top-1 right-1 z-20"
      :class="flipped ? '-scale-x-100 -scale-y-100' : ''"
    >
      {{ count }}
    </UBadge>
    <div class="relative h-full">
      <slot />
    </div>
  </div>
</template>
