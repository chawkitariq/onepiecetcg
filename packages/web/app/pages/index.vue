<script setup lang="ts">
const { loading, signIn } = useSession()
</script>

<template>
  <UContainer class="py-10">
    <div class="mx-auto max-w-2xl space-y-6">
      <div class="space-y-3">
        <UBadge
          color="primary"
          variant="subtle"
          icon="i-lucide-shield-check"
        >
          Simulateur One Piece TCG
        </UBadge>

        <h1 class="text-4xl font-semibold tracking-normal text-highlighted sm:text-5xl">
          Connexion joueur
        </h1>

        <p class="max-w-2xl text-lg text-muted">
          Connecte-toi avec Google ou Discord pour retrouver ton profil et tes futurs decks sauvegardes.
        </p>
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <UButton
          icon="i-simple-icons-google"
          size="xl"
          block
          :loading="loading"
          @click="signIn('google')"
        >
          Google
        </UButton>

        <UButton
          icon="i-simple-icons-discord"
          size="xl"
          color="neutral"
          variant="subtle"
          block
          :loading="loading"
          @click="signIn('discord')"
        >
          Discord
        </UButton>
      </div>
    </div>
  </UContainer>
</template>
