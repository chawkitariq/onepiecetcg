import { mount } from '@vue/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DuelAttackArrow from './DuelAttackArrow.vue'

const reducedMotion = ref<'reduce' | 'no-preference'>('no-preference')
const { animateMock } = vi.hoisted(() => ({
  animateMock: vi.fn(() => ({
    pause: vi.fn()
  }))
}))

vi.mock('animejs', () => ({
  animate: animateMock
}))

mockNuxtImport('usePreferredReducedMotion', () => () => reducedMotion)

type TestRect = {
  left: number
  top: number
  width: number
  height: number
}

function createTrackedElement(instanceId: string, rect: TestRect) {
  const element = document.createElement('div')
  element.setAttribute('data-instance-id', instanceId)
  element.getBoundingClientRect = () => ({
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
    top: rect.top,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    left: rect.left,
    toJSON: () => ({})
  }) as DOMRect

  document.body.appendChild(element)

  return element
}

describe('DuelAttackArrow', () => {
  let rafQueue: FrameRequestCallback[] = []

  beforeEach(() => {
    reducedMotion.value = 'no-preference'
    animateMock.mockClear()
    rafQueue = []
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      rafQueue.push(callback)
      return rafQueue.length
    })
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
  })

  async function flushRaf(times = 1) {
    for (let index = 0; index < times; index += 1) {
      const callback = rafQueue.shift()

      if (!callback) {
        return
      }

      callback(performance.now())
      await nextTick()
    }
  }

  it('starts the confirmed animation once when the attacker and target points become available', async () => {
    const wrapper = mount(DuelAttackArrow, {
      attachTo: document.body,
      props: {
        fromInstanceId: 'attacker-a',
        toInstanceId: 'target-a',
        variant: 'confirmed',
        animationKey: 7
      }
    })

    await nextTick()
    await flushRaf()

    expect(animateMock).not.toHaveBeenCalled()

    createTrackedElement('attacker-a', { left: 20, top: 40, width: 80, height: 120 })
    createTrackedElement('target-a', { left: 220, top: 120, width: 80, height: 120 })

    await flushRaf(2)

    expect(animateMock).toHaveBeenCalledTimes(1)

    await flushRaf(3)

    expect(animateMock).toHaveBeenCalledTimes(1)
  })

  it('does not restart the confirmed animation for the same animation key on later prop updates', async () => {
    createTrackedElement('attacker-a', { left: 20, top: 40, width: 80, height: 120 })
    createTrackedElement('target-a', { left: 220, top: 120, width: 80, height: 120 })

    const wrapper = mount(DuelAttackArrow, {
      props: {
        fromInstanceId: 'attacker-a',
        toInstanceId: 'target-a',
        variant: 'confirmed',
        animationKey: 9
      }
    })

    await nextTick()
    await flushRaf(2)

    expect(animateMock).toHaveBeenCalledTimes(1)

    await wrapper.setProps({
      fromInstanceId: 'attacker-a',
      toInstanceId: 'target-a',
      variant: 'confirmed',
      animationKey: 9
    })
    await nextTick()
    await flushRaf(2)

    expect(animateMock).toHaveBeenCalledTimes(1)
  })

  it('renders the arrow one layer above board cards', async () => {
    createTrackedElement('attacker-a', { left: 20, top: 40, width: 80, height: 120 })
    createTrackedElement('target-a', { left: 220, top: 120, width: 80, height: 120 })

    const wrapper = mount(DuelAttackArrow, {
      attachTo: document.body,
      props: {
        fromInstanceId: 'attacker-a',
        toInstanceId: 'target-a',
        variant: 'confirmed',
        animationKey: 11
      }
    })

    await nextTick()
    await flushRaf(2)

    const arrow = wrapper.find('svg')

    expect(arrow.attributes('class')).toContain('z-[61]')
  })
})
