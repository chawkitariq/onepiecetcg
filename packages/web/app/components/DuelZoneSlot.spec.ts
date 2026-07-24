import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DuelZoneSlot from './DuelZoneSlot.vue'

describe('DuelZoneSlot', () => {
  it('keeps overflow hidden by default', () => {
    const wrapper = mount(DuelZoneSlot, {
      props: {
        label: 'Leader'
      }
    })

    expect(wrapper.get('div').classes()).toContain('overflow-hidden')
  })

  it('allows visible overflow when explicitly enabled', () => {
    const wrapper = mount(DuelZoneSlot, {
      props: {
        label: 'Leader',
        allowOverflow: true
      }
    })

    expect(wrapper.get('div').classes()).toContain('overflow-visible')
  })
})
