import { Client, type Room } from 'colyseus.js'
import { DuelState } from '@onepiecetcg/shared'

const RECONNECTION_TOKEN_KEY = 'duel-reconnection-token'

type ColyseusDevOverride = ReturnType<typeof createColyseusDevOverrideShape>

type DuelJoinOptions = {
  displayName?: string
  deckId: string
  description?: string
}

/**
 * `DuelState` (the real Colyseus schema class, shared with `packages/api`
 * via `packages/shared`) is passed as `rootSchema` to every join call below.
 * Relying on Colyseus's Reflection protocol instead (omitting `rootSchema`)
 * proved fragile with `@colyseus/schema` 3.x: it silently produced an empty
 * decoded state once a second client joined the room ("refId" not found
 * errors), so a shared concrete class is required, not just convenient.
 *
 * `MapSchema`/`ArraySchema` fields still aren't plain JS collections --
 * these helpers bridge that gap for template/computed consumption.
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
// /lobby and /zone/:roomId (board), which are separate page components each
// calling useColyseus() -- a Room/Client instance is not serializable, so it
// cannot live in Nuxt's useState, but it only ever exists client-side anyway.
const client = shallowRef<Client | null>(null)
const room = shallowRef<Room<DuelState> | null>(null)
const status = ref<'idle' | 'connecting' | 'connected' | 'error'>('idle')
const error = ref('')

function createColyseusDevOverrideShape() {
  return {
    client,
    room,
    status,
    error,
    joinDuel: async () => null,
    createPrivateRoom: async () => null,
    joinPrivateRoom: async () => null,
    reconnect: async () => null,
    getStoredReconnectionToken: () => null,
    leave: async () => {},
    sendMessage: () => {}
  }
}

function getColyseusDevOverride(): ColyseusDevOverride | null {
  if (!import.meta.client || !import.meta.dev) {
    return null
  }

  const override = (window as typeof window & {
    __COLYSEUS_DEV_OVERRIDE__?: ColyseusDevOverride
  }).__COLYSEUS_DEV_OVERRIDE__

  return override ?? null
}

export function useColyseus() {
  const devOverride = getColyseusDevOverride()

  if (devOverride) {
    return devOverride
  }

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
      room.value = await client.value.joinOrCreate<DuelState>('duel', options, DuelState)
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
      room.value = await client.value.create<DuelState>('duel', options, DuelState)
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
      room.value = await client.value.joinById<DuelState>(code, options, DuelState)
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
      room.value = await client.value.reconnect<DuelState>(token, DuelState)
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

  function sendMessage<T extends object>(type: string, message: T) {
    room.value?.send(type, message)
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
    leave,
    sendMessage
  }
}
