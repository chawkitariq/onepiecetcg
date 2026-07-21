<template>
  <UPage class="grid grid-cols-[1fr_12.25%_1fr] gap-4">
    <template #left>
      <UCard></UCard>
    </template>

    <UContainer class="grid gap-4">
      <PlayZone isAdversary />
      <USeparator />
      <PlayZone />
    </UContainer>

    <template #right>
      <UCard></UCard>
    </template>
  </UPage>
</template>
