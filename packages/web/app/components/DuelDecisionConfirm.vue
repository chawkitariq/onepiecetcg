<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>

<template>
  <p class="max-w-sm text-sm leading-6 text-muted">
    {{ message }}
  </p>
</template>
