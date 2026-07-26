<script setup lang="ts">
import type { DeckStats, LeaderStats, PlayerStats } from '@onepiecetcg/shared'
import { formatDuration, formatPercent, streakLabel } from '~/utils/playerStatsFormat'
import { CARD_COLOR_ACCENTS } from '~/utils/cardColors'

definePageMeta({
  layout: 'lobby',
  middleware: 'auth'
})

const api = useApi()
const isDev = import.meta.dev

const stats = ref<PlayerStats | null>(null)
const loading = ref(true)
const errorMessage = ref('')

await loadStats()

async function loadStats() {
  loading.value = true
  errorMessage.value = ''

  try {
    stats.value = await api<PlayerStats>('/stats/me')
  } catch {
    errorMessage.value = 'Le journal de bord est resté au fond de la cale : impossible de charger tes statistiques.'
  } finally {
    loading.value = false
  }
}

function deckLabel(deck: DeckStats) {
  return deck.deckName ?? 'Deck rayé du registre'
}

function leaderLabel(leader: LeaderStats) {
  return leader.leaderName ?? leader.leaderCardId
}

/** Deterministic OPTCG-color assignment per leader, since GET /stats/me doesn't carry the leader's card color. */
const leaderColorSequence = Object.values(CARD_COLOR_ACCENTS)

function leaderColor(leaderCardId: string) {
  let hash = 0

  for (let index = 0; index < leaderCardId.length; index += 1) {
    hash = (hash * 31 + leaderCardId.charCodeAt(index)) >>> 0
  }

  return leaderColorSequence[hash % leaderColorSequence.length]!.hex
}

function loadFakeStats() {
  stats.value = {
    played: 12,
    wins: 8,
    losses: 4,
    winRate: 8 / 12,
    currentStreak: { type: 'win', length: 3 },
    averageDurationSeconds: 642,
    wentFirst: { played: 7, wins: 5, losses: 2, winRate: 5 / 7 },
    wentSecond: { played: 5, wins: 3, losses: 2, winRate: 3 / 5 },
    byDeck: [
      { deckId: 'fake-deck-1', deckName: 'Rouge Rush', played: 7, wins: 5, losses: 2, winRate: 5 / 7 },
      { deckId: 'fake-deck-2', deckName: 'Bleu Control', played: 5, wins: 3, losses: 2, winRate: 3 / 5 },
      { deckId: 'fake-deck-3', deckName: 'Deck rayé du registre', played: 0, wins: 0, losses: 0, winRate: 0 }
    ],
    byLeader: [
      { leaderCardId: 'OP01-001', leaderName: 'Roronoa Zoro', leaderImageUrl: null, played: 7, wins: 5, losses: 2, winRate: 5 / 7 },
      { leaderCardId: 'ST01-001', leaderName: 'Monkey.D.Luffy', leaderImageUrl: null, played: 5, wins: 3, losses: 2, winRate: 3 / 5 }
    ]
  }
  errorMessage.value = ''
}

const leaderChartData = computed(() =>
  (stats.value?.byLeader ?? []).map(leader => ({
    leader: leaderLabel(leader),
    wins: leader.wins,
    losses: leader.losses
  }))
)
const leaderChartCategories = {
  wins: { name: 'Victoires', color: '#22c55e' },
  losses: { name: 'Défaites', color: '#ef4444' }
}

/** Life-zone-style pip meter: each pip is one game, filled by result order (most recent first, left to right), capped at 10 so the strip never overflows on a long win-loss run. */
const lifeMeterPips = computed(() => {
  if (!stats.value) {
    return []
  }

  const total = Math.min(stats.value.played, 10)
  const winShare = Math.round((stats.value.wins / stats.value.played) * total)

  return Array.from({ length: total }, (_, index) => index < winShare ? 'win' : 'loss')
})
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 pb-16 pt-8">
    <UButton
      v-if="isDev"
      color="neutral"
      variant="subtle"
      icon="i-lucide-flask-conical"
      label="Charger des données de test (dev)"
      @click="loadFakeStats"
    />

    <UAlert
      v-if="errorMessage"
      class="mt-6"
      color="error"
      icon="i-lucide-circle-alert"
      title="Le journal est illisible"
      :description="errorMessage"
    />

    <div
      v-else-if="loading"
      class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      <USkeleton
        v-for="index in 4"
        :key="index"
        class="h-20 w-full"
      />
    </div>

    <template v-else-if="stats">
      <div
        v-if="stats.played === 0"
        class="mt-6"
      >
        <UAlert
          color="neutral"
          icon="i-lucide-anchor"
          title="Ton registre est encore vierge"
          description="Termine un duel (Vie à zéro ou deck-out) pour que ton premier résultat s'inscrive ici."
        />
      </div>

      <template v-else>
        <!-- Metric strip -->
        <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <UCard :ui="{ body: 'p-4 sm:p-4' }">
            <p class="text-xs font-medium uppercase tracking-wide text-muted">
              Duels menés
            </p>
            <p class="mt-1 text-2xl font-bold text-highlighted tabular-nums">
              {{ stats.played }}
            </p>
          </UCard>
          <UCard :ui="{ body: 'p-4 sm:p-4' }">
            <p class="text-xs font-medium uppercase tracking-wide text-muted">
              Victoires / Défaites
            </p>
            <p class="mt-1 text-2xl font-bold text-highlighted tabular-nums">
              {{ stats.wins }} <span class="text-muted">/</span> {{ stats.losses }}
            </p>
          </UCard>
          <UCard :ui="{ body: 'p-4 sm:p-4' }">
            <p class="text-xs font-medium uppercase tracking-wide text-muted">
              Série en cours
            </p>
            <p
              class="mt-1 flex items-center gap-1.5 text-2xl font-bold tabular-nums"
              :class="stats.currentStreak?.type === 'win' ? 'text-success' : stats.currentStreak?.type === 'loss' ? 'text-error' : 'text-highlighted'"
            >
              <UIcon
                v-if="stats.currentStreak"
                :name="stats.currentStreak.type === 'win' ? 'i-lucide-flame' : 'i-lucide-cloud-rain'"
                class="size-5 shrink-0"
              />
              {{ streakLabel(stats.currentStreak) }}
            </p>
          </UCard>
          <UCard :ui="{ body: 'p-4 sm:p-4' }">
            <p class="text-xs font-medium uppercase tracking-wide text-muted">
              Durée moyenne
            </p>
            <p class="mt-1 text-2xl font-bold text-highlighted tabular-nums">
              {{ formatDuration(stats.averageDurationSeconds) }}
            </p>
          </UCard>
        </div>

        <!-- First / second turn split -->
        <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <UCard :ui="{ body: 'flex items-center justify-between p-4 sm:p-4' }">
            <span class="flex items-center gap-2 text-sm text-muted">
              <UIcon
                name="i-lucide-arrow-right-to-line"
                class="size-4 shrink-0"
              />
              En jouant en premier
            </span>
            <span class="text-sm font-semibold text-highlighted tabular-nums">
              {{ stats.wentFirst.wins }}V · {{ stats.wentFirst.losses }}D
              <span class="text-muted">({{ formatPercent(stats.wentFirst.winRate) }})</span>
            </span>
          </UCard>
          <UCard :ui="{ body: 'flex items-center justify-between p-4 sm:p-4' }">
            <span class="flex items-center gap-2 text-sm text-muted">
              <UIcon
                name="i-lucide-arrow-left-to-line"
                class="size-4 shrink-0"
              />
              En jouant en second
            </span>
            <span class="text-sm font-semibold text-highlighted tabular-nums">
              {{ stats.wentSecond.wins }}V · {{ stats.wentSecond.losses }}D
              <span class="text-muted">({{ formatPercent(stats.wentSecond.winRate) }})</span>
            </span>
          </UCard>
        </div>

        <!-- Win/loss life-meter + per-leader chart -->
        <div class="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <UCard class="lg:col-span-2">
            <h2 class="text-sm font-semibold uppercase tracking-wide text-muted">
              Zone de Vie
            </h2>
            <p class="mt-1 text-xs text-muted">
              Chaque carte est un duel, dans l'ordre où ils se sont enchaînés.
            </p>
            <div class="mt-4 flex gap-1.5">
              <div
                v-for="(pip, index) in lifeMeterPips"
                :key="index"
                class="h-10 flex-1 rounded-sm transition-colors"
                :class="pip === 'win' ? 'bg-success' : 'bg-error'"
              />
            </div>
            <div class="mt-3 flex items-center gap-4 text-xs text-muted">
              <span class="flex items-center gap-1.5">
                <span class="size-2.5 rounded-sm bg-success" /> Victoire
              </span>
              <span class="flex items-center gap-1.5">
                <span class="size-2.5 rounded-sm bg-error" /> Défaite
              </span>
              <span
                v-if="stats.played > 10"
                class="ml-auto"
              >dernier {{ Math.min(stats.played, 10) }} sur {{ stats.played }}</span>
            </div>
          </UCard>

          <UCard
            v-if="stats.byLeader.length > 0"
            class="lg:col-span-3"
          >
            <h2 class="text-sm font-semibold uppercase tracking-wide text-muted">
              Résultats par capitaine
            </h2>
            <BarChart
              class="mt-3"
              :data="leaderChartData"
              :categories="leaderChartCategories"
              :y-axis="['wins', 'losses']"
              :height="200"
              :x-formatter="(i: number) => leaderChartData[i]?.leader ?? ''"
            />
          </UCard>
        </div>

        <!-- Deck log -->
        <div class="mt-10">
          <h2 class="flex items-center gap-2 text-base font-semibold text-highlighted">
            <UIcon
              name="i-lucide-layers"
              class="size-4 shrink-0 text-muted"
            />
            Registre des decks
          </h2>
          <p
            v-if="stats.byDeck.length === 0"
            class="mt-2 text-sm text-muted"
          >
            Aucun deck sauvegardé n'a encore de duel à son actif.
          </p>
          <UTable
            v-else
            class="mt-3"
            :data="stats.byDeck"
            :columns="[
              { accessorKey: 'deckId', header: 'Deck' },
              { accessorKey: 'played', header: 'Duels' },
              { accessorKey: 'wins', header: 'Bilan' },
              { accessorKey: 'winRate', header: 'Taux' }
            ]"
          >
            <template #deckId-cell="{ row }">
              <span :class="row.original.deckName ? 'text-highlighted' : 'italic text-muted'">
                {{ deckLabel(row.original) }}
              </span>
            </template>
            <template #wins-cell="{ row }">
              <span class="tabular-nums">
                <span class="text-success">{{ row.original.wins }}V</span>
                <span class="text-muted"> · </span>
                <span class="text-error">{{ row.original.losses }}D</span>
              </span>
            </template>
            <template #winRate-cell="{ row }">
              <span class="font-semibold text-highlighted tabular-nums">
                {{ formatPercent(row.original.winRate) }}
              </span>
            </template>
          </UTable>
        </div>

        <!-- Leader log -->
        <div class="mt-8">
          <h2 class="flex items-center gap-2 text-base font-semibold text-highlighted">
            <UIcon
              name="i-lucide-crown"
              class="size-4 shrink-0 text-muted"
            />
            Registre des capitaines
          </h2>
          <p
            v-if="stats.byLeader.length === 0"
            class="mt-2 text-sm text-muted"
          >
            Aucun Leader n'a encore mené de duel.
          </p>
          <UTable
            v-else
            class="mt-3"
            :data="stats.byLeader"
            :columns="[
              { accessorKey: 'leaderCardId', header: 'Leader' },
              { accessorKey: 'played', header: 'Duels' },
              { accessorKey: 'wins', header: 'Bilan' },
              { accessorKey: 'winRate', header: 'Taux' }
            ]"
          >
            <template #leaderCardId-cell="{ row }">
              <div class="flex items-center gap-2.5">
                <span
                  class="size-2.5 shrink-0 rounded-full"
                  :style="{ backgroundColor: leaderColor(row.original.leaderCardId) }"
                />
                <img
                  v-if="row.original.leaderImageUrl"
                  :src="row.original.leaderImageUrl"
                  alt=""
                  class="h-8 w-6 shrink-0 rounded object-cover"
                >
                <span class="font-medium text-highlighted">{{ leaderLabel(row.original) }}</span>
              </div>
            </template>
            <template #wins-cell="{ row }">
              <span class="tabular-nums">
                <span class="text-success">{{ row.original.wins }}V</span>
                <span class="text-muted"> · </span>
                <span class="text-error">{{ row.original.losses }}D</span>
              </span>
            </template>
            <template #winRate-cell="{ row }">
              <span class="font-semibold text-highlighted tabular-nums">
                {{ formatPercent(row.original.winRate) }}
              </span>
            </template>
          </UTable>
        </div>
      </template>
    </template>
  </div>
</template>
