<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { loading, profile, signOut } = useSession()

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
