<script setup lang="ts">
type CardPickerCard = {
  instanceId: string
  imageUrl: string | null
  name: string
}

type CardSize = {
  width: number
  height: number
}

const props = withDefaults(defineProps<{
  open: boolean
  cards: readonly CardPickerCard[]
  selectedCardInstanceId: string | null
  cardSize?: CardSize | null
  modalTestId: string
  cardTestId: string
  title?: string
  description?: string
}>(), {
  cardSize: null,
  title: undefined,
  description: undefined
})

const emit = defineEmits<{
  close: []
  hover: [card: CardPickerCard | null]
  select: [instanceId: string]
}>()
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="props.open"
      :data-test="props.modalTestId"
      class="duel-card-picker-modal-overlay"
      @click.self="emit('close')"
    >
      <Transition
        appear
        enter-active-class="transition duration-250 ease-out"
        enter-from-class="opacity-0 translate-y-3 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
      >
        <div class="w-full max-w-[min(100%,1500px)]">
          <div
            v-if="props.title || props.description"
            class="mb-5 text-center"
          >
            <h3
              v-if="props.title"
              class="text-lg font-bold text-highlighted"
            >
              {{ props.title }}
            </h3>
            <p
              v-if="props.description"
              class="text-sm text-muted"
            >
              {{ props.description }}
            </p>
          </div>

          <div class="flex flex-wrap items-start justify-center gap-4">
            <button
              v-for="(card, index) in props.cards"
              :key="card.instanceId"
              :data-test="props.cardTestId"
              type="button"
              class="duel-card-picker-modal-card group aspect-5/7 text-left transition"
              :class="card.instanceId === props.selectedCardInstanceId ? 'scale-[1.02]' : 'hover:scale-[1.01]'"
              :style="{
                ...(props.cardSize
                  ? { width: `${props.cardSize.width}px`, height: `${props.cardSize.height}px` }
                  : {}),
                '--duel-card-picker-index': index
              }"
              @mouseenter="emit('hover', card)"
              @mouseleave="emit('hover', null)"
              @click="emit('select', card.instanceId)"
            >
              <DuelCard
                :src="card.imageUrl"
                :alt="card.name"
                class="overflow-hidden rounded-lg shadow-2xl group-hover:scale-[1.02]"
              />
            </button>
          </div>

          <div
            v-if="$slots.actions"
            class="mt-5 flex flex-wrap items-center justify-center gap-2"
          >
            <slot name="actions" />
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.duel-card-picker-modal-overlay {
  position: absolute;
  inset: 0;
  z-index: 2145;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: color-mix(in oklab, var(--ui-bg) 90%, transparent);
  backdrop-filter: blur(8px);
}

.duel-card-picker-modal-card {
  animation: duel-card-picker-modal-card-appear 220ms ease-out both;
  animation-delay: calc(var(--duel-card-picker-index, 0) * 35ms);
  will-change: transform, opacity;
}

@keyframes duel-card-picker-modal-card-appear {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .duel-card-picker-modal-card {
    animation: none;
    will-change: auto;
  }
}
</style>
