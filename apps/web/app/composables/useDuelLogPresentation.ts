import type { DuelLogEntry, DuelPlayerView } from '@onepiecetcg/shared'
import type { Ref } from 'vue'
import {
  getDuelLogMessageText,
  resolveDuelLogActorPresentation
} from '~/utils/duelLogs'

type UseDuelLogPresentationOptions = {
  self: Ref<DuelPlayerView | null>
  opponent: Ref<DuelPlayerView | null>
}

/**
 * Formats duel log entries for rendering in the board journal.
 */
export function useDuelLogPresentation(options: UseDuelLogPresentationOptions) {
  function formatLogTime(createdAt: string): string {
    const date = new Date(createdAt)

    if (Number.isNaN(date.getTime())) {
      return '--:--'
    }

    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function resolveLogActor(sessionId: string) {
    return resolveDuelLogActorPresentation(sessionId, {
      self: options.self.value,
      opponent: options.opponent.value
    })
  }

  function getLogActor(entry: DuelLogEntry) {
    return resolveLogActor(entry.actorSessionId)
  }

  function getLogMessageTextForEntry(entry: DuelLogEntry) {
    return getDuelLogMessageText(entry, getLogActor(entry))
  }

  return {
    formatLogTime,
    getLogActor,
    getLogMessageText: getLogMessageTextForEntry
  }
}
