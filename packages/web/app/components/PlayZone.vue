<script setup lang="ts">
import type { DuelPlayerView, PrivateCard, PublicCard } from '@onepiecetcg/shared'
import type { TransitionGhost } from '~/utils/duelTransitions'
import { AnimatePresence, motion } from 'motion-v'
import cardBackDon from '~/assets/card-back-don.png'
import cardBackRegular from '~/assets/card-back-regular.png'
import donFront from '~/assets/don.png'

type StackContainerSize = {
  width: number
  height: number
}

const COST_STACK_PEEK_PX = 18
const FALLBACK_COST_STACK_WIDTH_PX = 240
const FALLBACK_COST_STACK_HEIGHT_PX = 112
const FALLBACK_COST_CARD_WIDTH_PX = 80

type CharacterActionPopoverItem = {
  label: string
  icon?: string
  disabled?: boolean
  onSelect: () => void
}

type LeaderActionPopoverItem = {
  label: string
  icon?: string
  disabled?: boolean
  onSelect: () => void
}

type HoveredDuelCard = Pick<PublicCard, 'number' | 'name' | 'type' | 'colors' | 'cost' | 'power' | 'life' | 'counter' | 'imageUrl'>
  & Partial<Pick<PrivateCard, 'text' | 'trigger'>>

const props = defineProps<{
  player: DuelPlayerView
  side: 0 | 1
  isOwnerTurn?: boolean
  isAdversary?: boolean
  attackerId?: string | null
  isTargetable?: boolean
  isSelectable?: boolean
  targetableLeader?: boolean
  targetableCharacterIds?: string[]
  selectableLeader?: boolean
  selectableCharacterIds?: string[]
  leaderActionPopoverItems?: LeaderActionPopoverItem[]
  characterActionPopoverItems?: Record<string, CharacterActionPopoverItem[]>
  invalidLeaderPulse?: boolean
  invalidCharacterIds?: string[]
  draggedHandCardInstanceId?: string | null
  canDropOnCharacterZone?: boolean
  transitionGhosts?: TransitionGhost[]
}>()
const {
  player,
  side,
  isAdversary,
  attackerId,
  isTargetable,
  isSelectable,
  targetableLeader,
  selectableLeader,
  invalidLeaderPulse,
  draggedHandCardInstanceId,
  canDropOnCharacterZone,
  transitionGhosts
} = toRefs(props)

/**
 * DON!! attached to a Leader/Character only grants +1000 power "during your
 * turn" (docs/rule_comprehensive.md 6-5-5-2) -- mirrors the server-side
 * ownerSessionId === activePlayerSessionId gate in duel.room.ts cardPower().
 */
function cardPower(card: { power: number | null, attachedDon: number }): number | null {
  if (card.power === null) {
    return null
  }

  const donBonus = props.isOwnerTurn ? card.attachedDon * 1000 : 0

  return card.power + donBonus
}

const emit = defineEmits<{
  leaderClick: [side: 0 | 1]
  characterClick: [side: 0 | 1, instanceId: string]
  stageClick: [side: 0 | 1]
  handCardDropOnCharacters: [side: 0 | 1]
  cardHover: [card: HoveredDuelCard | null]
}>()

const life = computed(() => Array.from({ length: props.player.lifeCount }))
const topTrash = computed(() => props.player.trash[0] ?? null)
const costStackSize = useMeasuredStackSize('costStack')
const lifeGhosts = computed(() => transitionGhosts.value?.filter(ghost => ghost.source === 'life') ?? [])
const deckGhosts = computed(() => transitionGhosts.value?.filter(ghost => ghost.source === 'deck') ?? [])
const donDeckGhosts = computed(() => transitionGhosts.value?.filter(ghost => ghost.source === 'donDeck') ?? [])
const untappedCostCards = computed(() => props.player.cost.filter(card => !card.rested))
const restedCostCards = computed(() => props.player.cost.filter(card => card.rested))
const isCostStackSplit = computed(() => untappedCostCards.value.length > 0 && restedCostCards.value.length > 0)
const reducedMotion = usePreferredReducedMotion()
const isCharacterZoneDraggedOver = ref(false)
const characterZoneDragDepth = ref(0)
const openActionPopoverKey = ref<string | null>(null)

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

function costStackAreaSize() {
  const size: StackContainerSize = {
    width: isCostStackSplit.value
      ? Math.max((costStackSize.width || FALLBACK_COST_STACK_WIDTH_PX) / 2, 0)
      : (costStackSize.width || FALLBACK_COST_STACK_WIDTH_PX),
    height: costStackSize.height || FALLBACK_COST_STACK_HEIGHT_PX
  }

  return size
}

function costStackStartOffset(cardCount: number, size: StackContainerSize, cardWidthRatio?: number) {
  const ratio = cardWidthRatio ?? 5 / 7
  const cardWidth = (size.height || FALLBACK_COST_STACK_HEIGHT_PX) * ratio || FALLBACK_COST_CARD_WIDTH_PX
  const stackWidth = cardWidth + Math.max(cardCount - 1, 0) * COST_STACK_PEEK_PX

  return (size.width - stackWidth) / 2
}

function costStackStyle(
  index: number,
  cardCount: number,
  direction: 'left' | 'right',
  cardWidthRatio?: number
) {
  const size = costStackAreaSize()
  const startOffset = costStackStartOffset(cardCount, size, cardWidthRatio)
  const offset = size.width > 0
    ? ((startOffset + index * COST_STACK_PEEK_PX) / size.width) * 100
    : 0

  return {
    [direction]: `${offset}%`,
    zIndex: index + 1
  }
}

function onCardHover(card: PublicCard | PrivateCard | null | undefined) {
  if (!card) {
    emit('cardHover', null)
    return
  }

  emit('cardHover', {
    number: card.number,
    name: card.name,
    type: card.type,
    colors: card.colors,
    cost: card.cost,
    power: card.power,
    life: card.life,
    counter: card.counter,
    imageUrl: card.imageUrl,
    text: 'text' in card ? card.text : undefined,
    trigger: 'trigger' in card ? card.trigger : undefined
  })
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

function getLeaderActionPopoverItems(): LeaderActionPopoverItem[] {
  return props.leaderActionPopoverItems ?? []
}

function hasLeaderActionPopover(): boolean {
  return getLeaderActionPopoverItems().length > 0
}

function getCharacterActionPopoverItems(instanceId: string): CharacterActionPopoverItem[] {
  return props.characterActionPopoverItems?.[instanceId] ?? []
}

function hasCharacterActionPopover(instanceId: string): boolean {
  return getCharacterActionPopoverItems(instanceId).length > 0
}

function isLeaderActionPopoverOpen(): boolean {
  return openActionPopoverKey.value === 'leader'
}

function isCharacterActionPopoverOpen(instanceId: string): boolean {
  return openActionPopoverKey.value === `character:${instanceId}`
}

function onLeaderActionPopoverOpenChange(open: boolean) {
  openActionPopoverKey.value = open ? 'leader' : (openActionPopoverKey.value === 'leader' ? null : openActionPopoverKey.value)
}

function onCharacterActionPopoverOpenChange(instanceId: string, open: boolean) {
  const key = `character:${instanceId}`
  openActionPopoverKey.value = open
    ? key
    : (openActionPopoverKey.value === key ? null : openActionPopoverKey.value)
}

function onLeaderActionTriggerClick() {
  if (hasLeaderActionPopover() && openActionPopoverKey.value && openActionPopoverKey.value !== 'leader') {
    openActionPopoverKey.value = 'leader'
  }
}

function onCharacterActionTriggerClick(instanceId: string) {
  if (
    hasCharacterActionPopover(instanceId)
    && openActionPopoverKey.value
    && openActionPopoverKey.value !== `character:${instanceId}`
  ) {
    openActionPopoverKey.value = `character:${instanceId}`
  }
}

const isCharacterZoneDropTargetActive = computed(() =>
  Boolean(
    canDropOnCharacterZone.value
    && draggedHandCardInstanceId.value
    && isCharacterZoneDraggedOver.value
  )
)

watch(draggedHandCardInstanceId, (nextDraggedCard) => {
  if (nextDraggedCard) {
    return
  }

  isCharacterZoneDraggedOver.value = false
  characterZoneDragDepth.value = 0
})

watch(() => props.characterActionPopoverItems, (nextItems) => {
  if (!openActionPopoverKey.value?.startsWith('character:')) {
    return
  }

  const instanceId = openActionPopoverKey.value.replace('character:', '')

  if (!nextItems?.[instanceId]?.length) {
    openActionPopoverKey.value = null
  }
}, { deep: true })

watch(() => props.leaderActionPopoverItems, (nextItems) => {
  if (openActionPopoverKey.value !== 'leader') {
    return
  }

  if (!nextItems?.length) {
    openActionPopoverKey.value = null
  }
}, { deep: true })

function onCharacterZoneDragEnter() {
  if (!canDropOnCharacterZone.value || !draggedHandCardInstanceId.value) {
    return
  }

  characterZoneDragDepth.value += 1
  isCharacterZoneDraggedOver.value = true
}

function onCharacterZoneDragLeave() {
  if (!canDropOnCharacterZone.value || !draggedHandCardInstanceId.value) {
    return
  }

  characterZoneDragDepth.value = Math.max(0, characterZoneDragDepth.value - 1)
  isCharacterZoneDraggedOver.value = characterZoneDragDepth.value > 0
}

function onCharacterZoneDragOver(event: DragEvent) {
  if (!canDropOnCharacterZone.value || !draggedHandCardInstanceId.value) {
    return
  }

  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  isCharacterZoneDraggedOver.value = true
}

function onCharacterZoneDrop(event: DragEvent) {
  if (!canDropOnCharacterZone.value || !draggedHandCardInstanceId.value) {
    return
  }

  event.preventDefault()
  characterZoneDragDepth.value = 0
  isCharacterZoneDraggedOver.value = false
  emit('handCardDropOnCharacters', side.value)
}
</script>

<template>
  <div :class="`flex flex-col gap-2 h-full min-h-0 ${isAdversary ? '-scale-x-100 -scale-y-100' : ''}`">
    <div class="grid grid-cols-[min-content_1fr] grid-rows-[minmax(0,1fr)] gap-2 flex-1 min-h-0">
      <DuelZoneSlot
        label="Life"
        :flipped="isAdversary"
        hug-card
        allow-overflow
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
            class="absolute left-0 top-0"
            :class="index === 0 ? 'z-50' : ''"
            :style="{ top: `${index * 20}px`, zIndex: 50 - index }"
          />
          <UBadge
            color="neutral"
            variant="solid"
            size="sm"
            class="absolute right-1 top-1 z-70"
            :class="isAdversary ? '-scale-x-100 -scale-y-100' : ''"
          >
            {{ player.lifeCount }}
          </UBadge>
        </div>
      </DuelZoneSlot>
      <DuelZoneSlot
        label="Character"
        :flipped="isAdversary"
        allow-overflow
        :class="isCharacterZoneDropTargetActive ? 'border-success bg-success/5 ring-2 ring-success/70' : ''"
      >
        <div
          class="relative flex h-full items-center justify-center gap-2 transition-colors duration-150"
          data-drop-zone="character"
          @dragenter="onCharacterZoneDragEnter"
          @dragleave="onCharacterZoneDragLeave"
          @dragover="onCharacterZoneDragOver"
          @drop="onCharacterZoneDrop"
        >
          <template
            v-for="character in player.characters"
            :key="character.instanceId"
          >
            <UPopover
              v-if="hasCharacterActionPopover(character.instanceId)"
              :open="isCharacterActionPopoverOpen(character.instanceId)"
              :content="{ side: 'right', align: 'center', sideOffset: 10 }"
              :ui="{ content: 'w-52 p-2' }"
              @update:open="onCharacterActionPopoverOpenChange(character.instanceId, $event)"
            >
              <motion.button
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
                  isSelectable ? 'cursor-pointer' : 'cursor-pointer'
                ]"
                @click="onCharacterActionTriggerClick(character.instanceId); emit('characterClick', side, character.instanceId)"
                @mouseenter="onCardHover(character)"
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

              <template #content>
                <div class="flex flex-col gap-1">
                  <UButton
                    v-for="action in getCharacterActionPopoverItems(character.instanceId)"
                    :key="action.label"
                    size="sm"
                    color="neutral"
                    variant="ghost"
                    block
                    :disabled="action.disabled"
                    @click="action.onSelect()"
                  >
                    <template
                      v-if="action.icon"
                      #leading
                    >
                      <UIcon :name="action.icon" />
                    </template>
                    {{ action.label }}
                  </UButton>
                </div>
              </template>
            </UPopover>

            <motion.button
              v-else
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
              @mouseenter="onCardHover(character)"
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
          </template>
          <UBadge
            color="neutral"
            variant="solid"
            size="sm"
            class="absolute right-1 top-1 z-70"
            :class="isAdversary ? '-scale-x-100 -scale-y-100' : ''"
          >
            {{ player.characters.length }}
          </UBadge>
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
        <UPopover
          v-if="hasLeaderActionPopover()"
          :open="isLeaderActionPopoverOpen()"
          :content="{ side: 'right', align: 'center', sideOffset: 10 }"
          :ui="{ content: 'w-52 p-2' }"
          @update:open="onLeaderActionPopoverOpenChange($event)"
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
            @click="onLeaderActionTriggerClick(); emit('leaderClick', side)"
            @mouseenter="onCardHover(player.leader)"
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

          <template #content>
            <div class="flex flex-col gap-1">
              <UButton
                v-for="action in getLeaderActionPopoverItems()"
                :key="action.label"
                size="sm"
                color="neutral"
                variant="ghost"
                block
                :disabled="action.disabled"
                @click="action.onSelect()"
              >
                <template
                  v-if="action.icon"
                  #leading
                >
                  <UIcon :name="action.icon" />
                </template>
                {{ action.label }}
              </UButton>
            </div>
          </template>
        </UPopover>

        <motion.button
          v-else
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
          @mouseenter="onCardHover(player.leader)"
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
          @mouseenter="onCardHover(player.stage)"
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
        :flipped="isAdversary"
        hug-card
        allow-overflow
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
          <UBadge
            color="neutral"
            variant="solid"
            size="sm"
            class="absolute right-1 top-1 z-70"
            :class="isAdversary ? '-scale-x-100 -scale-y-100' : ''"
          >
            {{ player.deckCount }}
          </UBadge>
        </div>
      </DuelZoneSlot>
    </div>

    <div class="grid grid-cols-[min-content_1fr_min-content] grid-rows-[minmax(0,1fr)] gap-2 flex-1 min-h-0">
      <DuelZoneSlot
        label="Don"
        :flipped="isAdversary"
        hug-card
        allow-overflow
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
          <UBadge
            color="neutral"
            variant="solid"
            size="sm"
            class="absolute right-1 top-1 z-70"
            :class="isAdversary ? '-scale-x-100 -scale-y-100' : ''"
          >
            {{ player.donDeckCount }}
          </UBadge>
        </div>
      </DuelZoneSlot>
      <DuelZoneSlot
        label="Cost"
        :flipped="isAdversary"
        allow-overflow
      >
        <div
          ref="costStack"
          class="relative h-full w-full overflow-visible"
        >
          <div
            data-cost-stack="untapped"
            class="absolute inset-y-0 left-0"
            :class="isCostStackSplit ? 'w-1/2' : 'w-full'"
          >
            <motion.div
              v-for="(don, index) in untappedCostCards"
              :key="don.instanceId"
              layout
              :layout-id="don.instanceId"
              data-cost-state="untapped"
              class="absolute top-0 h-full"
              :style="costStackStyle(index, untappedCostCards.length, 'left')"
              :initial="false"
              :transition="{ duration: 0.22, ease: 'easeOut' }"
            >
              <DuelCard
                :src="donFront"
                alt="DON!!"
              />
            </motion.div>
          </div>
          <div
            data-cost-stack="rested"
            class="absolute inset-y-0 right-0"
            :class="isCostStackSplit ? 'w-1/2' : 'w-full'"
          >
            <motion.div
              v-for="(don, index) in restedCostCards"
              :key="don.instanceId"
              layout
              :layout-id="don.instanceId"
              data-cost-state="rested"
              class="absolute top-0 h-full"
              :style="costStackStyle(index, restedCostCards.length, 'right', 1)"
              :initial="false"
              :transition="{ duration: 0.22, ease: 'easeOut' }"
            >
              <DuelCard
                :src="donFront"
                alt="DON!!"
                :rotated="true"
              />
            </motion.div>
          </div>
          <UBadge
            color="neutral"
            variant="solid"
            size="sm"
            class="absolute right-1 top-1 z-70"
            :class="isAdversary ? '-scale-x-100 -scale-y-100' : ''"
          >
            {{ player.cost.length }}
          </UBadge>
        </div>
      </DuelZoneSlot>
      <DuelZoneSlot
        label="Trash"
        :flipped="isAdversary"
        hug-card
        allow-overflow
      >
        <div class="relative h-full">
          <div
            v-if="topTrash"
            class="h-full"
            @mouseenter="onCardHover(topTrash)"
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
          <UBadge
            color="neutral"
            variant="solid"
            size="sm"
            class="absolute right-1 top-1 z-70"
            :class="isAdversary ? '-scale-x-100 -scale-y-100' : ''"
          >
            {{ player.trash.length }}
          </UBadge>
        </div>
      </DuelZoneSlot>
    </div>
  </div>
</template>
