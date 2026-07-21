import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AppLogo from './AppLogo.vue'

describe('AppLogo', () => {
  it('renders correctly', async () => {
    const wrapper = await mountSuspended(AppLogo)
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})
