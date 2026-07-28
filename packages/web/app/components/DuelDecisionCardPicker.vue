<script setup lang="ts">
import type { PublicCard } from '@onepiecetcg/shared'

defineProps<{
  message: string
  cards: PublicCard[]
  selectedCardIds: string[]
  revealedCardIds: string[]
  submitDisabledReason?: string | null
}>()

const emit = defineEmits<{
  toggle: [instanceId: string]
}>()
</script>

<template>
  <div class="flex w-full flex-col gap-3">
    <p class="text-sm leading-6 text-muted">
      {{ message }}
    </p>

    <div class="grid gap-2 text-left">
      <button
        v-for="card in cards"
        :key="card.instanceId"
        type="button"
        class="rounded-xl border px-3 py-2 transition"
        :class="selectedCardIds.includes(card.instanceId)
          ? 'border-primary bg-primary/10 text-highlighted'
          : 'border-default bg-default/70 text-muted hover:border-primary/40 hover:text-highlighted'"
        @click="emit('toggle', card.instanceId)"
      >
        <span class="block text-sm font-semibold">
          {{ card.name }}
        </span>
        <span class="block text-xs">
          {{ card.type }} · {{ card.number }}
        </span>
        <span
          v-if="revealedCardIds.includes(card.instanceId)"
          class="mt-1 inline-flex rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning"
        >
          Révélée
        </span>
      </button>
    </div>

    <p
      v-if="submitDisabledReason"
      class="text-xs text-warning"
    >
      {{ submitDisabledReason }}
    </p>
  </div>
</template>
