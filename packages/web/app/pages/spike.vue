<script setup lang="ts">
import { Client } from 'colyseus.js'

const config = useRuntimeConfig()

const sessionStatus = ref('Idle')
const roomStatus = ref('Idle')

async function checkSession() {
  sessionStatus.value = 'Checking'

  try {
    const session = await $fetch(`${config.public.apiBase}/spike/session`, {
      credentials: 'include'
    })
    sessionStatus.value = JSON.stringify(session)
  } catch (error) {
    sessionStatus.value = error instanceof Error ? error.message : 'Request failed'
  }
}

async function joinRoom() {
  roomStatus.value = 'Joining'

  try {
    const client = new Client(config.public.colyseusEndpoint)
    const room = await client.joinOrCreate('duel_spike')
    roomStatus.value = `Joined ${room.name} as ${room.sessionId}`
    await room.leave()
  } catch (error) {
    roomStatus.value = error instanceof Error ? error.message : 'Connection failed'
  }
}
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10">
    <header>
      <p class="text-sm font-medium text-primary">
        Étape 0
      </p>
      <h1 class="mt-2 text-3xl font-semibold">
        Spike technique
      </h1>
    </header>

    <section class="grid gap-4 sm:grid-cols-2">
      <UCard>
        <template #header>
          <h2 class="text-base font-semibold">
            Session API
          </h2>
        </template>

        <p class="min-h-16 break-words text-sm text-muted">
          {{ sessionStatus }}
        </p>

        <template #footer>
          <UButton icon="i-lucide-cookie" label="Tester" @click="checkSession" />
        </template>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-base font-semibold">
            Room Colyseus
          </h2>
        </template>

        <p class="min-h-16 break-words text-sm text-muted">
          {{ roomStatus }}
        </p>

        <template #footer>
          <UButton icon="i-lucide-plug-zap" label="Rejoindre" @click="joinRoom" />
        </template>
      </UCard>
    </section>
  </main>
</template>
