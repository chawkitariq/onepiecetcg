<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import type { DevFixtureAccount } from '~/composables/useSession'

const { loading, profile, refresh, signIn, signInWithEmailPassword, getAuthConfig } = useSession()
const route = useRoute()

const devFixtureAccounts = ref<DevFixtureAccount[]>([])

onMounted(async () => {
  const config = await getAuthConfig().catch(() => null)
  devFixtureAccounts.value = config?.devFixtureAccounts ?? []
})

const redirectTarget = computed(() => {
  const redirect = route.query.redirect
  const isSafeInternalPath = typeof redirect === 'string'
    && redirect.startsWith('/')
    && !redirect.startsWith('//')
    && !redirect.startsWith('/\\')

  return isSafeInternalPath ? redirect : '/lobby'
})

await refresh()

watch(profile, (value) => {
  if (value) {
    void navigateTo(redirectTarget.value)
  }
}, { immediate: true })

const providers = computed<ButtonProps[]>(() => [
  {
    label: 'Google',
    icon: 'i-simple-icons-google',
    loading: loading.value,
    onClick: () => signIn('google')
  },
  {
    label: 'Discord',
    icon: 'i-simple-icons-discord',
    color: 'neutral',
    variant: 'subtle',
    loading: loading.value,
    onClick: () => signIn('discord')
  }
])

async function signInAsFixture(account: DevFixtureAccount) {
  await signInWithEmailPassword(account.email, account.password)
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 py-10">
    <UPageCard class="w-full max-w-md">
      <template #headline>
        <UBadge
          color="primary"
          variant="subtle"
          icon="i-lucide-shield-check"
        >
          Simulateur One Piece TCG
        </UBadge>
      </template>

      <UAuthForm
        title="Connexion joueur"
        description="Connecte-toi avec Google ou Discord pour retrouver ton profil et tes futurs decks sauvegardes."
        icon="i-lucide-log-in"
        :providers="providers"
      />

      <template v-if="devFixtureAccounts.length > 0">
        <USeparator
          label="Developpement"
          class="my-4"
        />
        <div class="flex flex-col gap-2">
          <UButton
            v-for="account in devFixtureAccounts"
            :key="account.email"
            color="neutral"
            variant="soft"
            icon="i-lucide-flask-conical"
            :loading="loading"
            block
            @click="signInAsFixture(account)"
          >
            Se connecter en tant que {{ account.name }}
          </UButton>
        </div>
      </template>
    </UPageCard>
  </div>
</template>
