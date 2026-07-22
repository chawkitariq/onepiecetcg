<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { loading, profile, signOut } = useSession()

const navigationItems = [
  {
    label: 'Lobby',
    icon: 'i-lucide-swords',
    to: '/room'
  },
  {
    label: 'Deck builder',
    icon: 'i-lucide-layers-3',
    to: '/decks'
  }
]

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
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <UHeader>
      <template #left>
        <NuxtLink to="/">
          <AppLogo class="w-auto h-6 shrink-0" />
        </NuxtLink>
      </template>

      <UNavigationMenu :items="navigationItems" />

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

      <template #body>
        <UNavigationMenu
          :items="navigationItems"
          orientation="vertical"
          class="-mx-2.5"
        />
      </template>
    </UHeader>

    <UMain class="flex-1">
      <slot />
    </UMain>
  </div>
</template>
