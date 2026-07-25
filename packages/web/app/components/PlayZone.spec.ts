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

function extractDirectionalOffset(style: string, direction: 'left' | 'right') {
  const match = style.match(new RegExp(`${direction}:\\s*(-?[0-9.]+)%`))

  return match ? Number.parseFloat(match[1] ?? '0') : null
}

function createPlayer(overrides: Partial<DuelPlayerView> = {}): DuelPlayerView {
  return {
    sessionId: 'player-a',
    displayName: 'Player A',
    deckId: 'deck-a',
    ready: true,
    connected: true,
    mulliganDecided: true,
    hasTakenFirstTurn: true,
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

  it('keeps deck overflow visible so draw transitions can travel between zones', () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer(),
        side: 0
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const zones = wrapper.findAllComponents({ name: 'DuelZoneSlot' })
    const deckZone = zones.find(component => component.props('label') === 'Deck')
    expect(deckZone?.props('allowOverflow')).toBe(true)
    expect(wrapper.html()).toContain('overflow-visible')
  })

  it('does not render a Main zone -- the hand lives in DuelHand, not on the mirrored board', () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer(),
        side: 0
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const zones = wrapper.findAllComponents({ name: 'DuelZoneSlot' })
    expect(zones.some(component => component.props('label') === 'Main')).toBe(false)
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

  it('renders untapped and rested DON!! as two opposite cost stacks', () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer({
          cost: [
            createPublicCard('don-ready-1', { type: 'DON!!', cost: null, power: null, counter: null }),
            createPublicCard('don-ready-2', { type: 'DON!!', cost: null, power: null, counter: null }),
            createPublicCard('don-rested-1', { type: 'DON!!', cost: null, power: null, counter: null, rested: true }),
            createPublicCard('don-rested-2', { type: 'DON!!', cost: null, power: null, counter: null, rested: true })
          ]
        }),
        side: 0
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const zones = wrapper.findAllComponents({ name: 'DuelZoneSlot' })
    const costZone = zones.find(component => component.props('label') === 'Cost')
    const untappedCards = wrapper.findAll('[data-cost-state="untapped"]')
    const restedCards = wrapper.findAll('[data-cost-state="rested"]')

    expect(costZone?.props('allowOverflow')).toBe(true)
    expect(wrapper.find('[data-cost-stack="untapped"]').exists()).toBe(true)
    expect(wrapper.find('[data-cost-stack="rested"]').exists()).toBe(true)
    expect(untappedCards).toHaveLength(2)
    expect(restedCards).toHaveLength(2)
    const untappedFirstOffset = extractDirectionalOffset(untappedCards[0]?.attributes('style') ?? '', 'left')
    const untappedSecondOffset = extractDirectionalOffset(untappedCards[1]?.attributes('style') ?? '', 'left')
    const restedFirstOffset = extractDirectionalOffset(restedCards[0]?.attributes('style') ?? '', 'right')
    const restedSecondOffset = extractDirectionalOffset(restedCards[1]?.attributes('style') ?? '', 'right')

    expect(untappedFirstOffset).not.toBeNull()
    expect(untappedSecondOffset).not.toBeNull()
    expect(restedFirstOffset).not.toBeNull()
    expect(restedSecondOffset).not.toBeNull()
    expect(untappedFirstOffset).not.toBe(untappedSecondOffset)
    expect(restedFirstOffset).not.toBe(restedSecondOffset)
    expect(untappedSecondOffset).toBeGreaterThan(untappedFirstOffset ?? 0)
    expect(restedSecondOffset).toBeGreaterThan(restedFirstOffset ?? 0)
  })

  it('emits a drop event when a dragged hand card is released over the character zone', async () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer(),
        side: 0,
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

  it('emits a drop event when a dragged hand card is released over the stage zone', async () => {
    const wrapper = mount(PlayZone, {
      props: {
        player: createPlayer(),
        side: 0,
        draggedHandCardInstanceId: 'hand-a',
        canDropOnStageZone: true
      },
      global: {
        stubs: popoverTestStubs()
      }
    })

    const stageZoneButton = wrapper.get('[data-drop-zone="stage"]')

    await stageZoneButton.trigger('dragenter')
    await stageZoneButton.trigger('dragover', { dataTransfer: { dropEffect: '' } })
    await stageZoneButton.trigger('drop')

    expect(wrapper.emitted('handCardDropOnStage')).toEqual([[0]])
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
