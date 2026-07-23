<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { loading, profile, signOut } = useSession()
const lightModeIcon = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%236b7280" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>'
const darkModeIcon = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%236b7280" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9"/></svg>'

const userMenuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: profile.value?.profile.displayName ?? '',
      description: profile.value?.profile.email ?? undefined,
      avatar: { src: profile.value?.profile.image ?? undefined },
      type: 'label'
    },
    {
      type: 'separator'
    },
    {
      slot: 'appearance',
      type: 'label'
    }
  ],
  [
    {
      label: 'Se deconnecter',
      icon: 'i-lucide-log-out',
      color: 'error',
      onSelect: signOut
    }
  ]
])
</script>

<template>
  <template v-if="loading">
    <USkeleton
      class="ml-2 size-10 shrink-0 rounded-full"
    />
  </template>

  <template v-else-if="profile">
    <UDropdownMenu
      :items="userMenuItems"
      :content="{ align: 'end' }"
    >
      <UAvatar
        :src="profile.profile.image ?? undefined"
        :alt="profile.profile.displayName"
        size="md"
        class="ml-2 cursor-pointer"
      />
      
      <template #appearance>
        <div class="flex min-w-56 items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <UColorModeAvatar
              :light="lightModeIcon"
              :dark="darkModeIcon"
              alt=""
              size="2xs"
            />

            <span class="text-sm text-default">
              Dark mode
            </span>
          </div>

          <UColorModeSwitch color="neutral" />
        </div>
      </template>
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
