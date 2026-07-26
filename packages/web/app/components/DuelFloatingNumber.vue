<script setup lang="ts">
import { animate } from 'animejs'

/**
 * A single number that rises and fades out from a fixed screen position, Hearthstone-style
 * damage/gain feedback. Generic on purpose so it can represent damage, life loss, or DON!! gained
 * -- the caller decides the value, color, and position; this only owns the animation.
 */
const props = defineProps<{
  value: number
  x: number
  y: number
  tone?: 'damage' | 'gain'
}>()

const emit = defineEmits<{
  done: []
}>()

const reducedMotion = usePreferredReducedMotion()
const floatingNumberElement = useTemplateRef<HTMLElement>('floating-number')

const label = computed(() => (props.tone === 'gain' ? `+${props.value}` : `-${props.value}`))

const toneClass = computed(() =>
  props.tone === 'gain' ? 'text-success' : 'text-error'
)

function onAnimationComplete() {
  emit('done')
}

onMounted(() => {
  if (!floatingNumberElement.value) {
    onAnimationComplete()
    return
  }

  if (reducedMotion.value === 'reduce') {
    animate(floatingNumberElement.value, {
      opacity: [1, 1, 0],
      duration: 600,
      ease: 'linear',
      onComplete: onAnimationComplete
    })
    return
  }

  animate(floatingNumberElement.value, {
    opacity: [0, 1, 1, 0],
    y: [0, -56],
    scale: [0.6, 1],
    duration: 900,
    ease: 'outCubic',
    onComplete: onAnimationComplete
  })
})
</script>

<template>
  <span
    ref="floating-number"
    class="pointer-events-none fixed z-80 text-2xl font-black tabular-nums drop-shadow-[0_2px_4px_rgb(0_0_0/0.6)] sm:text-3xl"
    :class="toneClass"
    :style="{ left: `${x}px`, top: `${y}px`, translate: '-50% -50%' }"
  >
    {{ label }}
  </span>
</template>
