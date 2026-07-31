<script setup lang="ts">
import { animate } from 'animejs'
import {
  getDuelFloatingFeedbackAnimation,
  resolveDuelFeedbackClasses,
  type DuelFloatingFeedbackFamily
} from '~/utils/duelFeedback'

/**
 * A single number that rises and fades out from a fixed screen position, Hearthstone-style
 * damage/gain feedback. Generic on purpose so it can represent damage, life loss, or DON!! gained
 * -- the caller decides the value, color, and position; this only owns the animation.
 */
const props = defineProps<{
  value: number
  x: number
  y: number
  family?: DuelFloatingFeedbackFamily
}>()

const emit = defineEmits<{
  done: []
}>()

const reducedMotion = usePreferredReducedMotion()
const appConfig = useAppConfig()
const floatingNumberElement = useTemplateRef<HTMLElement>('floating-number')

const label = computed(() => (props.family === 'gain' ? `+${props.value}` : `-${props.value}`))

const feedbackClasses = computed(() =>
  resolveDuelFeedbackClasses(appConfig, 'floating', props.family ?? 'impact')
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
    animate(
      floatingNumberElement.value,
      getDuelFloatingFeedbackAnimation(props.family ?? 'impact', true, onAnimationComplete)
    )
    return
  }

  animate(
    floatingNumberElement.value,
    getDuelFloatingFeedbackAnimation(props.family ?? 'impact', false, onAnimationComplete)
  )
})
</script>

<template>
  <span
    ref="floating-number"
    class="pointer-events-none fixed z-80 text-2xl font-black tabular-nums sm:text-3xl"
    :class="feedbackClasses"
    :data-feedback-family="family ?? 'impact'"
    :style="{ left: `${x}px`, top: `${y}px`, translate: '-50% -50%' }"
  >
    {{ label }}
  </span>
</template>
