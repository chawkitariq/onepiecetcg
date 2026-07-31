<script setup lang="ts">
import { computed } from 'vue'
import { extractCardEffectBadges, type CardEffectBadgeTone } from '~/utils/cardEffectBadges'

const { text } = defineProps<{
  text?: string | null
}>()

const effectBadges = computed(() => extractCardEffectBadges(text))

function badgeClass(tone: CardEffectBadgeTone) {
  switch (tone) {
    case 'blue':
      return 'bg-sky-600 text-white'
    case 'red':
      return 'bg-red-500 text-white'
    case 'pink':
      return 'bg-pink-500 text-white'
    case 'black':
      return 'bg-zinc-900 text-white'
    case 'orange':
      return 'bg-orange-500 text-white'
    case 'yellow':
      return 'bg-yellow-300 text-zinc-900'
    default:
      return 'bg-zinc-200 text-zinc-800'
  }
}
</script>

<template>
  <div
    v-if="effectBadges.length > 0"
    class="flex flex-wrap gap-2"
  >
    <span
      v-for="badge in effectBadges"
      :key="badge.label"
      class="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold leading-none shadow-sm"
      :class="badgeClass(badge.tone)"
    >
      {{ badge.label }}
    </span>
  </div>
</template>
