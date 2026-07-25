import type { PrivateCard } from '@onepiecetcg/shared'
import { mount } from '@vue/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { defineComponent, h, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DuelHand from './DuelHand.vue'

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

  return {
    motion: {
      button: defineComponent({
        name: 'MockMotionButton',
        inheritAttrs: false,
        props: {
          layout: { type: Boolean, default: false },
          layoutId: { type: String, default: undefined },
          animate: { type: [Object, Boolean], default: undefined },
          initial: { type: [Object, Boolean], default: undefined },
          transition: { type: Object, default: undefined },
          type: { type: String, default: undefined }
        },
        setup(props, { slots, attrs }) {
          return () => h('button', {
            ...attrs,
            'type': props.type,
            'data-layout-id': props.layoutId,
            'data-animate': props.animate === undefined ? undefined : JSON.stringify(props.animate)
          }, slots.default?.())
        }
      })
    }
  }
})

function createPrivateCard(instanceId: string, overrides: Partial<PrivateCard> = {}): PrivateCard {
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
    text: '',
    trigger: null,
    ...overrides
  }
}

describe('DuelHand', () => {
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

  it('attaches the reveal animation to newly revealed hand cards', () => {
    const wrapper = mount(DuelHand, {
      props: {
        hand: [createPrivateCard('hand-a'), createPrivateCard('revealed-hand')],
        revealedHandCardIds: ['revealed-hand']
      },
      global: {
        stubs: { UTooltip: tooltipStub }
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

    const wrapper = mount(DuelHand, {
      props: {
        hand: [createPrivateCard('revealed-hand')],
        revealedHandCardIds: ['revealed-hand']
      },
      global: {
        stubs: { UTooltip: tooltipStub }
      }
    })

    const animatedHandCard = wrapper.findAll('button')
      .find(node => node.attributes('data-layout-id') === 'revealed-hand')

    expect(animatedHandCard?.attributes('data-animate')).toBeUndefined()
  })

  it('emits a drag start for a draggable hand card and populates the drag data payload', async () => {
    const wrapper = mount(DuelHand, {
      props: {
        hand: [createPrivateCard('hand-a')],
        draggableHandCardIds: ['hand-a']
      },
      global: {
        stubs: { UTooltip: tooltipStub }
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
    expect(wrapper.emitted('cardDragStart')).toEqual([['hand-a']])
  })

  it('rejects a drag attempt for a non-draggable hand card', async () => {
    const wrapper = mount(DuelHand, {
      props: {
        hand: [createPrivateCard('hand-a')]
      },
      global: {
        stubs: { UTooltip: tooltipStub }
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

    expect(wrapper.emitted('invalidCardDragAttempt')).toEqual([['hand-a']])
  })

  it('emits a click event with the instance id when a hand card is clicked', async () => {
    const wrapper = mount(DuelHand, {
      props: {
        hand: [createPrivateCard('hand-a')]
      },
      global: {
        stubs: { UTooltip: tooltipStub }
      }
    })

    const handCard = wrapper.findAll('button')
      .find(node => node.attributes('data-layout-id') === 'hand-a')

    await handCard?.trigger('click')

    expect(wrapper.emitted('cardClick')).toEqual([['hand-a']])
  })
})
