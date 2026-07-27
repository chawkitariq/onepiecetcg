<script setup lang="ts">
import type { CardColor, CardType } from '@onepiecetcg/shared'
import { getCardColorStyle } from '~/utils/cardColors'

type CardDetailsValue = number | string

type CardDetailsDisplayCard = {
  number: string
  name: string
  type: CardType
  colors: CardColor[]
  imageUrl: string | null
  text?: string | null
  trigger?: string | null
}

const {
  card,
  rows,
  loadingDescription = false,
  emptyMessage
} = defineProps<{
  card: CardDetailsDisplayCard | null
  rows: ReadonlyArray<readonly [label: string, value: CardDetailsValue]>
  loadingDescription?: boolean
  emptyMessage: string
}>()
</script>

<template>
  <UCard
    class="min-h-0 min-w-0"
    :ui="{ root: 'h-full flex-col', body: 'min-h-0 flex-1 overflow-hidden' }"
  >
    <template #header>
      <div class="space-y-3">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-semibold text-highlighted">
              Details
            </h2>
            <p class="text-sm text-muted">
              {{ card?.number ?? 'Aucune carte' }}
            </p>
          </div>
          <UBadge
            v-if="card"
            color="neutral"
            variant="subtle"
          >
            {{ card.type }}
          </UBadge>
        </div>
      </div>
    </template>

    <div
      v-if="card"
      class="flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-1"
    >
      <div class="w-full aspect-[4/5]">
        <img
          v-if="card.imageUrl"
          :src="card.imageUrl"
          :alt="card.name"
          class="w-full rounded-lg border border-muted object-cover"
        >
        <div
          v-else
          class="flex h-full w-full items-center justify-center rounded-lg border border-muted bg-elevated text-muted"
        >
          <UIcon
            name="i-lucide-image-off"
            class="size-8"
          />
        </div>
      </div>

      <div class="flex min-h-0 min-w-0 flex-col gap-4">
        <div class="min-w-0 space-y-3">
          <div>
            <h3 class="text-base font-semibold text-highlighted">
              {{ card.name }}
            </h3>
            <div class="mt-2 flex flex-wrap gap-1">
              <UBadge
                v-for="color in card.colors"
                :key="color"
                :style="getCardColorStyle(color)"
              >
                {{ color }}
              </UBadge>
            </div>
          </div>

          <CardEffectBadges :text="card.text" />

          <p
            v-if="card.text"
            class="max-h-36 overflow-y-auto whitespace-pre-line text-sm text-muted"
          >
            {{ card.text }}
          </p>
          <p
            v-else-if="loadingDescription"
            class="max-h-36 overflow-y-auto whitespace-pre-line text-sm text-muted"
          >
            Chargement de la description...
          </p>
          <p
            v-else
            class="max-h-36 overflow-y-auto whitespace-pre-line text-sm text-muted"
          >
            Description indisponible.
          </p>
        </div>

        <dl class="grid gap-2 text-sm">
          <div
            v-for="[label, value] in rows"
            :key="label"
            class="grid grid-cols-[76px_minmax(0,1fr)] gap-3"
          >
            <dt class="text-muted">
              {{ label }}
            </dt>
            <dd class="min-w-0 text-highlighted">
              {{ value }}
            </dd>
          </div>
        </dl>
      </div>
    </div>

    <div
      v-else
      class="flex h-full min-h-0 flex-col gap-4"
    >
      <div class="flex-1 min-h-0 overflow-y-auto pr-1">
        <div class="flex min-h-full flex-col gap-4">
          <div class="flex aspect-[4/5] w-full items-center justify-center rounded-lg bg-elevated/50 p-6 text-center text-muted">
            <div class="flex flex-col items-center gap-3">
              <UIcon
                name="i-lucide-square-mouse-pointer"
                class="size-10"
              />
              <div class="space-y-1">
                <p class="text-sm font-medium text-highlighted">
                  Aucune carte
                </p>
                <p class="text-sm">
                  {{ emptyMessage }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template
      v-if="$slots.footer"
      #footer
    >
      <slot name="footer" />
    </template>
  </UCard>
</template>
