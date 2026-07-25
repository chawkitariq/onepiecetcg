<script setup lang="ts">
import { motion } from 'motion-v'

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

const label = computed(() => (props.tone === 'gain' ? `+${props.value}` : `-${props.value}`))

const toneClass = computed(() =>
  props.tone === 'gain' ? 'text-success' : 'text-error'
)

function onAnimationComplete() {
  emit('done')
}
</script>

<template>
  <motion.span
    class="pointer-events-none fixed z-80 text-2xl font-black tabular-nums drop-shadow-[0_2px_4px_rgb(0_0_0/0.6)] sm:text-3xl"
    :class="toneClass"
    :style="{ left: `${x}px`, top: `${y}px`, translate: '-50% -50%' }"
    :initial="reducedMotion === 'reduce' ? { opacity: 1 } : { opacity: 0, y: 0, scale: 0.6 }"
    :animate="reducedMotion === 'reduce' ? { opacity: [1, 1, 0] } : { opacity: [0, 1, 1, 0], y: -56, scale: 1 }"
    :transition="{ duration: reducedMotion === 'reduce' ? 0.6 : 0.9, ease: 'easeOut' }"
    @animation-complete="onAnimationComplete"
  >
    {{ label }}
  </motion.span>
</template>
