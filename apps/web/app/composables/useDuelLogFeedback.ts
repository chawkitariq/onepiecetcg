import type { DuelLogEntry, DuelPlayerView } from '@onepiecetcg/shared'
import type { Ref } from 'vue'
import {
  extractBlockerCardName,
  extractDonGainFeedback,
  resolveAttackBannerMessage
} from '~/utils/duelBoardLogFeedback'

type UseDuelLogFeedbackOptions = {
  self: Ref<DuelPlayerView | null>
  opponent: Ref<DuelPlayerView | null>
  blockerInstanceId: Ref<string | null | undefined>
  spawnBannerFeedback: (text: string, tone?: 'narration' | 'status' | 'error') => void
  spawnCardFeedback: (instanceId: string | undefined, text: string, tone?: 'status' | 'impact' | 'gain') => void
}

/**
 * Resolves duel log entries into board feedback cues such as narration banners and card badges.
 */
export function useDuelLogFeedback(options: UseDuelLogFeedbackOptions) {
  function findPlayerByDisplayName(displayName: string) {
    if (options.self.value?.displayName === displayName) {
      return options.self.value
    }

    if (options.opponent.value?.displayName === displayName) {
      return options.opponent.value
    }

    return null
  }

  function findVisibleCardInstanceIdByName(name: string) {
    for (const player of [options.self.value, options.opponent.value]) {
      if (!player) {
        continue
      }

      if (player.leader?.name === name) {
        return player.leader.instanceId
      }

      if (player.stage?.name === name) {
        return player.stage.instanceId
      }

      const character = player.characters.find(card => card.name === name)

      if (character) {
        return character.instanceId
      }
    }

    return null
  }

  function resolveGlobalActionMessage(message: string) {
    return resolveAttackBannerMessage(message, {
      resolveLeaderNameByDisplayName: displayName => findPlayerByDisplayName(displayName)?.leader?.name
    })
  }

  function handleNewLogFeedback(message: string) {
    const globalActionMessage = resolveGlobalActionMessage(message)

    if (globalActionMessage) {
      options.spawnBannerFeedback(globalActionMessage, 'narration')
    }

    const blockerCardName = extractBlockerCardName(message)

    if (blockerCardName) {
      nextTick(() => options.spawnCardFeedback(
        findVisibleCardInstanceIdByName(blockerCardName) ?? options.blockerInstanceId.value ?? undefined,
        'Blocker',
        'status'
      ))
    }

    const donGainFeedback = extractDonGainFeedback(message)

    if (donGainFeedback) {
      const player = findPlayerByDisplayName(donGainFeedback.playerDisplayName)
      const targetInstanceId = donGainFeedback.targetLabel === 'son Leader'
        ? player?.leader?.instanceId ?? undefined
        : findVisibleCardInstanceIdByName(donGainFeedback.targetLabel) ?? undefined

      nextTick(() => options.spawnCardFeedback(targetInstanceId, `+${donGainFeedback.power}`, 'gain'))
    }
  }

  function handleNewLogEntries(entries: DuelLogEntry[]) {
    for (const entry of entries) {
      handleNewLogFeedback(entry.message)
    }
  }

  return {
    handleNewLogEntries
  }
}
