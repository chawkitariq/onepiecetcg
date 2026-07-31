<script setup lang="ts">
defineProps<{
  open: boolean
  victory: boolean
  turnLabel: string
  durationLabel: string
}>()

defineEmits<{
  leave: []
}>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-80 flex items-center justify-center bg-default/55 px-4 backdrop-blur-sm"
      >
        <Transition
          appear
          enter-active-class="transition duration-250 ease-out"
          enter-from-class="opacity-0 translate-y-3 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
        >
          <UCard
            class="w-full max-w-xl border shadow-2xl"
            :class="victory ? 'border-success/40 bg-success/8' : 'border-error/40 bg-error/8'"
          >
            <div class="flex flex-col gap-5">
              <div class="space-y-2">
                <UBadge
                  :color="victory ? 'success' : 'error'"
                  variant="soft"
                  size="lg"
                  class="rounded-full px-3 py-1"
                >
                  {{ victory ? 'Victoire' : 'Défaite' }}
                </UBadge>
                <h2 class="text-2xl font-bold text-highlighted">
                  {{ victory ? 'Duel remporté' : 'Duel terminé' }}
                </h2>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <div class="rounded-2xl border border-default/70 bg-default/70 px-4 py-3 shadow-sm">
                  <p class="text-[0.7rem] font-semibold tracking-[0.18em] text-muted uppercase">
                    Tours
                  </p>
                  <p class="mt-1 text-lg font-semibold text-highlighted">
                    {{ turnLabel }}
                  </p>
                </div>
                <div class="rounded-2xl border border-default/70 bg-default/70 px-4 py-3 shadow-sm">
                  <p class="text-[0.7rem] font-semibold tracking-[0.18em] text-muted uppercase">
                    Durée
                  </p>
                  <p class="mt-1 text-lg font-semibold text-highlighted">
                    {{ durationLabel }}
                  </p>
                </div>
              </div>

              <div class="flex flex-wrap justify-end gap-2">
                <UButton
                  color="neutral"
                  @click="$emit('leave')"
                >
                  Retour au lobby
                </UButton>
              </div>
            </div>
          </UCard>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
