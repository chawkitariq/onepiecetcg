<script setup lang="ts">
import type { DuelPlayerView } from '@onepiecetcg/shared'
import cardBackDon from '~/assets/card-back-don.png'
import cardBackRegular from '~/assets/card-back-regular.png'
import donFront from '~/assets/don.png'
import { getStackedCardLayout } from '~/utils/cardStack'

type StackContainerSize = {
  width: number
  height: number
}

type StackedCardStyleOptions = {
  cardWidthRatio?: number
  centered?: boolean
}

const { player, side, isAdversary, revealHand, attackerId, isTargetable } = defineProps<{
  player: DuelPlayerView
  side: 0 | 1
  isAdversary?: boolean
  revealHand?: boolean
  attackerId?: string | null
  isTargetable?: boolean
}>()

const emit = defineEmits<{
  leaderClick: [side: 0 | 1]
  characterClick: [side: 0 | 1, instanceId: string]
  stageClick: [side: 0 | 1]
  handCardClick: [side: 0 | 1, instanceId: string]
  cardHover: [card: { imageUrl: string, alt?: string } | null]
}>()

const life = computed(() => Array.from({ length: player.lifeCount }))
const topTrash = computed(() => player.trash[0] ?? null)
const hiddenHand = computed(() => Array.from({ length: player.handCount }))
const costCardWidthRatio = computed(() => player.cost.some(card => card.rested) ? 1 : undefined)
const costStackSize = useMeasuredStackSize('costStack')
const handStackSize = useMeasuredStackSize('handStack')

function useMeasuredStackSize(templateRefName: string) {
  const element = useTemplateRef<HTMLElement>(templateRefName)
  const size = reactive<StackContainerSize>({
    width: 0,
    height: 0
  })
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

function stackedCardStyle(
  index: number,
  cardCount: number,
  size: StackContainerSize,
  options: StackedCardStyleOptions = {}
) {
  const { startPercent, offsetPercent } = getStackedCardLayout(
    cardCount,
    size.width,
    size.height,
    options
  )

  return {
    left: `${startPercent + index * offsetPercent}%`,
    zIndex: index + 1
  }
}

function onCardHover(imageUrl: string | null | undefined, alt?: string) {
  emit('cardHover', imageUrl ? { imageUrl, alt } : null)
}
</script>

<template>
  <div :class="`flex flex-col gap-2 h-full min-h-0 ${isAdversary ? '-scale-x-100 -scale-y-100' : ''}`">
    <div class="grid grid-cols-[min-content_1fr] grid-rows-[minmax(0,1fr)] gap-2 flex-1 min-h-0">
      <DuelZoneSlot
        label="Life"
        :count="player.lifeCount"
        :flipped="isAdversary"
        hug-card
      >
        <div class="relative h-full">
          <DuelCard
            v-for="(_, index) in life"
            :key="index"
            :src="cardBackRegular"
            alt="Vie"
            :class="index === 0 ? 'relative z-50' : 'absolute left-0 top-0'"
            :style="index > 0 ? { top: `${index * 4}%`, zIndex: 50 - index } : undefined"
          />
        </div>
      </DuelZoneSlot>
      <DuelZoneSlot
        label="Character"
        :flipped="isAdversary"
      >
        <div class="flex justify-center items-center gap-2 h-full">
          <button
            v-for="character in player.characters"
            :key="character.instanceId"
            type="button"
            class="relative h-full shrink-0"
            :class="[
              attackerId === character.instanceId ? 'ring-4 ring-primary rounded' : '',
              isTargetable && character.rested ? 'ring-4 ring-error rounded' : ''
            ]"
            @click="emit('characterClick', side, character.instanceId)"
            @mouseenter="onCardHover(character.imageUrl)"
            @mouseleave="onCardHover(null)"
          >
            <DuelCard
              :src="character.imageUrl"
              :rotated="character.rested"
            />
          </button>
        </div>
      </DuelZoneSlot>
    </div>

    <div class="grid grid-cols-[repeat(3,min-content)] grid-rows-[minmax(0,1fr)] place-content-end gap-2 flex-1 min-h-0">
      <DuelZoneSlot
        label="Leader"
        :flipped="isAdversary"
        hug-card
      >
        <button
          type="button"
          class="relative h-full w-full"
          :class="[
            attackerId === player.leader?.instanceId ? 'ring-4 ring-primary rounded' : '',
            isTargetable ? 'ring-4 ring-error rounded' : ''
          ]"
          @click="emit('leaderClick', side)"
          @mouseenter="onCardHover(player.leader?.imageUrl)"
          @mouseleave="onCardHover(null)"
        >
          <DuelCard
            v-if="player.leader"
            :src="player.leader.imageUrl"
            :rotated="player.leader.rested"
          />
        </button>
      </DuelZoneSlot>
      <DuelZoneSlot
        label="Stage"
        :flipped="isAdversary"
        hug-card
      >
        <button
          type="button"
          class="h-full w-full"
          @click="emit('stageClick', side)"
          @mouseenter="onCardHover(player.stage?.imageUrl)"
          @mouseleave="onCardHover(null)"
        >
          <DuelCard
            v-if="player.stage"
            :src="player.stage.imageUrl"
          />
        </button>
      </DuelZoneSlot>
      <DuelZoneSlot
        label="Deck"
        :count="player.deckCount"
        :flipped="isAdversary"
        hug-card
      >
        <DuelCard
          v-if="player.deckCount > 0"
          :src="cardBackRegular"
          alt="Deck"
        />
      </DuelZoneSlot>
    </div>

    <div class="grid grid-cols-[min-content_1fr_min-content] grid-rows-[minmax(0,1fr)] gap-2 flex-1 min-h-0">
      <DuelZoneSlot
        label="Don"
        :count="player.donDeckCount"
        :flipped="isAdversary"
        hug-card
      >
        <DuelCard
          v-if="player.donDeckCount > 0"
          :src="cardBackDon"
          alt="Deck DON!!"
        />
      </DuelZoneSlot>
      <DuelZoneSlot
        label="Cost"
        :flipped="isAdversary"
      >
        <div
          ref="costStack"
          class="relative h-full w-full overflow-hidden"
        >
          <DuelCard
            v-for="(don, index) in player.cost"
            :key="don.instanceId"
            :src="donFront"
            alt="DON!!"
            :rotated="don.rested"
            class="absolute top-0"
            :style="stackedCardStyle(index, player.cost.length, costStackSize, { cardWidthRatio: costCardWidthRatio })"
          />
        </div>
      </DuelZoneSlot>
      <DuelZoneSlot
        label="Trash"
        :count="player.trash.length"
        :flipped="isAdversary"
        hug-card
      >
        <div
          v-if="topTrash"
          class="h-full"
          @mouseenter="onCardHover(topTrash.imageUrl)"
          @mouseleave="onCardHover(null)"
        >
          <DuelCard :src="topTrash.imageUrl" />
        </div>
      </DuelZoneSlot>
    </div>

    <DuelZoneSlot
      label="Main"
      :count="player.handCount"
      :flipped="isAdversary"
      class="flex-1 min-h-0"
    >
      <div
        ref="handStack"
        class="relative h-full w-full overflow-hidden"
      >
        <template v-if="revealHand">
          <button
            v-for="(card, index) in player.hand"
            :key="card.instanceId"
            type="button"
            class="absolute top-0 h-full transition-transform duration-150 ease-out hover:-translate-y-4 hover:z-50 focus-visible:-translate-y-4 focus-visible:z-50"
            :style="stackedCardStyle(index, player.hand.length, handStackSize, { centered: true })"
            @click="emit('handCardClick', side, card.instanceId)"
            @mouseenter="onCardHover(card.imageUrl)"
            @mouseleave="onCardHover(null)"
          >
            <DuelCard :src="card.imageUrl" />
          </button>
        </template>
        <template v-else>
          <DuelCard
            v-for="(_, index) in hiddenHand"
            :key="index"
            :src="cardBackRegular"
            alt="Main adverse"
            class="absolute top-0"
            :style="stackedCardStyle(index, hiddenHand.length, handStackSize, { centered: true })"
          />
        </template>
      </div>
    </DuelZoneSlot>
  </div>
</template>
