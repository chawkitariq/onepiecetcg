export type DuelCardFeedbackFamily = 'impact' | 'gain' | 'status'
export type DuelBannerFeedbackFamily = 'narration' | 'error'
export type DuelFloatingFeedbackFamily = 'impact' | 'gain'
export type DuelFeedbackFamily =
  | DuelCardFeedbackFamily
  | DuelBannerFeedbackFamily
  | DuelFloatingFeedbackFamily

export type DuelFeedbackSurface = 'card' | 'banner' | 'floating'

type DuelFeedbackConfig = {
  duel?: {
    feedback?: {
      base?: string
      surfaces?: Partial<Record<DuelFeedbackSurface, string>>
      families?: Partial<Record<DuelFeedbackFamily, string>>
    }
  }
}

/**
 * Resolves the shared CSS contract for duel feedback labels so floating numbers,
 * per-card badges and global banners all stay visually aligned.
 */
export function resolveDuelFeedbackClasses(
  config: DuelFeedbackConfig,
  surface: DuelFeedbackSurface,
  family: DuelFeedbackFamily
): string[] {
  const feedback = config.duel?.feedback
  const base = feedback?.base ?? 'duel-feedback'
  const surfaceClass = feedback?.surfaces?.[surface] ?? `duel-feedback--${surface}`
  const familyClass = feedback?.families?.[family] ?? `duel-feedback--${family}`

  return [base, surfaceClass, familyClass]
}

/**
 * Shared motion presets keep duel feedback brief, readable and consistent with
 * the board's tactical visual language.
 */
export function getDuelCardFeedbackAnimation(
  family: DuelCardFeedbackFamily,
  reducedMotion: boolean,
  onComplete: () => void
) {
  if (reducedMotion) {
    return {
      opacity: [1, 1, 0],
      duration: 680,
      ease: 'linear',
      onComplete
    }
  }

  const preset = {
    impact: {
      opacity: [0, 1, 1, 0],
      y: [8, -14, -20],
      scale: [0.88, 1.05, 1],
      duration: 880,
      ease: 'outCubic'
    },
    gain: {
      opacity: [0, 1, 1, 0],
      y: [10, -18, -24],
      scale: [0.94, 1.03, 1],
      duration: 940,
      ease: 'outCubic'
    },
    status: {
      opacity: [0, 1, 1, 0],
      y: [4, -16, -20],
      scale: [0.92, 1, 0.99],
      duration: 900,
      ease: 'outCubic'
    }
  }[family]

  return {
    ...preset,
    onComplete
  }
}

export function getDuelBannerFeedbackAnimation(
  family: DuelBannerFeedbackFamily,
  reducedMotion: boolean,
  onComplete: () => void
) {
  if (reducedMotion) {
    return {
      opacity: [1, 1, 0],
      duration: 840,
      ease: 'linear',
      onComplete
    }
  }

  const preset = {
    narration: {
      opacity: [0, 1, 1, 0],
      y: [-12, 0, 0, -6],
      scale: [0.97, 1, 1, 0.995],
      duration: 1320,
      ease: 'outCubic'
    },
    error: {
      opacity: [0, 1, 1, 0],
      y: [-8, 0, 0, -4],
      scale: [0.96, 1, 1],
      duration: 1160,
      ease: 'outCubic'
    }
  }[family]

  return {
    ...preset,
    onComplete
  }
}

export function getDuelFloatingFeedbackAnimation(
  family: DuelFloatingFeedbackFamily,
  reducedMotion: boolean,
  onComplete: () => void
) {
  if (reducedMotion) {
    return {
      opacity: [1, 1, 0],
      duration: 620,
      ease: 'linear',
      onComplete
    }
  }

  const preset = {
    impact: {
      opacity: [0, 1, 1, 0],
      y: [0, -46, -58],
      scale: [0.72, 1.06, 1],
      duration: 820,
      ease: 'outCubic'
    },
    gain: {
      opacity: [0, 1, 1, 0],
      y: [0, -40, -52],
      scale: [0.72, 1, 1],
      duration: 860,
      ease: 'outCubic'
    }
  }[family]

  return {
    ...preset,
    onComplete
  }
}
