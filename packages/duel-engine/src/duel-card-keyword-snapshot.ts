import type { DuelCard, DuelPlayer, DuelState } from '@onepiecetcg/shared';

/**
 * Snapshot of mutable per-card keyword/status flags that must survive effect
 * boundary re-instantiation when an isolated runtime is adopted back into the
 * live room.
 */
export type DuelRoomCardKeywordSnapshot = {
  hasRush: boolean;
  hasDoubleAttack: boolean;
  hasBanish: boolean;
  canAttackActiveCharacters: boolean;
  mustBeAttackTarget: boolean;
  cannotAttack: boolean;
  cannotAttackLeaderOnTurnPlayed: boolean;
  cannotBlock: boolean;
  cannotBeKoedInBattle: boolean;
  cannotBeKoedByEffects: boolean;
  cannotBeKoedBySlashInBattle: boolean;
  cannotBeKoedByStrikeInBattle: boolean;
  winOnDeckOut: boolean;
  cannotBeRemovedByOpponentEffects: boolean;
  effectNegated: boolean;
  skipNextRefreshPhases: number;
};

/**
 * Returns every card currently owned by a player across public and private
 * zones, including leader and occupied stage.
 */
export function* iterateDuelPlayerCards(
  player: DuelPlayer,
): Iterable<DuelCard> {
  yield player.zones.leader;

  if (player.zones.stage.instanceId) {
    yield player.zones.stage;
  }

  for (const zone of [
    player.zones.deck,
    player.zones.donDeck,
    player.zones.hand,
    player.zones.life,
    player.zones.characters,
    player.zones.cost,
    player.zones.trash,
  ]) {
    for (const card of zone) {
      yield card;
    }
  }
}

/**
 * Captures all keyword/status flags that must be preserved when rebuilding a
 * gameplay runtime for an existing duel state.
 */
export function captureDuelRoomCardKeywordSnapshot(
  state: DuelState,
): Map<string, DuelRoomCardKeywordSnapshot> {
  const snapshot = new Map<string, DuelRoomCardKeywordSnapshot>();

  for (const player of state.players.values()) {
    for (const card of iterateDuelPlayerCards(player)) {
      snapshot.set(card.instanceId, {
        hasRush: card.hasRush,
        hasDoubleAttack: card.hasDoubleAttack,
        hasBanish: card.hasBanish,
        canAttackActiveCharacters: card.canAttackActiveCharacters,
        mustBeAttackTarget: card.mustBeAttackTarget,
        cannotAttack: card.cannotAttack,
        cannotAttackLeaderOnTurnPlayed: card.cannotAttackLeaderOnTurnPlayed,
        cannotBlock: card.cannotBlock,
        cannotBeKoedInBattle: card.cannotBeKoedInBattle,
        cannotBeKoedByEffects: card.cannotBeKoedByEffects,
        cannotBeKoedBySlashInBattle: card.cannotBeKoedBySlashInBattle,
        cannotBeKoedByStrikeInBattle: card.cannotBeKoedByStrikeInBattle,
        winOnDeckOut: card.winOnDeckOut,
        cannotBeRemovedByOpponentEffects:
          card.cannotBeRemovedByOpponentEffects,
        effectNegated: card.effectNegated,
        skipNextRefreshPhases: card.skipNextRefreshPhases,
      });
    }
  }

  return snapshot;
}

/**
 * Reapplies captured keyword/status flags onto the current room state after a
 * gameplay runtime rebuild.
 */
export function restoreDuelRoomCardKeywordSnapshot(
  state: DuelState,
  snapshot: Map<string, DuelRoomCardKeywordSnapshot>,
): void {
  for (const player of state.players.values()) {
    for (const card of iterateDuelPlayerCards(player)) {
      const cardSnapshot = snapshot.get(card.instanceId);

      if (!cardSnapshot) {
        continue;
      }

      card.hasRush ||= cardSnapshot.hasRush;
      card.hasDoubleAttack ||= cardSnapshot.hasDoubleAttack;
      card.hasBanish ||= cardSnapshot.hasBanish;
      card.canAttackActiveCharacters ||= cardSnapshot.canAttackActiveCharacters;
      card.mustBeAttackTarget ||= cardSnapshot.mustBeAttackTarget;
      card.cannotAttack ||= cardSnapshot.cannotAttack;
      card.cannotAttackLeaderOnTurnPlayed ||=
        cardSnapshot.cannotAttackLeaderOnTurnPlayed;
      card.cannotBlock ||= cardSnapshot.cannotBlock;
      card.cannotBeKoedInBattle ||= cardSnapshot.cannotBeKoedInBattle;
      card.cannotBeKoedByEffects ||= cardSnapshot.cannotBeKoedByEffects;
      card.cannotBeKoedBySlashInBattle ||=
        cardSnapshot.cannotBeKoedBySlashInBattle;
      card.cannotBeKoedByStrikeInBattle ||=
        cardSnapshot.cannotBeKoedByStrikeInBattle;
      card.winOnDeckOut ||= cardSnapshot.winOnDeckOut;
      card.cannotBeRemovedByOpponentEffects ||=
        cardSnapshot.cannotBeRemovedByOpponentEffects;
      card.effectNegated ||= cardSnapshot.effectNegated;
      card.skipNextRefreshPhases = Math.max(
        card.skipNextRefreshPhases,
        cardSnapshot.skipNextRefreshPhases,
      );
    }
  }
}
