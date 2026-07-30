import type { DuelLogEntry, DuelLogLevel, DuelPlayerView } from '@onepiecetcg/shared'

export type DuelLogLevelPresentation = {
  label: string
  toneClass: string
  badgeClass: string
}

export type DuelLogActorPresentation = {
  displayName: string
  classes: string
}

const DUEL_LOG_LEVEL_PRESENTATIONS: Record<DuelLogLevel, DuelLogLevelPresentation> = {
  info: {
    label: 'Info',
    toneClass: 'text-muted',
    badgeClass: 'border-default/40 bg-elevated text-toned'
  },
  action: {
    label: 'Action',
    toneClass: 'text-primary',
    badgeClass: 'border-primary/30 bg-primary/10 text-primary'
  },
  effect: {
    label: 'Effet',
    toneClass: 'text-warning',
    badgeClass: 'border-warning/30 bg-warning/10 text-warning'
  },
  system: {
    label: 'Système',
    toneClass: 'text-info',
    badgeClass: 'border-info/30 bg-info/10 text-info'
  },
  error: {
    label: 'Erreur',
    toneClass: 'text-error',
    badgeClass: 'border-error/30 bg-error/10 text-error'
  }
}

/**
 * Returns the normalized presentation metadata for a duel log level.
 */
export function getDuelLogLevelPresentation(level: DuelLogLevel): DuelLogLevelPresentation {
  return DUEL_LOG_LEVEL_PRESENTATIONS[level]
}

/**
 * Resolves the player badge to display for the actor that emitted a duel log.
 */
export function resolveDuelLogActorPresentation(
  actorSessionId: string,
  players: { self: DuelPlayerView | null, opponent: DuelPlayerView | null }
): DuelLogActorPresentation | null {
  if (!actorSessionId) {
    return null
  }

  if (players.self?.sessionId === actorSessionId) {
    return {
      displayName: players.self.displayName,
      classes: 'border-primary/30 bg-primary/10 text-primary'
    }
  }

  if (players.opponent?.sessionId === actorSessionId) {
    return {
      displayName: players.opponent.displayName,
      classes: 'border-warning/30 bg-warning/10 text-warning'
    }
  }

  return {
    displayName: actorSessionId,
    classes: 'border-default/40 bg-elevated text-toned'
  }
}

/**
 * Removes a duplicated actor prefix from the message when the actor is already
 * rendered as a dedicated badge in the journal.
 */
export function getDuelLogMessageText(
  entry: DuelLogEntry,
  actor: DuelLogActorPresentation | null
): string {
  if (!actor) {
    return entry.message
  }

  const actorPrefix = `${actor.displayName} `

  if (entry.message.startsWith(actorPrefix)) {
    return entry.message.slice(actorPrefix.length).trimStart()
  }

  return entry.message
}
