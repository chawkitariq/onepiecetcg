<script setup lang="ts">
import cardBackRegular from '~/assets/card-back-regular.png'
import { getStackedCardLayout } from '~/utils/cardStack'

/**
 * Renders the opponent's hand as a fixed strip of face-down cards, docked above their mirrored
 * board (DuelBoard.vue) -- the counterpart to DuelHand.vue for the owner's own revealed hand.
 * Card-back only: the opponent's hand contents are never known to this client, only the count
 * (already public per docs/optcg-rules.md -- hidden zones stay secret in content, not in count).
 */

type StackContainerSize = {
  width: number
  height: number
}

const props = defineProps<{
  handCount: number
}>()

const hiddenHand = computed(() => Array.from({ length: props.handCount }))
const handStackSize = useMeasuredStackSize('opponentHandStack')

function useMeasuredStackSize(templateRefName: string) {
  const element = useTemplateRef<HTMLElement>(templateRefName)
  const size = reactive<StackContainerSize>({ width: 0, height: 0 })
  let observer: ResizeObserver | null = null

  onMounted(() => {
    if (!element.value) {
      return
    }

    size.width = element.value.clientWidth
    size.height = element.value.clientHeight

    observer = new ResizeObserver(([entry]) => {
      if (!entry) {
        return
      }

      size.width = entry.contentRect.width
      size.height = entry.contentRect.height
    })
    observer.observe(element.value)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
  })

  return size
}

function stackedCardStyle(index: number, cardCount: number, size: StackContainerSize) {
  const { startPercent, offsetPercent } = getStackedCardLayout(cardCount, size.width, size.height, { centered: true })

  return {
    left: `${startPercent + index * offsetPercent}%`,
    zIndex: index + 1
  }
}
</script>

<template>
  <UTooltip
    :text="String(handCount)"
    :delay-duration="0"
    :ui="{ content: 'text-sm' }"
  >
    <div
      ref="opponentHandStack"
      class="relative h-28 w-full shrink-0 overflow-visible sm:h-32"
    >
      <DuelCard
        v-for="(_, index) in hiddenHand"
        :key="index"
        :src="cardBackRegular"
        alt="Main adverse"
        class="absolute top-0"
        :style="stackedCardStyle(index, hiddenHand.length, handStackSize)"
      />
    </div>
  </UTooltip>
</template>
