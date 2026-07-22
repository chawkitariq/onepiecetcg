<script setup lang="ts">
definePageMeta({
  layout: 'simulator',
  middleware: 'auth'
})
</script>

<template>
  <ClientOnly>
    <MockDuelBoard />
    <template #fallback>
      <UPage class="grid grid-cols-[1fr_12.25%_1fr] gap-4">
        <UContainer class="grid gap-4">
          <p class="text-sm text-muted">
            Préparation du duel...
          </p>
        </UContainer>
      </UPage>
    </template>
  </ClientOnly>
</template>
