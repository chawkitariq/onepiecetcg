<script setup lang="ts">
import onePieceTcgLogo from '~/assets/onepiecetcg.png'
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <UHeader
      :ui="{
        container: 'mx-auto flex h-full w-full max-w-[2000px] items-center justify-between gap-3 px-4',
        header: 'mx-auto flex h-(--ui-header-height) w-full max-w-[2000px] items-center justify-between gap-3 px-4',
        body: 'mx-auto w-full max-w-[2000px] px-4 py-4 overflow-y-auto'
      }"
    >
      <template #left>
        <NuxtLink
          to="/"
          class="flex items-center gap-2"
        >
          <img
            :src="onePieceTcgLogo"
            alt="One Piece TCG"
            class="h-9 w-9 shrink-0 rounded-md border border-default bg-default p-1 shadow-sm ring-1 ring-inset ring-default/60"
          >
        </NuxtLink>
      </template>

      <template #right>
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
