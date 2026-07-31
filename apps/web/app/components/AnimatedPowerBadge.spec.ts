import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import AnimatedPowerBadge from './AnimatedPowerBadge.vue'

const reducedMotion = ref<'reduce' | 'no-preference'>('no-preference')
const transitionedValue = ref<number | null>(null)

mockNuxtImport('usePreferredReducedMotion', () => () => reducedMotion)
mockNuxtImport('useTransition', () => () => transitionedValue)

describe('AnimatedPowerBadge', () => {
  it('renders the rounded transitioned power value by default', () => {
    reducedMotion.value = 'no-preference'
    transitionedValue.value = 8123.6

    const wrapper = mount(AnimatedPowerBadge, {
      props: {
        value: 8000
      }
    })

    expect(wrapper.text()).toContain('8')
    expect(wrapper.text()).toContain('124')
    expect(wrapper.classes()).toContain('duel-board-badge')
    expect(wrapper.classes()).toContain('duel-power-badge')
  })

  it('falls back to the raw value when reduced motion is enabled', () => {
    reducedMotion.value = 'reduce'
    transitionedValue.value = 9123.6

    const wrapper = mount(AnimatedPowerBadge, {
      props: {
        value: 8000
      }
    })

    expect(wrapper.text()).toContain('8')
    expect(wrapper.text()).toContain('000')
  })

  it('mirrors the badge when requested', () => {
    reducedMotion.value = 'no-preference'
    transitionedValue.value = 5000

    const wrapper = mount(AnimatedPowerBadge, {
      props: {
        value: 5000,
        mirrored: true
      }
    })

    expect(wrapper.classes()).toContain('-scale-x-100')
    expect(wrapper.classes()).toContain('-scale-y-100')
  })

  it('renders nothing when no power value is available', () => {
    reducedMotion.value = 'no-preference'
    transitionedValue.value = null

    const wrapper = mount(AnimatedPowerBadge, {
      props: {
        value: null
      }
    })

    expect(wrapper.html()).toBe('<!--v-if-->')
  })
})
