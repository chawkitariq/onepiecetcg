export type DuelHighlightState =
  | 'idle'
  | 'interactive'
  | 'preview'
  | 'selected'
  | 'source'
  | 'targetable'
  | 'drop-target'
  | 'invalid'

export type DuelHighlightFlags = Partial<Record<DuelHighlightState, boolean>>

type DuelHighlightConfig = {
  duel?: {
    highlight?: {
      base?: string
      states?: {
        interactive?: string
        preview?: string
        selected?: string
        source?: string
        targetable?: string
        dropTarget?: string
        invalid?: string
      }
    }
  }
}

/**
 * Resolves the single dominant highlight state for one board element so
 * concurrent gameplay signals never stack into conflicting visuals.
 */
export function resolveDuelHighlightState(
  flags: DuelHighlightFlags
): DuelHighlightState {
  if (flags.invalid) {
    return 'invalid'
  }

  if (flags['drop-target']) {
    return 'drop-target'
  }

  if (flags.targetable) {
    return 'targetable'
  }

  if (flags.selected) {
    return 'selected'
  }

  if (flags.preview) {
    return 'preview'
  }

  if (flags.source) {
    return 'source'
  }

  if (flags.interactive) {
    return 'interactive'
  }

  return 'idle'
}

/**
 * Maps a highlight state to the shared CSS contract declared in `app.config`
 * so duel components stay aligned with the Nuxt UI theme tokens.
 */
export function resolveDuelHighlightClasses(
  config: DuelHighlightConfig,
  state: DuelHighlightState
): string[] {
  if (state === 'idle') {
    return []
  }

  const base = config.duel?.highlight?.base ?? 'duel-highlight'
  const states = config.duel?.highlight?.states
  const stateClass = {
    interactive: states?.interactive ?? 'duel-highlight--interactive',
    preview: states?.preview ?? 'duel-highlight--preview',
    selected: states?.selected ?? 'duel-highlight--selected',
    source: states?.source ?? 'duel-highlight--source',
    targetable: states?.targetable ?? 'duel-highlight--targetable',
    'drop-target': states?.dropTarget ?? 'duel-highlight--drop-target',
    invalid: states?.invalid ?? 'duel-highlight--invalid'
  }[state]

  return [base, stateClass]
}
