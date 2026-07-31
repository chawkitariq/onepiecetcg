import type { Card, Deck, DescribedRoomSummary } from '@onepiecetcg/shared'
import { flushPromises as flushVuePromises, mount } from '@vue/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { Suspense, defineComponent, h, nextTick, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LobbyPage from './lobby.vue'

function createDeck(overrides: Partial<Deck> = {}): Deck {
  return {
    id: 'deck-1',
    name: 'Deck aleatoire - Kouzuki Oden (SPR)',
    leaderCardId: 'leader-red',
    cards: Array.from({ length: 50 }, (_, index) => ({ cardId: `card-${index}`, quantity: 1 })),
    exportText: '',
    createdAt: '2026-07-24T10:00:00.000Z',
    updatedAt: '2026-07-24T10:00:00.000Z',
    ...overrides
  }
}

function createLeaderCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'leader-red',
    number: 'OP01-001',
    name: 'Kouzuki Oden',
    type: 'Leader',
    colors: ['Red'],
    cost: null,
    power: 5000,
    life: 5,
    counter: null,
    attributes: [],
    families: [],
    text: '',
    trigger: null,
    imageUrl: null,
    set: { id: 'OP01', name: 'Romance Dawn' },
    rarity: 'L',
    ...overrides
  }
}

const apiMock = vi.fn()
const toastAdd = vi.fn()
const refresh = vi.fn()
const joinDuel = vi.fn()
const createPrivateRoom = vi.fn()
const joinPrivateRoom = vi.fn()
const leave = vi.fn()

const room = ref<{ roomId: string } | null>(null)
const status = ref<'idle' | 'connecting' | 'connected' | 'error'>('idle')
const error = ref('')

mockNuxtImport('useApi', () => () => apiMock)
mockNuxtImport('useToast', () => () => ({ add: toastAdd }))
mockNuxtImport('navigateTo', () => vi.fn())

mockNuxtImport('useSession', () => () => ({
  profile: ref({
    user: { id: 'user-1', name: 'Test', email: null, image: null },
    profile: { id: 'profile-1', displayName: 'Test 1', email: null, image: null, createdAt: '', updatedAt: '' }
  }),
  refresh
}))

mockNuxtImport('useColyseus', () => () => ({
  room,
  status,
  error,
  joinDuel,
  createPrivateRoom,
  joinPrivateRoom,
  leave
}))

const passthroughStub = defineComponent({
  setup(_, { slots, attrs }) {
    return () => h('div', attrs, slots.default?.())
  }
})

const popoverStub = defineComponent({
  setup(_, { slots }) {
    return () => h('div', [slots.default?.(), slots.content?.()])
  }
})

const formStub = defineComponent({
  props: ['state', 'validateOn'],
  emits: ['submit'],
  setup(props, { slots, emit }) {
    return () => h('form', {
      onSubmit: (submitEvent: Event) => {
        submitEvent.preventDefault()
        emit('submit', { data: props.state })
      }
    }, slots.default?.())
  }
})

const buttonStub = defineComponent({
  props: ['disabled', 'loading', 'to'],
  setup(props, { slots, attrs }) {
    return () => h('button', { ...attrs, disabled: props.disabled }, slots.default?.())
  }
})

const inputStub = defineComponent({
  props: ['modelValue'],
  setup(props, { attrs }) {
    return () => h('input', {
      ...attrs,
      value: props.modelValue,
      onInput: (inputEvent: Event) => {
        const updateModelValue = attrs['onUpdate:modelValue']

        if (typeof updateModelValue === 'function') {
          updateModelValue((inputEvent.target as HTMLInputElement).value)
        }
      }
    })
  }
})

function mountLobby() {
  const SuspendedLobbyPage = defineComponent({
    setup() {
      return () => h(Suspense, null, {
        default: () => h(LobbyPage)
      })
    }
  })

  return mount(SuspendedLobbyPage, {
    global: {
      stubs: {
        Suspense: false,
        UAlert: passthroughStub,
        UCard: passthroughStub,
        UBadge: passthroughStub,
        UPopover: popoverStub,
        UForm: formStub,
        UFormField: passthroughStub,
        UButton: buttonStub,
        UInput: inputStub,
        UIcon: passthroughStub,
        USeparator: passthroughStub
      }
    }
  })
}

describe('lobby page', () => {
  beforeEach(() => {
    apiMock.mockReset()
    toastAdd.mockReset()
    refresh.mockReset()
    joinDuel.mockReset()
    createPrivateRoom.mockReset()
    joinPrivateRoom.mockReset()
    leave.mockReset()
    room.value = null
    status.value = 'idle'
    error.value = ''
  })

  it('disables quick match when the selected deck is incomplete', async () => {
    const incompleteDeck = createDeck({ cards: [{ cardId: 'card-0', quantity: 1 }] })
    apiMock
      .mockResolvedValueOnce({ decks: [incompleteDeck] })
      .mockResolvedValueOnce({ cards: [createLeaderCard()] })
      .mockResolvedValueOnce({ rooms: [] })

    const wrapper = mountLobby()
    await flushPromises()

    const quickMatchButton = wrapper.get('[data-test="quick-match"]')
    expect(quickMatchButton.attributes('disabled')).toBeDefined()
  })

  it('enables quick match once a complete deck is selected and calls joinDuel', async () => {
    const deck = createDeck()
    apiMock
      .mockResolvedValueOnce({ decks: [deck] })
      .mockResolvedValueOnce({ cards: [createLeaderCard()] })
      .mockResolvedValueOnce({ rooms: [] })

    const wrapper = mountLobby()
    await flushPromises()

    const quickMatchButton = wrapper.get('[data-test="quick-match"]')
    expect((quickMatchButton.element as HTMLButtonElement).disabled).toBe(false)

    await quickMatchButton.trigger('click')

    expect(joinDuel).toHaveBeenCalledWith({ displayName: 'Test 1', deckId: 'deck-1' })
  })

  it('refreshes the described-room list and clears the form after publishing a lobby', async () => {
    const deck = createDeck()
    const publishedRoom: DescribedRoomSummary = {
      roomId: 'room-123',
      description: 'Débutants bienvenus',
      clients: 1,
      maxClients: 2
    }

    apiMock
      .mockResolvedValueOnce({ decks: [deck] })
      .mockResolvedValueOnce({ cards: [createLeaderCard()] })
      .mockResolvedValueOnce({ rooms: [] })
      .mockResolvedValueOnce({ rooms: [publishedRoom] })

    createPrivateRoom.mockResolvedValue({ roomId: 'room-123' })

    const wrapper = mountLobby()
    await flushPromises()

    const descriptionInput = wrapper.get('[data-test="lobby-description-input"]')
    await descriptionInput.setValue('Débutants bienvenus')
    await wrapper.get('[data-test="create-lobby-form"]').trigger('submit')
    await flushPromises()

    expect(createPrivateRoom).toHaveBeenCalledWith({
      displayName: 'Test 1',
      deckId: 'deck-1',
      description: 'Débutants bienvenus'
    })
    expect(apiMock).toHaveBeenCalledTimes(4)
    expect(wrapper.text()).toContain('Débutants bienvenus')
    expect((descriptionInput.element as HTMLInputElement).value).toBe('')
  })

  it('shows an error toast when joining a room by code fails', async () => {
    const deck = createDeck()
    apiMock
      .mockResolvedValueOnce({ decks: [deck] })
      .mockResolvedValueOnce({ cards: [createLeaderCard()] })
      .mockResolvedValueOnce({ rooms: [] })

    joinPrivateRoom.mockImplementation(async () => {
      error.value = 'Room introuvable'

      return null
    })

    const wrapper = mountLobby()
    await flushPromises()

    await wrapper.get('[data-test="join-code-input"]').setValue('ABC123')
    await wrapper.get('[data-test="join-code-form"]').trigger('submit')
    await flushPromises()

    expect(joinPrivateRoom).toHaveBeenCalledWith('ABC123', { displayName: 'Test 1', deckId: 'deck-1' })
    expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({ color: 'error' }))
  })

  it('does not validate lobby inputs on blur', async () => {
    const deck = createDeck()
    apiMock
      .mockResolvedValueOnce({ decks: [deck] })
      .mockResolvedValueOnce({ cards: [createLeaderCard()] })
      .mockResolvedValueOnce({ rooms: [] })

    const wrapper = mountLobby()
    await flushPromises()

    const forms = wrapper.findAllComponents(formStub)

    expect(forms).toHaveLength(2)
    expect(forms[0]?.props('validateOn')).toEqual(['input', 'change'])
    expect(forms[1]?.props('validateOn')).toEqual(['input', 'change'])
  })
})

async function flushPromises() {
  await flushVuePromises()
  await nextTick()
}
