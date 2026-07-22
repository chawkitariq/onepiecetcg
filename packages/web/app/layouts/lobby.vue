<script setup lang="ts">
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
        <UserAccountMenu />
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
