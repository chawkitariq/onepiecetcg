<script setup lang="ts">
import type { DuelPlayerView, PublicCard } from '@onepiecetcg/shared'
import cardBackDon from '~/assets/card-back-don.png'
import cardBackRegular from '~/assets/card-back-regular.png'
import donFront from '~/assets/don.png'

const { player, side, isAdversary, revealHand, attackerId, isTargetable } = defineProps<{
  player: DuelPlayerView
  side: 0 | 1
  isAdversary?: boolean
  revealHand?: boolean
  attackerId?: string | null
  isTargetable?: boolean
}>()

const emit = defineEmits<{
  leaderClick: [side: 0 | 1]
  characterClick: [side: 0 | 1, instanceId: string]
  stageClick: [side: 0 | 1]
  handCardClick: [side: 0 | 1, instanceId: string]
}>()

function power(card: PublicCard): number {
  return (card.power ?? 0) + card.attachedDon * 1000
}

const life = computed(() => Array.from({ length: player.lifeCount }))
const topTrash = computed(() => player.trash[0] ?? null)
const hiddenHand = computed(() => Array.from({ length: player.hand.length }))
const textFlipClass = computed(() => isAdversary ? '-scale-x-100 -scale-y-100' : '')
</script>

<template>
  <div :class="`grid grid-cols-1 gap-4 ${isAdversary ? '-scale-x-100 -scale-y-100' : ''}`">
    <div class="grid grid-cols-[12.25%_1fr] gap-4">
      <UCard
        variant="subtle"
        class="h-full relative overflow-visible"
      >
        <p
          class="uppercase absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-[-1]"
          :class="textFlipClass"
        >
          Life ({{ player.lifeCount }})
        </p>
        <div class="relative">
          <img
            v-for="(_, index) in life"
            :key="index"
            :src="cardBackRegular"
            alt="Vie"
            class="object-cover w-full"
            :class="index === 0 ? 'relative z-50' : 'absolute left-0'"
            :style="index > 0 ? { top: `${index * 10}%`, zIndex: 50 - index } : undefined"
          >
        </div>
      </UCard>
      <UCard
        variant="subtle"
        class="h-full relative"
      >
        <p
          class="uppercase absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-[-1]"
          :class="textFlipClass"
        >
          Character
        </p>
        <div class="flex justify-center gap-4">
          <button
            v-for="character in player.characters"
            :key="character.instanceId"
            type="button"
            class="relative w-25 shrink-0"
            :class="[
              character.rested ? '-rotate-90' : '',
              attackerId === character.instanceId ? 'ring-4 ring-primary rounded' : '',
              isTargetable && character.rested ? 'ring-4 ring-error rounded' : ''
            ]"
            @click="emit('characterClick', side, character.instanceId)"
          >
            <img
              :src="character.imageUrl ?? undefined"
              alt=""
              class="object-cover w-full"
            >
            <span
              class="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1"
              :class="textFlipClass"
            >
              {{ character.name }} · {{ power(character) }}
            </span>
          </button>
        </div>
      </UCard>
    </div>

    <div class="grid grid-cols-[12.25%_12.25%_12.25%] place-content-end gap-4">
      <UCard
        variant="subtle"
        class="h-full relative"
      >
        <p
          class="uppercase absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-[-1]"
          :class="textFlipClass"
        >
          Leader
        </p>
        <button
          type="button"
          class="relative w-full"
          :class="[
            player.leader?.rested ? '-rotate-90' : '',
            attackerId === player.leader?.instanceId ? 'ring-4 ring-primary rounded' : '',
            isTargetable ? 'ring-4 ring-error rounded' : ''
          ]"
          @click="emit('leaderClick', side)"
        >
          <img
            v-if="player.leader"
            :src="player.leader.imageUrl ?? undefined"
            alt=""
            class="object-cover h-full w-full"
          >
          <span
            v-if="player.leader"
            class="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1"
            :class="textFlipClass"
          >
            {{ player.leader.name }} · {{ power(player.leader) }}
          </span>
        </button>
      </UCard>
      <UCard
        variant="subtle"
        class="h-full relative"
      >
        <p
          class="uppercase absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-[-1]"
          :class="textFlipClass"
        >
          Stage
        </p>
        <button
          type="button"
          class="w-full h-full"
          @click="emit('stageClick', side)"
        >
          <img
            v-if="player.stage"
            :src="player.stage.imageUrl ?? undefined"
            alt=""
            class="object-cover h-full w-full"
          >
        </button>
      </UCard>
      <UCard
        variant="subtle"
        class="h-full relative"
      >
        <p
          class="uppercase absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-[-1]"
          :class="textFlipClass"
        >
          Deck ({{ player.deckCount }})
        </p>
        <img
          v-if="player.deckCount > 0"
          :src="cardBackRegular"
          alt="Deck"
          class="object-cover h-full w-full"
        >
      </UCard>
    </div>

    <div class="grid grid-cols-[12.25%_1fr_12.25%] gap-4">
      <UCard
        variant="subtle"
        class="h-full relative"
      >
        <p
          class="uppercase absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-[-1]"
          :class="textFlipClass"
        >
          Don ({{ player.donDeckCount }})
        </p>
        <img
          v-if="player.donDeckCount > 0"
          :src="cardBackDon"
          alt="Deck DON!!"
          class="object-cover h-full w-full"
        >
      </UCard>
      <UCard
        variant="subtle"
        class="h-full relative"
      >
        <p
          class="uppercase absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-[-1]"
          :class="textFlipClass"
        >
          Cost
        </p>
        <div class="flex justify-center gap-4">
          <img
            v-for="don in player.cost"
            :key="don.instanceId"
            :src="donFront"
            alt="DON!!"
            class="object-cover w-20"
            :class="don.rested ? '-rotate-90' : ''"
          >
        </div>
      </UCard>
      <UCard
        variant="subtle"
        class="h-full relative"
      >
        <p
          class="uppercase absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-[-1]"
          :class="textFlipClass"
        >
          Trash ({{ player.trash.length }})
        </p>
        <img
          v-if="topTrash"
          :src="topTrash.imageUrl ?? undefined"
          alt=""
          class="object-cover h-full w-full"
        >
      </UCard>
    </div>

    <UCard
      variant="subtle"
      class="h-full relative"
    >
      <p
        class="uppercase text-xs mb-2"
        :class="textFlipClass"
      >
        Main ({{ player.hand.length }})
      </p>
      <div class="flex justify-center gap-2 flex-wrap">
        <template v-if="revealHand">
          <button
            v-for="card in player.hand"
            :key="card.instanceId"
            type="button"
            class="relative w-22.5"
            @click="emit('handCardClick', side, card.instanceId)"
          >
            <img
              :src="card.imageUrl ?? undefined"
              alt=""
              class="object-cover w-full"
            >
            <span
              class="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1"
              :class="textFlipClass"
            >
              {{ card.name }} <template v-if="card.cost !== null">
                · {{ card.cost }}
              </template>
            </span>
          </button>
        </template>
        <template v-else>
          <img
            v-for="(_, index) in hiddenHand"
            :key="index"
            :src="cardBackRegular"
            alt="Main adverse"
            class="w-15"
          >
        </template>
      </div>
    </UCard>
  </div>
</template>
