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
const self = ref<DuelPlayerView | null>(null)
const opponent = ref<DuelPlayerView | null>(null)

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

mockNuxtImport('useColyseus', () => () => ({
  status: ref('connected')
}))

mockNuxtImport('useDuelRoom', () => () => ({
  self,
  opponent,
  phase,
  isSelfTurn,
  isMainPhase: computed(() => phase.value === 'main'),
  canEndPhase: computed(() => isSelfTurn.value),
  selfUntappedDonCount: computed(() => self.value?.cost.filter(card => !card.rested).length ?? 0),
  isSelfCharacterZoneFull: computed(() => (self.value?.characters.length ?? 0) >= 5),
  logs: ref([]),
  errorMessage: ref<string | null>(null),
  endPhase,
  playCard,
  attachDon,
  clearError,
  combat: ref(null),
  isCombatInProgress: computed(() => isCombatInProgress.value),
  isSelfAttacker: computed(() => false),
  isSelfDefender: computed(() => false),
  canDeclareAttack: computed(() => false),
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
    draggableHandCardIds: { type: Array, default: () => [] }
  },
  emits: ['handCardDragStart', 'handCardDropOnCharacters', 'handCardClick'],
  setup(props, { emit }) {
    return () => h('div', {
      'data-play-zone': props.side,
      'data-draggable-hand-card-ids': JSON.stringify(props.draggableHandCardIds)
    }, [
      h('button', {
        'data-test': `drag-start-${props.side}`,
        'onClick': () => emit('handCardDragStart', props.side, 'hand-character')
      }),
      h('button', {
        'data-test': `drop-${props.side}`,
        'onClick': () => emit('handCardDropOnCharacters', props.side)
      }),
      h('button', {
        'data-test': `hand-click-${props.side}`,
        'onClick': () => emit('handCardClick', props.side, 'hand-character')
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

describe('DuelBoard drag and drop', () => {
  beforeEach(() => {
    phase.value = 'main'
    isSelfTurn.value = true
    isCombatInProgress.value = false
    self.value = createPlayer('self')
    opponent.value = createPlayer('opponent')
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
          UPage: defaultStub,
          UContainer: defaultStub,
          UCard: defaultStub,
          USeparator: defaultStub,
          UInputNumber: defaultStub,
          DuelSetupOverlay: defaultStub,
          PlayZone: playZoneStub
        }
      }
    })
  }

  it('exposes only affordable character cards as draggable from the self hand', () => {
    const wrapper = mountBoard()
    const selfZone = wrapper.get('[data-play-zone="0"]')

    expect(selfZone.attributes('data-draggable-hand-card-ids')).toBe(JSON.stringify(['hand-character']))
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
})
