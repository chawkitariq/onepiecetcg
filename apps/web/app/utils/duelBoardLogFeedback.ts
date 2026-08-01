type AttackBannerOptions = {
  resolveLeaderNameByDisplayName: (displayName: string) => string | null | undefined
}

type DonGainFeedback = {
  playerDisplayName: string
  targetLabel: string
  power: string
}

const ATTACK_MESSAGE_PATTERN = /^(?<attacker>.+?) attaque avec (?<source>.+?) vers (?<target>.+)\.$/u
const LEADER_TARGET_PATTERN = /^le Leader de (?<defender>.+)$/u
const BLOCKER_MESSAGE_PATTERN = /^(?<player>.+?) declare (?<card>.+?) comme Bloqueur\.$/u
const DON_GAIN_MESSAGE_PATTERN = /^(?<player>.+?) donne \d+ DON!! a (?<target>.+?) \(\+(?<power>\d+) de puissance\)\.$/u

/**
 * Resolves the banner copy for an attack log entry when the message matches the expected duel format.
 */
export function resolveAttackBannerMessage(message: string, options: AttackBannerOptions) {
  const attackGroups = message.match(ATTACK_MESSAGE_PATTERN)?.groups

  if (!attackGroups?.source || !attackGroups.target) {
    return null
  }

  const source = attackGroups.source.trim()
  const rawTarget = attackGroups.target.trim()
  const leaderTarget = rawTarget.match(LEADER_TARGET_PATTERN)?.groups?.defender
  const target = leaderTarget
    ? options.resolveLeaderNameByDisplayName(leaderTarget) ?? 'le Leader'
    : rawTarget

  return `${source} attaque ${target}`
}

/**
 * Extracts the blocker card name from a blocker-declaration log entry.
 */
export function extractBlockerCardName(message: string) {
  return message.match(BLOCKER_MESSAGE_PATTERN)?.groups?.card ?? null
}

/**
 * Extracts DON gain feedback details from a matching duel log entry.
 */
export function extractDonGainFeedback(message: string): DonGainFeedback | null {
  const groups = message.match(DON_GAIN_MESSAGE_PATTERN)?.groups

  if (!groups?.player || !groups.target || !groups.power) {
    return null
  }

  return {
    playerDisplayName: groups.player,
    targetLabel: groups.target,
    power: groups.power
  }
}
