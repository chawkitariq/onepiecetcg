import type { DuelPlayerView, PrivateCard, PublicCard } from '@onepiecetcg/shared'
import { mount } from '@vue/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { defineComponent, h, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PlayZone from './PlayZone.vue'

const reducedMotion = ref<'reduce' | 'no-preference'>('no-preference')
const tooltipStub = defineComponent({
  name: 'UTooltip',
  setup(_, { slots }) {
    return () => h('div', { 'data-tooltip-stub': 'true' }, slots.default?.())
  }
})
const popoverStub = defineComponent({
  name: 'UPopover',
  props: {
    open: { type: Boolean, default: false }
  },
  emits: ['update:open'],
  setup(props, { slots, emit }) {
    return () => h('div', {
      'data-popover-stub': 'true',
      'data-open': String(props.open)
    }, [
      h('button', {
        'data-popover-trigger': 'true',
        'onClick': () => emit('update:open', !props.open)
      }, slots.default?.({ open: props.open })),
      h('div', { 'data-popover-content': String(props.open) }, slots.content?.({ close: () => emit('update:open', false) }))
    ])
  }
})

function popoverTestStubs() {
  return {
    UTooltip: tooltipStub,
    UPopover: popoverStub,
    UButton: defineComponent({
      name: 'UButton',
      inheritAttrs: false,
      props: {
        disabled: { type: Boolean, default: false }
      },
      setup(props, { slots, attrs }) {
        return () => h('button', { ...attrs, disabled: props.disabled }, slots.default?.())
      }
    }),
    UIcon: defineComponent({
      name: 'UIcon',
      props: {
        name: { type: String, required: true }
      },
      setup(props) {
        return () => h('span', { 'data-icon-name': props.name })
      }
    })
  }
}

mockNuxtImport('usePreferredReducedMotion', () => () => reducedMotion)

vi.mock('motion-v', async () => {
  const { defineComponent, h } = await import('vue')

  function createMotionComponent(tag: 'div' | 'button') {
    return defineComponent({
      name: `MockMotion${tag}`,
      inheritAttrs: false,
      props: {
        layout: { type: Boolean, default: false },
        layoutId: { type: String, default: undefined },
        animate: { type: [Object, Boolean], default: undefined },
        initial: { type: [Object, Boolean], default: undefined },
        exit: { type: Object, default: undefined },
        transition: { type: Object, default: undefined },
        type: { type: String, default: undefined }
      },
      setup(props, { slots, attrs }) {
        return () => h(tag, {
          ...attrs,
          'type': tag === 'button' ? props.type : undefined,
          'data-layout': String(props.layout),
          'data-layout-id': props.layoutId,
          'data-animate': props.animate === undefined ? undefined : JSON.stringify(props.animate),
          'data-initial': props.initial === undefined ? undefined : JSON.stringify(props.initial),
          'data-exit': props.exit === undefined ? undefined : JSON.stringify(props.exit)
        }, slots.default?.())
      }
    })
  }

  return {
    AnimatePresence: defineComponent({
      name: 'MockAnimatePresence',
      setup(_, { slots }) {
        return () => h('div', { 'data-motion-presence': 'true' }, slots.default?.())
      }
    }),
    LayoutGroup: defineComponent({
      name: 'MockLayoutGroup',
      props: {
        id: { type: String, required: true }
      },
      setup(props, { slots }) {
        return () => h('div', { 'data-layout-group': props.id }, slots.default?.())
      }
    }),
    motion: {
      div: createMotionComponent('div'),
      button: createMotionComponent('button')
    }
  }
})

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

function createPrivateCard(instanceId: string): PrivateCard {
  return {
    ...createPublicCard(instanceId),
    text: '',
    trigger: null
  }
}

function createPlayer(overrides: Partial<DuelPlayerView> = {}): DuelPlayerView {
  return {
    sessionId: 'player-a',
    displayName: 'Player A',
    deckId: 'deck-a',
    ready: true,
    connected: true,
    mulliganDecided: true,
    leader: createPublicCard('leader-a', { type: 'Leader', power: 5000 }),
    stage: null,
    characters: [createPublicCard('character-a')],
    cost: [],
    trash: [],
    donDeckCount: 10,
    hand: [createPrivateCard('hand-a')],
    handCount: 1,
    deck: [createPrivateCard('deck-a')],
    deckCount: 30,
    life: [createPrivateCard('life-a')],
    lifeCount: 4,
    ...overrides
  }
}

describe('PlayZone transitions', () => {
  beforeEach(() => {
    reducedMotion.value = 'no-preference'
    vi.stubGlobal('ResizeObserver', class {
      observe() {}
      disconnect() {}
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('keeps leader overflow visible so a rested leader can fully extend outside the slot', () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          leader: createPublicCard('leader-a', {
            type: 'Leader',
            power: 5000,
            rested: true
          })
        }),
        side: 0
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const leaderZone = wrapper.findAllComponents({ name: 'DuelZoneSlot' })
      .find(component => component.props('label') === 'Leader')

    expect(leaderZone?.props('allowOverflow')).toBe(true)
  })

  it('renders ghosts for hidden-zone transitions from life, deck and DON!! deck', () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer(),
        side: 0,
        transitionGhosts: [
          { instanceId: 'life-ghost', source: 'life' },
          { instanceId: 'deck-ghost', source: 'deck' },
          { instanceId: 'don-ghost', source: 'donDeck' }
        ]
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const ghostIds = wrapper.findAll('[data-layout-id]')
      .map(node => node.attributes('data-layout-id'))

    expect(ghostIds).toEqual(expect.arrayContaining(['life-ghost', 'deck-ghost', 'don-ghost']))
  })

  it('attaches the reveal animation to newly revealed hand cards', () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          hand: [createPrivateCard('hand-a'), createPrivateCard('revealed-hand')],
          handCount: 2
        }),
        side: 0,
        revealHand: true,
        revealedHandCardIds: ['revealed-hand']
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const animatedHandCard = wrapper.findAll('button')
      .find(node => node.attributes('data-layout-id') === 'revealed-hand')

    expect(animatedHandCard?.attributes('data-animate')).toBe(JSON.stringify({
      rotateY: [90, 0],
      scale: [0.94, 1],
      filter: ['brightness(1.16)', 'brightness(1)']
    }))
  })

  it('disables reveal animation details when reduced motion is requested', () => {
    reducedMotion.value = 'reduce'

    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          hand: [createPrivateCard('revealed-hand')],
          handCount: 1
        }),
        side: 0,
        revealHand: true,
        revealedHandCardIds: ['revealed-hand']
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const animatedHandCard = wrapper.findAll('button')
      .find(node => node.attributes('data-layout-id') === 'revealed-hand')

    expect(animatedHandCard?.attributes('data-animate')).toBeUndefined()
  })

  it('emits a drag start for a draggable hand card and populates the drag data payload', async () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer(),
        side: 0,
        revealHand: true,
        draggableHandCardIds: ['hand-a']
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const setData = vi.fn()
    const handCard = wrapper.findAll('button')
      .find(node => node.attributes('data-layout-id') === 'hand-a')

    await handCard?.trigger('dragstart', {
      dataTransfer: {
        setData,
        effectAllowed: ''
      }
    })

    expect(setData).toHaveBeenCalledWith('text/plain', 'hand-a')
    expect(wrapper.emitted('handCardDragStart')).toEqual([[0, 'hand-a']])
  })

  it('rejects a drag attempt for a non-draggable hand card', async () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer(),
        side: 0,
        revealHand: true
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const handCard = wrapper.findAll('button')
      .find(node => node.attributes('data-layout-id') === 'hand-a')

    await handCard?.trigger('dragstart', {
      dataTransfer: {
        setData: vi.fn(),
        effectAllowed: ''
      }
    })

    expect(wrapper.emitted('invalidHandCardDragAttempt')).toEqual([[0, 'hand-a']])
  })

  it('emits a drop event when a dragged hand card is released over the character zone', async () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer(),
        side: 0,
        revealHand: true,
        draggedHandCardInstanceId: 'hand-a',
        canDropOnCharacterZone: true
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const characterZone = wrapper.get('[data-drop-zone="character"]')

    await characterZone.trigger('dragenter')
    await characterZone.trigger('dragover', {
      dataTransfer: {
        dropEffect: 'none'
      }
    })
    await characterZone.trigger('drop')

    expect(wrapper.emitted('handCardDropOnCharacters')).toEqual([[0]])
  })

  it('switches the open popover to another character on the first click', async () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          characters: [
            createPublicCard('character-a'),
            createPublicCard('character-b')
          ]
        }),
        side: 0,
        characterActionPopoverItems: {
          'character-a': [{ label: 'Attacher un DON!!', onSelect: vi.fn() }],
          'character-b': [{ label: 'Attacher un DON!!', onSelect: vi.fn() }]
        }
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const triggers = wrapper.findAll('[data-popover-trigger="true"]')

    await triggers[0]!.trigger('click')
    expect(wrapper.findAll('[data-popover-stub="true"]').map(node => node.attributes('data-open'))).toEqual(['true', 'false'])

    await triggers[1]!.trigger('click')
    expect(wrapper.findAll('[data-popover-stub="true"]').map(node => node.attributes('data-open'))).toEqual(['false', 'true'])
  })

  it('switches the open popover from the leader to a character on the first click', async () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          characters: [createPublicCard('character-a')]
        }),
        side: 0,
        leaderActionPopoverItems: [{ label: 'Attaquer avec', onSelect: vi.fn() }],
        characterActionPopoverItems: {
          'character-a': [{ label: 'Attacher un DON!!', onSelect: vi.fn() }]
        }
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const triggers = wrapper.findAll('[data-popover-trigger="true"]')

    await triggers[0]!.trigger('click')
    expect(wrapper.findAll('[data-popover-stub="true"]').map(node => node.attributes('data-open'))).toEqual(['true', 'false'])

    await triggers[1]!.trigger('click')
    expect(wrapper.findAll('[data-popover-stub="true"]').map(node => node.attributes('data-open'))).toEqual(['false', 'true'])
  })
})
