import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { refreshMock, navigateToMock, sessionState } = vi.hoisted(() => ({
  refreshMock: vi.fn(),
  navigateToMock: vi.fn((input: unknown) => input),
  sessionState: { profile: null as unknown }
}))

mockNuxtImport('useSession', () => () => ({
  profile: { value: sessionState.profile },
  refresh: refreshMock
}))

mockNuxtImport('navigateTo', () => navigateToMock)

describe('auth middleware', () => {
  beforeEach(() => {
    refreshMock.mockReset()
    navigateToMock.mockClear()
    sessionState.profile = null
  })

  it('redirects to /login with the original path when there is no session', async () => {
    const authMiddleware = (await import('./auth')).default

    const result = await authMiddleware(
      { fullPath: '/lobby' } as never,
      {} as never
    )

    expect(refreshMock).toHaveBeenCalled()
    expect(navigateToMock).toHaveBeenCalledWith({
      path: '/login',
      query: { redirect: '/lobby' }
    })
    expect(result).toEqual({
      path: '/login',
      query: { redirect: '/lobby' }
    })
  })

  it('lets the navigation through when a session profile exists', async () => {
    sessionState.profile = { user: { id: 'user-1' } }

    const authMiddleware = (await import('./auth')).default

    const result = await authMiddleware(
      { fullPath: '/decks' } as never,
      {} as never
    )

    expect(navigateToMock).not.toHaveBeenCalled()
    expect(result).toBeUndefined()
  })
})
