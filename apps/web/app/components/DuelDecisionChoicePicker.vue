<script setup lang="ts">
import type { DuelEffectChoiceView } from '~/utils/duelDecision'

defineProps<{
  message: string
  choices: DuelEffectChoiceView[]
  submitDisabledReason?: string | null
}>()

const emit = defineEmits<{
  toggle: [choiceId: string]
}>()
</script>

<template>
  <div class="flex w-full flex-col gap-3">
    <p class="text-sm leading-6 text-muted">
      {{ message }}
    </p>

    <div class="grid gap-2 text-left">
      <button
        v-for="choice in choices"
        :key="choice.id"
        type="button"
        class="rounded-xl border px-3 py-2 transition"
        :class="choice.selected
          ? 'border-primary bg-primary/10 text-highlighted'
          : 'border-default bg-default/70 text-muted hover:border-primary/40 hover:text-highlighted'"
        @click="emit('toggle', choice.id)"
      >
        <span class="block text-sm font-semibold">
          {{ choice.label }}
        </span>
        <span
          v-if="choice.cardInstanceId"
          class="block text-xs"
        >
          Carte liée: {{ choice.cardInstanceId }}
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
