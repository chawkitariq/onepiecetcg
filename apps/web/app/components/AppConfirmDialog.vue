<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: 'error' | 'primary' | 'warning'
}>(), {
  description: undefined,
  confirmLabel: 'Confirmer',
  cancelLabel: 'Annuler',
  confirmColor: 'error'
})

const emit = defineEmits<{
  close: [confirmed: boolean]
}>()
</script>

<template>
  <UModal
    :title="title"
    :description="description"
    :close="{ onClick: () => emit('close', false) }"
    :ui="{ footer: 'justify-end' }"
  >
    <template #footer>
      <UButton
        :label="cancelLabel"
        color="neutral"
        variant="ghost"
        @click="emit('close', false)"
      />
      <UButton
        :label="confirmLabel"
        :color="confirmColor"
        @click="emit('close', true)"
      />
    </template>
  </UModal>
</template>
