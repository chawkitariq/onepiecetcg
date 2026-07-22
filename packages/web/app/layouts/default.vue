<template>
  <div class="flex min-h-dvh flex-col">
    <UHeader>
      <template #left>
        <NuxtLink to="/">
          <AppLogo class="w-auto h-6 shrink-0" />
        </NuxtLink>
      </template>

      <template #right>
        <UColorModeButton />
        <UserAccountMenu />
      </template>
    </UHeader>

    <UMain class="flex-1">
      <slot />
    </UMain>

    <USeparator icon="i-lucide-anchor" />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          One Piece TCG Simulator - {{ new Date().getFullYear() }}
        </p>
      </template>
    </UFooter>
  </div>
</template>
