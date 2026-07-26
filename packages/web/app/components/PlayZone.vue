<script setup lang="ts">
import type { DuelPlayerView, PrivateCard, PublicCard } from '@onepiecetcg/shared'
import type { TransitionGhost } from '~/utils/duelTransitions'
import type { ComponentPublicInstance } from 'vue'
import { animate } from 'animejs'
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
const ATTACHED_DON_PEEK_PX = 14

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
  selectedDonCardIds?: string[]
  draggedHandCardInstanceId?: string | null
  draggedDonCardInstanceId?: string | null
  draggedDonCardCount?: number
  canDropOnCharacterZone?: boolean
  canDropOnStageZone?: boolean
  canDropDonOnLeader?: boolean
  canDropDonOnCharacter?: boolean
  transitionGhosts?: TransitionGhost[]
  deferredBoardCardIds?: string[]
  deferredCostCardIds?: string[]
  deferredTrashCardIds?: string[]
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
  selectedDonCardIds,
  draggedHandCardInstanceId,
  draggedDonCardInstanceId,
  draggedDonCardCount,
  canDropOnCharacterZone,
  canDropOnStageZone,
  canDropDonOnLeader,
  canDropDonOnCharacter,
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
  handCardDropOnStage: [side: 0 | 1]
  donCardSelectionStart: [instanceId: string]
  donCardSelectionHover: [instanceId: string]
  donCardDragStart: [instanceId: string]
  donCardDragEnd: []
  donCardDropOnLeader: [side: 0 | 1]
  donCardDropOnCharacter: [side: 0 | 1, instanceId: string]
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
const isStageZoneDraggedOver = ref(false)
const stageZoneDragDepth = ref(0)
const isLeaderDonDraggedOver = ref(false)
const leaderDonDragDepth = ref(0)
const characterDonDragDepth = reactive<Record<string, number>>({})
const donDraggedOverCharacterIds = ref<string[]>([])
const openActionPopoverKey = ref<string | null>(null)
const leaderActionReference = ref<HTMLElement | null>(null)
const characterActionReferences = reactive<Record<string, HTMLElement | null>>({})
const ghostElements = new Map<string, HTMLElement>()

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

function attachedDonIndices(attachedDonCount: number) {
  return Array.from({ length: attachedDonCount }, (_, index) => index)
}

function attachedDonAnchorStyle(attachedDonCount: number) {
  return {
    width: `calc(58% + ${Math.max(attachedDonCount - 1, 0) * ATTACHED_DON_PEEK_PX}px)`
  }
}

function attachedDonStackStyle(index: number) {
  return {
    left: `${index * ATTACHED_DON_PEEK_PX}px`,
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

function isBoardCardDeferred(instanceId: string | null | undefined): boolean {
  if (!instanceId) {
    return false
  }

  return props.deferredBoardCardIds?.includes(instanceId) ?? false
}

function isCostCardDeferred(instanceId: string | null | undefined): boolean {
  if (!instanceId) {
    return false
  }

  return props.deferredCostCardIds?.includes(instanceId) ?? false
}

function isTrashCardDeferred(instanceId: string | null | undefined): boolean {
  if (!instanceId) {
    return false
  }

  return props.deferredTrashCardIds?.includes(instanceId) ?? false
}

function isDonCardSelected(instanceId: string): boolean {
  return selectedDonCardIds.value?.includes(instanceId) ?? false
}

const selectedDonCount = computed(() => selectedDonCardIds.value?.length ?? 0)

function shouldShowSelectedDonCount(instanceId: string): boolean {
  if (selectedDonCount.value < 2) {
    return false
  }

  return selectedDonCardIds.value?.at(-1) === instanceId
}

function isDonCardDraggable(instanceId: string): boolean {
  return Boolean(
    !isAdversary.value
    && !isCostCardDeferred(instanceId)
    && !props.player.cost.find(card => card.instanceId === instanceId)?.rested
    && (canDropDonOnLeader.value || canDropDonOnCharacter.value)
  )
}

function isCharacterDonDropTargetActive(instanceId: string): boolean {
  return Boolean(
    canDropDonOnCharacter.value
    && draggedDonCardInstanceId.value
    && donDraggedOverCharacterIds.value.includes(instanceId)
  )
}

function visibleLayoutId(instanceId: string | null | undefined, deferred: boolean): string | undefined {
  if (!instanceId || deferred) {
    return undefined
  }

  return instanceId
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

function setGhostElement(key: string, value: Element | null) {
  if (value instanceof HTMLElement) {
    ghostElements.set(key, value)
    return
  }

  ghostElements.delete(key)
}

function animateGhost(key: string) {
  if (reducedMotion.value === 'reduce') {
    return
  }

  const element = ghostElements.get(key)

  if (!element) {
    return
  }

  animate(element, {
    opacity: [1, 0],
    duration: 520,
    ease: 'outQuad'
  })
}

watch(
  () => transitionGhosts.value?.map(ghost => `${ghost.source}:${ghost.instanceId}`) ?? [],
  (current, previous) => {
    const previousKeys = new Set(previous ?? [])
    const freshKeys = current.filter(key => !previousKeys.has(key))

    if (freshKeys.length === 0) {
      return
    }

    nextTick(() => {
      for (const key of freshKeys) {
        animateGhost(key)
      }
    })
  },
  { immediate: true }
)

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
  if (!hasLeaderActionPopover()) {
    return
  }

  openActionPopoverKey.value = openActionPopoverKey.value === 'leader' ? null : 'leader'
}

function onCharacterActionTriggerClick(instanceId: string) {
  if (!hasCharacterActionPopover(instanceId)) {
    return
  }

  const key = `character:${instanceId}`
  openActionPopoverKey.value = openActionPopoverKey.value === key ? null : key
}

function resolvePopoverReference(
  value: Element | ComponentPublicInstance | null
): HTMLElement | null {
  if (!value) {
    return null
  }

  if ('$el' in value) {
    return value.$el instanceof HTMLElement ? value.$el : null
  }

  return value instanceof HTMLElement ? value : null
}

function setLeaderActionReference(value: Element | ComponentPublicInstance | null) {
  leaderActionReference.value = resolvePopoverReference(value)
}

function setCharacterActionReference(
  instanceId: string,
  value: Element | ComponentPublicInstance | null
) {
  const reference = resolvePopoverReference(value)

  if (reference) {
    characterActionReferences[instanceId] = reference
    return
  }

  characterActionReferences[instanceId] = null
}

const isCharacterZoneDropTargetActive = computed(() =>
  Boolean(
    canDropOnCharacterZone.value
    && draggedHandCardInstanceId.value
    && isCharacterZoneDraggedOver.value
  )
)

const isStageZoneDropTargetActive = computed(() =>
  Boolean(
    canDropOnStageZone.value
    && draggedHandCardInstanceId.value
    && isStageZoneDraggedOver.value
  )
)

const isLeaderDonDropTargetActive = computed(() =>
  Boolean(
    canDropDonOnLeader.value
    && draggedDonCardInstanceId.value
    && isLeaderDonDraggedOver.value
  )
)

watch(draggedHandCardInstanceId, (nextDraggedCard) => {
  if (nextDraggedCard) {
    return
  }

  isCharacterZoneDraggedOver.value = false
  characterZoneDragDepth.value = 0
  isStageZoneDraggedOver.value = false
  stageZoneDragDepth.value = 0
})

watch(draggedDonCardInstanceId, (nextDraggedCard) => {
  if (nextDraggedCard) {
    return
  }

  isLeaderDonDraggedOver.value = false
  leaderDonDragDepth.value = 0
  donDraggedOverCharacterIds.value = []

  for (const instanceId of Object.keys(characterDonDragDepth)) {
    characterDonDragDepth[instanceId] = 0
  }
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

function onStageZoneDragEnter() {
  if (!canDropOnStageZone.value || !draggedHandCardInstanceId.value) {
    return
  }

  stageZoneDragDepth.value += 1
  isStageZoneDraggedOver.value = true
}

function onStageZoneDragLeave() {
  if (!canDropOnStageZone.value || !draggedHandCardInstanceId.value) {
    return
  }

  stageZoneDragDepth.value = Math.max(0, stageZoneDragDepth.value - 1)
  isStageZoneDraggedOver.value = stageZoneDragDepth.value > 0
}

function onStageZoneDragOver(event: DragEvent) {
  if (!canDropOnStageZone.value || !draggedHandCardInstanceId.value) {
    return
  }

  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  isStageZoneDraggedOver.value = true
}

function onStageZoneDrop(event: DragEvent) {
  if (!canDropOnStageZone.value || !draggedHandCardInstanceId.value) {
    return
  }

  event.preventDefault()
  stageZoneDragDepth.value = 0
  isStageZoneDraggedOver.value = false
  emit('handCardDropOnStage', side.value)
}

function onDonCardSelectionStart(instanceId: string, event: MouseEvent) {
  if (!event.shiftKey) {
    return
  }

  if (isAdversary.value || isCostCardDeferred(instanceId)) {
    return
  }

  event.preventDefault()
  emit('donCardSelectionStart', instanceId)
}

function onDonCardSelectionHover(instanceId: string, event: MouseEvent) {
  if (!event.shiftKey) {
    return
  }

  if (isAdversary.value || isCostCardDeferred(instanceId)) {
    return
  }

  emit('donCardSelectionHover', instanceId)
}

function onDonCardDragStart(instanceId: string, event: DragEvent) {
  if (!isDonCardDraggable(instanceId)) {
    event.preventDefault()
    return
  }

  event.dataTransfer?.setData('text/plain', instanceId)
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
  emit('donCardDragStart', instanceId)
}

function onLeaderDonDragEnter() {
  if (!canDropDonOnLeader.value || !draggedDonCardInstanceId.value) {
    return
  }

  leaderDonDragDepth.value += 1
  isLeaderDonDraggedOver.value = true
}

function onLeaderDonDragLeave() {
  if (!canDropDonOnLeader.value || !draggedDonCardInstanceId.value) {
    return
  }

  leaderDonDragDepth.value = Math.max(0, leaderDonDragDepth.value - 1)
  isLeaderDonDraggedOver.value = leaderDonDragDepth.value > 0
}

function onLeaderDonDragOver(event: DragEvent) {
  if (!canDropDonOnLeader.value || !draggedDonCardInstanceId.value) {
    return
  }

  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  isLeaderDonDraggedOver.value = true
}

function onLeaderDonDrop(event: DragEvent) {
  if (!canDropDonOnLeader.value || !draggedDonCardInstanceId.value) {
    return
  }

  event.preventDefault()
  leaderDonDragDepth.value = 0
  isLeaderDonDraggedOver.value = false
  emit('donCardDropOnLeader', side.value)
}

function onCharacterDonDragEnter(instanceId: string) {
  if (!canDropDonOnCharacter.value || !draggedDonCardInstanceId.value) {
    return
  }

  characterDonDragDepth[instanceId] = (characterDonDragDepth[instanceId] ?? 0) + 1
  donDraggedOverCharacterIds.value = Array.from(new Set([...donDraggedOverCharacterIds.value, instanceId]))
}

function onCharacterDonDragLeave(instanceId: string) {
  if (!canDropDonOnCharacter.value || !draggedDonCardInstanceId.value) {
    return
  }

  const nextDepth = Math.max(0, (characterDonDragDepth[instanceId] ?? 0) - 1)
  characterDonDragDepth[instanceId] = nextDepth
  donDraggedOverCharacterIds.value = nextDepth > 0
    ? Array.from(new Set([...donDraggedOverCharacterIds.value, instanceId]))
    : donDraggedOverCharacterIds.value.filter(id => id !== instanceId)
}

function onCharacterDonDragOver(instanceId: string, event: DragEvent) {
  if (!canDropDonOnCharacter.value || !draggedDonCardInstanceId.value) {
    return
  }

  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  donDraggedOverCharacterIds.value = Array.from(new Set([...donDraggedOverCharacterIds.value, instanceId]))
}

function onCharacterDonDrop(instanceId: string, event: DragEvent) {
  if (!canDropDonOnCharacter.value || !draggedDonCardInstanceId.value) {
    return
  }

  event.preventDefault()
  characterDonDragDepth[instanceId] = 0
  donDraggedOverCharacterIds.value = donDraggedOverCharacterIds.value.filter(id => id !== instanceId)
  emit('donCardDropOnCharacter', side.value, instanceId)
}
</script>

<template>
  <div :class="`flex flex-col gap-4 h-full min-h-0 ${isAdversary ? '-scale-x-100 -scale-y-100' : ''}`">
    <div class="grid grid-cols-[min-content_1fr] grid-rows-[minmax(0,1fr)] gap-4 flex-1 min-h-0">
      <DuelZoneSlot
        label="Life"
        :flipped="isAdversary"
        hug-card
        :count="player.lifeCount"
        allow-overflow
      >
        <div
          :data-life-side="side"
          class="relative h-full"
        >
          <div
            v-for="ghost in lifeGhosts"
            :key="`${ghost.source}-${ghost.instanceId}`"
            :ref="(value: Element | null) => setGhostElement(`${ghost.source}:${ghost.instanceId}`, value)"
            :data-layout-id="ghost.instanceId"
            class="duel-zone-ghost absolute left-0 top-0 z-[60] h-full"
          >
            <DuelCard
              :src="cardBackRegular"
              alt="Vie"
            />
          </div>
          <DuelCard
            v-for="(_, index) in life"
            :key="index"
            :src="cardBackRegular"
            alt="Vie"
            class="absolute left-0 top-0"
            :data-life-top="index === 0 ? 'true' : undefined"
            :class="index === 0 ? 'z-50' : ''"
            :style="{ top: `${index * 20}px`, zIndex: 50 - index }"
          />
        </div>
      </DuelZoneSlot>
      <DuelZoneSlot
        label="Character"
        :flipped="isAdversary"
        :count="player.characters.length"
        allow-overflow
        :class="isCharacterZoneDropTargetActive ? 'border-success bg-success/5 ring-2 ring-success/70' : ''"
      >
        <div
          class="relative flex h-full items-center justify-center gap-4 transition-colors duration-150"
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
            <button
              :ref="(value: Element | ComponentPublicInstance | null) => setCharacterActionReference(character.instanceId, value)"
              type="button"
              :data-instance-id="character.instanceId"
              :data-layout-id="visibleLayoutId(character.instanceId, isBoardCardDeferred(character.instanceId))"
              data-don-attach-target="true"
              class="duel-card-shell duel-layout-card relative h-full shrink-0 overflow-visible rounded-lg"
              :class="[
                attackerId === character.instanceId ? 'ring-4 ring-primary shadow-[0_0_0_0.25rem_color-mix(in_oklab,var(--ui-primary)_18%,transparent)]' : '',
                isCharacterTargetable(character.instanceId) ? 'duel-targetable ring-4 ring-success' : '',
                isCharacterSelectable(character.instanceId) ? 'ring-4 ring-info/70' : '',
                isCharacterDonDropTargetActive(character.instanceId) ? 'bg-success/5 ring-4 ring-success/70' : '',
                isCharacterInvalid(character.instanceId) ? 'duel-invalid-target ring-4 ring-error' : '',
                isBoardCardDeferred(character.instanceId) ? 'pointer-events-none opacity-0' : '',
                isTargetable && character.rested ? 'cursor-crosshair' : '',
                isSelectable ? 'cursor-pointer' : ''
              ]"
              @click="onCharacterActionTriggerClick(character.instanceId); emit('characterClick', side, character.instanceId)"
              @dragenter="onCharacterDonDragEnter(character.instanceId)"
              @dragleave="onCharacterDonDragLeave(character.instanceId)"
              @dragover="onCharacterDonDragOver(character.instanceId, $event)"
              @drop="onCharacterDonDrop(character.instanceId, $event)"
              @mouseenter="onCardHover(character)"
              @mouseleave="onCardHover(null)"
            >
              <DuelCard
                :src="character.imageUrl"
                :rotated="character.rested"
              />
              <div
                v-if="character.attachedDon > 0"
                :data-attached-don-anchor="character.instanceId"
                class="pointer-events-none absolute left-1/2 top-[calc(100%-0.45rem)] z-20 h-[28%] w-[58%] -translate-x-1/2 overflow-visible"
                :style="attachedDonAnchorStyle(character.attachedDon)"
              >
                <div
                  v-for="index in attachedDonIndices(character.attachedDon)"
                  :key="`${character.instanceId}:attached-don:${index}`"
                  class="absolute inset-y-0 aspect-5/7"
                  :style="attachedDonStackStyle(index)"
                >
                  <DuelCard
                    :src="donFront"
                    alt="DON!! attache"
                  />
                </div>
              </div>
              <AnimatedPowerBadge
                :value="cardPower(character)"
                :mirrored="isAdversary"
              />
            </button>

            <UPopover
              v-if="hasCharacterActionPopover(character.instanceId)"
              :open="isCharacterActionPopoverOpen(character.instanceId)"
              :reference="characterActionReferences[character.instanceId] ?? undefined"
              :content="{ side: 'right', align: 'center', sideOffset: 10 }"
              :ui="{ content: 'w-52 p-2' }"
              @update:open="onCharacterActionPopoverOpenChange(character.instanceId, $event)"
            >
              <template #content>
                <div
                  class="flex flex-col gap-1"
                  data-don-selection-keepalive="true"
                >
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
          </template>
        </div>
      </DuelZoneSlot>
    </div>

    <div class="grid grid-cols-[repeat(3,min-content)] grid-rows-[minmax(0,1fr)] place-content-end gap-4 flex-1 min-h-0">
      <DuelZoneSlot
        label="Leader"
        :flipped="isAdversary"
        hug-card
        allow-overflow
      >
        <button
          :ref="setLeaderActionReference"
          type="button"
          :data-instance-id="player.leader?.instanceId"
          :data-layout-id="visibleLayoutId(player.leader?.instanceId, false)"
          data-don-attach-target="true"
          class="duel-card-shell duel-layout-card relative h-full w-full overflow-visible rounded-lg"
          :class="[
            attackerId === player.leader?.instanceId ? 'ring-4 ring-primary shadow-[0_0_0_0.25rem_color-mix(in_oklab,var(--ui-primary)_18%,transparent)]' : '',
            targetableLeader ? 'duel-targetable ring-4 ring-success cursor-crosshair' : '',
            selectableLeader ? 'ring-4 ring-info/70 cursor-pointer' : '',
            isLeaderDonDropTargetActive ? 'bg-success/5 ring-4 ring-success/70' : '',
            invalidLeaderPulse ? 'duel-invalid-target ring-4 ring-error' : ''
          ]"
          @click="onLeaderActionTriggerClick(); emit('leaderClick', side)"
          @dragenter="onLeaderDonDragEnter"
          @dragleave="onLeaderDonDragLeave"
          @dragover="onLeaderDonDragOver"
          @drop="onLeaderDonDrop"
          @mouseenter="onCardHover(player.leader)"
          @mouseleave="onCardHover(null)"
        >
          <DuelCard
            v-if="player.leader"
            :src="player.leader.imageUrl"
            :rotated="player.leader.rested"
          />
          <div
            v-if="player.leader && player.leader.attachedDon > 0"
            :data-attached-don-anchor="player.leader.instanceId"
            class="pointer-events-none absolute left-1/2 top-[calc(100%-0.45rem)] z-20 h-[28%] w-[58%] -translate-x-1/2 overflow-visible"
            :style="attachedDonAnchorStyle(player.leader.attachedDon)"
          >
            <div
              v-for="index in attachedDonIndices(player.leader.attachedDon)"
              :key="`${player.leader.instanceId}:attached-don:${index}`"
              class="absolute inset-y-0 aspect-5/7"
              :style="attachedDonStackStyle(index)"
            >
              <DuelCard
                :src="donFront"
                alt="DON!! attache"
              />
            </div>
          </div>
          <AnimatedPowerBadge
            v-if="player.leader"
            :value="cardPower(player.leader)"
            :mirrored="isAdversary"
          />
        </button>

        <UPopover
          v-if="hasLeaderActionPopover()"
          :open="isLeaderActionPopoverOpen()"
          :reference="leaderActionReference ?? undefined"
          :content="{ side: 'right', align: 'center', sideOffset: 10 }"
          :ui="{ content: 'w-52 p-2' }"
          @update:open="onLeaderActionPopoverOpenChange($event)"
        >
          <template #content>
            <div
              class="flex flex-col gap-1"
              data-don-selection-keepalive="true"
            >
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
      </DuelZoneSlot>
      <DuelZoneSlot
        label="Stage"
        :flipped="isAdversary"
        hug-card
      >
        <button
          v-if="player.stage"
          type="button"
          :data-instance-id="player.stage.instanceId"
          :data-layout-id="visibleLayoutId(player.stage.instanceId, isBoardCardDeferred(player.stage.instanceId))"
          data-drop-zone="stage"
          class="duel-card-shell duel-layout-card relative z-20 h-full w-full rounded-lg transition-colors duration-150"
          :class="[
            isStageZoneDropTargetActive ? 'bg-success/5 ring-2 ring-success/70' : '',
            isBoardCardDeferred(player.stage.instanceId) ? 'pointer-events-none opacity-0' : ''
          ]"
          @click="emit('stageClick', side)"
          @dragenter="onStageZoneDragEnter"
          @dragleave="onStageZoneDragLeave"
          @dragover="onStageZoneDragOver"
          @drop="onStageZoneDrop"
          @mouseenter="onCardHover(player.stage)"
          @mouseleave="onCardHover(null)"
        >
          <DuelCard :src="player.stage.imageUrl" />
        </button>

        <button
          v-else
          type="button"
          data-drop-zone="stage"
          class="h-full w-full rounded-lg transition-colors duration-150"
          :class="isStageZoneDropTargetActive ? 'bg-success/5 ring-2 ring-success/70' : ''"
          @click="emit('stageClick', side)"
          @dragenter="onStageZoneDragEnter"
          @dragleave="onStageZoneDragLeave"
          @dragover="onStageZoneDragOver"
          @drop="onStageZoneDrop"
          @mouseenter="onCardHover(null)"
          @mouseleave="onCardHover(null)"
        />
      </DuelZoneSlot>
      <DuelZoneSlot
        label="Deck"
        :flipped="isAdversary"
        hug-card
        :count="player.deckCount"
        allow-overflow
      >
        <div class="relative h-full">
          <div
            v-for="ghost in deckGhosts"
            :key="`${ghost.source}-${ghost.instanceId}`"
            :ref="(value: Element | null) => setGhostElement(`${ghost.source}:${ghost.instanceId}`, value)"
            :data-layout-id="ghost.instanceId"
            class="duel-zone-ghost absolute left-0 top-0 z-[60] h-full"
          >
            <DuelCard
              :src="cardBackRegular"
              alt="Deck"
            />
          </div>
          <DuelCard
            v-if="player.deckCount > 0"
            :src="cardBackRegular"
            alt="Deck"
            :data-deck-side="side"
            data-deck-top="true"
          />
        </div>
      </DuelZoneSlot>
    </div>

    <div class="grid grid-cols-[min-content_1fr_min-content] grid-rows-[minmax(0,1fr)] gap-4 flex-1 min-h-0">
      <DuelZoneSlot
        label="Don"
        :flipped="isAdversary"
        hug-card
        :count="player.donDeckCount"
        allow-overflow
      >
        <div
          :data-don-deck-side="side"
          class="relative h-full"
        >
          <div
            v-for="ghost in donDeckGhosts"
            :key="`${ghost.source}-${ghost.instanceId}`"
            :ref="(value: Element | null) => setGhostElement(`${ghost.source}:${ghost.instanceId}`, value)"
            :data-layout-id="ghost.instanceId"
            class="duel-zone-ghost absolute left-0 top-0 z-[60] h-full"
          >
            <DuelCard
              :src="cardBackDon"
              alt="Deck DON!!"
            />
          </div>
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
        :count="player.cost.length"
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
            <button
              v-for="(don, index) in untappedCostCards"
              :key="don.instanceId"
              type="button"
              draggable="true"
              :data-instance-id="don.instanceId"
              :data-layout-id="visibleLayoutId(don.instanceId, isCostCardDeferred(don.instanceId))"
              :data-zone-side="side"
              :data-don-selected="String(isDonCardSelected(don.instanceId))"
              data-cost-state="untapped"
              class="duel-layout-card absolute top-0 h-full"
              :class="[
                isCostCardDeferred(don.instanceId) ? 'pointer-events-none opacity-0' : '',
                isDonCardSelected(don.instanceId) ? 'ring-4 ring-info/70 rounded-lg' : '',
                isDonCardDraggable(don.instanceId) ? 'cursor-grab active:cursor-grabbing' : ''
              ]"
              :style="costStackStyle(index, untappedCostCards.length, 'left')"
              @mousedown="onDonCardSelectionStart(don.instanceId, $event)"
              @mouseenter="onDonCardSelectionHover(don.instanceId, $event)"
              @dragstart="onDonCardDragStart(don.instanceId, $event)"
              @dragend="emit('donCardDragEnd')"
            >
              <DuelCard
                :src="donFront"
                alt="DON!!"
              />
              <div
                v-if="shouldShowSelectedDonCount(don.instanceId)"
                data-selected-don-count
                class="pointer-events-none absolute -right-2 -top-2 z-10 flex h-7 min-w-7 items-center justify-center rounded-full bg-info px-2 text-xs font-bold text-info-foreground shadow-sm"
                :title="`${selectedDonCount} DON!! selectionnes`"
                :aria-label="`${selectedDonCount} DON!! selectionnes`"
              >
                {{ selectedDonCount }}
              </div>
              <span
                v-if="draggedDonCardInstanceId === don.instanceId && (draggedDonCardCount ?? 0) > 1"
                class="pointer-events-none absolute -right-2 -top-2 z-10 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground"
              >
                x{{ draggedDonCardCount }}
              </span>
            </button>
          </div>
          <div
            data-cost-stack="rested"
            class="absolute inset-y-0 right-0"
            :class="isCostStackSplit ? 'w-1/2' : 'w-full'"
          >
            <div
              v-for="(don, index) in restedCostCards"
              :key="don.instanceId"
              :data-instance-id="don.instanceId"
              :data-layout-id="visibleLayoutId(don.instanceId, isCostCardDeferred(don.instanceId))"
              :data-zone-side="side"
              data-cost-state="rested"
              class="duel-layout-card absolute top-0 h-full"
              :class="isCostCardDeferred(don.instanceId) ? 'pointer-events-none opacity-0' : ''"
              :style="costStackStyle(index, restedCostCards.length, 'right', 1)"
            >
              <DuelCard
                :src="donFront"
                alt="DON!!"
                :rotated="true"
              />
            </div>
          </div>
        </div>
      </DuelZoneSlot>
      <DuelZoneSlot
        label="Trash"
        :flipped="isAdversary"
        hug-card
        :count="player.trash.length"
        allow-overflow
      >
        <div
          :data-trash-side="side"
          class="relative h-full"
        >
          <div
            v-if="topTrash"
            class="h-full"
            @mouseenter="onCardHover(topTrash)"
            @mouseleave="onCardHover(null)"
          >
            <div
              :data-layout-id="visibleLayoutId(topTrash.instanceId, isTrashCardDeferred(topTrash.instanceId))"
              :data-instance-id="topTrash.instanceId"
              class="duel-layout-card h-full"
              :class="isTrashCardDeferred(topTrash.instanceId) ? 'pointer-events-none opacity-0' : ''"
            >
              <DuelCard :src="topTrash.imageUrl" />
            </div>
          </div>
        </div>
      </DuelZoneSlot>
    </div>
  </div>
</template>

<style scoped>
.duel-layout-card {
  transition:
    left 520ms ease-in-out,
    right 520ms ease-in-out,
    top 520ms ease-in-out,
    transform 520ms ease-in-out,
    opacity 180ms ease-out,
    box-shadow 180ms ease-out,
    filter 180ms ease-out;
}

.duel-zone-ghost {
  will-change: opacity;
}

@media (prefers-reduced-motion: reduce) {
  .duel-layout-card {
    transition-duration: 0ms !important;
  }
}
</style>
