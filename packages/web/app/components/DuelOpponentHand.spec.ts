import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getStackedCardLayout } from '~/utils/cardStack'
import DuelOpponentHand from './DuelOpponentHand.vue'

vi.mock('~/utils/cardStack', () => ({
  getStackedCardLayout: vi.fn(() => ({ startPercent: 0, offsetPercent: 0 }))
}))

const tooltipStub = defineComponent({
  name: 'UTooltip',
  setup(_, { slots }) {
    return () => h('div', { 'data-tooltip-stub': 'true' }, slots.default?.())
  }
})

describe('DuelOpponentHand', () => {
  beforeEach(() => {
    vi.mocked(getStackedCardLayout).mockClear()
    vi.stubGlobal('ResizeObserver', class {
      observe() {}
      disconnect() {}
    })
  })

  it('left-aligns the hidden hand stack when requested by the board layout', () => {
    mount(DuelOpponentHand, {
      props: {
        handCount: 3,
        align: 'start'
      },
      global: {
        stubs: { UTooltip: tooltipStub }
      }
    })

    expect(vi.mocked(getStackedCardLayout)).toHaveBeenCalledWith(
      3,
      expect.any(Number),
      expect.any(Number),
      { centered: false, sideSpaceCards: 0 }
    )
  })
})
