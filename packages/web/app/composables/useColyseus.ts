import { Client, type Room } from 'colyseus.js'

type DuelJoinOptions = {
  authUserId: string
  displayName?: string
  deckId: string
}

export function useColyseus() {
  const config = useRuntimeConfig()
  const client = shallowRef<Client | null>(null)
  const room = shallowRef<Room | null>(null)
  const status = ref<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const error = ref('')

  async function joinDuel(options: DuelJoinOptions) {
    if (!import.meta.client) {
      return null
    }

    status.value = 'connecting'
    error.value = ''

    try {
      client.value = client.value ?? new Client(config.public.colyseusEndpoint)
      room.value = await client.value.joinOrCreate('duel', options)
      status.value = 'connected'

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
      room.value = await client.value.create('duel', options)
      status.value = 'connected'

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
      room.value = await client.value.joinById(code, options)
      status.value = 'connected'

      return room.value
    } catch (caught) {
      status.value = 'error'
      error.value = caught instanceof Error ? caught.message : 'Impossible de rejoindre cette room'

      return null
    }
  }

  async function leave() {
    await room.value?.leave()
    room.value = null
    status.value = 'idle'
  }

  return {
    client,
    room,
    status,
    error,
    joinDuel,
    createPrivateRoom,
    joinPrivateRoom,
    leave
  }
}
