<script setup lang="ts">
/**
 * Centered, non-blocking overlay for combat decisions (block/don't block, counter, trigger) --
 * Hearthstone-style rather than an inline UAlert banner, so it never reflows the board underneath.
 * Only used for moments with an actual decision to make; pure "waiting on opponent" states render
 * as a small ambient corner toast instead (DuelWaitingToast.vue), since there is nothing to decide.
 */
export type DuelActionModalAction = {
  label: string
  color?: 'primary' | 'neutral' | 'error'
  onSelect: () => void
}

export type DuelActionModalState = {
  tone: 'decision' | 'danger'
  title: string
  description?: string
  actions: DuelActionModalAction[]
  /** When true, the decision also requires clicking a card on the board (e.g. choosing a blocker),
   * so the backdrop must not intercept pointer events -- only the panel itself stays interactive. */
  allowBoardInteraction?: boolean
}

defineProps<{
  state: DuelActionModalState | null
}>()

const toneClasses: Record<DuelActionModalState['tone'], string> = {
  decision: 'border-warning/50',
  danger: 'border-error/50'
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="state"
        class="fixed inset-0 z-[150] flex justify-center"
        :class="state.allowBoardInteraction
          ? 'pointer-events-none items-end pb-24 sm:pb-8'
          : 'items-center bg-default/40 backdrop-blur-[2px]'"
      >
        <Transition
          appear
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
        >
          <UCard
            :key="state.title"
            class="pointer-events-auto w-full max-w-sm border-2 shadow-2xl"
            :class="toneClasses[state.tone]"
          >
            <div class="flex flex-col items-center gap-3 text-center">
              <h3 class="text-base font-bold text-highlighted">
                {{ state.title }}
              </h3>
              <p
                v-if="state.description"
                class="text-sm text-muted"
              >
                {{ state.description }}
              </p>

              <slot name="content" />

              <div class="mt-1 flex w-full flex-wrap items-center justify-center gap-2">
                <UButton
                  v-for="action in state.actions"
                  :key="action.label"
                  size="lg"
                  :color="action.color ?? 'neutral'"
                  variant="subtle"
                  class="justify-center"
                  @click="action.onSelect()"
                >
                  {{ action.label }}
                </UButton>
              </div>
            </div>
          </UCard>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
