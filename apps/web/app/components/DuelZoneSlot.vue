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
 * `count`, when set, appears as a small chip only while the zone is hovered/focused so overlays
 * stay clear during normal play.
 */
const { label, flipped, hugCard = false, count, allowOverflow = false } = defineProps<{
  label?: string
  flipped?: boolean
  hugCard?: boolean
  count?: number
  allowOverflow?: boolean
}>()
</script>

<template>
  <div
    class="group h-full relative rounded-lg border border-dashed border-muted"
    :class="[allowOverflow ? 'overflow-visible' : 'overflow-hidden', hugCard ? 'w-auto aspect-5/7 max-w-full justify-self-center' : '']"
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
      class="pointer-events-none absolute right-1 top-1 z-70 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      :class="flipped ? '-scale-x-100 -scale-y-100' : ''"
    >
      {{ count }}
    </UBadge>
    <div class="relative h-full">
      <slot />
    </div>
  </div>
</template>
