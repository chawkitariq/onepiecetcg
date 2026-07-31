import { describe, expect, it } from 'vitest'
import {
  getDuelBannerFeedbackAnimation,
  getDuelCardFeedbackAnimation,
  getDuelFloatingFeedbackAnimation,
  resolveDuelFeedbackClasses
} from './duelFeedback'

describe('duelFeedback', () => {
  it('resolves shared classes for a card impact feedback', () => {
    expect(resolveDuelFeedbackClasses({}, 'card', 'impact')).toEqual([
      'duel-feedback',
      'duel-feedback--card',
      'duel-feedback--impact'
    ])
  })

  it('uses shorter reduced-motion presets for card feedback', () => {
    const animation = getDuelCardFeedbackAnimation('status', true, () => {})

    expect(animation.duration).toBe(680)
    expect(animation.ease).toBe('linear')
  })

  it('keeps narration banners longer than error banners', () => {
    const narration = getDuelBannerFeedbackAnimation('narration', false, () => {})
    const error = getDuelBannerFeedbackAnimation('error', false, () => {})

    expect(narration.duration).toBeGreaterThan(error.duration)
  })

  it('gives impact floating numbers a punchier scale than gain', () => {
    const impact = getDuelFloatingFeedbackAnimation('impact', false, () => {})
    const gain = getDuelFloatingFeedbackAnimation('gain', false, () => {})

    expect(impact.scale).toEqual([0.72, 1.06, 1])
    expect(gain.scale).toEqual([0.72, 1, 1])
  })
})
