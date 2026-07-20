<script setup lang="ts">
const { errorMessage, loading, profile, refresh, signIn, signOut } = useSession()

onMounted(() => {
  void refresh()
})
</script>

<template>
  <UContainer class="py-10">
    <div class="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <section class="space-y-6">
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
      </section>

      <section class="rounded-lg border border-muted bg-elevated p-5">
        <div class="mb-4 flex items-center justify-between gap-3">
          <h2 class="text-base font-semibold text-highlighted">
            Etat de session
          </h2>

          <UButton
            icon="i-lucide-refresh-cw"
            color="neutral"
            variant="ghost"
            :loading="loading"
            aria-label="Actualiser"
            @click="refresh"
          />
        </div>

        <UAlert
          v-if="errorMessage"
          class="mb-4"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          :description="errorMessage"
        />

        <div
          v-if="profile"
          class="space-y-4"
        >
          <div class="flex items-center gap-3">
            <UAvatar
              :src="profile.profile.image ?? undefined"
              :alt="profile.profile.displayName"
              size="lg"
            />

            <div class="min-w-0">
              <p class="truncate font-medium text-highlighted">
                {{ profile.profile.displayName }}
              </p>
              <p class="truncate text-sm text-muted">
                {{ profile.profile.email ?? 'Email non expose' }}
              </p>
            </div>
          </div>

          <USeparator />

          <dl class="grid gap-3 text-sm">
            <div class="flex justify-between gap-4">
              <dt class="text-muted">
                Profil
              </dt>
              <dd class="truncate text-highlighted">
                {{ profile.profile.id }}
              </dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-muted">
                Utilisateur auth
              </dt>
              <dd class="truncate text-highlighted">
                {{ profile.user.id }}
              </dd>
            </div>
          </dl>

          <UButton
            icon="i-lucide-log-out"
            color="neutral"
            variant="outline"
            block
            :loading="loading"
            @click="signOut"
          >
            Se deconnecter
          </UButton>
        </div>

        <UEmpty
          v-else
          icon="i-lucide-user-round-x"
          title="Aucune session active"
          description="Les routes privees de l'API refusent les requetes non authentifiees."
        />
      </section>
    </div>
  </UContainer>
</template>
