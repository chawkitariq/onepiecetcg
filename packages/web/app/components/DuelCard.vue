<script setup lang="ts">
/**
 * Renders a single card (or card-back) image at the One Piece TCG card ratio (5:7), sized only
 * by the height available so every card on the board renders at the exact same size regardless
 * of zone, never stretched/cropped to fit a differently-shaped slot. Never renders text over the
 * artwork.
 */
const { src, alt = '', rotated = false } = defineProps<{
  src?: string | null
  alt?: string
  rotated?: boolean
}>()
</script>

<template>
  <img
    v-if="src"
    :src="src"
    :alt="alt"
    class="h-full aspect-5/7 object-contain"
    :class="rotated ? '-rotate-90' : ''"
  >
</template>
