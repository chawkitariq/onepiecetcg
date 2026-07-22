<script setup lang="ts">
/**
 * Replaces UCard as the container for a duel board zone (life, character, leader, stage, deck,
 * don, cost, trash, main). Renders as a dashed placeholder frame (no fill background).
 *
 * `hugCard` (leader, stage, deck, don, trash, life) shrinks the frame itself to the card's exact
 * width/height (5:7 ratio) instead of stretching to the grid column, so the block always matches
 * the card size precisely. Multi-card zones (character, cost, main) leave it off and stay
 * stretched to their track so several cards can lay out inside.
 *
 * `labelStyle="overlay"` (default) prints the label faded behind the zone's content, matching
 * empty single-card slots. `labelStyle="inline"` prints it as a normal heading above the content,
 * for zones that are never empty-looking (main).
 */
const { label, flipped, labelStyle = 'overlay', hugCard = false } = defineProps<{
  label?: string
  flipped?: boolean
  labelStyle?: 'overlay' | 'inline'
  hugCard?: boolean
}>()
</script>

<template>
  <div
    class="h-full relative overflow-hidden rounded-lg border border-dashed border-muted"
    :class="[
      labelStyle === 'inline' ? 'flex flex-col' : '',
      hugCard ? 'w-auto aspect-5/7 max-w-full justify-self-center' : ''
    ]"
  >
    <p
      v-if="label && labelStyle === 'overlay'"
      class="uppercase text-xs absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-[-1]"
      :class="flipped ? '-scale-x-100 -scale-y-100' : ''"
    >
      {{ label }}
    </p>
    <p
      v-else-if="label"
      class="uppercase text-xs shrink-0"
      :class="flipped ? '-scale-x-100 -scale-y-100' : ''"
    >
      {{ label }}
    </p>
    <div :class="labelStyle === 'inline' ? 'relative flex-1 min-h-0' : 'relative h-full'">
      <slot />
    </div>
  </div>
</template>
