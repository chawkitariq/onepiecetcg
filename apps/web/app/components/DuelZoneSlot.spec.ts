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

  it('renders the zone count as a styled badge', () => {
    const wrapper = mount(DuelZoneSlot, {
      props: {
        label: 'Cost',
        count: 7
      }
    })

    const badge = wrapper.getComponent({ name: 'UBadge' })

    expect(badge.text()).toContain('7')
    expect(badge.classes()).toContain('duel-zone-count-badge')
    expect(badge.html()).toContain('i-lucide:layers-2')
  })
})
