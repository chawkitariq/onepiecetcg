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
const self = ref<DuelPlayerView | null>(null)
const opponent = ref<DuelPlayerView | null>(null)
const logs = ref<Array<{ id: string, message: string, createdAt: string }>>([])

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
      createPrivateCard('hand-event', { type: 'Event', cost: 1, power: null, counter: null })
    ],
    handCount: 2,
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
  errorMessage: ref<string | null>(null),
  endPhase,
  playCard,
  attachDon,
  clearError,
  combat: ref(null),
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
    leaderActionPopoverItems: { type: Array, default: () => [] },
    characterActionPopoverItems: { type: Object, default: () => ({}) },
    attackerId: { type: String, default: undefined },
    isTargetable: { type: Boolean, default: false }
  },
  emits: ['handCardDropOnCharacters'],
  setup(props, { emit }) {
    function getLeaderPopoverItems() {
      return props.leaderActionPopoverItems as Array<{ label: string, onSelect: () => void }>
    }

    function getCharacterPopoverItems(instanceId: string) {
      return (props.characterActionPopoverItems as Record<string, Array<{ label: string, onSelect: () => void }>>)[instanceId] ?? []
    }

    return () => h('div', {
      'data-play-zone': props.side,
      'data-leader-popover': JSON.stringify(getLeaderPopoverItems().map(item => item.label)),
      'data-character-popover-character-a': JSON.stringify(getCharacterPopoverItems('character-a').map(item => item.label)),
      'data-attacker-id': props.attackerId,
      'data-is-targetable': String(props.isTargetable ?? false)
    }, [
      h('button', {
        'data-test': `drop-${props.side}`,
        'onClick': () => emit('handCardDropOnCharacters', props.side)
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
    draggableHandCardIds: { type: Array, default: () => [] }
  },
  emits: ['cardDragStart', 'cardClick'],
  setup(props, { emit }) {
    return () => h('div', {
      'data-duel-hand': 'true',
      'data-draggable-hand-card-ids': JSON.stringify(props.draggableHandCardIds)
    }, [
      h('button', {
        'data-test': 'drag-start-0',
        'onClick': () => emit('cardDragStart', 'hand-character')
      }),
      h('button', {
        'data-test': 'hand-click-0',
        'onClick': () => emit('cardClick', 'hand-character')
      })
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

describe('DuelBoard drag and drop', () => {
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
    playCard.mockReset()
    endPhase.mockReset()
    attachDon.mockReset()
    clearError.mockReset()
    declareAttack.mockReset()
    declareBlock.mockReset()
    declareCounter.mockReset()
    finishCounterStep.mockReset()
    resolveTrigger.mockReset()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  function mountBoard() {
    return mount(DuelBoard, {
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
          DuelSetupOverlay: defaultStub,
          PlayZone: playZoneStub,
          DuelHand: duelHandStub,
          DuelOpponentHand: defaultStub
        }
      }
    })
  }

  it('exposes only affordable character cards as draggable from the self hand', () => {
    const wrapper = mountBoard()
    const hand = wrapper.get('[data-duel-hand]')

    expect(hand.attributes('data-draggable-hand-card-ids')).toBe(JSON.stringify(['hand-character']))
  })

  it('plays the dragged character when it is dropped onto the self character zone', async () => {
    const wrapper = mountBoard()

    await wrapper.get('[data-test="drag-start-0"]').trigger('click')
    await wrapper.get('[data-test="drop-0"]').trigger('click')

    expect(playCard).toHaveBeenCalledWith('hand-character')
  })

  it('does not play a dragged card when the current context is not eligible', async () => {
    phase.value = 'draw'

    const wrapper = mountBoard()

    await wrapper.get('[data-test="drag-start-0"]').trigger('click')
    await wrapper.get('[data-test="drop-0"]').trigger('click')

    expect(playCard).not.toHaveBeenCalled()
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

    expect(attachDon).toHaveBeenNthCalledWith(1, 'character', 'character-a')
    expect(attachDon).toHaveBeenNthCalledWith(2, 'character', 'character-a')
  })

  it('starts target selection from the character popover attack action', async () => {
    canDeclareAttack.value = true

    const wrapper = mountBoard()

    await wrapper.get('[data-test="character-popover-attack-0"]').trigger('click')

    expect(wrapper.get('[data-play-zone="0"]').attributes('data-attacker-id')).toBe('character-a')
    expect(wrapper.get('[data-play-zone="1"]').attributes('data-is-targetable')).toBe('true')
    expect(declareAttack).not.toHaveBeenCalled()
  })

  it('lets the leader popover trigger repeated DON attachment and attack targeting', async () => {
    canDeclareAttack.value = true

    const wrapper = mountBoard()

    await wrapper.get('[data-test="leader-popover-attach-0"]').trigger('click')
    await wrapper.get('[data-test="leader-popover-attach-0"]').trigger('click')
    await wrapper.get('[data-test="leader-popover-attack-0"]').trigger('click')

    expect(attachDon).toHaveBeenNthCalledWith(1, 'leader')
    expect(attachDon).toHaveBeenNthCalledWith(2, 'leader')
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
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
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

  function mountBoard() {
    return mount(DuelBoard, {
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
          DuelSetupOverlay: defaultStub,
          PlayZone: playZoneStub,
          DuelHand: duelHandStub,
          DuelOpponentHand: defaultStub
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
