import { flushPromises, mount } from '@vue/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import UserAccountMenu from './UserAccountMenu.vue'

type SessionProfile = {
  authenticated: true
  user: {
    id: string
    name: string
    email: string | null
    image: null
    isAnonymous?: boolean
  }
  profile: {
    id: string
    displayName: string
    email: string | null
    image: null
    createdAt: string
    updatedAt: string
  }
}

const toastAdd = vi.fn()
const confirmMock = vi.fn()
const deleteAccountMock = vi.fn()
const signOutMock = vi.fn()
const loading = ref(false)
const profile = ref<SessionProfile | null>({
  authenticated: true,
  user: {
    id: 'auth-user-1',
    name: 'Nami',
    email: 'nami@example.test',
    image: null
  },
  profile: {
    id: 'player-1',
    displayName: 'Nami',
    email: 'nami@example.test',
    image: null,
    createdAt: '2026-07-28T00:00:00.000Z',
    updatedAt: '2026-07-28T00:00:00.000Z'
  }
})

const anonymousProfile: SessionProfile = {
  authenticated: true,
  user: {
    id: 'auth-user-guest',
    name: 'Q7mR2xK9vB4n',
    email: null,
    image: null,
    isAnonymous: true
  },
  profile: {
    id: 'player-guest',
    displayName: 'Q7mR2xK9vB4n',
    email: null,
    image: null,
    createdAt: '2026-07-28T00:00:00.000Z',
    updatedAt: '2026-07-28T00:00:00.000Z'
  }
}

mockNuxtImport('useToast', () => () => ({ add: toastAdd }))
mockNuxtImport('useConfirmDialog', () => () => ({ confirm: confirmMock }))
mockNuxtImport('useSession', () => () => ({
  deleteAccount: deleteAccountMock,
  loading,
  profile,
  signOut: signOutMock
}))

describe('UserAccountMenu', () => {
  const dropdownMenuStub = defineComponent({
    name: 'UDropdownMenu',
    props: {
      items: {
        type: Array,
        required: true
      }
    },
    template: '<div><slot /></div>'
  })

  beforeEach(() => {
    toastAdd.mockReset()
    confirmMock.mockReset()
    deleteAccountMock.mockReset()
    signOutMock.mockReset()
    loading.value = false
    profile.value = {
      authenticated: true,
      user: {
        id: 'auth-user-1',
        name: 'Nami',
        email: 'nami@example.test',
        image: null
      },
      profile: {
        id: 'player-1',
        displayName: 'Nami',
        email: 'nami@example.test',
        image: null,
        createdAt: '2026-07-28T00:00:00.000Z',
        updatedAt: '2026-07-28T00:00:00.000Z'
      }
    }
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('asks for confirmation before deleting the current account', async () => {
    confirmMock.mockResolvedValue(true)
    deleteAccountMock.mockResolvedValue(undefined)

    const wrapper = mount(UserAccountMenu, {
      global: {
        stubs: {
          UDropdownMenu: dropdownMenuStub,
          UAvatar: {
            template: '<div />'
          },
          UColorModeAvatar: {
            template: '<div />'
          },
          UColorModeSwitch: {
            template: '<div />'
          }
        }
      }
    })

    const menuItems = wrapper.getComponent(dropdownMenuStub).props('items') as Array<Array<{
      label?: string
      description?: string
      onSelect?: () => void
    }>>
    const deleteItem = menuItems[1]?.[0]

    deleteItem?.onSelect?.()
    await flushPromises()

    expect(confirmMock).toHaveBeenCalledWith({
      title: 'Supprimer ton compte ?',
      description: 'Tes decks, tes statistiques et ta session seront supprimes definitivement.',
      confirmLabel: 'Supprimer mon compte'
    })
    expect(deleteAccountMock).toHaveBeenCalledTimes(1)
  })

  it('shows an error toast when account deletion fails', async () => {
    confirmMock.mockResolvedValue(true)
    deleteAccountMock.mockRejectedValue(new Error('boom'))

    const wrapper = mount(UserAccountMenu, {
      global: {
        stubs: {
          UDropdownMenu: dropdownMenuStub,
          UAvatar: { template: '<div />' },
          UColorModeAvatar: { template: '<div />' },
          UColorModeSwitch: { template: '<div />' }
        }
      }
    })

    const menuItems = wrapper.getComponent(dropdownMenuStub).props('items') as Array<Array<{
      onSelect?: () => void
      description?: string
    }>>
    const deleteItem = menuItems[1]?.[0]

    deleteItem?.onSelect?.()
    await flushPromises()

    expect(toastAdd).toHaveBeenCalledWith({
      title: 'Suppression impossible',
      description: 'Le compte n a pas pu etre supprime. Reessaie dans un instant.',
      color: 'error'
    })
  })

  it('hides delete and sign out actions for anonymous users', async () => {
    profile.value = anonymousProfile

    const wrapper = mount(UserAccountMenu, {
      global: {
        stubs: {
          UDropdownMenu: dropdownMenuStub,
          UAvatar: { template: '<div />' },
          UColorModeAvatar: { template: '<div />' },
          UColorModeSwitch: { template: '<div />' }
        }
      }
    })

    const menuItems = wrapper.getComponent(dropdownMenuStub).props('items') as Array<Array<{
      label?: string
      onSelect?: () => void
    }>>

    expect(menuItems).toHaveLength(1)
    expect(menuItems[0]?.[0]?.label).toBe('Q7mR2xK9vB4n')
  })
})
