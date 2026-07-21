<script setup lang="ts">
const { isAdversary } = defineProps<{
    isAdversary?: boolean
}>()
</script>

<template>
    <div :class="`grid grid-cols-1 gap-4 ${isAdversary ? '-scale-x-100 -scale-y-100' : ''}`">
        <div class="grid grid-cols-[12.25%_1fr] gap-4">
            <UCard variant="subtle" class="h-full relative overflow-visible">
                <p class="uppercase absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-[-1]">
                    Life</p>
                <div class="relative">
                    <img src="https://optcgapi.com/media/static/Card_Images/OP03-075.jpg" alt=""
                        class="object-cover h-full w-full relative z-50">
                    <img src="https://optcgapi.com/media/static/Card_Images/OP03-075.jpg" alt=""
                        class="absolute top-[10%] left-0 z-40">
                    <img src="https://optcgapi.com/media/static/Card_Images/OP03-075.jpg" alt=""
                        class="absolute top-[20%] left-0 z-30">
                    <img src="https://optcgapi.com/media/static/Card_Images/OP03-075.jpg" alt=""
                        class="absolute top-[30%] left-0 z-20">
                </div>
            </UCard>
            <UCard variant="subtle" class="h-full relative">
                <p class="uppercase absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-[-1]">
                    Character
                </p>
                <div class="flex justify-center gap-4">
                    <img src="https://optcgapi.com/media/static/Card_Images/OP03-075.jpg" alt=""
                        class="object-cover w-[100px]">
                    <img src="https://optcgapi.com/media/static/Card_Images/OP03-075.jpg" alt=""
                        class="object-cover w-[100px]">
                    <img src="https://optcgapi.com/media/static/Card_Images/OP03-075.jpg" alt=""
                        class="object-cover w-[100px]">
                    <img src="https://optcgapi.com/media/static/Card_Images/OP03-075.jpg" alt=""
                        class="object-cover w-[100px]">
                    <img src="https://optcgapi.com/media/static/Card_Images/OP03-075.jpg" alt=""
                        class="object-cover w-[100px]">
                </div>
            </UCard>
        </div>

        <div class="grid grid-cols-[12.25%_12.25%_12.25%] place-content-end gap-4">
            <UCard variant="subtle" class="h-full relative">
                <p class="uppercase absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-[-1]">
                    Leader
                </p>
                <img src="https://optcgapi.com/media/static/Card_Images/OP03-075.jpg" alt=""
                    class="object-cover h-full w-full">
            </UCard>
            <UCard variant="subtle" class="h-full relative">
                <p class="uppercase absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-[-1]">
                    Stage</p>
                <img src="https://optcgapi.com/media/static/Card_Images/OP03-075.jpg" alt=""
                    class="object-cover h-full w-full">
            </UCard>
            <UCard variant="subtle" class="h-full relative">
                <p class="uppercase absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-[-1]">
                    Deck</p>
                <img src="https://optcgapi.com/media/static/Card_Images/OP03-075.jpg" alt=""
                    class="object-cover h-full w-full">
            </UCard>
        </div>

        <div class="grid grid-cols-[12.25%_1fr_12.25%] gap-4">
            <UCard variant="subtle" class="h-full relative">
                <p class="uppercase absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-[-1]">
                    Don</p>
                <img src="https://optcgapi.com/media/static/Card_Images/OP03-075.jpg" alt=""
                    class="object-cover h-full w-full">
            </UCard>
            <UCard variant="subtle" class="h-full relative">
                <p class="uppercase absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-[-1]">
                    Cost</p>
                <div class="flex justify-center gap-4">
                    <img src="https://optcgapi.com/media/static/Card_Images/OP03-075.jpg" alt=""
                        class="object-cover w-[100px]">
                    <img src="https://optcgapi.com/media/static/Card_Images/OP03-075.jpg" alt=""
                        class="object-cover w-[100px]">
                    <img src="https://optcgapi.com/media/static/Card_Images/OP03-075.jpg" alt=""
                        class="object-cover w-[100px]">
                    <img src="https://optcgapi.com/media/static/Card_Images/OP03-075.jpg" alt=""
                        class="object-cover w-[100px]">
                    <img src="https://optcgapi.com/media/static/Card_Images/OP03-075.jpg" alt=""
                        class="object-cover w-[100px]">
                </div>
            </UCard>
            <UCard variant="subtle" class="h-full relative">
                <p class="uppercase absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-[-1]">
                    Trash</p>
                <img src="https://optcgapi.com/media/static/Card_Images/OP03-075.jpg" alt=""
                    class="object-cover h-full w-full">
            </UCard>
        </div>
    </div>
</template>
