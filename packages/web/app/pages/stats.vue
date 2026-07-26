<script setup lang="ts">
import type { DeckStats, LeaderStats, PlayerStats } from '@onepiecetcg/shared'
import { formatDuration, formatPercent, streakLabel } from '~/utils/playerStatsFormat'

definePageMeta({
  layout: 'lobby',
  middleware: 'auth'
})

const api = useApi()

const stats = ref<PlayerStats | null>(null)
const loading = ref(false)
const errorMessage = ref('')

await loadStats()

async function loadStats() {
  loading.value = true
  errorMessage.value = ''

  try {
    stats.value = await api<PlayerStats>('/stats/me')
  } catch {
    errorMessage.value = 'Impossible de charger tes statistiques.'
  } finally {
    loading.value = false
  }
}

function deckLabel(deck: DeckStats) {
  return deck.deckName ?? 'Deck supprimé'
}

function leaderLabel(leader: LeaderStats) {
  return leader.leaderName ?? leader.leaderCardId
}

const winLossChartData = computed(() => stats.value ? [stats.value.wins, stats.value.losses] : [0, 0])
const winLossCategories = {
  Victoires: { name: 'Victoires', color: '#22c55e' },
  Défaites: { name: 'Défaites', color: '#ef4444' }
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
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-8">
    <h1 class="text-2xl font-bold">
      Statistiques
    </h1>
    <p class="mt-1 text-sm text-muted">
      Résultats agrégés de tes parties terminées proprement (Vie à zéro ou deck-out). Les abandons par déconnexion ne sont pas comptabilisés.
    </p>

    <UAlert
      v-if="errorMessage"
      class="mt-6"
      color="error"
      icon="i-lucide-circle-alert"
      :title="errorMessage"
    />

    <div
      v-else-if="loading"
      class="mt-6 space-y-4"
    >
      <USkeleton class="h-24 w-full" />
      <USkeleton class="h-24 w-full" />
    </div>

    <template v-else-if="stats">
      <div
        v-if="stats.played === 0"
        class="mt-6"
      >
        <UAlert
          color="neutral"
          icon="i-lucide-info"
          title="Aucune partie terminée pour le moment"
          description="Termine une partie (Vie à zéro ou deck-out) pour voir apparaître tes statistiques ici."
        />
      </div>

      <template v-else>
        <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <UCard>
            <p class="text-sm text-muted">
              Parties jouées
            </p>
            <p class="text-2xl font-bold">
              {{ stats.played }}
            </p>
          </UCard>
          <UCard>
            <p class="text-sm text-muted">
              Victoires / Défaites
            </p>
            <p class="text-2xl font-bold">
              {{ stats.wins }} / {{ stats.losses }}
            </p>
          </UCard>
          <UCard>
            <p class="text-sm text-muted">
              Taux de victoire
            </p>
            <p class="text-2xl font-bold">
              {{ formatPercent(stats.winRate) }}
            </p>
          </UCard>
          <UCard>
            <p class="text-sm text-muted">
              Série en cours
            </p>
            <p class="text-2xl font-bold">
              {{ streakLabel(stats.currentStreak) }}
            </p>
          </UCard>
        </div>

        <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <UCard>
            <p class="text-sm text-muted">
              Durée moyenne de partie
            </p>
            <p class="text-xl font-semibold">
              {{ formatDuration(stats.averageDurationSeconds) }}
            </p>
          </UCard>
          <UCard>
            <p class="text-sm text-muted">
              En jouant en premier
            </p>
            <p class="text-xl font-semibold">
              {{ stats.wentFirst.wins }}V / {{ stats.wentFirst.losses }}D ({{ formatPercent(stats.wentFirst.winRate) }})
            </p>
          </UCard>
          <UCard>
            <p class="text-sm text-muted">
              En jouant en second
            </p>
            <p class="text-xl font-semibold">
              {{ stats.wentSecond.wins }}V / {{ stats.wentSecond.losses }}D ({{ formatPercent(stats.wentSecond.winRate) }})
            </p>
          </UCard>
        </div>

        <div class="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <UCard>
            <h2 class="text-lg font-semibold">
              Victoires / Défaites
            </h2>
            <DonutChart
              class="mt-3"
              :data="winLossChartData"
              :height="220"
              :radius="4"
              :categories="winLossCategories"
            />
          </UCard>
          <UCard v-if="stats.byLeader.length > 0">
            <h2 class="text-lg font-semibold">
              Résultats par Leader
            </h2>
            <BarChart
              class="mt-3"
              :data="leaderChartData"
              :categories="leaderChartCategories"
              :y-axis="['wins', 'losses']"
              :height="220"
              :x-formatter="(i: number) => leaderChartData[i]?.leader ?? ''"
            />
          </UCard>
        </div>

        <div class="mt-8">
          <h2 class="text-lg font-semibold">
            Par deck
          </h2>
          <p
            v-if="stats.byDeck.length === 0"
            class="mt-2 text-sm text-muted"
          >
            Aucune donnée par deck.
          </p>
          <UTable
            v-else
            class="mt-3"
            :data="stats.byDeck"
            :columns="[
              { accessorKey: 'deckId', header: 'Deck' },
              { accessorKey: 'played', header: 'Parties' },
              { accessorKey: 'wins', header: 'Victoires' },
              { accessorKey: 'losses', header: 'Défaites' },
              { accessorKey: 'winRate', header: 'Taux' }
            ]"
          >
            <template #deckId-cell="{ row }">
              {{ deckLabel(row.original) }}
            </template>
            <template #winRate-cell="{ row }">
              {{ formatPercent(row.original.winRate) }}
            </template>
          </UTable>
        </div>

        <div class="mt-8">
          <h2 class="text-lg font-semibold">
            Par Leader
          </h2>
          <p
            v-if="stats.byLeader.length === 0"
            class="mt-2 text-sm text-muted"
          >
            Aucune donnée par Leader.
          </p>
          <UTable
            v-else
            class="mt-3"
            :data="stats.byLeader"
            :columns="[
              { accessorKey: 'leaderCardId', header: 'Leader' },
              { accessorKey: 'played', header: 'Parties' },
              { accessorKey: 'wins', header: 'Victoires' },
              { accessorKey: 'losses', header: 'Défaites' },
              { accessorKey: 'winRate', header: 'Taux' }
            ]"
          >
            <template #leaderCardId-cell="{ row }">
              <div class="flex items-center gap-2">
                <img
                  v-if="row.original.leaderImageUrl"
                  :src="row.original.leaderImageUrl"
                  alt=""
                  class="h-8 w-6 shrink-0 rounded object-cover"
                >
                {{ leaderLabel(row.original) }}
              </div>
            </template>
            <template #winRate-cell="{ row }">
              {{ formatPercent(row.original.winRate) }}
            </template>
          </UTable>
        </div>
      </template>
    </template>
  </div>
</template>
