import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useSession } from './useSession'

const { apiMock, navigateToMock } = vi.hoisted(() => ({
  apiMock: vi.fn(),
  navigateToMock: vi.fn()
}))
const profile = ref<{
  authenticated: true
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
    isAnonymous: boolean
  }
  profile: {
    id: string
    displayName: string
    email: string | null
    image: string | null
    createdAt: string
    updatedAt: string
  }
} | null>(null)

mockNuxtImport('useApi', () => () => apiMock)
mockNuxtImport('navigateTo', () => navigateToMock)
mockNuxtImport('useState', () => (key: string, init: () => unknown) => {
  if (key === 'session-profile') {
    return profile
  }

  return ref(init())
})

describe('useSession', () => {
  beforeEach(() => {
    apiMock.mockReset()
    navigateToMock.mockReset()
    profile.value = null
  })

  it('does not sign out anonymous users', async () => {
    const session = useSession()
    profile.value = {
      authenticated: true,
      user: {
        id: 'auth-user-guest',
        name: 'Q7mR2xK9vB4n',
        email: null,
        image: null,
        isAnonymous: true
      },
      profile: {
        id: 'player-1',
        displayName: 'Q7mR2xK9vB4n',
        email: null,
        image: null,
        createdAt: '2026-08-18T00:00:00.000Z',
        updatedAt: '2026-08-18T00:00:00.000Z'
      }
    }

    await session.signOut()

    expect(apiMock).not.toHaveBeenCalled()
    expect(navigateToMock).not.toHaveBeenCalled()
    expect(profile.value).toBeTruthy()
  })

  it('does not delete anonymous users', async () => {
    const session = useSession()
    profile.value = {
      authenticated: true,
      user: {
        id: 'auth-user-guest',
        name: 'Q7mR2xK9vB4n',
        email: null,
        image: null,
        isAnonymous: true
      },
      profile: {
        id: 'player-1',
        displayName: 'Q7mR2xK9vB4n',
        email: null,
        image: null,
        createdAt: '2026-08-18T00:00:00.000Z',
        updatedAt: '2026-08-18T00:00:00.000Z'
      }
    }

    await session.deleteAccount()

    expect(apiMock).not.toHaveBeenCalled()
    expect(navigateToMock).not.toHaveBeenCalled()
    expect(profile.value).toBeTruthy()
  })
})
