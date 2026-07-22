import { Client, type Room } from 'colyseus.js'
import type { DuelRoomView } from '@onepiecetcg/shared'

const RECONNECTION_TOKEN_KEY = 'duel-reconnection-token'

type DuelJoinOptions = {
  displayName?: string
  deckId: string
}

/**
 * `colyseus.js` decodes `MapSchema`/`ArraySchema` fields into live Colyseus
 * collection instances at runtime (via Reflection, since no `rootSchema`
 * class is passed here), not the plain `Record`/array shapes `DuelRoomView`
 * declares for TS convenience -- these helpers bridge that gap.
 */
export function colyseusMapValues<T>(map: unknown): T[] {
  if (map && typeof (map as { values?: () => Iterable<T> }).values === 'function') {
    return Array.from((map as { values: () => Iterable<T> }).values())
  }

  return []
}

export function colyseusArrayValues<T>(list: unknown): T[] {
  if (list && typeof (list as Iterable<T>)[Symbol.iterator] === 'function') {
    return Array.from(list as Iterable<T>)
  }

  return []
}

// Module-scope singletons: the Colyseus room must survive navigation between
// /room (lobby) and /zone (board), which are separate page components each
// calling useColyseus() -- a Room/Client instance is not serializable, so it
// cannot live in Nuxt's useState, but it only ever exists client-side anyway.
const client = shallowRef<Client | null>(null)
const room = shallowRef<Room<DuelRoomView> | null>(null)
const status = ref<'idle' | 'connecting' | 'connected' | 'error'>('idle')
const error = ref('')

export function useColyseus() {
  const config = useRuntimeConfig()

  function persistReconnectionToken() {
    if (import.meta.client && room.value) {
      sessionStorage.setItem(RECONNECTION_TOKEN_KEY, room.value.reconnectionToken)
    }
  }

  function clearReconnectionToken() {
    if (import.meta.client) {
      sessionStorage.removeItem(RECONNECTION_TOKEN_KEY)
    }
  }

  async function joinDuel(options: DuelJoinOptions) {
    if (!import.meta.client) {
      return null
    }

    status.value = 'connecting'
    error.value = ''

    try {
      client.value = client.value ?? new Client(config.public.colyseusEndpoint)
      room.value = await client.value.joinOrCreate<DuelRoomView>('duel', options)
      status.value = 'connected'
      persistReconnectionToken()

      return room.value
    } catch (caught) {
      status.value = 'error'
      error.value = caught instanceof Error ? caught.message : 'Connexion impossible'

      return null
    }
  }

  async function createPrivateRoom(options: DuelJoinOptions) {
    if (!import.meta.client) {
      return null
    }

    status.value = 'connecting'
    error.value = ''

    try {
      client.value = client.value ?? new Client(config.public.colyseusEndpoint)
      room.value = await client.value.create<DuelRoomView>('duel', options)
      status.value = 'connected'
      persistReconnectionToken()

      return room.value
    } catch (caught) {
      status.value = 'error'
      error.value = caught instanceof Error ? caught.message : 'Création de la room impossible'

      return null
    }
  }

  async function joinPrivateRoom(code: string, options: DuelJoinOptions) {
    if (!import.meta.client) {
      return null
    }

    status.value = 'connecting'
    error.value = ''

    try {
      client.value = client.value ?? new Client(config.public.colyseusEndpoint)
      room.value = await client.value.joinById<DuelRoomView>(code, options)
      status.value = 'connected'
      persistReconnectionToken()

      return room.value
    } catch (caught) {
      status.value = 'error'
      error.value = caught instanceof Error ? caught.message : 'Impossible de rejoindre cette room'

      return null
    }
  }

  async function reconnect(token: string) {
    if (!import.meta.client) {
      return null
    }

    status.value = 'connecting'
    error.value = ''

    try {
      client.value = client.value ?? new Client(config.public.colyseusEndpoint)
      room.value = await client.value.reconnect<DuelRoomView>(token)
      status.value = 'connected'
      persistReconnectionToken()

      return room.value
    } catch (caught) {
      status.value = 'error'
      error.value = caught instanceof Error ? caught.message : 'Reconnexion impossible'
      clearReconnectionToken()

      return null
    }
  }

  function getStoredReconnectionToken(): string | null {
    if (!import.meta.client) {
      return null
    }

    return sessionStorage.getItem(RECONNECTION_TOKEN_KEY)
  }

  async function leave() {
    await room.value?.leave()
    room.value = null
    status.value = 'idle'
    clearReconnectionToken()
  }

  return {
    client,
    room,
    status,
    error,
    joinDuel,
    createPrivateRoom,
    joinPrivateRoom,
    reconnect,
    getStoredReconnectionToken,
    leave
  }
}
