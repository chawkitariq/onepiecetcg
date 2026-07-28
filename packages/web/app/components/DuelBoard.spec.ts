import type { DuelPlayerView, PendingEffectDecision, PrivateCard, PublicCard } from '@onepiecetcg/shared'
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
const submitEffectDecision = vi.fn()
const declineEffectDecision = vi.fn()
const cancelEffectDecisionSelection = vi.fn()
const toggleEffectCardSelection = vi.fn()
const toggleEffectChoiceSelection = vi.fn()

const phase = ref('main')
const turn = ref(1)
const winnerSessionId = ref<string | null>(null)
const startedAt = ref<string | null>(null)
const finishedAt = ref<string | null>(null)
const isSelfTurn = ref(true)
const isCombatInProgress = ref(false)
const canDeclareAttack = ref(false)
const isOpponentDisconnected = ref(false)
const reducedMotion = ref<'reduce' | 'no-preference'>('no-preference')
const self = ref<DuelPlayerView | null>(null)
const opponent = ref<DuelPlayerView | null>(null)
const logs = ref<Array<{ id: string, message: string, createdAt: string }>>([])
const errorMessage = ref<string | null>(null)
const pendingEffectDecision = ref<PendingEffectDecision | null>(null)
const activeDecision = ref<any>(null)
const isAwaitingEffectDecision = ref(false)
const selectedEffectCardIds = ref<string[]>([])
const selectedEffectChoiceIds = ref<string[]>([])
const selectableDecisionCardIds = ref<string[]>([])
const selectableRevealedDecisionCardIds = ref<string[]>([])
const selectableEffectCards = ref<PublicCard[]>([])
const effectChoiceViews = ref<Array<{ id: string, label: string, selected: boolean, cardInstanceId?: string }>>([])
const effectDecisionSubmitState = ref<{ canSubmit: boolean, reason: string | null }>({
  canSubmit: true,
  reason: null
})
const apiFetch = vi.fn()
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
const room = ref({ roomId: 'room-1' })

mockNuxtImport('useColyseus', () => () => ({
  room,
  status: ref('connected'),
  leave
}))

mockNuxtImport('useConfirmDialog', () => () => ({
  confirm
}))

mockNuxtImport('navigateTo', () => vi.fn())
mockNuxtImport('usePreferredReducedMotion', () => () => reducedMotion)
mockNuxtImport('useApi', () => () => apiFetch)

mockNuxtImport('useDuelRoom', () => () => ({
  self,
  opponent,
  phase,
  turn,
  winnerSessionId,
  startedAt,
  finishedAt,
  isSelfTurn,
  isMainPhase: computed(() => phase.value === 'main'),
  canEndPhase: computed(() => isSelfTurn.value && phase.value === 'main'),
  selfUntappedDonCount: computed(() => self.value?.cost.filter(card => !card.rested).length ?? 0),
  isSelfCharacterZoneFull: computed(() => (self.value?.characters.length ?? 0) >= 5),
  logs,
  errorMessage,
  pendingEffectDecision,
  activeDecision,
  isAwaitingEffectDecision: computed(() => isAwaitingEffectDecision.value),
  selectedEffectCardIds,
  selectedEffectChoiceIds,
  selectableDecisionCardIds,
  selectableRevealedDecisionCardIds,
  selectableEffectCards,
  effectChoiceViews,
  effectDecisionSubmitState,
  toggleEffectCardSelection,
  toggleEffectChoiceSelection,
  submitEffectDecision,
  declineEffectDecision,
  cancelEffectDecisionSelection,
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
  isOpponentDisconnected: computed(() => isOpponentDisconnected.value)
}))

const playZoneStub = defineComponent({
  name: 'PlayZone',
  props: {
    side: { type: Number, required: true },
    player: { type: Object, required: true },
    attackableLeader: { type: Boolean, default: false },
    attackableCharacterIds: { type: Array, default: () => [] },
    selectedDonCardIds: { type: Array, default: () => [] },
    draggedDonCardCount: { type: Number, default: 0 },
    attackerId: { type: String, default: undefined },
    isTargetable: { type: Boolean, default: false },
    linkedPreviewInstanceId: { type: String, default: null },
    linkedSelectedInstanceIds: { type: Array, default: () => [] },
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
    'donCardDropOnCharacter',
    'trashClick',
    'leaderAttackStart',
    'characterAttackStart',
    'leaderClick',
    'characterClick'
  ],
  setup(props, { emit }) {
    return () => h('div', {
      'data-play-zone': props.side,
      'data-player-hand': JSON.stringify((props.player as DuelPlayerView).hand.map(card => card.instanceId)),
      'data-transition-ghosts': JSON.stringify((props.transitionGhosts as Array<{ instanceId: string, source: string }>)),
      'data-deferred-board-card-ids': JSON.stringify(props.deferredBoardCardIds),
      'data-deferred-cost-card-ids': JSON.stringify(props.deferredCostCardIds),
      'data-deferred-trash-card-ids': JSON.stringify(props.deferredTrashCardIds),
      'data-selected-don-card-ids': JSON.stringify(props.selectedDonCardIds),
      'data-dragged-don-card-count': String(props.draggedDonCardCount),
      'data-attacker-id': props.attackerId,
      'data-is-targetable': String(props.isTargetable ?? false),
      'data-linked-preview-instance-id': props.linkedPreviewInstanceId,
      'data-linked-selected-instance-ids': JSON.stringify(props.linkedSelectedInstanceIds)
    }, [
      h('div', { 'data-life-side': props.side }, [
        h('div', { 'data-life-top': 'true' })
      ]),
      h('div', { 'data-deck-side': props.side, 'data-deck-top': 'true' }),
      h('div', { 'data-don-deck-side': props.side }),
      ...((props.player as DuelPlayerView).characters.map(character => h('div', {
        'data-instance-id': character.instanceId,
        'data-zone-side': props.side,
        'data-board-card-deferred': String((props.deferredBoardCardIds as string[]).includes(character.instanceId)),
        'onPointerdown': () => {
          if ((props.attackableCharacterIds as string[]).includes(character.instanceId)) {
            emit('characterAttackStart', props.side, character.instanceId)
          }
        },
        'onClick': () => emit('characterClick', props.side, character.instanceId)
      }, [
        character.attachedDon > 0
          ? h('div', { 'data-attached-don-anchor': character.instanceId }, Array.from({ length: character.attachedDon }, (_, index) =>
              h('div', {
                'data-attached-don-owner': character.instanceId,
                'data-attached-don-slot': String(index)
              })
            ))
          : null
      ]))),
      (props.player as DuelPlayerView).leader
        ? h('div', {
            'data-instance-id': (props.player as DuelPlayerView).leader?.instanceId,
            'data-zone-side': props.side,
            'onPointerdown': () => {
              if (props.attackableLeader) {
                emit('leaderAttackStart', props.side)
              }
            },
            'onClick': () => emit('leaderClick', props.side)
          }, [
            ((props.player as DuelPlayerView).leader?.attachedDon ?? 0) > 0
              ? h('div', { 'data-attached-don-anchor': (props.player as DuelPlayerView).leader?.instanceId }, Array.from({ length: (props.player as DuelPlayerView).leader?.attachedDon ?? 0 }, (_, index) =>
                  h('div', {
                    'data-attached-don-owner': (props.player as DuelPlayerView).leader?.instanceId,
                    'data-attached-don-slot': String(index)
                  })
                ))
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
        'data-test': `trash-click-${props.side}`,
        'onClick': () => emit('trashClick', props.side)
      }),
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
        'data-test': `hover-card-${props.side}`,
        'onClick': () => {
          const character = (props.player as DuelPlayerView).characters[0]

          if (!character) {
            return
          }

          emit('cardHover', createPrivateCard(character.instanceId, {
            ...character,
            text: 'Board hover detail text',
            trigger: null
          }))
        }
      }),
      h('button', {
        'data-test': `leave-card-${props.side}`,
        'onClick': () => emit('cardHover', null)
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
    deferredHiddenCount: { type: Number, default: 0 },
    draggableHandCardIds: { type: Array, default: () => [] },
    revealedHandCardIds: { type: Array, default: () => [] },
    deferredHandCardIds: { type: Array, default: () => [] },
    selectedHandCardIds: { type: Array, default: () => [] },
    linkedPreviewInstanceId: { type: String, default: null },
    linkedSelectedInstanceIds: { type: Array, default: () => [] },
    draggedHandCardCount: { type: Number, default: 0 }
  },
  emits: ['cardDragStart', 'cardDragEnd', 'cardClick'],
  setup(props, { emit }) {
    const hiddenCards = Array.from({ length: props.handCount }, (_, index) => h('div', {
      'data-hidden-hand-card': 'true',
      'data-hidden-hand-top': index === props.handCount - 1 ? 'true' : undefined,
      'data-hidden-hand-deferred': String(index >= props.handCount - props.deferredHiddenCount)
    }))

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
      'data-opponent-hand-count': props.hidden ? String(Math.max(props.handCount - props.deferredHiddenCount, 0)) : undefined,
      'data-hand-ids': JSON.stringify((props.hand as Array<PrivateCard>)
        .filter(card => !(props.deferredHandCardIds as string[]).includes(card.instanceId))
        .map(card => card.instanceId)),
      'data-draggable-hand-card-ids': JSON.stringify(props.draggableHandCardIds),
      'data-revealed-hand-card-ids': JSON.stringify(props.revealedHandCardIds),
      'data-selected-hand-card-ids': JSON.stringify(props.selectedHandCardIds),
      'data-linked-preview-instance-id': props.linkedPreviewInstanceId,
      'data-linked-selected-instance-ids': JSON.stringify(props.linkedSelectedInstanceIds),
      'data-dragged-hand-card-count': String(props.draggedHandCardCount)
    }, [
      ...(props.hidden ? hiddenCards : []),
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

const buttonStub = defineComponent({
  name: 'UButton',
  props: {
    disabled: { type: Boolean, default: false },
    color: { type: String, default: undefined },
    variant: { type: String, default: undefined }
  },
  emits: ['click'],
  setup(props, { slots, emit }) {
    return () => h('button', {
      disabled: props.disabled,
      'data-color': props.color,
      'data-variant': props.variant,
      onClick: () => emit('click')
    }, slots.default?.())
  }
})

const slideoverStub = defineComponent({
  name: 'USlideover',
  props: {
    open: { type: Boolean, default: false }
  },
  emits: ['update:open'],
  setup(props, { slots }) {
    return () => h('div', {
      'data-test': 'journal-slideover',
      'data-open': String(props.open)
    }, slots.body?.())
  }
})

const duelAttackArrowStub = defineComponent({
  name: 'DuelAttackArrow',
  props: {
    fromInstanceId: { type: String, default: null },
    toInstanceId: { type: String, default: null },
    toPoint: { type: Object, default: null },
    variant: { type: String, default: 'drag' },
    animationKey: { type: [String, Number], default: null }
  },
  setup(props) {
    return () => h('div', {
      'data-test': 'attack-arrow',
      'data-from-instance-id': props.fromInstanceId ?? '',
      'data-to-instance-id': props.toInstanceId ?? '',
      'data-has-point-target': String(Boolean(props.toPoint)),
      'data-variant': props.variant,
      'data-animation-key': props.animationKey == null ? '' : String(props.animationKey)
    })
  }
})

describe('DuelBoard drag and drop', () => {
  let scrollToMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    phase.value = 'main'
    turn.value = 1
    winnerSessionId.value = null
    startedAt.value = null
    finishedAt.value = null
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
    pendingEffectDecision.value = null
    activeDecision.value = null
    isAwaitingEffectDecision.value = false
    selectedEffectCardIds.value = []
    selectedEffectChoiceIds.value = []
    selectableDecisionCardIds.value = []
    selectableRevealedDecisionCardIds.value = []
    selectableEffectCards.value = []
    effectChoiceViews.value = []
    effectDecisionSubmitState.value = { canSubmit: true, reason: null }
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
    submitEffectDecision.mockReset()
    declineEffectDecision.mockReset()
    cancelEffectDecisionSelection.mockReset()
    toggleEffectCardSelection.mockReset()
    toggleEffectChoiceSelection.mockReset()
    apiFetch.mockReset()
    apiFetch.mockResolvedValue({
      id: 'effect-card',
      number: 'OP00-001',
      name: 'Effect Card',
      type: 'Character',
      colors: ['Red'],
      cost: 4,
      power: 5000,
      life: null,
      counter: 1000,
      attributes: [],
      families: [],
      text: 'Prompt detail text',
      trigger: null,
      imageUrl: '/cards/effect-card.png',
      set: { id: 'OP00', name: 'Test Set' },
      rarity: null
    })
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
      window.setTimeout(() => callback(performance.now()), 16)
    )
    vi.stubGlobal('cancelAnimationFrame', (handle: number) => {
      window.clearTimeout(handle)
    })
    scrollToMock = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      writable: true,
      value: scrollToMock
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
          UHeader: headerStub,
          UBadge: defaultStub,
          UButton: buttonStub,
          USlideover: slideoverStub,
          UContainer: defaultStub,
          UCard: defaultStub,
          USeparator: defaultStub,
          UScrollArea: defaultStub,
          UInputNumber: defaultStub,
          DuelSetupOverlay: defaultStub,
          DuelAttackArrow: duelAttackArrowStub,
          PlayZone: playZoneStub,
          DuelHand: duelHandStub
        }
      }
    })
  }

  it('shows the player-vs-player badge instead of the old phase progress bar', () => {
    phase.value = 'main'

    const wrapper = mountBoard()

    expect(wrapper.text()).toContain('self vs opponent')
    expect(wrapper.find('[data-test="phase-progress"]').exists()).toBe(false)
  })

  it('auto-advances frontend-only phases until the active player reaches main', async () => {
    phase.value = 'refresh'

    mountBoard()
    await vi.runAllTimersAsync()

    expect(endPhase).toHaveBeenCalled()
  })

  it('renders a single active/inactive turn button label', async () => {
    const wrapper = mountBoard()
    const findTurnButton = () => wrapper.get('[data-test="turn-toggle"]')

    expect(wrapper.text()).toContain('Fin du tour')
    expect(wrapper.text()).not.toContain('Votre tour')
    expect(findTurnButton().text()).toContain('Fin du tour')

    isSelfTurn.value = false
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Tour adverse')
    expect(findTurnButton().text()).toContain('Tour adverse')
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

  it('marks the current mulligan hand for reveal animation when mulligan starts', async () => {
    phase.value = 'setup'

    const wrapper = mountBoard()

    phase.value = 'mulligan'
    await wrapper.vm.$nextTick()

    const initialHand = wrapper.get('[data-duel-hand]')
    expect(initialHand.attributes('data-revealed-hand-card-ids')).toBe(JSON.stringify([
      'hand-character',
      'hand-stage',
      'hand-event'
    ]))
  })

  it('uses the standard deck-to-hand travel overlay when a mulligan redraw arrives', async () => {
    phase.value = 'mulligan'

    const wrapper = mountBoard({ attachToBody: true })

    self.value = createPlayer('self', {
      hand: [
        createPrivateCard('mulligan-card-1', { type: 'Character', cost: 1 }),
        createPrivateCard('mulligan-card-2', { type: 'Character', cost: 2 }),
        createPrivateCard('mulligan-card-3', { type: 'Stage', cost: 1, power: null, counter: null }),
        createPrivateCard('mulligan-card-4', { type: 'Event', cost: 1, power: null, counter: null }),
        createPrivateCard('mulligan-card-5', { type: 'Character', cost: 3 })
      ],
      handCount: 5
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(1)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-board-travel-instance-id="mulligan-card-1"]').exists()).toBe(true)
    expect(wrapper.get('[data-board-travel-instance-id="mulligan-card-1"]').attributes('data-board-travel-variant')).toBe('default')
  })

  it('exposes only affordable character cards as draggable from the self hand', () => {
    const wrapper = mountBoard()
    const hand = wrapper.get('[data-duel-hand]')

    expect(hand.attributes('data-draggable-hand-card-ids')).toBe(JSON.stringify(['hand-character', 'hand-stage']))
  })

  it('surfaces a deck ghost and defers the new hand card while the standard deck-to-hand travel plays', async () => {
    const wrapper = mountBoard({ attachToBody: true })

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
    expect(wrapper.find('[data-board-travel-instance-id="drawn-card"]').exists()).toBe(true)
    expect(hand.attributes('data-hand-ids')).not.toContain('drawn-card')
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

  it('keeps the self hand-to-character travel when the hand loss and board arrival land on separate patches', async () => {
    const wrapper = mountBoard({ attachToBody: true })

    await wrapper.get('[data-test="hand-click-hand-character"]').trigger('click')
    expect(playCard).toHaveBeenCalledWith('hand-character')

    self.value = createPlayer('self', {
      characters: [createPublicCard('character-a')],
      hand: [
        createPrivateCard('hand-stage', { type: 'Stage', cost: 1, power: null, counter: null }),
        createPrivateCard('hand-event', { type: 'Event', cost: 1, power: null, counter: null })
      ],
      handCount: 2
    })
    await wrapper.vm.$nextTick()

    self.value = createPlayer('self', {
      characters: [
        createPublicCard('character-a'),
        createPublicCard('hand-character')
      ],
      hand: [
        createPrivateCard('hand-stage', { type: 'Stage', cost: 1, power: null, counter: null }),
        createPrivateCard('hand-event', { type: 'Event', cost: 1, power: null, counter: null })
      ],
      handCount: 2
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(1)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-board-travel-instance-id="hand-character"]').exists()).toBe(true)
  })

  it('keeps the self hand-to-stage travel when the hand loss and stage arrival land on separate patches', async () => {
    const wrapper = mountBoard({ attachToBody: true })

    await wrapper.get('[data-test="hand-click-hand-stage"]').trigger('click')
    expect(playCard).toHaveBeenCalledWith('hand-stage')

    self.value = createPlayer('self', {
      characters: [createPublicCard('character-a')],
      hand: [
        createPrivateCard('hand-character', { type: 'Character', cost: 1 }),
        createPrivateCard('hand-event', { type: 'Event', cost: 1, power: null, counter: null })
      ],
      handCount: 2
    })
    await wrapper.vm.$nextTick()

    self.value = createPlayer('self', {
      characters: [createPublicCard('character-a')],
      stage: createPublicCard('hand-stage', { type: 'Stage', cost: 1, power: null, counter: null }),
      hand: [
        createPrivateCard('hand-character', { type: 'Character', cost: 1 }),
        createPrivateCard('hand-event', { type: 'Event', cost: 1, power: null, counter: null })
      ],
      handCount: 2
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(1)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-board-travel-instance-id="hand-stage"]').exists()).toBe(true)
  })

  it('creates an explicit overlay when DON!! attaches to a character slot', async () => {
    const wrapper = mountBoard({ attachToBody: true })

    self.value = createPlayer('self', {
      characters: [createPublicCard('character-a', { attachedDon: 2 })],
      cost: [
        createPublicCard('self-don-1', { type: 'DON!!', cost: null, power: null, counter: null, rested: true }),
        createPublicCard('self-don-2', { type: 'DON!!', cost: null, power: null, counter: null }),
        createPublicCard('self-don-3', { type: 'DON!!', cost: null, power: null, counter: null })
      ]
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(40)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-board-travel-instance-id^="attached-don:character-a:"]').exists()).toBe(true)
  })

  it('creates an explicit overlay when the opponent plays a visible card from the hidden hand lane', async () => {
    const wrapper = mountBoard({ attachToBody: true })

    opponent.value = createPlayer('opponent', {
      handCount: 2,
      characters: [createPublicCard('opponent-character-a', { rested: true })]
    })
    await wrapper.vm.$nextTick()

    opponent.value = createPlayer('opponent', {
      handCount: 1,
      characters: [
        createPublicCard('opponent-character-a', { rested: true }),
        createPublicCard('opponent-character-b')
      ]
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(1)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-board-travel-instance-id="opponent-character-b"]').exists()).toBe(true)
  })

  it('keeps the opponent hand-to-character travel when the hand loss and board arrival land on separate patches', async () => {
    const wrapper = mountBoard({ attachToBody: true })

    opponent.value = createPlayer('opponent', {
      handCount: 2,
      characters: [createPublicCard('opponent-character-a', { rested: true })]
    })
    await wrapper.vm.$nextTick()

    opponent.value = createPlayer('opponent', {
      handCount: 1,
      characters: [createPublicCard('opponent-character-a', { rested: true })]
    })
    await wrapper.vm.$nextTick()

    opponent.value = createPlayer('opponent', {
      handCount: 1,
      characters: [
        createPublicCard('opponent-character-a', { rested: true }),
        createPublicCard('opponent-character-b')
      ]
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(1)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-board-travel-instance-id="opponent-character-b"]').exists()).toBe(true)
  })

  it('creates an explicit overlay when the opponent draws from deck into the hidden hand lane', async () => {
    const wrapper = mountBoard({ attachToBody: true })

    opponent.value = createPlayer('opponent', {
      handCount: 3,
      deckCount: 30
    })
    await wrapper.vm.$nextTick()

    opponent.value = createPlayer('opponent', {
      handCount: 4,
      deckCount: 29
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(1)
    await wrapper.vm.$nextTick()

    const hiddenHand = wrapper.get('[data-opponent-hand]')

    expect(hiddenHand.attributes('data-opponent-hand-count')).toBe('3')
    expect(wrapper.find('[data-board-travel-instance-id^="opponent-hidden-hand:deck:"]').exists()).toBe(true)
  })

  it('creates an explicit overlay when the opponent takes life into the hidden hand lane', async () => {
    const wrapper = mountBoard({ attachToBody: true })

    opponent.value = createPlayer('opponent', {
      handCount: 3,
      lifeCount: 4
    })
    await wrapper.vm.$nextTick()

    opponent.value = createPlayer('opponent', {
      handCount: 4,
      lifeCount: 3
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(1)
    await wrapper.vm.$nextTick()

    const hiddenHand = wrapper.get('[data-opponent-hand]')

    expect(hiddenHand.attributes('data-opponent-hand-count')).toBe('3')
    expect(wrapper.find('[data-board-travel-instance-id^="opponent-hidden-hand:life:"]').exists()).toBe(true)
  })

  it('does not replay multiple life-to-hand overlays for the same self damage event across later patches', async () => {
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

    expect(wrapper.findAll('[data-board-travel-instance-id="revealed-life"]')).toHaveLength(1)

    logs.value = [
      {
        id: 'later-log',
        message: 'self attaque avec Luffy vers Nami.',
        createdAt: '2026-07-26T10:03:00.000Z'
      }
    ]
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('[data-board-travel-instance-id="revealed-life"]')).toHaveLength(1)
  })

  it('keeps the self life-to-hand travel when life loss and hand gain land on separate patches', async () => {
    const wrapper = mountBoard({ attachToBody: true })

    self.value = createPlayer('self', {
      hand: [createPrivateCard('hand-character', { type: 'Character', cost: 1 })],
      handCount: 1,
      lifeCount: 4
    })
    await wrapper.vm.$nextTick()

    self.value = createPlayer('self', {
      hand: [createPrivateCard('hand-character', { type: 'Character', cost: 1 })],
      handCount: 1,
      lifeCount: 3
    })
    await wrapper.vm.$nextTick()

    self.value = createPlayer('self', {
      hand: [
        createPrivateCard('hand-character', { type: 'Character', cost: 1 }),
        createPrivateCard('revealed-life', { type: 'Character', cost: 2 })
      ],
      handCount: 2,
      lifeCount: 3
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(1)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-board-travel-instance-id="revealed-life"]').exists()).toBe(true)
  })

  it('uses the standard travel variant for revealed life cards', async () => {
    const wrapper = mountBoard({ attachToBody: true })

    self.value = createPlayer('self', {
      hand: [createPrivateCard('hand-character', { type: 'Character', cost: 1 })],
      handCount: 1,
      lifeCount: 4
    })
    await wrapper.vm.$nextTick()

    self.value = createPlayer('self', {
      hand: [
        createPrivateCard('hand-character', { type: 'Character', cost: 1 }),
        createPrivateCard('revealed-life', { type: 'Character', cost: 2 })
      ],
      handCount: 2,
      lifeCount: 3
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(1)
    await wrapper.vm.$nextTick()

    expect(wrapper.get('[data-board-travel-instance-id="revealed-life"]').attributes('data-board-travel-variant')).toBe('default')
  })

  it('keeps the self deck-to-hand travel when deck loss and hand gain land on separate patches', async () => {
    const wrapper = mountBoard({ attachToBody: true })

    self.value = createPlayer('self', {
      hand: [createPrivateCard('hand-character', { type: 'Character', cost: 1 })],
      handCount: 1,
      deckCount: 30
    })
    await wrapper.vm.$nextTick()

    self.value = createPlayer('self', {
      hand: [createPrivateCard('hand-character', { type: 'Character', cost: 1 })],
      handCount: 1,
      deckCount: 29
    })
    await wrapper.vm.$nextTick()

    self.value = createPlayer('self', {
      hand: [
        createPrivateCard('hand-character', { type: 'Character', cost: 1 }),
        createPrivateCard('drawn-card', { type: 'Character', cost: 2 })
      ],
      handCount: 2,
      deckCount: 29
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(1)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-board-travel-instance-id="drawn-card"]').exists()).toBe(true)
  })

  it('creates an explicit overlay when the opponent gains DON!! into cost', async () => {
    const wrapper = mountBoard({ attachToBody: true })

    opponent.value = createPlayer('opponent', {
      donDeckCount: 9,
      cost: [createPublicCard('opponent-don-1', { type: 'DON!!', cost: null, power: null, counter: null })]
    })
    await wrapper.vm.$nextTick()

    opponent.value = createPlayer('opponent', {
      donDeckCount: 8,
      cost: [
        createPublicCard('opponent-don-1', { type: 'DON!!', cost: null, power: null, counter: null }),
        createPublicCard('opponent-don-2', { type: 'DON!!', cost: null, power: null, counter: null })
      ]
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(1)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-board-travel-instance-id="opponent-don-2"]').exists()).toBe(true)
  })

  it('keeps the opponent attached-DON overlay even when the last untapped cost card leaves the zone', async () => {
    const wrapper = mountBoard({ attachToBody: true })

    opponent.value = createPlayer('opponent', {
      leader: createPublicCard('opponent-leader', { type: 'Leader', power: 5000, attachedDon: 0 }),
      cost: [
        createPublicCard('opponent-don-last', { type: 'DON!!', cost: null, power: null, counter: null })
      ]
    })
    await wrapper.vm.$nextTick()

    opponent.value = createPlayer('opponent', {
      leader: createPublicCard('opponent-leader', { type: 'Leader', power: 5000, attachedDon: 1 }),
      cost: []
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(1)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-board-travel-instance-id^="attached-don:opponent-leader:"]').exists()).toBe(true)
  })

  it('shows the confirmed incoming attack arrow when the opponent declares an attack on the self leader', async () => {
    const wrapper = mountBoard()

    combat.value = {
      attackerSessionId: 'opponent',
      attackerInstanceId: 'opponent-character-a',
      defenderSessionId: 'self',
      targetType: 'leader',
      targetInstanceId: 'self-leader',
      step: 'declared',
      counterPowerBonus: 0,
      awaitingTriggerDecision: false
    }
    await wrapper.vm.$nextTick()

    const arrow = wrapper.get('[data-test="attack-arrow"]')

    expect(arrow.attributes('data-from-instance-id')).toBe('opponent-character-a')
    expect(arrow.attributes('data-to-instance-id')).toBe('self-leader')
    expect(arrow.attributes('data-has-point-target')).toBe('false')
    expect(arrow.attributes('data-variant')).toBe('confirmed')
    expect(arrow.attributes('data-animation-key')).not.toBe('')
  })

  it('keeps the confirmed incoming attack arrow when the server snapshot is already at the blocking step', async () => {
    const wrapper = mountBoard()

    combat.value = {
      attackerSessionId: 'opponent',
      attackerInstanceId: 'opponent-character-a',
      defenderSessionId: 'self',
      targetType: 'leader',
      targetInstanceId: 'self-leader',
      blockerInstanceId: '',
      step: 'blocked',
      counterPowerBonus: 0,
      awaitingTriggerDecision: false
    }
    await wrapper.vm.$nextTick()

    const arrow = wrapper.get('[data-test="attack-arrow"]')

    expect(arrow.attributes('data-from-instance-id')).toBe('opponent-character-a')
    expect(arrow.attributes('data-to-instance-id')).toBe('self-leader')
    expect(arrow.attributes('data-variant')).toBe('confirmed')
  })

  it('does not restart the confirmed incoming attack arrow when the same combat advances to countering after a block declaration', async () => {
    const wrapper = mountBoard()

    combat.value = {
      attackerSessionId: 'opponent',
      attackerInstanceId: 'opponent-character-a',
      defenderSessionId: 'self',
      targetType: 'leader',
      targetInstanceId: 'self-leader',
      step: 'blocked',
      counterPowerBonus: 0,
      awaitingTriggerDecision: false
    }
    await wrapper.vm.$nextTick()

    const firstArrow = wrapper.get('[data-test="attack-arrow"]')
    const firstAnimationKey = firstArrow.attributes('data-animation-key')

    combat.value = {
      attackerSessionId: 'opponent',
      attackerInstanceId: 'opponent-character-a',
      defenderSessionId: 'self',
      targetType: 'leader',
      targetInstanceId: 'self-leader',
      blockerInstanceId: 'self-character-a',
      step: 'countering',
      counterPowerBonus: 0,
      awaitingTriggerDecision: false
    }
    await wrapper.vm.$nextTick()

    const secondArrow = wrapper.get('[data-test="attack-arrow"]')

    expect(secondArrow.attributes('data-animation-key')).toBe(firstAnimationKey)
    expect(secondArrow.attributes('data-variant')).toBe('confirmed')
  })

  it('keeps the same confirmed arrow visible while the same attack continues through later combat steps', async () => {
    const wrapper = mountBoard()

    combat.value = {
      attackerSessionId: 'opponent',
      attackerInstanceId: 'opponent-character-a',
      defenderSessionId: 'self',
      targetType: 'leader',
      targetInstanceId: 'self-leader',
      step: 'blocked',
      counterPowerBonus: 0,
      awaitingTriggerDecision: false
    }
    await wrapper.vm.$nextTick()

    const firstArrow = wrapper.get('[data-test="attack-arrow"]')
    const firstAnimationKey = firstArrow.attributes('data-animation-key')

    combat.value = {
      attackerSessionId: 'opponent',
      attackerInstanceId: 'opponent-character-a',
      defenderSessionId: 'self',
      targetType: 'leader',
      targetInstanceId: 'self-leader',
      blockerInstanceId: 'self-character-a',
      step: 'countering',
      counterPowerBonus: 0,
      awaitingTriggerDecision: false
    }
    await wrapper.vm.$nextTick()

    const continuedArrow = wrapper.get('[data-test="attack-arrow"]')

    expect(continuedArrow.attributes('data-animation-key')).toBe(firstAnimationKey)
    expect(continuedArrow.attributes('data-variant')).toBe('confirmed')
  })

  it('clears the confirmed attack arrow once combat returns to the idle snapshot with no attacker', async () => {
    const wrapper = mountBoard()

    combat.value = {
      attackerSessionId: 'opponent',
      attackerInstanceId: 'opponent-character-a',
      defenderSessionId: 'self',
      targetType: 'leader',
      targetInstanceId: 'self-leader',
      step: 'blocked',
      counterPowerBonus: 0,
      awaitingTriggerDecision: false
    }
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-test="attack-arrow"]').exists()).toBe(true)

    combat.value = {
      attackerSessionId: '',
      attackerInstanceId: '',
      defenderSessionId: '',
      targetType: 'leader',
      targetInstanceId: '',
      blockerInstanceId: '',
      step: 'declared',
      counterPowerBonus: 0,
      awaitingTriggerDecision: false
    }
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-test="attack-arrow"]').exists()).toBe(false)
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

  it('does not attach DON!! on target click when no stack is selected', async () => {
    const wrapper = mountBoard()

    await wrapper.get('[data-play-zone="0"] [data-instance-id="character-a"]').trigger('click')
    await wrapper.get('[data-play-zone="0"] [data-instance-id="character-a"]').trigger('click')

    expect(attachDon).not.toHaveBeenCalled()
  })

  it('uses the selected DON!! batch count when the self leader is clicked', async () => {
    const wrapper = mountBoard()

    await wrapper.get('[data-test="don-select-start-0"]').trigger('click')
    await wrapper.get('[data-test="don-select-hover-0"]').trigger('click')

    const selfZone = wrapper.get('[data-play-zone="0"]')

    expect(selfZone.attributes('data-selected-don-card-ids')).toBe(JSON.stringify([
      'self-don-1',
      'self-don-2',
      'self-don-3'
    ]))

    await wrapper.get('[data-play-zone="0"] [data-instance-id="self-leader"]').trigger('click')

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

  it('starts target selection from a pointer hold on a ready character', async () => {
    canDeclareAttack.value = true

    const wrapper = mountBoard({ attachToBody: true })

    await wrapper.get('[data-play-zone="0"] [data-instance-id="character-a"]').trigger('pointerdown', { button: 0 })

    expect(wrapper.get('[data-play-zone="0"]').attributes('data-attacker-id')).toBeUndefined()
    expect(wrapper.get('[data-play-zone="1"]').attributes('data-is-targetable')).toBe('true')
    expect(declareAttack).not.toHaveBeenCalled()
  })

  it('declares the attack when the pointer is released over a valid enemy target', async () => {
    canDeclareAttack.value = true

    const wrapper = mountBoard({ attachToBody: true })
    const targetElement = wrapper.get('[data-play-zone="1"] [data-instance-id="opponent-character-a"]').element as HTMLElement
    const elementFromPoint = vi.spyOn(document, 'elementFromPoint').mockReturnValue(targetElement)

    await wrapper.get('[data-play-zone="0"] [data-instance-id="character-a"]').trigger('pointerdown', { button: 0 })

    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 100, clientY: 100, button: 0 }))
    await wrapper.vm.$nextTick()

    expect(declareAttack).toHaveBeenCalledWith('character-a', 'character', 'opponent-character-a')
    expect(wrapper.get('[data-play-zone="1"]').attributes('data-is-targetable')).toBe('false')

    elementFromPoint.mockRestore()
  })

  it('cancels target selection when Escape is pressed', async () => {
    canDeclareAttack.value = true

    const wrapper = mountBoard({ attachToBody: true })

    await wrapper.get('[data-play-zone="0"] [data-instance-id="character-a"]').trigger('pointerdown', { button: 0 })
    expect(wrapper.get('[data-play-zone="1"]').attributes('data-is-targetable')).toBe('true')

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()

    expect(wrapper.get('[data-play-zone="1"]').attributes('data-is-targetable')).toBe('false')
  })

  it('cancels target selection on an empty-board pointer release', async () => {
    canDeclareAttack.value = true

    const wrapper = mountBoard({ attachToBody: true })
    const elementFromPoint = vi.spyOn(document, 'elementFromPoint').mockReturnValue(document.body)

    await wrapper.get('[data-play-zone="0"] [data-instance-id="character-a"]').trigger('pointerdown', { button: 0 })
    expect(wrapper.get('[data-play-zone="1"]').attributes('data-is-targetable')).toBe('true')

    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 5, clientY: 5, button: 0 }))
    await wrapper.vm.$nextTick()

    expect(wrapper.get('[data-play-zone="1"]').attributes('data-is-targetable')).toBe('false')
    expect(declareAttack).not.toHaveBeenCalled()

    elementFromPoint.mockRestore()
  })

  it('cancels target selection when the pointer is released over an invalid enemy card', async () => {
    canDeclareAttack.value = true

    const wrapper = mountBoard({ attachToBody: true })
    const invalidTargetElement = wrapper.get('[data-play-zone="0"] [data-instance-id="self-leader"]').element as HTMLElement
    const elementFromPoint = vi.spyOn(document, 'elementFromPoint').mockReturnValue(invalidTargetElement)

    await wrapper.get('[data-play-zone="0"] [data-instance-id="character-a"]').trigger('pointerdown', { button: 0 })
    expect(wrapper.get('[data-play-zone="1"]').attributes('data-is-targetable')).toBe('true')

    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 5, clientY: 5, button: 0 }))
    await wrapper.vm.$nextTick()

    expect(wrapper.get('[data-play-zone="1"]').attributes('data-is-targetable')).toBe('false')
    expect(declareAttack).not.toHaveBeenCalled()

    elementFromPoint.mockRestore()
  })

  it('cancels target selection on right-click while dragging', async () => {
    canDeclareAttack.value = true

    const wrapper = mountBoard({ attachToBody: true })

    await wrapper.get('[data-play-zone="0"] [data-instance-id="character-a"]').trigger('pointerdown', { button: 0 })
    expect(wrapper.get('[data-play-zone="1"]').attributes('data-is-targetable')).toBe('true')

    document.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, button: 2, cancelable: true }))
    await wrapper.vm.$nextTick()

    expect(wrapper.get('[data-play-zone="1"]').attributes('data-is-targetable')).toBe('false')
    expect(declareAttack).not.toHaveBeenCalled()
  })

  it('does not attach DON!! on leader click when no stack is selected', async () => {
    const wrapper = mountBoard()

    await wrapper.get('[data-play-zone="0"] [data-instance-id="self-leader"]').trigger('click')
    await wrapper.get('[data-play-zone="0"] [data-instance-id="self-leader"]').trigger('click')

    expect(attachDon).not.toHaveBeenCalled()
  })

  it('renders journal entries in chronological order', () => {
    logs.value = [
      { id: 'log-1', message: 'self commence la partie.', createdAt: '2026-07-24T10:00:00.000Z' },
      { id: 'log-2', message: 'DON!! insuffisant pour jouer Zoro.', createdAt: '2026-07-24T10:01:00.000Z' }
    ]

    const wrapper = mountBoard()
    const html = wrapper.html()
    const journalEntries = wrapper.findAll('[data-test="journal-entry"]')

    expect(html.indexOf('self commence la partie.')).toBeLessThan(html.indexOf('DON!! insuffisant pour jouer Zoro.'))
    expect(journalEntries).toHaveLength(2)
    expect(journalEntries[0]?.classes()).not.toContain('border')
    expect(journalEntries[0]?.classes()).not.toContain('rounded-lg')
  })

  it('applies the requested color coding to journal entries', () => {
    logs.value = [
      { id: 'log-positive', message: 'self joue Zoro.', createdAt: '2026-07-24T10:00:00.000Z' },
      { id: 'log-negative', message: 'self attaque avec Luffy.', createdAt: '2026-07-24T10:01:00.000Z' },
      { id: 'log-special', message: 'self révèle un Trigger.', createdAt: '2026-07-24T10:02:00.000Z' },
      { id: 'log-neutral', message: 'self commence la partie.', createdAt: '2026-07-24T10:03:00.000Z' }
    ]

    const wrapper = mountBoard()
    const journalEntries = wrapper.findAll('[data-test="journal-entry"]')

    expect(journalEntries[0]?.find('p').classes()).toContain('text-success')
    expect(journalEntries[1]?.find('p').classes()).toContain('text-error')
    expect(journalEntries[2]?.find('p').classes()).toContain('text-warning')
    expect(journalEntries[3]?.find('p').classes()).toContain('text-muted')
  })

  it('scrolls the journal to the latest entry when the slideover opens', async () => {
    logs.value = [
      { id: 'log-1', message: 'self commence la partie.', createdAt: '2026-07-24T10:00:00.000Z' },
      { id: 'log-2', message: 'self joue Zoro.', createdAt: '2026-07-24T10:01:00.000Z' }
    ]

    const wrapper = mountBoard()
    const journalSlideover = wrapper.getComponent(slideoverStub)

    journalSlideover.vm.$emit('update:open', true)
    await wrapper.vm.$nextTick()
    await vi.runAllTimersAsync()
    await wrapper.vm.$nextTick()

    expect(scrollToMock).toHaveBeenCalledWith({
      top: expect.any(Number),
      behavior: 'auto'
    })
  })

  it('scrolls the journal to the latest entry when a new log arrives and the slideover is open', async () => {
    logs.value = [
      { id: 'log-1', message: 'self commence la partie.', createdAt: '2026-07-24T10:00:00.000Z' }
    ]

    const wrapper = mountBoard()
    const journalSlideover = wrapper.getComponent(slideoverStub)

    journalSlideover.vm.$emit('update:open', true)
    await wrapper.vm.$nextTick()
    await vi.runAllTimersAsync()
    await wrapper.vm.$nextTick()
    scrollToMock.mockClear()

    logs.value = [
      ...logs.value,
      { id: 'log-2', message: 'self joue Zoro.', createdAt: '2026-07-24T10:01:00.000Z' }
    ]
    await wrapper.vm.$nextTick()
    await vi.runAllTimersAsync()
    await wrapper.vm.$nextTick()

    expect(scrollToMock).toHaveBeenCalledWith({
      top: expect.any(Number),
      behavior: 'smooth'
    })
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
    const clearErrorCallCountBeforeError = clearError.mock.calls.length

    errorMessage.value = 'Pas assez de DON!!'
    await wrapper.vm.$nextTick()

    expect(wrapper.get('[data-test="error-feedback"]').text()).toContain('Pas assez de DON!!')
    expect(document.body.textContent).toContain('Action impossible')
    expect(document.body.textContent).toContain('Pas assez de DON!!')
    expect(document.body.textContent).toContain('Compris')
    expect(clearError.mock.calls.length).toBeGreaterThan(clearErrorCallCountBeforeError)
  })

  it('opens a trash modal and animates the top trash card into it', async () => {
    self.value = createPlayer('self', {
      trash: [
        createPublicCard('trash-top', {
          name: 'Koby',
          number: 'OP02-098',
          imageUrl: '/cards/trash-top.png'
        }),
        createPublicCard('trash-second', {
          name: 'Helmeppo',
          number: 'OP02-099',
          imageUrl: '/cards/trash-second.png'
        })
      ]
    })

    const wrapper = mountBoard({ attachToBody: true })

    await wrapper.get('[data-test="trash-click-0"]').trigger('click')
    await wrapper.vm.$nextTick()

    const trashModal = document.querySelector('[data-test="trash-modal"]')

    expect(trashModal).not.toBeNull()
    expect(document.querySelectorAll('[data-test="trash-modal-card"]')).toHaveLength(2)
  })

  it('creates a trash travel overlay when a self hand card becomes the new top trash card', async () => {
    const wrapper = mountBoard({ attachToBody: true })

    self.value = createPlayer('self', {
      hand: [
        createPrivateCard('counter-card', { type: 'Character', counter: 1000 }),
        createPrivateCard('hand-stage', { type: 'Stage', cost: 1, power: null, counter: null })
      ],
      handCount: 2,
      trash: [
        createPublicCard('old-trash', {
          imageUrl: '/cards/old-trash.png'
        })
      ]
    })
    await wrapper.vm.$nextTick()

    self.value = createPlayer('self', {
      hand: [
        createPrivateCard('hand-stage', { type: 'Stage', cost: 1, power: null, counter: null })
      ],
      handCount: 1,
      trash: [
        createPublicCard('counter-card', {
          imageUrl: '/cards/counter-card.png'
        }),
        createPublicCard('old-trash', {
          imageUrl: '/cards/old-trash.png'
        })
      ]
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(1)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-board-travel-instance-id="counter-card"]').exists()).toBe(true)
  })

  it('uses the shared waiting toast when the opponent is disconnected', async () => {
    const wrapper = mountBoard({ attachToBody: true })

    isOpponentDisconnected.value = true
    await wrapper.vm.$nextTick()

    const waitingToast = wrapper.getComponent({ name: 'DuelWaitingToast' })

    expect(waitingToast.text()).toContain('Adversaire temporairement deconnecte')
    expect(waitingToast.props('tone')).toBe('warning')

    wrapper.unmount()
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

  it('renders the finished duel modal with opponent deck, turn count, and duration', () => {
    phase.value = 'finished'
    turn.value = 7
    winnerSessionId.value = 'opponent'
    startedAt.value = '2026-07-26T10:00:00.000Z'
    finishedAt.value = '2026-07-26T10:08:34.000Z'
    opponent.value = createPlayer('opponent', {
      displayName: 'Marshall'
    })

    const wrapper = mountBoard({ attachToBody: true })

    expect(document.body.textContent).toContain('Défaite')
    expect(document.body.textContent).toContain('7 tours')
    expect(document.body.textContent).toContain('8 min 34 s')
    expect(document.body.textContent).not.toContain('Barbe Noire Midrange')
    expect(document.body.textContent).not.toContain('Vie à zéro')

    wrapper.unmount()
  })
})

describe('DuelBoard leave to lobby', () => {
  beforeEach(() => {
    phase.value = 'main'
    turn.value = 1
    winnerSessionId.value = null
    startedAt.value = null
    finishedAt.value = null
    isSelfTurn.value = true
    isCombatInProgress.value = false
    canDeclareAttack.value = false
    isOpponentDisconnected.value = false
    self.value = createPlayer('self', {
      characters: [createPublicCard('character-a')]
    })
    opponent.value = createPlayer('opponent', {
      characters: [createPublicCard('opponent-character-a', { rested: true })]
    })
    logs.value = []
    pendingEffectDecision.value = null
    activeDecision.value = null
    isAwaitingEffectDecision.value = false
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

  function mountBoard(options: { attachToBody?: boolean } = {}) {
    return mount(DuelBoard, {
      attachTo: options.attachToBody ? document.body : undefined,
      global: {
        stubs: {
          UHeader: headerStub,
          UBadge: defaultStub,
          UButton: buttonStub,
          UAlert: defaultStub,
          USlideover: slideoverStub,
          UContainer: defaultStub,
          UCard: defaultStub,
          USeparator: defaultStub,
          UScrollArea: defaultStub,
          UInputNumber: defaultStub,
          DuelSetupOverlay: defaultStub,
          PlayZone: playZoneStub,
          DuelHand: duelHandStub
        }
      }
    })
  }

  it('renders a generic confirm prompt for an effect decision', () => {
    pendingEffectDecision.value = {
      id: 'decision-1',
      effectId: 'effect-1',
      effectCardId: 'card-1',
      sourceInstanceId: 'source-1',
      playerSessionId: 'self',
      createdAt: '2026-07-28T12:00:00.000Z',
      prompt: {
        type: 'confirm',
        message: 'Activer cet effet ?',
        optional: true
      }
    }
    activeDecision.value = {
      source: 'effect',
      pending: pendingEffectDecision.value
    }

    mountBoard({ attachToBody: true })

    expect(document.body.textContent).toContain('Décision d’effet')
    expect(document.body.textContent).toContain('Activer cet effet ?')
    expect(document.body.textContent).toContain('Activer')
    expect(document.body.textContent).toContain('Ignorer')
  })

  it('shows effect prompt card details in the details panel on hover and click', async () => {
    apiFetch.mockReset()
    apiFetch.mockResolvedValue({
      id: 'effect-card',
      number: 'OP00-001',
      name: 'Effect Card',
      type: 'Character',
      colors: ['Red'],
      cost: 4,
      power: 5000,
      life: null,
      counter: 1000,
      attributes: [],
      families: [],
      text: 'Prompt detail text',
      trigger: null,
      imageUrl: '/cards/effect-card.png',
      set: { id: 'OP00', name: 'Test Set' },
      rarity: null
    })

    const effectCard = createPublicCard('effect-card', {
      cardId: 'effect-card',
      number: 'OP00-001',
      name: 'Effect Card',
      type: 'Character',
      cost: 4,
      power: 5000
    })

    pendingEffectDecision.value = {
      id: 'decision-cards',
      effectId: 'effect-1',
      effectCardId: 'card-1',
      sourceInstanceId: 'source-1',
      playerSessionId: 'self',
      createdAt: '2026-07-28T12:00:00.000Z',
      prompt: {
        type: 'selectCards',
        message: 'Choisissez une carte.',
        selector: {
          player: 'self',
          zones: ['characters'],
          count: { kind: 'upTo', value: 1 }
        },
        min: 0,
        max: 1,
        revealedCards: []
      }
    }
    activeDecision.value = {
      source: 'effect',
      pending: pendingEffectDecision.value
    }
    selectableEffectCards.value = [effectCard]

    const wrapper = mountBoard({ attachToBody: true })
    const button = document.body.querySelector('[data-test="effect-decision-card-effect-card"]')

    expect(button).not.toBeNull()

    button?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await Promise.resolve()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(document.body.textContent).toContain('Effect Card')
    expect(document.body.textContent).toContain('Prompt detail text')

    button?.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await Promise.resolve()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(document.body.textContent).toContain('Effect Card')
    expect(document.body.textContent).toContain('Prompt detail text')
    expect(toggleEffectCardSelection).toHaveBeenCalledWith('effect-card')
  })

  it('links effect prompt selection states back to matching board elements', async () => {
    const effectCard = createPublicCard('effect-card', {
      cardId: 'effect-card',
      number: 'OP00-001',
      name: 'Effect Card',
      type: 'Character',
      cost: 4,
      power: 5000
    })

    self.value = createPlayer('self', {
      characters: [effectCard]
    })
    pendingEffectDecision.value = {
      id: 'decision-cards',
      effectId: 'effect-1',
      effectCardId: 'card-1',
      sourceInstanceId: 'source-1',
      playerSessionId: 'self',
      createdAt: '2026-07-28T12:00:00.000Z',
      prompt: {
        type: 'selectCards',
        message: 'Choisissez une carte.',
        selector: {
          player: 'self',
          zones: ['characters'],
          count: { kind: 'upTo', value: 1 }
        },
        min: 0,
        max: 1,
        revealedCards: []
      }
    }
    activeDecision.value = {
      source: 'effect',
      pending: pendingEffectDecision.value
    }
    selectableEffectCards.value = [effectCard]

    const wrapper = mountBoard({ attachToBody: true })
    const promptButton = document.body.querySelector('[data-test="effect-decision-card-effect-card"]') as HTMLButtonElement | null

    expect(promptButton).not.toBeNull()

    const selfPlayZone = wrapper.findAllComponents(playZoneStub)[1]

    expect(selfPlayZone.props('linkedSelectedInstanceIds')).toEqual([])

    promptButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    selectedEffectCardIds.value = ['effect-card']
    await Promise.resolve()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.findAllComponents(playZoneStub)[1]?.props('linkedSelectedInstanceIds')).toEqual(['effect-card'])
  })

  it('reuses board hover details after an effect prompt description fetch fails', async () => {
    apiFetch.mockReset()
    apiFetch.mockRejectedValue(new Error('catalog unavailable'))

    const effectCard = createPublicCard('effect-card', {
      cardId: 'effect-card',
      number: 'OP00-001',
      name: 'Effect Card',
      type: 'Character',
      cost: 4,
      power: 5000
    })

    self.value = createPlayer('self', {
      characters: [effectCard]
    })
    pendingEffectDecision.value = {
      id: 'decision-cards',
      effectId: 'effect-1',
      effectCardId: 'card-1',
      sourceInstanceId: 'source-1',
      playerSessionId: 'self',
      createdAt: '2026-07-28T12:00:00.000Z',
      prompt: {
        type: 'selectCards',
        message: 'Choisissez une carte.',
        selector: {
          player: 'self',
          zones: ['characters'],
          count: { kind: 'upTo', value: 1 }
        },
        min: 0,
        max: 1,
        revealedCards: []
      }
    }
    activeDecision.value = {
      source: 'effect',
      pending: pendingEffectDecision.value
    }
    selectableEffectCards.value = [effectCard]

    const wrapper = mountBoard({ attachToBody: true })
    const promptButton = document.body.querySelector('[data-test="effect-decision-card-effect-card"]') as HTMLButtonElement | null

    expect(promptButton).not.toBeNull()

    promptButton?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await Promise.resolve()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(document.body.textContent).toContain('Description indisponible.')

    await wrapper.get('[data-test="hover-card-0"]').trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(document.body.textContent).toContain('Board hover detail text')

    await wrapper.get('[data-test="leave-card-0"]').trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(document.body.textContent).toContain('Board hover detail text')
  })

  it('shows the opponent waiting toast while an effect decision is pending remotely', () => {
    isAwaitingEffectDecision.value = true

    const wrapper = mountBoard()

    expect(wrapper.text()).toContain('En attente de la résolution de l’effet par l’adversaire')
  })

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
