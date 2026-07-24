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
        stubs: {
          UTooltip: tooltipStub
        }
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
        stubs: {
          UTooltip: tooltipStub
        }
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
        stubs: {
          UTooltip: tooltipStub
        }
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
        stubs: {
          UTooltip: tooltipStub
        }
      }
    })

    const animatedHandCard = wrapper.findAll('button')
      .find(node => node.attributes('data-layout-id') === 'revealed-hand')

    expect(animatedHandCard?.attributes('data-animate')).toBeUndefined()
  })
})
