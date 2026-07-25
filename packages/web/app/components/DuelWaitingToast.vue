<script setup lang="ts">
/**
 * Small ambient corner indicator for "waiting on opponent" combat states (blocking, countering,
 * trigger decisions). Deliberately quiet -- there is nothing to decide, so it should read as
 * ambient status rather than compete with DuelActionModal.vue's decision prompts for attention.
 */
defineProps<{
  text: string
}>()
</script>

<template>
  <div
    class="pointer-events-none fixed bottom-4 left-1/2 z-60 flex -translate-x-1/2 items-center gap-2 rounded-full border border-default bg-default/95 px-4 py-2 text-xs text-muted shadow-lg backdrop-blur-sm"
  >
    <span class="size-1.5 shrink-0 animate-pulse rounded-full bg-muted" />
    {{ text }}
  </div>
</template>
