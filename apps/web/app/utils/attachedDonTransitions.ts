import type { DuelPlayerView } from '@onepiecetcg/shared'

/**
 * Expands attached-DON count gains into a per-card travel target list so the
 * board can animate each newly attached DON!! from Cost into its destination.
 */
export function deriveAttachedDonTravelTargetIds(
  previous: DuelPlayerView | null,
  current: DuelPlayerView
) {
  if (!previous) {
    return []
  }

  const targetIds: string[] = []
  const previousCharacters = new Map(previous.characters.map(card => [card.instanceId, card] as const))

  if (current.leader && previous.leader) {
    const leaderGain = Math.max(current.leader.attachedDon - previous.leader.attachedDon, 0)

    for (let index = 0; index < leaderGain; index += 1) {
      targetIds.push(current.leader.instanceId)
    }
  }

  for (const character of current.characters) {
    const previousCharacter = previousCharacters.get(character.instanceId)

    if (!previousCharacter) {
      continue
    }

    const gain = Math.max(character.attachedDon - previousCharacter.attachedDon, 0)

    for (let index = 0; index < gain; index += 1) {
      targetIds.push(character.instanceId)
    }
  }

  return targetIds
}
