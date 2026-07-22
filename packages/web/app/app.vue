<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { loading, profile, signOut } = useSession()

const route = useRoute()
const isFullHeightPage = computed(() => route.path === '/zone')

const userMenuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: profile.value?.profile.displayName ?? '',
      description: profile.value?.profile.email ?? undefined,
      avatar: { src: profile.value?.profile.image ?? undefined },
      type: 'label'
    }
  ],
  [
    {
      label: 'Se deconnecter',
      icon: 'i-lucide-log-out',
      color: 'error',
      click: signOut
    }
  ]
])

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'fr'
  }
})

const title = 'One Piece TCG Simulator'
const description = 'Simulateur multijoueur en ligne pour construire et jouer tes decks One Piece TCG.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <template v-if="!isFullHeightPage">
      <UHeader>
        <template #left>
          <NuxtLink to="/">
            <AppLogo class="w-auto h-6 shrink-0" />
          </NuxtLink>
        </template>

        <template #right>
          <UColorModeButton />

          <template v-if="loading">
            <USkeleton
              class="ml-2 size-10 shrink-0 rounded-full"
            />
          </template>

          <template v-else-if="profile">
            <UDropdownMenu :items="userMenuItems">
              <UAvatar
                :src="profile.profile.image ?? undefined"
                :alt="profile.profile.displayName"
                size="md"
                class="ml-2 cursor-pointer"
              />
            </UDropdownMenu>
          </template>

          <template v-else>
            <UButton
              to="/login"
              color="primary"
              variant="solid"
              size="md"
              class="ml-2"
            >
              Connexion
            </UButton>
          </template>
        </template>
      </UHeader>
    </template>

    <UMain :class="isFullHeightPage ? 'h-dvh min-h-0 overflow-hidden' : undefined">
      <NuxtPage />
    </UMain>

    <template v-if="!isFullHeightPage">
      <USeparator icon="i-lucide-anchor" />

      <UFooter>
        <template #left>
          <p class="text-sm text-muted">
            One Piece TCG Simulator - {{ new Date().getFullYear() }}
          </p>
        </template>
      </UFooter>
    </template>
  </UApp>
</template>
