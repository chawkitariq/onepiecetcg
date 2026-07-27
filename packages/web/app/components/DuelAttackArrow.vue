<script setup lang="ts">
import { animate } from 'animejs'

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
  animationKey?: number | string | null
  variant?: 'drag' | 'confirmed'
}>()

const reducedMotion = usePreferredReducedMotion()

const svgElement = useTemplateRef<SVGSVGElement>('svg-element')
const fromPoint = ref<{ x: number, y: number } | null>(null)
const resolvedToPoint = ref<{ x: number, y: number } | null>(null)
const confirmedProgress = ref(1)
const lastAnimatedConfirmedId = ref<string | null>(null)
const pendingConfirmedAnimationId = ref<string | null>(null)
let confirmedAnimation: ReturnType<typeof animate> | null = null

function currentContainerRect(): DOMRect | null {
  return svgElement.value?.getBoundingClientRect() ?? null
}

function pointWithinContainer(point: { x: number, y: number }, containerRect: DOMRect | null) {
  if (!containerRect) {
    return point
  }

  return {
    x: point.x - containerRect.left,
    y: point.y - containerRect.top
  }
}

function centerOf(instanceId: string | null, containerRect: DOMRect | null): { x: number, y: number } | null {
  if (!instanceId) {
    return null
  }

  const element = document.querySelector(`[data-instance-id="${CSS.escape(instanceId)}"]`)

  if (!element) {
    return null
  }

  const rect = element.getBoundingClientRect()

  return pointWithinContainer(
    { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
    containerRect
  )
}

let frameId: number | null = null

function trackPositions() {
  const containerRect = currentContainerRect()

  fromPoint.value = centerOf(props.fromInstanceId, containerRect)
  resolvedToPoint.value = props.toPoint
    ? pointWithinContainer(props.toPoint, containerRect)
    : centerOf(props.toInstanceId, containerRect)
  frameId = requestAnimationFrame(trackPositions)
}

function ensureTracking() {
  if (props.fromInstanceId && frameId === null) {
    trackPositions()
  }
}

watch(() => props.fromInstanceId, (instanceId) => {
  if (instanceId) {
    ensureTracking()
    return
  }

  if (!instanceId && frameId !== null) {
    cancelAnimationFrame(frameId)
    frameId = null
    fromPoint.value = null
    resolvedToPoint.value = null
  }
})

onMounted(() => {
  ensureTracking()
})

onBeforeUnmount(() => {
  confirmedAnimation?.pause()

  if (frameId !== null) {
    cancelAnimationFrame(frameId)
  }
})

function tryStartConfirmedAnimation() {
  if (
    props.variant !== 'confirmed'
    || reducedMotion.value === 'reduce'
    || !fromPoint.value
    || !resolvedToPoint.value
    || !pendingConfirmedAnimationId.value
  ) {
    return
  }

  if (lastAnimatedConfirmedId.value === pendingConfirmedAnimationId.value) {
    pendingConfirmedAnimationId.value = null
    confirmedProgress.value = 1
    return
  }

  confirmedAnimation?.pause()
  confirmedAnimation = null
  lastAnimatedConfirmedId.value = pendingConfirmedAnimationId.value
  pendingConfirmedAnimationId.value = null
  confirmedProgress.value = 0

  const state = { value: 0 }

  confirmedAnimation = animate(state, {
    value: 1,
    duration: 360,
    ease: 'outCubic',
    onUpdate: () => {
      confirmedProgress.value = state.value
    },
    onComplete: () => {
      confirmedProgress.value = 1
      confirmedAnimation = null
    }
  })
}

watch(
  () => [props.animationKey, props.variant, props.fromInstanceId, props.toInstanceId, reducedMotion.value] as const,
  () => {
    if (props.variant !== 'confirmed' || reducedMotion.value === 'reduce') {
      confirmedAnimation?.pause()
      confirmedAnimation = null
      pendingConfirmedAnimationId.value = null
      confirmedProgress.value = 1
      return
    }

    pendingConfirmedAnimationId.value = String(props.animationKey ?? 'static')
    tryStartConfirmedAnimation()
  },
  { immediate: true }
)

watch(
  () => [Boolean(fromPoint.value), Boolean(resolvedToPoint.value)] as const,
  () => {
    tryStartConfirmedAnimation()
  }
)

const displayedToPoint = computed(() => {
  if (!fromPoint.value || !resolvedToPoint.value) {
    return null
  }

  if (props.variant !== 'confirmed' || reducedMotion.value === 'reduce') {
    return resolvedToPoint.value
  }

  return {
    x: fromPoint.value.x + (resolvedToPoint.value.x - fromPoint.value.x) * confirmedProgress.value,
    y: fromPoint.value.y + (resolvedToPoint.value.y - fromPoint.value.y) * confirmedProgress.value
  }
})

const isVisible = computed(() => Boolean(fromPoint.value && displayedToPoint.value))
const lineLength = computed(() => {
  if (!fromPoint.value || !displayedToPoint.value) {
    return 0
  }

  return Math.hypot(
    displayedToPoint.value.x - fromPoint.value.x,
    displayedToPoint.value.y - fromPoint.value.y
  )
})
const lineRenderKey = computed(() =>
  `${props.variant ?? 'drag'}:${String(props.animationKey ?? 'static')}:${props.fromInstanceId ?? 'none'}:${props.toInstanceId ?? 'none'}`
)
const lineStyle = computed(() => ({
  '--duel-attack-arrow-length': `${lineLength.value}px`,
  'stroke': 'var(--ui-error)'
}))
const arrowHeadStyle = computed(() => ({
  fill: 'var(--ui-error)'
}))

</script>

<template>
  <svg
    v-if="isVisible && fromPoint && displayedToPoint"
    ref="svg-element"
    class="pointer-events-none absolute inset-0 z-[61] h-full w-full"
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
          :style="arrowHeadStyle"
        />
      </marker>
    </defs>
    <line
      :key="lineRenderKey"
      :x1="fromPoint.x"
      :y1="fromPoint.y"
      :x2="displayedToPoint.x"
      :y2="displayedToPoint.y"
      stroke-width="4"
      stroke-linecap="round"
      marker-end="url(#duel-attack-arrowhead)"
      :style="lineStyle"
      :class="[
        reducedMotion === 'reduce'
          ? ''
          : (variant === 'confirmed' ? 'duel-attack-arrow-confirmed' : 'duel-attack-arrow-drag')
      ]"
    />
  </svg>
</template>

<style scoped>
.duel-attack-arrow-drag {
  stroke-dasharray: 10 8;
  animation: duel-attack-arrow-flow 0.5s linear infinite;
}

.duel-attack-arrow-confirmed {
  filter: drop-shadow(0 0 10px color-mix(in oklab, var(--ui-error) 45%, transparent));
}

@keyframes duel-attack-arrow-flow {
  to {
    stroke-dashoffset: -18;
  }
}
</style>
