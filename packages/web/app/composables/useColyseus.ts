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
    leave
  }
}
