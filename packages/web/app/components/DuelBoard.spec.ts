import type { DuelPlayerView, PrivateCard, PublicCard } from '@onepiecetcg/shared'
import { mount } from '@vue/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { computed, defineComponent, h, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DuelBoard from './DuelBoard.vue'

const playCard = vi.fn()
const endPhase = vi.fn()
const attachDon = vi.fn()
const clearError = vi.fn()
const declareAttack = vi.fn()
const declareBlock = vi.fn()
const declareCounter = vi.fn()
const finishCounterStep = vi.fn()
const resolveTrigger = vi.fn()

const phase = ref('main')
const isSelfTurn = ref(true)
const isCombatInProgress = ref(false)
const canDeclareAttack = ref(false)
const reducedMotion = ref<'reduce' | 'no-preference'>('no-preference')
const self = ref<DuelPlayerView | null>(null)
const opponent = ref<DuelPlayerView | null>(null)
const logs = ref<Array<{ id: string, message: string, createdAt: string }>>([])
const errorMessage = ref<string | null>(null)
const combat = ref<{
  attackerSessionId: string
  attackerInstanceId: string
  defenderSessionId: string
  targetType: 'leader' | 'character'
  targetInstanceId?: string
  blockerInstanceId?: string
  step: 'declared' | 'blocked' | 'countering' | 'resolving' | 'resolved'
  counterPowerBonus: number
  awaitingTriggerDecision: boolean
} | null>(null)

function createPublicCard(instanceId: string, overrides: Partial<PublicCard> = {}): PublicCard {
  return {
    instanceId,
    cardId: instanceId,
    number: instanceId,
    name: instanceId,
    type: 'Character',
    colors: ['Red'],
    cost: 1,
    power: 1000,
    life: null,
    counter: 1000,
    imageUrl: `/cards/${instanceId}.png`,
    rested: false,
    attachedDon: 0,
    playedThisTurn: false,
    ...overrides
  }
}

function createPrivateCard(instanceId: string, overrides: Partial<PrivateCard> = {}): PrivateCard {
  return {
    ...createPublicCard(instanceId, overrides),
    text: '',
    trigger: null,
    ...overrides
  }
}

function createPlayer(sessionId: string, overrides: Partial<DuelPlayerView> = {}): DuelPlayerView {
  return {
    sessionId,
    displayName: sessionId,
    deckId: `${sessionId}-deck`,
    ready: true,
    connected: true,
    mulliganDecided: true,
    hasTakenFirstTurn: true,
    leader: createPublicCard(`${sessionId}-leader`, { type: 'Leader', power: 5000 }),
    stage: null,
    characters: [],
    cost: [createPublicCard(`${sessionId}-don-1`, { type: 'DON!!', cost: null, power: null, counter: null })],
    trash: [],
    donDeckCount: 10,
    hand: [
      createPrivateCard('hand-character', { type: 'Character', cost: 1 }),
      createPrivateCard('hand-stage', { type: 'Stage', cost: 1, power: null, counter: null }),
      createPrivateCard('hand-event', { type: 'Event', cost: 1, power: null, counter: null })
    ],
    handCount: 3,
    deck: [],
    deckCount: 30,
    life: [],
    lifeCount: 4,
    ...overrides
  }
}

const leave = vi.fn()
const confirm = vi.fn()

mockNuxtImport('useColyseus', () => () => ({
  status: ref('connected'),
  leave
}))

mockNuxtImport('useConfirmDialog', () => () => ({
  confirm
}))

mockNuxtImport('navigateTo', () => vi.fn())
mockNuxtImport('usePreferredReducedMotion', () => () => reducedMotion)

mockNuxtImport('useDuelRoom', () => () => ({
  self,
  opponent,
  phase,
  isSelfTurn,
  isMainPhase: computed(() => phase.value === 'main'),
  canEndPhase: computed(() => isSelfTurn.value),
  selfUntappedDonCount: computed(() => self.value?.cost.filter(card => !card.rested).length ?? 0),
  isSelfCharacterZoneFull: computed(() => (self.value?.characters.length ?? 0) >= 5),
  logs,
  errorMessage,
  endPhase,
  playCard,
  attachDon,
  clearError,
  combat,
  isCombatInProgress: computed(() => isCombatInProgress.value),
  isSelfAttacker: computed(() => false),
  isSelfDefender: computed(() => false),
  canDeclareAttack: computed(() => canDeclareAttack.value),
  isBlockingStep: computed(() => false),
  isCounteringStep: computed(() => false),
  isAwaitingTriggerDecision: computed(() => false),
  declareAttack,
  declareBlock,
  declareCounter,
  finishCounterStep,
  resolveTrigger,
  isOpponentDisconnected: computed(() => false)
}))

const playZoneStub = defineComponent({
  name: 'PlayZone',
  props: {
    side: { type: Number, required: true },
    player: { type: Object, required: true },
    leaderActionPopoverItems: { type: Array, default: () => [] },
    characterActionPopoverItems: { type: Object, default: () => ({}) },
    selectedDonCardIds: { type: Array, default: () => [] },
    draggedDonCardCount: { type: Number, default: 0 },
    attackerId: { type: String, default: undefined },
    isTargetable: { type: Boolean, default: false },
    transitionGhosts: { type: Array, default: () => [] },
    deferredBoardCardIds: { type: Array, default: () => [] },
    deferredCostCardIds: { type: Array, default: () => [] },
    deferredTrashCardIds: { type: Array, default: () => [] }
  },
  emits: [
    'handCardDropOnCharacters',
    'handCardDropOnStage',
    'donCardSelectionStart',
    'donCardSelectionHover',
    'donCardDragStart',
    'donCardDragEnd',
    'donCardDropOnLeader',
    'donCardDropOnCharacter'
  ],
  setup(props, { emit }) {
    function getLeaderPopoverItems() {
      return props.leaderActionPopoverItems as Array<{ label: string, onSelect: () => void }>
    }

    function getCharacterPopoverItems(instanceId: string) {
      return (props.characterActionPopoverItems as Record<string, Array<{ label: string, onSelect: () => void }>>)[instanceId] ?? []
    }

    return () => h('div', {
      'data-play-zone': props.side,
      'data-player-hand': JSON.stringify((props.player as DuelPlayerView).hand.map(card => card.instanceId)),
      'data-transition-ghosts': JSON.stringify((props.transitionGhosts as Array<{ instanceId: string, source: string }>)),
      'data-deferred-board-card-ids': JSON.stringify(props.deferredBoardCardIds),
      'data-deferred-cost-card-ids': JSON.stringify(props.deferredCostCardIds),
      'data-deferred-trash-card-ids': JSON.stringify(props.deferredTrashCardIds),
      'data-selected-don-card-ids': JSON.stringify(props.selectedDonCardIds),
      'data-dragged-don-card-count': String(props.draggedDonCardCount),
      'data-leader-popover': JSON.stringify(getLeaderPopoverItems().map(item => item.label)),
      'data-character-popover-character-a': JSON.stringify(getCharacterPopoverItems('character-a').map(item => item.label)),
      'data-attacker-id': props.attackerId,
      'data-is-targetable': String(props.isTargetable ?? false)
    }, [
      h('div', { 'data-life-side': props.side }, [
        h('div', { 'data-life-top': 'true' })
      ]),
      h('div', { 'data-deck-side': props.side, 'data-deck-top': 'true' }),
      h('div', { 'data-don-deck-side': props.side }),
      ...((props.player as DuelPlayerView).characters.map(character => h('div', {
        'data-instance-id': character.instanceId,
        'data-board-card-deferred': String((props.deferredBoardCardIds as string[]).includes(character.instanceId))
      }, [
        character.attachedDon > 0
          ? h('div', { 'data-attached-don-anchor': character.instanceId })
          : null
      ]))),
      (props.player as DuelPlayerView).leader
        ? h('div', {
            'data-instance-id': (props.player as DuelPlayerView).leader?.instanceId
          }, [
            ((props.player as DuelPlayerView).leader?.attachedDon ?? 0) > 0
              ? h('div', { 'data-attached-don-anchor': (props.player as DuelPlayerView).leader?.instanceId })
              : null
          ])
        : null,
      (props.player as DuelPlayerView).stage
        ? h('div', {
            'data-instance-id': (props.player as DuelPlayerView).stage?.instanceId,
            'data-board-card-deferred': String((props.deferredBoardCardIds as string[]).includes((props.player as DuelPlayerView).stage?.instanceId ?? ''))
          })
        : null,
      ...((props.player as DuelPlayerView).cost.map(card => h('div', {
        'data-instance-id': card.instanceId,
        'data-zone-side': props.side,
        'data-cost-state': card.rested ? 'rested' : 'untapped',
        'data-cost-card-deferred': String((props.deferredCostCardIds as string[]).includes(card.instanceId))
      }))),
      h('div', { 'data-trash-side': props.side }, [
        (props.player as DuelPlayerView).trash[0]
          ? h('div', {
              'data-instance-id': (props.player as DuelPlayerView).trash[0]?.instanceId,
              'data-trash-card-deferred': String((props.deferredTrashCardIds as string[]).includes((props.player as DuelPlayerView).trash[0]?.instanceId ?? ''))
            })
          : null
      ]),
      h('button', {
        'data-test': `don-select-start-${props.side}`,
        'onClick': () => emit('donCardSelectionStart', 'self-don-1')
      }),
      h('button', {
        'data-test': `don-select-hover-${props.side}`,
        'onClick': () => emit('donCardSelectionHover', 'self-don-3')
      }),
      h('button', {
        'data-test': `don-attach-target-${props.side}`,
        'data-don-attach-target': 'true'
      }),
      h('button', {
        'data-test': `don-keepalive-${props.side}`,
        'data-don-selection-keepalive': 'true'
      }),
      h('button', {
        'data-test': `don-drag-start-${props.side}`,
        'onClick': () => emit('donCardDragStart', 'self-don-1')
      }),
      h('button', {
        'data-test': `don-drag-end-${props.side}`,
        'onClick': () => emit('donCardDragEnd')
      }),
      h('button', {
        'data-test': `don-drop-leader-${props.side}`,
        'onClick': () => emit('donCardDropOnLeader', props.side)
      }),
      h('button', {
        'data-test': `don-drop-character-${props.side}`,
        'onClick': () => emit('donCardDropOnCharacter', props.side, 'character-a')
      }),
      h('button', {
        'data-test': `drop-${props.side}`,
        'onClick': () => emit('handCardDropOnCharacters', props.side)
      }),
      h('button', {
        'data-test': `drop-stage-${props.side}`,
        'onClick': () => emit('handCardDropOnStage', props.side)
      }),
      h('button', {
        'data-test': `character-popover-attach-${props.side}`,
        'onClick': () => getCharacterPopoverItems('character-a')[0]?.onSelect?.()
      }),
      h('button', {
        'data-test': `character-popover-attack-${props.side}`,
        'onClick': () => getCharacterPopoverItems('character-a')[1]?.onSelect?.()
      }),
      h('button', {
        'data-test': `leader-popover-attach-${props.side}`,
        'onClick': () => getLeaderPopoverItems()[0]?.onSelect?.()
      }),
      h('button', {
        'data-test': `leader-popover-attack-${props.side}`,
        'onClick': () => getLeaderPopoverItems()[1]?.onSelect?.()
      })
    ])
  }
})

const duelHandStub = defineComponent({
  name: 'DuelHand',
  props: {
    hand: { type: Array, default: () => [] },
    handCount: { type: Number, default: 0 },
    hidden: { type: Boolean, default: false },
    draggableHandCardIds: { type: Array, default: () => [] },
    deferredHandCardIds: { type: Array, default: () => [] },
    selectedHandCardIds: { type: Array, default: () => [] },
    draggedHandCardCount: { type: Number, default: 0 }
  },
  emits: ['cardDragStart', 'cardDragEnd', 'cardClick'],
  setup(props, { emit }) {
    function clickTestId(instanceId: string) {
      return `hand-click-${instanceId}`
    }

    function ctrlClickTestId(instanceId: string) {
      return `hand-ctrl-click-${instanceId}`
    }

    function dragStartTestId(instanceId: string) {
      return `drag-start-${instanceId}`
    }

    return () => h('div', {
      'data-duel-hand': props.hidden ? undefined : 'true',
      'data-opponent-hand': props.hidden ? 'true' : undefined,
      'data-opponent-hand-count': props.hidden ? String(props.handCount) : undefined,
      'data-hand-ids': JSON.stringify((props.hand as Array<PrivateCard>)
        .filter(card => !(props.deferredHandCardIds as string[]).includes(card.instanceId))
        .map(card => card.instanceId)),
      'data-draggable-hand-card-ids': JSON.stringify(props.draggableHandCardIds),
      'data-selected-hand-card-ids': JSON.stringify(props.selectedHandCardIds),
      'data-dragged-hand-card-count': String(props.draggedHandCardCount)
    }, [
      ...((props.hidden ? [] : (props.hand as Array<PrivateCard>))
        .filter(card => !(props.deferredHandCardIds as string[]).includes(card.instanceId))
        .map(card => h('div', {
          'data-instance-id': card.instanceId
        }))),
      ...(props.hidden
        ? []
        : [
            h('button', {
              'data-test': 'drag-end-0',
              'onClick': () => emit('cardDragEnd', 'hand-character')
            }),
            ...((props.hand as Array<PrivateCard>).flatMap(card => [
              h('button', {
                'data-test': dragStartTestId(card.instanceId),
                'onClick': () => emit('cardDragStart', card.instanceId)
              }),
              h('button', {
                'data-test': clickTestId(card.instanceId),
                'onClick': () => emit('cardClick', card.instanceId, { ctrlKey: false })
              }),
              h('button', {
                'data-test': ctrlClickTestId(card.instanceId),
                'onClick': () => emit('cardClick', card.instanceId, { ctrlKey: true })
              })
            ]))
          ])
    ])
  }
})

const defaultStub = defineComponent({
  name: 'DefaultStub',
  setup(_, { slots }) {
    return () => h('div', slots.default?.())
  }
})

const slideoverStub = defineComponent({
  name: 'USlideover',
  setup(_, { slots }) {
    return () => h('div', slots.body?.())
  }
})

const progressStub = defineComponent({
  name: 'UProgress',
  props: {
    modelValue: { type: Number, default: null },
    max: { type: Array, default: () => [] }
  },
  setup(props) {
    return () => h('div', {
      'data-test': 'phase-progress',
      'data-model-value': props.modelValue,
      'data-max': JSON.stringify(props.max)
    })
  }
})

describe('DuelBoard drag and drop', () => {
  beforeEach(() => {
    phase.value = 'main'
    isSelfTurn.value = true
    isCombatInProgress.value = false
    canDeclareAttack.value = false
    reducedMotion.value = 'no-preference'
    self.value = createPlayer('self', {
      characters: [createPublicCard('character-a')],
      cost: [
        createPublicCard('self-don-1', { type: 'DON!!', cost: null, power: null, counter: null }),
        createPublicCard('self-don-2', { type: 'DON!!', cost: null, power: null, counter: null }),
        createPublicCard('self-don-3', { type: 'DON!!', cost: null, power: null, counter: null })
      ]
    })
    opponent.value = createPlayer('opponent', {
      characters: [createPublicCard('opponent-character-a', { rested: true })]
    })
    logs.value = []
    errorMessage.value = null
    combat.value = null
    playCard.mockReset()
    endPhase.mockReset()
    attachDon.mockReset()
    clearError.mockReset()
    declareAttack.mockReset()
    declareBlock.mockReset()
    declareCounter.mockReset()
    finishCounterStep.mockReset()
    resolveTrigger.mockReset()
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
      window.setTimeout(() => callback(performance.now()), 16)
    )
    vi.stubGlobal('cancelAnimationFrame', (handle: number) => {
      window.clearTimeout(handle)
    })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  function mountBoard(options: { attachToBody?: boolean } = {}) {
    return mount(DuelBoard, {
      attachTo: options.attachToBody ? document.body : undefined,
      global: {
        stubs: {
          UHeader: defaultStub,
          UBadge: defaultStub,
          UButton: defaultStub,
          UAlert: defaultStub,
          USlideover: slideoverStub,
          UContainer: defaultStub,
          UCard: defaultStub,
          USeparator: defaultStub,
          UScrollArea: defaultStub,
          UInputNumber: defaultStub,
          UProgress: progressStub,
          DuelSetupOverlay: defaultStub,
          PlayZone: playZoneStub,
          DuelHand: duelHandStub
        }
      }
    })
  }

  it('aligns the phase progress indicator with the actual current phase', () => {
    phase.value = 'main'

    const wrapper = mountBoard()
    const progress = wrapper.get('[data-test="phase-progress"]')

    expect(JSON.parse(progress.attributes('data-max') ?? '[]')).toEqual([
      'Recharge',
      'Pioche',
      'DON!!',
      'Principale',
      'Fin'
    ])
    expect(Number(progress.attributes('data-model-value'))).toBe(3)
  })

  it('shows the opponent hidden hand lane during setup and mulligan while the owner hand waits for mulligan', () => {
    phase.value = 'setup'

    const setupWrapper = mountBoard()

    expect(setupWrapper.find('[data-duel-hand]').exists()).toBe(false)
    expect(setupWrapper.find('[data-opponent-hand]').exists()).toBe(true)

    setupWrapper.unmount()

    phase.value = 'mulligan'

    const mulliganWrapper = mountBoard()

    expect(mulliganWrapper.find('[data-duel-hand]').exists()).toBe(true)
    expect(mulliganWrapper.find('[data-opponent-hand]').exists()).toBe(true)
  })

  it('exposes only affordable character cards as draggable from the self hand', () => {
    const wrapper = mountBoard()
    const hand = wrapper.get('[data-duel-hand]')

    expect(hand.attributes('data-draggable-hand-card-ids')).toBe(JSON.stringify(['hand-character', 'hand-stage']))
  })

  it('surfaces a deck ghost and queues the new hand card for custom deck-to-hand travel', async () => {
    const wrapper = mountBoard()

    self.value = createPlayer('self', {
      characters: [createPublicCard('character-a')],
      hand: [
        createPrivateCard('hand-character', { type: 'Character', cost: 1 }),
        createPrivateCard('hand-stage', { type: 'Stage', cost: 1, power: null, counter: null }),
        createPrivateCard('hand-event', { type: 'Event', cost: 1, power: null, counter: null }),
        createPrivateCard('drawn-card', { type: 'Character', cost: 2 })
      ],
      handCount: 4,
      deckCount: 29
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(40)
    await wrapper.vm.$nextTick()

    const selfZone = wrapper.get('[data-play-zone="0"]')
    const hand = wrapper.get('[data-duel-hand]')

    expect(selfZone.attributes('data-transition-ghosts')).toContain('"instanceId":"drawn-card"')
    expect(selfZone.attributes('data-transition-ghosts')).toContain('"source":"deck"')
    expect(hand.attributes('data-hand-ids')).toContain('drawn-card')
  })

  it('creates an explicit overlay when a revealed life card travels into the self hand', async () => {
    const wrapper = mountBoard({ attachToBody: true })

    self.value = createPlayer('self', {
      characters: [createPublicCard('character-a')],
      hand: [
        createPrivateCard('hand-character', { type: 'Character', cost: 1 }),
        createPrivateCard('hand-stage', { type: 'Stage', cost: 1, power: null, counter: null }),
        createPrivateCard('hand-event', { type: 'Event', cost: 1, power: null, counter: null }),
        createPrivateCard('revealed-life', { type: 'Character', cost: 2 })
      ],
      handCount: 4,
      lifeCount: 3
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(1)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-board-travel-instance-id="revealed-life"]').exists()).toBe(true)
  })

  it('creates an explicit overlay when a visible self card moves into trash', async () => {
    const wrapper = mountBoard({ attachToBody: true })

    self.value = createPlayer('self', {
      characters: [createPublicCard('character-a')],
      hand: [
        createPrivateCard('hand-stage', { type: 'Stage', cost: 1, power: null, counter: null }),
        createPrivateCard('hand-event', { type: 'Event', cost: 1, power: null, counter: null })
      ],
      handCount: 2,
      trash: [createPrivateCard('hand-character', { type: 'Character', cost: 1 })]
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(1)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-board-travel-instance-id="hand-character"]').exists()).toBe(true)
  })

  it('plays the dragged character when it is dropped onto the self character zone', async () => {
    const wrapper = mountBoard()

    await wrapper.get('[data-test="drag-start-hand-character"]').trigger('click')
    await wrapper.get('[data-test="drop-0"]').trigger('click')

    expect(playCard).toHaveBeenCalledWith('hand-character')
  })

  it('does not play a dragged card when the current context is not eligible', async () => {
    phase.value = 'draw'

    const wrapper = mountBoard()

    await wrapper.get('[data-test="drag-start-hand-character"]').trigger('click')
    await wrapper.get('[data-test="drop-0"]').trigger('click')

    expect(playCard).not.toHaveBeenCalled()
  })

  it('plays a stage card from hand on click so it can travel into the stage block', async () => {
    const wrapper = mountBoard()

    await wrapper.get('[data-test="hand-click-hand-stage"]').trigger('click')

    expect(playCard).toHaveBeenCalledWith('hand-stage')
  })

  it('toggles hand stack selection on ctrl-click without playing the card', async () => {
    const wrapper = mountBoard()
    const hand = wrapper.get('[data-duel-hand]')

    await wrapper.get('[data-test="hand-ctrl-click-hand-character"]').trigger('click')
    expect(hand.attributes('data-selected-hand-card-ids')).toBe(JSON.stringify(['hand-character']))
    expect(playCard).not.toHaveBeenCalled()

    await wrapper.get('[data-test="hand-ctrl-click-hand-stage"]').trigger('click')
    expect(hand.attributes('data-selected-hand-card-ids')).toBe(JSON.stringify(['hand-character', 'hand-stage']))
    expect(playCard).not.toHaveBeenCalled()

    await wrapper.get('[data-test="hand-ctrl-click-hand-character"]').trigger('click')
    expect(hand.attributes('data-selected-hand-card-ids')).toBe(JSON.stringify(['hand-stage']))
  })

  it('exposes the selected hand stack count while dragging a selected hand card', async () => {
    const wrapper = mountBoard()

    await wrapper.get('[data-test="hand-ctrl-click-hand-character"]').trigger('click')
    await wrapper.get('[data-test="hand-ctrl-click-hand-stage"]').trigger('click')
    await wrapper.get('[data-test="drag-start-hand-stage"]').trigger('click')

    expect(wrapper.get('[data-duel-hand]').attributes('data-dragged-hand-card-count')).toBe('2')
  })

  it('plays the selected hand stack one card at a time when dropped on the character zone', async () => {
    playCard.mockImplementation((instanceId: string) => {
      if (!self.value) {
        return
      }

      const nextHand = self.value.hand.filter(card => card.instanceId !== instanceId)

      self.value = {
        ...self.value,
        hand: nextHand,
        handCount: nextHand.length
      }
    })

    const wrapper = mountBoard()

    self.value = {
      ...self.value!,
      hand: [
        createPrivateCard('hand-character-b', { type: 'Character', cost: 1 }),
        ...self.value!.hand
      ],
      handCount: 4
    }
    await wrapper.vm.$nextTick()

    await wrapper.get('[data-test="hand-ctrl-click-hand-character-b"]').trigger('click')
    await wrapper.get('[data-test="hand-ctrl-click-hand-character"]').trigger('click')
    await wrapper.get('[data-test="drag-start-hand-character"]').trigger('click')
    await wrapper.get('[data-test="drop-0"]').trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(playCard.mock.calls.map(call => call[0])).toEqual(['hand-character-b', 'hand-character'])
  })

  it('plays the dragged stage card when it is dropped onto the self stage zone', async () => {
    const wrapper = mountBoard()

    await wrapper.get('[data-test="drag-start-hand-stage"]').trigger('click')
    await wrapper.get('[data-test="drop-stage-0"]').trigger('click')

    expect(playCard).toHaveBeenCalledWith('hand-stage')
  })

  it('exposes character popover actions on the self board during the main phase', () => {
    canDeclareAttack.value = true

    const wrapper = mountBoard()
    const selfZone = wrapper.get('[data-play-zone="0"]')

    expect(selfZone.attributes('data-leader-popover')).toBe(JSON.stringify([
      'Attacher un DON!!',
      'Attaquer avec'
    ]))
    expect(selfZone.attributes('data-character-popover-character-a')).toBe(JSON.stringify([
      'Attacher un DON!!',
      'Attaquer avec'
    ]))
  })

  it('lets the attach DON action be triggered multiple times from the character popover', async () => {
    const wrapper = mountBoard()

    await wrapper.get('[data-test="character-popover-attach-0"]').trigger('click')
    await wrapper.get('[data-test="character-popover-attach-0"]').trigger('click')

    expect(attachDon).toHaveBeenNthCalledWith(1, 'character', 'character-a', 1)
    expect(attachDon).toHaveBeenNthCalledWith(2, 'character', 'character-a', 1)
  })

  it('uses the selected DON!! batch count for the attach action label and popover attach call', async () => {
    const wrapper = mountBoard()

    await wrapper.get('[data-test="don-select-start-0"]').trigger('click')
    await wrapper.get('[data-test="don-select-hover-0"]').trigger('click')

    const selfZone = wrapper.get('[data-play-zone="0"]')

    expect(selfZone.attributes('data-selected-don-card-ids')).toBe(JSON.stringify([
      'self-don-1',
      'self-don-2',
      'self-don-3'
    ]))
    expect(selfZone.attributes('data-leader-popover')).toContain('Attacher 3 DON!!')

    await wrapper.get('[data-test="leader-popover-attach-0"]').trigger('click')

    expect(attachDon).toHaveBeenCalledWith('leader', undefined, 3)
    expect(wrapper.get('[data-play-zone="0"]').attributes('data-selected-don-card-ids')).toBe(JSON.stringify([]))
  })

  it('attaches the dragged selected DON!! batch when dropped on a character', async () => {
    const wrapper = mountBoard()

    await wrapper.get('[data-test="don-select-start-0"]').trigger('click')
    await wrapper.get('[data-test="don-select-hover-0"]').trigger('click')
    await wrapper.get('[data-test="don-drag-start-0"]').trigger('click')

    expect(wrapper.get('[data-play-zone="0"]').attributes('data-dragged-don-card-count')).toBe('3')

    await wrapper.get('[data-test="don-drop-character-0"]').trigger('click')

    expect(attachDon).toHaveBeenCalledWith('character', 'character-a', 3)
    expect(wrapper.get('[data-play-zone="0"]').attributes('data-selected-don-card-ids')).toBe(JSON.stringify([]))
  })

  it('allows DON!! drag to start before a drop target is active', async () => {
    const wrapper = mountBoard()

    await wrapper.get('[data-test="don-select-start-0"]').trigger('click')
    await wrapper.get('[data-test="don-drag-start-0"]').trigger('click')

    expect(wrapper.get('[data-play-zone="0"]').attributes('data-dragged-don-card-count')).toBe('1')
  })

  it('clears selected DON!! cards on Escape, outside selected DON!! cards, and drag release', async () => {
    const wrapper = mountBoard()

    await wrapper.get('[data-test="don-select-start-0"]').trigger('click')
    expect(wrapper.get('[data-play-zone="0"]').attributes('data-selected-don-card-ids')).toBe(JSON.stringify(['self-don-1']))

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.get('[data-play-zone="0"]').attributes('data-selected-don-card-ids')).toBe(JSON.stringify([]))

    await wrapper.get('[data-test="don-select-start-0"]').trigger('click')
    await wrapper.get('[data-test="don-attach-target-0"]').trigger('pointerdown')
    await wrapper.vm.$nextTick()
    expect(wrapper.get('[data-play-zone="0"]').attributes('data-selected-don-card-ids')).toBe(JSON.stringify(['self-don-1']))

    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.get('[data-play-zone="0"]').attributes('data-selected-don-card-ids')).toBe(JSON.stringify([]))

    await wrapper.get('[data-test="don-select-start-0"]').trigger('click')
    await wrapper.get('[data-test="don-drag-start-0"]').trigger('click')
    await wrapper.get('[data-test="don-drag-end-0"]').trigger('click')

    expect(wrapper.get('[data-play-zone="0"]').attributes('data-dragged-don-card-count')).toBe('0')
    expect(wrapper.get('[data-play-zone="0"]').attributes('data-selected-don-card-ids')).toBe(JSON.stringify([]))
  })

  it('clears selected hand cards on Escape, outside clicks, and drag release', async () => {
    const wrapper = mountBoard()

    await wrapper.get('[data-test="hand-ctrl-click-hand-character"]').trigger('click')
    await wrapper.get('[data-test="hand-ctrl-click-hand-stage"]').trigger('click')
    expect(wrapper.get('[data-duel-hand]').attributes('data-selected-hand-card-ids')).toBe(JSON.stringify(['hand-character', 'hand-stage']))

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.get('[data-duel-hand]').attributes('data-selected-hand-card-ids')).toBe(JSON.stringify([]))

    await wrapper.get('[data-test="hand-ctrl-click-hand-character"]').trigger('click')
    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.get('[data-duel-hand]').attributes('data-selected-hand-card-ids')).toBe(JSON.stringify([]))

    await wrapper.get('[data-test="hand-ctrl-click-hand-character"]').trigger('click')
    await wrapper.get('[data-test="drag-start-hand-character"]').trigger('click')
    await wrapper.get('[data-test="drag-end-0"]').trigger('click')
    expect(wrapper.get('[data-duel-hand]').attributes('data-selected-hand-card-ids')).toBe(JSON.stringify([]))
    expect(wrapper.get('[data-duel-hand]').attributes('data-dragged-hand-card-count')).toBe('0')
  })

  it('starts target selection from the character popover attack action', async () => {
    canDeclareAttack.value = true

    const wrapper = mountBoard()

    await wrapper.get('[data-test="character-popover-attack-0"]').trigger('click')

    expect(wrapper.get('[data-play-zone="0"]').attributes('data-attacker-id')).toBe('character-a')
    expect(wrapper.get('[data-play-zone="1"]').attributes('data-is-targetable')).toBe('true')
    expect(declareAttack).not.toHaveBeenCalled()
  })

  it('cancels target selection when Escape is pressed', async () => {
    canDeclareAttack.value = true

    const wrapper = mountBoard()

    await wrapper.get('[data-test="character-popover-attack-0"]').trigger('click')
    expect(wrapper.get('[data-play-zone="1"]').attributes('data-is-targetable')).toBe('true')

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()

    expect(wrapper.get('[data-play-zone="1"]').attributes('data-is-targetable')).toBe('false')
  })

  it('cancels target selection on a click outside the board', async () => {
    canDeclareAttack.value = true

    const wrapper = mountBoard()

    await wrapper.get('[data-test="character-popover-attack-0"]').trigger('click')
    expect(wrapper.get('[data-play-zone="1"]').attributes('data-is-targetable')).toBe('true')

    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(wrapper.get('[data-play-zone="1"]').attributes('data-is-targetable')).toBe('false')
  })

  it('lets the leader popover trigger repeated DON attachment and attack targeting', async () => {
    canDeclareAttack.value = true

    const wrapper = mountBoard()

    await wrapper.get('[data-test="leader-popover-attach-0"]').trigger('click')
    await wrapper.get('[data-test="leader-popover-attach-0"]').trigger('click')
    await wrapper.get('[data-test="leader-popover-attack-0"]').trigger('click')

    expect(attachDon).toHaveBeenNthCalledWith(1, 'leader', undefined, 1)
    expect(attachDon).toHaveBeenNthCalledWith(2, 'leader', undefined, 1)
    expect(wrapper.get('[data-play-zone="0"]').attributes('data-attacker-id')).toBe('self-leader')
  })

  it('renders journal entries in chronological order', () => {
    logs.value = [
      { id: 'log-1', message: 'self commence la partie.', createdAt: '2026-07-24T10:00:00.000Z' },
      { id: 'log-2', message: 'DON!! insuffisant pour jouer Zoro.', createdAt: '2026-07-24T10:01:00.000Z' }
    ]

    const wrapper = mountBoard()
    const html = wrapper.html()

    expect(html.indexOf('self commence la partie.')).toBeLessThan(html.indexOf('DON!! insuffisant pour jouer Zoro.'))
  })

  it('shows a global animated feedback line for attack logs', async () => {
    const wrapper = mountBoard({ attachToBody: true })

    logs.value = [
      {
        id: 'log-attack',
        message: 'self attaque avec Luffy vers Nami.',
        createdAt: '2026-07-26T10:00:00.000Z'
      }
    ]
    await wrapper.vm.$nextTick()

    expect(wrapper.get('[data-test="global-feedback"]').text()).toContain('Luffy attaque Nami')
  })

  it('shows an animated error feedback line when an action error arrives', async () => {
    const wrapper = mountBoard({ attachToBody: true })

    errorMessage.value = 'Pas assez de DON!!'
    await wrapper.vm.$nextTick()

    expect(wrapper.get('[data-test="error-feedback"]').text()).toContain('Pas assez de DON!!')
  })

  it('shows a card feedback chip when DON!! attachment increases a card power', async () => {
    const wrapper = mountBoard({ attachToBody: true })

    self.value = createPlayer('self', {
      characters: [createPublicCard('character-a', { attachedDon: 1 })],
      cost: [
        createPublicCard('self-don-1', { type: 'DON!!', cost: null, power: null, counter: null, rested: true }),
        createPublicCard('self-don-2', { type: 'DON!!', cost: null, power: null, counter: null }),
        createPublicCard('self-don-3', { type: 'DON!!', cost: null, power: null, counter: null })
      ]
    })
    await wrapper.vm.$nextTick()
    logs.value = [
      {
        id: 'log-don-gain',
        message: 'self donne 1 DON!! a character-a (+1000 de puissance).',
        createdAt: '2026-07-26T10:00:00.000Z'
      }
    ]
    await Promise.resolve()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.get('[data-test="card-feedback-+1000"]').text()).toContain('+1000')
  })

  it('shows a blocker feedback chip on the declared blocker card', async () => {
    const wrapper = mountBoard({ attachToBody: true })

    self.value = createPlayer('self', {
      characters: [createPublicCard('character-a')]
    })
    combat.value = {
      attackerSessionId: 'opponent',
      attackerInstanceId: 'opponent-character-a',
      defenderSessionId: 'self',
      targetType: 'leader',
      blockerInstanceId: 'character-a',
      step: 'countering',
      counterPowerBonus: 0,
      awaitingTriggerDecision: false
    }
    await wrapper.vm.$nextTick()
    logs.value = [
      {
        id: 'log-blocker',
        message: 'self declare character-a comme Bloqueur.',
        createdAt: '2026-07-26T10:01:00.000Z'
      }
    ]
    await Promise.resolve()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.get('[data-test="card-feedback-Blocker"]').text()).toContain('Blocker')
  })

  it('shows a KO feedback chip when a character leaves the board', async () => {
    const wrapper = mountBoard({ attachToBody: true })

    self.value = createPlayer('self', {
      characters: []
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.get('[data-test="card-feedback-KO"]').text()).toContain('KO')
  })
})

describe('DuelBoard leave to lobby', () => {
  beforeEach(() => {
    phase.value = 'main'
    isSelfTurn.value = true
    isCombatInProgress.value = false
    canDeclareAttack.value = false
    self.value = createPlayer('self', {
      characters: [createPublicCard('character-a')]
    })
    opponent.value = createPlayer('opponent', {
      characters: [createPublicCard('opponent-character-a', { rested: true })]
    })
    logs.value = []
    leave.mockReset()
    confirm.mockReset()
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
      window.setTimeout(() => callback(performance.now()), 16)
    )
    vi.stubGlobal('cancelAnimationFrame', (handle: number) => {
      window.clearTimeout(handle)
    })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  const headerStub = defineComponent({
    name: 'UHeader',
    setup(_, { slots }) {
      return () => h('div', [
        slots.left?.(),
        slots.default?.(),
        slots.right?.()
      ])
    }
  })

  function mountBoard(options: { attachToBody?: boolean } = {}) {
    return mount(DuelBoard, {
      attachTo: options.attachToBody ? document.body : undefined,
      global: {
        stubs: {
          UHeader: headerStub,
          UBadge: defaultStub,
          UButton: defaultStub,
          UAlert: defaultStub,
          USlideover: slideoverStub,
          UContainer: defaultStub,
          UCard: defaultStub,
          USeparator: defaultStub,
          UScrollArea: defaultStub,
          UInputNumber: defaultStub,
          UProgress: progressStub,
          DuelSetupOverlay: defaultStub,
          PlayZone: playZoneStub,
          DuelHand: duelHandStub
        }
      }
    })
  }

  it('leaves the room and does not navigate away when the confirmation is dismissed', async () => {
    confirm.mockResolvedValue(false)

    const wrapper = mountBoard()
    await wrapper.get('[data-test="leave-to-lobby"]').trigger('click')
    await Promise.resolve()

    expect(confirm).toHaveBeenCalledWith({
      title: 'Retourner au lobby ?',
      description: 'Vous quitterez la partie en cours.',
      confirmLabel: 'Retourner au lobby'
    })
    expect(leave).not.toHaveBeenCalled()
  })

  it('leaves the room when the confirmation is accepted', async () => {
    confirm.mockResolvedValue(true)

    const wrapper = mountBoard()
    await wrapper.get('[data-test="leave-to-lobby"]').trigger('click')
    await Promise.resolve()
    await Promise.resolve()

    expect(leave).toHaveBeenCalledTimes(1)
  })
})
