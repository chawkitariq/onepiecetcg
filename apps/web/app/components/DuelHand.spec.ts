import type { PrivateCard } from '@onepiecetcg/shared'
import { mount } from '@vue/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { defineComponent, h, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getStackedCardLayout } from '~/utils/cardStack'
import DuelHand from './DuelHand.vue'

vi.mock('~/utils/cardStack', () => ({
  getStackedCardLayout: vi.fn(() => ({ startPercent: 0, offsetPercent: 0 }))
}))

const reducedMotion = ref<'reduce' | 'no-preference'>('no-preference')
const tooltipStub = defineComponent({
  name: 'UTooltip',
  setup(_, { slots }) {
    return () => h('div', { 'data-tooltip-stub': 'true' }, slots.default?.())
  }
})
const chipStub = defineComponent({
  name: 'UChip',
  props: {
    text: { type: String, default: '' }
  },
  setup(props) {
    return () => h('div', { 'data-chip-text': props.text })
  }
})

mockNuxtImport('usePreferredReducedMotion', () => () => reducedMotion)

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
    vi.mocked(getStackedCardLayout).mockClear()
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
        stubs: { UTooltip: tooltipStub, UChip: chipStub }
      }
    })

    const animatedHandCard = wrapper.findAll('button')
      .find(node => node.attributes('data-layout-id') === 'revealed-hand')

    expect(animatedHandCard?.classes()).toContain('duel-hand-card--revealed')
  })

  it('disables reveal animation details when reduced motion is requested', () => {
    reducedMotion.value = 'reduce'

    const wrapper = mount(DuelHand, {
      props: {
        hand: [createPrivateCard('revealed-hand')],
        revealedHandCardIds: ['revealed-hand']
      },
      global: {
        stubs: { UTooltip: tooltipStub, UChip: chipStub }
      }
    })

    const animatedHandCard = wrapper.findAll('button')
      .find(node => node.attributes('data-layout-id') === 'revealed-hand')

    expect(animatedHandCard?.classes()).not.toContain('duel-hand-card--revealed')
  })

  it('emits a drag start for a draggable hand card and populates the drag data payload', async () => {
    const wrapper = mount(DuelHand, {
      props: {
        hand: [createPrivateCard('hand-a')],
        draggableHandCardIds: ['hand-a']
      },
      global: {
        stubs: { UTooltip: tooltipStub, UChip: chipStub }
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
        stubs: { UTooltip: tooltipStub, UChip: chipStub }
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
        stubs: { UTooltip: tooltipStub, UChip: chipStub }
      }
    })

    const handCard = wrapper.findAll('button')
      .find(node => node.attributes('data-layout-id') === 'hand-a')

    await handCard?.trigger('click')

    expect(wrapper.emitted('cardClick')).toEqual([['hand-a', { ctrlKey: false }]])
  })

  it('emits ctrl-click intent so the board can toggle hand stack selection', async () => {
    const wrapper = mount(DuelHand, {
      props: {
        hand: [createPrivateCard('hand-a')]
      },
      global: {
        stubs: { UTooltip: tooltipStub, UChip: chipStub }
      }
    })

    const handCard = wrapper.findAll('button')
      .find(node => node.attributes('data-layout-id') === 'hand-a')

    await handCard?.trigger('click', { ctrlKey: true })

    expect(wrapper.emitted('cardClick')).toEqual([['hand-a', { ctrlKey: true }]])
  })

  it('renders the selected hand stack count on the last selected card', () => {
    const wrapper = mount(DuelHand, {
      props: {
        hand: [createPrivateCard('hand-a'), createPrivateCard('hand-b'), createPrivateCard('hand-c')],
        selectedHandCardIds: ['hand-a', 'hand-c']
      },
      global: {
        stubs: { UTooltip: tooltipStub, UChip: chipStub }
      }
    })

    expect(wrapper.findAll('[data-chip-text="2"]')).toHaveLength(1)
  })

  it('applies the shared selected highlight class to selected hand cards', () => {
    const wrapper = mount(DuelHand, {
      props: {
        hand: [createPrivateCard('hand-a')],
        selectedHandCardIds: ['hand-a']
      },
      global: {
        stubs: { UTooltip: tooltipStub, UChip: chipStub }
      }
    })

    const handCard = wrapper.findAll('button')
      .find(node => node.attributes('data-layout-id') === 'hand-a')

    expect(handCard?.classes()).toContain('duel-highlight')
    expect(handCard?.classes()).toContain('duel-highlight--selected')
  })

  it('applies the shared preview highlight class to a hand card linked from an effect prompt hover', () => {
    const wrapper = mount(DuelHand, {
      props: {
        hand: [createPrivateCard('hand-a')],
        linkedPreviewInstanceId: 'hand-a'
      },
      global: {
        stubs: { UTooltip: tooltipStub, UChip: chipStub }
      }
    })

    const handCard = wrapper.findAll('button')
      .find(node => node.attributes('data-layout-id') === 'hand-a')

    expect(handCard?.classes()).toContain('duel-highlight')
    expect(handCard?.classes()).toContain('duel-highlight--preview')
  })

  it('left-aligns the hand stack when requested by the board layout', () => {
    mount(DuelHand, {
      props: {
        hand: [createPrivateCard('hand-a')],
        align: 'start'
      },
      global: {
        stubs: { UTooltip: tooltipStub, UChip: chipStub }
      }
    })

    expect(vi.mocked(getStackedCardLayout)).toHaveBeenCalledWith(
      1,
      expect.any(Number),
      expect.any(Number),
      { centered: false, sideSpaceCards: 0 }
    )
  })

  it('renders a hidden opponent hand from only the public card count', () => {
    const wrapper = mount(DuelHand, {
      props: {
        hidden: true,
        handCount: 3,
        align: 'start'
      },
      global: {
        stubs: { UTooltip: tooltipStub, UChip: chipStub }
      }
    })

    const hiddenHand = wrapper.get('[data-opponent-hand="true"]')

    expect(hiddenHand.attributes('data-duel-hand')).toBeUndefined()
    expect(wrapper.findAll('button')).toHaveLength(0)
    expect(vi.mocked(getStackedCardLayout)).toHaveBeenCalledWith(
      3,
      expect.any(Number),
      expect.any(Number),
      { centered: false, sideSpaceCards: 0 }
    )
  })

  it('keeps deferred hand cards in the layout while hiding them visually', () => {
    const wrapper = mount(DuelHand, {
      props: {
        hand: [createPrivateCard('hand-a'), createPrivateCard('deferred-hand')],
        deferredHandCardIds: ['deferred-hand']
      },
      global: {
        stubs: { UTooltip: tooltipStub, UChip: chipStub }
      }
    })

    const renderedIds = wrapper.findAll('button')
      .map(node => node.attributes('data-layout-id'))
    const deferredHandCard = wrapper.findAll('button')
      .find(node => node.attributes('data-layout-id') === 'deferred-hand')

    expect(renderedIds).toEqual(['hand-a', 'deferred-hand'])
    expect(deferredHandCard?.classes()).toContain('opacity-0')
    expect(deferredHandCard?.classes()).toContain('pointer-events-none')
  })

  it('keeps custom position transitions on hand cards so stack movement stays visible', () => {
    const wrapper = mount(DuelHand, {
      props: {
        hand: [createPrivateCard('hand-a')]
      },
      global: {
        stubs: { UTooltip: tooltipStub, UChip: chipStub }
      }
    })

    const handCard = wrapper.findAll('button')
      .find(node => node.attributes('data-layout-id') === 'hand-a')

    expect(handCard?.classes()).toContain('duel-hand-card')
  })
})
