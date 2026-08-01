type WaitingToastState = {
  isOpponentDisconnected: boolean
  isBlockingStep: boolean
  isSelfAttacker: boolean
  isCounteringStep: boolean
  isAwaitingTriggerDecision: boolean
  isAwaitingEffectDecision: boolean
  hasPendingEffectDecision: boolean
}

/**
 * Formats the finished-duel turn count for the result modal.
 */
export function formatResultTurnLabel(turn: number) {
  if (turn <= 0) {
    return '—'
  }

  return `${turn} tour${turn > 1 ? 's' : ''}`
}

function parseIsoDate(value: string | null) {
  if (!value) {
    return null
  }

  const parsed = new Date(value)

  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/**
 * Formats the finished-duel duration for the result modal.
 */
export function formatMatchDurationLabel(startIso: string | null, endIso: string | null) {
  const start = parseIsoDate(startIso)
  const end = parseIsoDate(endIso)

  if (!start || !end) {
    return '—'
  }

  const totalSeconds = Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes === 0) {
    return `${seconds} s`
  }

  if (seconds === 0) {
    return `${minutes} min`
  }

  return `${minutes} min ${seconds.toString().padStart(2, '0')} s`
}

/**
 * Formats the duel header matchup label with fallbacks for missing names.
 */
export function formatMatchupLabel(selfName: string | null | undefined, opponentName: string | null | undefined) {
  return `${selfName ?? 'Vous'} vs ${opponentName ?? 'Adversaire'}`
}

/**
 * Formats the main turn button label from the current turn state.
 */
export function formatTurnButtonLabel(isSelfTurn: boolean, canEndPhase: boolean) {
  if (!isSelfTurn) {
    return 'Tour adverse'
  }

  if (canEndPhase) {
    return 'Fin du tour'
  }

  return 'Votre tour'
}

/**
 * Resolves the waiting toast copy for board states where the local player is blocked on the opponent.
 */
export function resolveWaitingToastText(state: WaitingToastState) {
  if (state.isOpponentDisconnected) {
    return 'Adversaire temporairement deconnecte. La partie reste en attente pendant la fenetre de reconnexion.'
  }

  if (state.isBlockingStep && state.isSelfAttacker) {
    return 'En attente de la décision de blocage de l\'adversaire...'
  }

  if (state.isCounteringStep && state.isSelfAttacker) {
    return 'En attente de la décision de contre de l\'adversaire...'
  }

  if (state.isAwaitingTriggerDecision && state.isSelfAttacker) {
    return 'En attente de la décision de Déclenchement du défenseur...'
  }

  if (state.isAwaitingEffectDecision && !state.hasPendingEffectDecision) {
    return 'En attente de la résolution de l’effet par l’adversaire...'
  }

  return null
}
