<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const toast = useToast()
const { confirm } = useConfirmDialog()
const { deleteAccount, loading, profile, signOut } = useSession()
const isAnonymousUser = computed(() => profile.value?.user.isAnonymous ?? false)

function createDeleteAccountErrorToast() {
  return {
    title: 'Suppression impossible',
    description: 'Le compte n a pas pu etre supprime. Reessaie dans un instant.',
    color: 'error' as const
  }
}

async function confirmDeleteAccount() {
  if (!profile.value) {
    return
  }

  const confirmed = await confirm({
    title: 'Supprimer ton compte ?',
    description: 'Tes decks, tes statistiques et ta session seront supprimes definitivement.',
    confirmLabel: 'Supprimer mon compte'
  })

  if (!confirmed) {
    return
  }

  try {
    await deleteAccount()
  } catch {
    toast.add(createDeleteAccountErrorToast())
  }
}

const userMenuItems = computed<DropdownMenuItem[][]>(() => {
  const identityItems: DropdownMenuItem[] = [
    {
      label: profile.value?.profile.displayName ?? '',
      description: profile.value?.user.isAnonymous
        ? undefined
        : profile.value?.profile.email ?? undefined,
      avatar: { src: profile.value?.profile.image ?? undefined },
      type: 'label'
    }
  ]

  if (isAnonymousUser.value) {
    return [identityItems]
  }

  const actionItems: DropdownMenuItem[] = [
    {
      label: 'Supprimer mon compte',
      icon: 'i-lucide-trash-2',
      color: 'error' as const,
      disabled: loading.value,
      onSelect: () => void confirmDeleteAccount()
    },
    {
      label: 'Se deconnecter',
      icon: 'i-lucide-log-out',
      color: 'error' as const,
      disabled: loading.value,
      onSelect: () => {
        void signOut()
      }
    }
  ]

  return [identityItems, actionItems]
})
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
