<script setup lang="ts">
const props = defineProps<{
  value: number | null
  mirrored?: boolean
}>()

const reducedMotion = usePreferredReducedMotion()
const animatedValue = useTransition(toRef(props, 'value'), {
  duration: 220
})

const displayedValue = computed(() => {
  if (props.value === null) {
    return null
  }

  if (reducedMotion.value === 'reduce') {
    return props.value
  }

  return Math.round(animatedValue.value ?? props.value ?? 0)
})

const formattedValue = computed(() => {
  if (displayedValue.value === null) {
    return null
  }

  return new Intl.NumberFormat('fr-FR').format(displayedValue.value)
})
</script>

<template>
  <UBadge
    v-if="displayedValue !== null"
    color="neutral"
    variant="solid"
    size="sm"
    class="absolute bottom-0 left-1/2 z-30 -translate-x-1/2 tabular-nums"
    :class="mirrored ? '-scale-x-100 -scale-y-100' : ''"
  >
    {{ formattedValue }}
  </UBadge>
</template>
