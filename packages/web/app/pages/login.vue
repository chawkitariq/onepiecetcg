<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

const { loading, profile, refresh, signIn } = useSession()
const route = useRoute()

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
    </UPageCard>
  </div>
</template>
