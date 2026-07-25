<script setup lang="ts">
/**
 * Hearthstone-style arrow drawn from an attacking card to its target while an attack is being
 * declared, and briefly held on the confirmed target after declaration. Reads live screen
 * positions from the cards' own `[data-instance-id]` DOM elements (set in PlayZone.vue) rather
 * than tracking layout math separately, so it stays correct through drag/resize/scroll.
 */
const props = defineProps<{
  fromInstanceId: string | null
  toInstanceId: string | null
  /** Follows the pointer instead of a fixed target element while true (mid drag/hover, no target locked yet). */
  toPoint?: { x: number, y: number } | null
}>()

const reducedMotion = usePreferredReducedMotion()

const fromPoint = ref<{ x: number, y: number } | null>(null)
const resolvedToPoint = ref<{ x: number, y: number } | null>(null)

function centerOf(instanceId: string | null): { x: number, y: number } | null {
  if (!instanceId) {
    return null
  }

  const element = document.querySelector(`[data-instance-id="${CSS.escape(instanceId)}"]`)

  if (!element) {
    return null
  }

  const rect = element.getBoundingClientRect()

  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

let frameId: number | null = null

function trackPositions() {
  fromPoint.value = centerOf(props.fromInstanceId)
  resolvedToPoint.value = props.toPoint ?? centerOf(props.toInstanceId)
  frameId = requestAnimationFrame(trackPositions)
}

watch(() => props.fromInstanceId, (instanceId) => {
  if (instanceId && frameId === null) {
    trackPositions()
    return
  }

  if (!instanceId && frameId !== null) {
    cancelAnimationFrame(frameId)
    frameId = null
    fromPoint.value = null
    resolvedToPoint.value = null
  }
})

onBeforeUnmount(() => {
  if (frameId !== null) {
    cancelAnimationFrame(frameId)
  }
})

const isVisible = computed(() => Boolean(fromPoint.value && resolvedToPoint.value))

const svgViewport = computed(() => {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 }
  }

  return { width: window.innerWidth, height: window.innerHeight }
})
</script>

<template>
  <Teleport to="body">
    <svg
      v-if="isVisible && fromPoint && resolvedToPoint"
      class="pointer-events-none fixed inset-0 z-60"
      :width="svgViewport.width"
      :height="svgViewport.height"
    >
      <defs>
        <marker
          id="duel-attack-arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="6"
          refY="5"
          orient="auto"
        >
          <path
            d="M0,0 L10,5 L0,10 Z"
            class="fill-error"
          />
        </marker>
      </defs>
      <line
        :x1="fromPoint.x"
        :y1="fromPoint.y"
        :x2="resolvedToPoint.x"
        :y2="resolvedToPoint.y"
        class="stroke-error"
        stroke-width="4"
        stroke-linecap="round"
        marker-end="url(#duel-attack-arrowhead)"
        :class="reducedMotion === 'reduce' ? '' : 'duel-attack-arrow-line'"
      />
    </svg>
  </Teleport>
</template>

<style scoped>
.duel-attack-arrow-line {
  stroke-dasharray: 10 8;
  animation: duel-attack-arrow-flow 0.5s linear infinite;
}

@keyframes duel-attack-arrow-flow {
  to {
    stroke-dashoffset: -18;
  }
}
</style>
