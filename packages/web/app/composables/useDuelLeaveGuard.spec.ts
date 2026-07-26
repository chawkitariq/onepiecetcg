import { mount } from '@vue/test-utils'
import { computed, defineComponent, h, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDuelLeaveGuard } from './useDuelLeaveGuard'

const {
  onBeforeRouteLeaveMock,
  registeredRouteLeaveGuards
} = vi.hoisted(() => {
  const registeredRouteLeaveGuards: Array<() => Promise<boolean | undefined> | boolean | undefined> = []
  const onBeforeRouteLeaveMock = vi.fn((guard: () => Promise<boolean | undefined> | boolean | undefined) => {
    registeredRouteLeaveGuards.push(guard)
  })

  return {
    onBeforeRouteLeaveMock,
    registeredRouteLeaveGuards
  }
})

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')

  return {
    ...actual,
    onBeforeRouteLeave: onBeforeRouteLeaveMock
  }
})

describe('useDuelLeaveGuard', () => {
  const confirm = vi.fn()
  const leave = vi.fn()
  const enabled = ref(true)

  const Harness = defineComponent({
    name: 'UseDuelLeaveGuardHarness',
    setup() {
      const guard = useDuelLeaveGuard({
        enabled: computed(() => enabled.value),
        confirm,
        leave
      })

      return () => h('button', {
        type: 'button',
        onClick: () => guard.leaveWithConfirmation()
      })
    }
  })

  beforeEach(() => {
    confirm.mockReset()
    leave.mockReset()
    enabled.value = true
    registeredRouteLeaveGuards.length = 0
    onBeforeRouteLeaveMock.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('cancels route navigation when the confirmation is dismissed', async () => {
    confirm.mockResolvedValue(false)

    mount(Harness)
    const routeGuard = registeredRouteLeaveGuards.at(0)

    expect(routeGuard).toBeTypeOf('function')
    await expect(routeGuard?.()).resolves.toBe(false)
    expect(confirm).toHaveBeenCalledWith({
      title: 'Retourner au lobby ?',
      description: 'Vous quitterez la partie en cours.',
      confirmLabel: 'Retourner au lobby'
    })
    expect(leave).not.toHaveBeenCalled()
  })

  it('leaves the room on confirmed route navigation', async () => {
    confirm.mockResolvedValue(true)

    mount(Harness)
    const routeGuard = registeredRouteLeaveGuards.at(0)

    await expect(routeGuard?.()).resolves.toBeUndefined()
    expect(leave).toHaveBeenCalledTimes(1)
  })

  it('skips confirmation entirely when the guard is disabled', async () => {
    enabled.value = false

    mount(Harness)
    const routeGuard = registeredRouteLeaveGuards.at(0)

    await expect(routeGuard?.()).resolves.toBeUndefined()
    expect(confirm).not.toHaveBeenCalled()
    expect(leave).not.toHaveBeenCalled()
  })

  it('registers a native beforeunload warning while enabled', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

    mount(Harness)

    const listener = addEventListenerSpy.mock.calls.find(([eventName]) => eventName === 'beforeunload')?.[1]

    expect(listener).toBeTypeOf('function')

    const event = new Event('beforeunload') as BeforeUnloadEvent
    const preventDefault = vi.fn()

    Object.defineProperty(event, 'preventDefault', {
      value: preventDefault
    })
    Object.defineProperty(event, 'returnValue', {
      value: undefined,
      writable: true
    })

    ;(listener as (event: BeforeUnloadEvent) => void)(event)

    expect(preventDefault).toHaveBeenCalledTimes(1)
    expect(event.returnValue).toBe('')
  })

  it('removes the native beforeunload warning on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const wrapper = mount(Harness)
    wrapper.unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))
  })
})
