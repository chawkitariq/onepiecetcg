export type CardEffectBadgeTone = 'blue' | 'red' | 'pink' | 'black' | 'orange' | 'yellow' | 'neutral'

/**
 * Canonical badge metadata derived from a card's visible effect text.
 */
export type CardEffectBadge = {
  label: string
  tone: CardEffectBadgeTone
}

type BadgeMatcher = {
  label: string
  tone: CardEffectBadgeTone
  patterns: RegExp[]
}

const BRACKETED_BADGE_MATCHERS: BadgeMatcher[] = [
  {
    label: 'On Play',
    tone: 'blue',
    patterns: [/^on play$/iu, /^jouee$/iu, /^jou[eé]e$/iu]
  },
  {
    label: 'Activate:Main',
    tone: 'blue',
    patterns: [/^activate\s*:?\s*main$/iu, /^(activation|actif)\s*:?\s*principale$/iu]
  },
  {
    label: 'Your Turn',
    tone: 'blue',
    patterns: [/^your turn$/iu, /^votre tour$/iu]
  },
  {
    label: 'End of Your Turn',
    tone: 'blue',
    patterns: [/^end of your turn$/iu, /^fin de votre tour$/iu]
  },
  {
    label: 'Main',
    tone: 'blue',
    patterns: [/^main$/iu, /^principale$/iu]
  },
  {
    label: 'Counter',
    tone: 'red',
    patterns: [/^counter$/iu, /^contre$/iu]
  },
  {
    label: 'Once Per Turn',
    tone: 'pink',
    patterns: [/^once per turn$/iu, /^une fois par tour$/iu]
  },
  {
    label: 'Blocker',
    tone: 'orange',
    patterns: [/^blocker$/iu, /^bloqueur$/iu]
  },
  {
    label: 'Rush',
    tone: 'orange',
    patterns: [/^rush$/iu, /^initiative$/iu]
  },
  {
    label: 'Double Attack',
    tone: 'orange',
    patterns: [/^double attack$/iu, /^double attaque$/iu]
  },
  {
    label: 'Banish',
    tone: 'orange',
    patterns: [/^banish$/iu, /^exil$/iu]
  },
  {
    label: 'Trigger',
    tone: 'yellow',
    patterns: [/^trigger$/iu, /^d[eé]clenchement$/iu]
  }
]

const INLINE_BADGE_MATCHERS: BadgeMatcher[] = [
  {
    label: 'Blocker',
    tone: 'orange',
    patterns: [/\bblocker\b/iu, /\bbloqueur\b/iu]
  },
  {
    label: 'Rush',
    tone: 'orange',
    patterns: [/\brush\b/iu, /\binitiative\b/iu]
  },
  {
    label: 'Double Attack',
    tone: 'orange',
    patterns: [/\bdouble attack\b/iu, /\bdouble attaque\b/iu]
  },
  {
    label: 'Banish',
    tone: 'orange',
    patterns: [/\bbanish\b/iu, /\bexil\b/iu]
  }
]

function normalizeToken(token: string) {
  return token
    .replaceAll(/\s+/gu, ' ')
    .replaceAll('：', ':')
    .trim()
}

function resolveBracketedBadge(token: string): CardEffectBadge {
  const normalizedToken = normalizeToken(token)
  const donGivenMatch = normalizedToken.match(/^DON!!\s*[x×]\s*(\d+)$/iu)

  if (donGivenMatch?.[1]) {
    return { label: `DON!!×${donGivenMatch[1]}`, tone: 'black' }
  }

  const donReturnMatch = normalizedToken.match(/^DON!!\s*-\s*(\d+)$/iu)

  if (donReturnMatch?.[1]) {
    return { label: `DON!!-${donReturnMatch[1]}`, tone: 'black' }
  }

  const matcher = BRACKETED_BADGE_MATCHERS.find(({ patterns }) =>
    patterns.some(pattern => pattern.test(normalizedToken))
  )

  if (matcher) {
    return {
      label: matcher.label,
      tone: matcher.tone
    }
  }

  return {
    label: normalizedToken,
    tone: 'neutral'
  }
}

function appendBadge(target: CardEffectBadge[], badge: CardEffectBadge) {
  if (target.some(entry => entry.label === badge.label)) {
    return
  }

  target.push(badge)
}

/**
 * Extracts glossary-style effect badges from the visible card description text.
 */
export function extractCardEffectBadges(text: string | null | undefined): CardEffectBadge[] {
  const badges: CardEffectBadge[] = []
  const sourceText = text ?? ''

  for (const match of sourceText.matchAll(/\[([^[\]]+)\]/gu)) {
    const token = match[1]?.trim()

    if (!token) {
      continue
    }

    appendBadge(badges, resolveBracketedBadge(token))
  }

  for (const matcher of INLINE_BADGE_MATCHERS) {
    if (matcher.patterns.some(pattern => pattern.test(sourceText))) {
      appendBadge(badges, {
        label: matcher.label,
        tone: matcher.tone
      })
    }
  }

  return badges
}
