<script setup lang="ts">
import type { DuelPlayerView } from '@onepiecetcg/shared'
import type { TransitionGhost } from '~/utils/duelTransitions'
import { AnimatePresence, LayoutGroup, motion } from 'motion-v'
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

const props = defineProps<{
  player: DuelPlayerView
  side: 0 | 1
  isAdversary?: boolean
  revealHand?: boolean
  attackerId?: string | null
  isTargetable?: boolean
  isSelectable?: boolean
  targetableLeader?: boolean
  targetableCharacterIds?: string[]
  selectableLeader?: boolean
  selectableCharacterIds?: string[]
  invalidLeaderPulse?: boolean
  invalidCharacterIds?: string[]
  transitionGhosts?: TransitionGhost[]
  revealedHandCardIds?: string[]
}>()
const {
  player,
  side,
  isAdversary,
  revealHand,
  attackerId,
  isTargetable,
  isSelectable,
  targetableLeader,
  selectableLeader,
  invalidLeaderPulse,
  transitionGhosts,
  revealedHandCardIds
} = toRefs(props)

function cardPower(card: { power: number | null, attachedDon: number }): number | null {
  if (card.power === null) {
    return null
  }

  return card.power + card.attachedDon * 1000
}

const emit = defineEmits<{
  leaderClick: [side: 0 | 1]
  characterClick: [side: 0 | 1, instanceId: string]
  stageClick: [side: 0 | 1]
  handCardClick: [side: 0 | 1, instanceId: string]
  cardHover: [card: { imageUrl: string, alt?: string } | null]
}>()

const life = computed(() => Array.from({ length: props.player.lifeCount }))
const topTrash = computed(() => props.player.trash[0] ?? null)
const hiddenHand = computed(() => Array.from({ length: props.player.handCount }))
const costCardWidthRatio = computed(() => props.player.cost.some(card => card.rested) ? 1 : undefined)
const costStackSize = useMeasuredStackSize('costStack')
const handStackSize = useMeasuredStackSize('handStack')
const lifeGhosts = computed(() => transitionGhosts.value?.filter(ghost => ghost.source === 'life') ?? [])
const deckGhosts = computed(() => transitionGhosts.value?.filter(ghost => ghost.source === 'deck') ?? [])
const donDeckGhosts = computed(() => transitionGhosts.value?.filter(ghost => ghost.source === 'donDeck') ?? [])
const reducedMotion = usePreferredReducedMotion()

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

function isCharacterTargetable(instanceId: string): boolean {
  return props.targetableCharacterIds?.includes(instanceId) ?? false
}

function isCharacterSelectable(instanceId: string): boolean {
  return props.selectableCharacterIds?.includes(instanceId) ?? false
}

function isCharacterInvalid(instanceId: string): boolean {
  return props.invalidCharacterIds?.includes(instanceId) ?? false
}

function isRevealedHandCard(instanceId: string): boolean {
  return revealedHandCardIds.value?.includes(instanceId) ?? false
}

function handRevealAnimation(instanceId: string) {
  if (!isRevealedHandCard(instanceId) || reducedMotion.value === 'reduce') {
    return undefined
  }

  return {
    rotateY: [90, 0],
    scale: [0.94, 1],
    filter: ['brightness(1.16)', 'brightness(1)']
  }
}
</script>

<template>
  <LayoutGroup :id="`play-zone-${player.sessionId}`">
    <div :class="`flex flex-col gap-2 h-full min-h-0 ${isAdversary ? '-scale-x-100 -scale-y-100' : ''}`">
      <div class="grid grid-cols-[min-content_1fr] grid-rows-[minmax(0,1fr)] gap-2 flex-1 min-h-0">
        <DuelZoneSlot
          label="Life"
          :count="player.lifeCount"
          :flipped="isAdversary"
          hug-card
        >
          <div class="relative h-full">
            <AnimatePresence>
              <motion.div
                v-for="ghost in lifeGhosts"
                :key="`${ghost.source}-${ghost.instanceId}`"
                :layout-id="ghost.instanceId"
                class="absolute left-0 top-0 z-[60] h-full"
                :initial="reducedMotion === 'reduce' ? false : { opacity: 1, scale: 1 }"
                :exit="reducedMotion === 'reduce' ? undefined : { opacity: 0 }"
                :transition="{ duration: 0.22, ease: 'easeOut' }"
              >
                <DuelCard
                  :src="cardBackRegular"
                  alt="Vie"
                />
              </motion.div>
            </AnimatePresence>
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
            <motion.button
              v-for="character in player.characters"
              :key="character.instanceId"
              type="button"
              layout
              :layout-id="character.instanceId"
              :initial="false"
              :transition="{ duration: 0.22, ease: 'easeOut' }"
              class="duel-card-shell relative h-full shrink-0 rounded-lg"
              :class="[
                attackerId === character.instanceId ? 'ring-4 ring-primary shadow-[0_0_0_0.25rem_color-mix(in_oklab,var(--ui-primary)_18%,transparent)]' : '',
                isCharacterTargetable(character.instanceId) ? 'duel-targetable ring-4 ring-success' : '',
                isCharacterSelectable(character.instanceId) ? 'ring-4 ring-info/70' : '',
                isCharacterInvalid(character.instanceId) ? 'duel-invalid-target ring-4 ring-error' : '',
                isTargetable && character.rested ? 'cursor-crosshair' : '',
                isSelectable ? 'cursor-pointer' : ''
              ]"
              @click="emit('characterClick', side, character.instanceId)"
              @mouseenter="onCardHover(character.imageUrl)"
              @mouseleave="onCardHover(null)"
            >
              <DuelCard
                :src="character.imageUrl"
                :rotated="character.rested"
              />
              <AnimatedPowerBadge
                :value="cardPower(character)"
                :mirrored="isAdversary"
              />
            </motion.button>
          </div>
        </DuelZoneSlot>
      </div>

      <div class="grid grid-cols-[repeat(3,min-content)] grid-rows-[minmax(0,1fr)] place-content-end gap-2 flex-1 min-h-0">
        <DuelZoneSlot
          label="Leader"
          :flipped="isAdversary"
          hug-card
          allow-overflow
        >
          <motion.button
            type="button"
            layout
            :layout-id="player.leader?.instanceId"
            :initial="false"
            :transition="{ duration: 0.22, ease: 'easeOut' }"
            class="duel-card-shell relative h-full w-full rounded-lg"
            :class="[
              attackerId === player.leader?.instanceId ? 'ring-4 ring-primary shadow-[0_0_0_0.25rem_color-mix(in_oklab,var(--ui-primary)_18%,transparent)]' : '',
              targetableLeader ? 'duel-targetable ring-4 ring-success cursor-crosshair' : '',
              selectableLeader ? 'ring-4 ring-info/70 cursor-pointer' : '',
              invalidLeaderPulse ? 'duel-invalid-target ring-4 ring-error' : ''
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
            <AnimatedPowerBadge
              v-if="player.leader"
              :value="cardPower(player.leader)"
              :mirrored="isAdversary"
            />
          </motion.button>
        </DuelZoneSlot>
        <DuelZoneSlot
          label="Stage"
          :flipped="isAdversary"
          hug-card
        >
          <motion.button
            type="button"
            layout
            :layout-id="player.stage?.instanceId"
            :initial="false"
            :transition="{ duration: 0.22, ease: 'easeOut' }"
            class="h-full w-full"
            @click="emit('stageClick', side)"
            @mouseenter="onCardHover(player.stage?.imageUrl)"
            @mouseleave="onCardHover(null)"
          >
            <DuelCard
              v-if="player.stage"
              :src="player.stage.imageUrl"
            />
          </motion.button>
        </DuelZoneSlot>
        <DuelZoneSlot
          label="Deck"
          :count="player.deckCount"
          :flipped="isAdversary"
          hug-card
        >
          <div class="relative h-full">
            <AnimatePresence>
              <motion.div
                v-for="ghost in deckGhosts"
                :key="`${ghost.source}-${ghost.instanceId}`"
                :layout-id="ghost.instanceId"
                class="absolute left-0 top-0 z-[60] h-full"
                :initial="reducedMotion === 'reduce' ? false : { opacity: 1, scale: 1 }"
                :exit="reducedMotion === 'reduce' ? undefined : { opacity: 0 }"
                :transition="{ duration: 0.22, ease: 'easeOut' }"
              >
                <DuelCard
                  :src="cardBackRegular"
                  alt="Deck"
                />
              </motion.div>
            </AnimatePresence>
            <DuelCard
              v-if="player.deckCount > 0"
              :src="cardBackRegular"
              alt="Deck"
            />
          </div>
        </DuelZoneSlot>
      </div>

      <div class="grid grid-cols-[min-content_1fr_min-content] grid-rows-[minmax(0,1fr)] gap-2 flex-1 min-h-0">
        <DuelZoneSlot
          label="Don"
          :count="player.donDeckCount"
          :flipped="isAdversary"
          hug-card
        >
          <div class="relative h-full">
            <AnimatePresence>
              <motion.div
                v-for="ghost in donDeckGhosts"
                :key="`${ghost.source}-${ghost.instanceId}`"
                :layout-id="ghost.instanceId"
                class="absolute left-0 top-0 z-[60] h-full"
                :initial="reducedMotion === 'reduce' ? false : { opacity: 1, scale: 1 }"
                :exit="reducedMotion === 'reduce' ? undefined : { opacity: 0 }"
                :transition="{ duration: 0.22, ease: 'easeOut' }"
              >
                <DuelCard
                  :src="cardBackDon"
                  alt="Deck DON!!"
                />
              </motion.div>
            </AnimatePresence>
            <DuelCard
              v-if="player.donDeckCount > 0"
              :src="cardBackDon"
              alt="Deck DON!!"
            />
          </div>
        </DuelZoneSlot>
        <DuelZoneSlot
          label="Cost"
          :flipped="isAdversary"
        >
          <div
            ref="costStack"
            class="relative h-full w-full overflow-hidden"
          >
            <motion.div
              v-for="(don, index) in player.cost"
              :key="don.instanceId"
              layout
              :layout-id="don.instanceId"
              class="absolute top-0 h-full"
              :style="stackedCardStyle(index, player.cost.length, costStackSize, { cardWidthRatio: costCardWidthRatio })"
              :initial="false"
              :transition="{ duration: 0.22, ease: 'easeOut' }"
            >
              <DuelCard
                :src="donFront"
                alt="DON!!"
                :rotated="don.rested"
              />
            </motion.div>
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
            <motion.div
              layout
              :layout-id="topTrash.instanceId"
              :initial="false"
              :transition="{ duration: 0.22, ease: 'easeOut' }"
              class="h-full"
            >
              <DuelCard :src="topTrash.imageUrl" />
            </motion.div>
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
            <motion.button
              v-for="(card, index) in player.hand"
              :key="card.instanceId"
              type="button"
              layout
              :layout-id="card.instanceId"
              :initial="false"
              :animate="handRevealAnimation(card.instanceId)"
              :transition="{ duration: 0.22, ease: 'easeOut' }"
              class="absolute top-0 h-full transition-transform duration-150 ease-out hover:-translate-y-4 hover:z-50 focus-visible:-translate-y-4 focus-visible:z-50"
              :style="stackedCardStyle(index, player.hand.length, handStackSize, { centered: true })"
              @click="emit('handCardClick', side, card.instanceId)"
              @mouseenter="onCardHover(card.imageUrl)"
              @mouseleave="onCardHover(null)"
            >
              <DuelCard :src="card.imageUrl" />
            </motion.button>
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
  </LayoutGroup>
</template>
