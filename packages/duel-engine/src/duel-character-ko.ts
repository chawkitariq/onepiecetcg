import type {
  DuelCard,
  DuelLogLevel,
  DuelPlayer,
  DuelState,
} from '@onepiecetcg/shared';
import type { DuelEngineEffectBoundary } from './contracts.js';
import { DuelRoomRuntimeState } from './duel-runtime-state.js';

/**
 * Dependencies required to resolve a character KO against one duel state.
 */
export type DuelRoomCharacterKoDeps = {
  state: DuelState;
  effectBoundary: Pick<
    DuelEngineEffectBoundary,
    'reapplyContinuousEffects' | 'applyKoReplacement' | 'emitCardEvent'
  >;
  addLog: (
    message: string,
    level?: DuelLogLevel,
    actorSessionId?: string,
  ) => void;
  unshiftIntoTrash: (player: DuelPlayer, card: DuelCard) => void;
};

/**
 * Returns whether battle rules protect the defending card from being KO'd by
 * the current attacker.
 */
export function isProtectedFromBattleKo(
  defendingCard: DuelCard,
  attackerCard: DuelCard,
): boolean {
  if (defendingCard.cannotBeKoedInBattle) {
    return true;
  }

  return (
    (defendingCard.cannotBeKoedBySlashInBattle &&
      attackerCard.attributes.includes('Slash')) ||
    (defendingCard.cannotBeKoedByStrikeInBattle &&
      attackerCard.attributes.includes('Strike'))
  );
}

/**
 * Applies a KO to the given character if it is still present in the
 * controller's character area.
 */
export function knockOutCharacterInState(
  deps: DuelRoomCharacterKoDeps,
  owner: DuelPlayer,
  card: DuelCard,
  reason: 'battle' | 'effect' = 'battle',
  skipReplacement = false,
): boolean {
  if (reason === 'effect' && card.cannotBeKoedByEffects) {
    deps.effectBoundary.reapplyContinuousEffects();
    return false;
  }

  if (
    !skipReplacement &&
    deps.effectBoundary.applyKoReplacement(owner.sessionId, card.instanceId, reason)
  ) {
    deps.effectBoundary.reapplyContinuousEffects();
    return false;
  }

  const runtimeState = new DuelRoomRuntimeState({ state: deps.state });
  const found = runtimeState.findCardInZone(owner, 'characters', card.instanceId);

  if (!found) {
    return false;
  }

  owner.zones.characters.splice(found.index, 1);
  const attachedDon = card.attachedDon;
  card.attachedDon = 0;
  card.rested = false;
  deps.unshiftIntoTrash(owner, card);
  runtimeState.returnDonToCost(owner, owner.sessionId, attachedDon);
  deps.addLog(
    `${card.name} est mis KO et rejoint la Defausse.`,
    reason === 'effect' ? 'effect' : 'action',
    owner.sessionId,
  );
  deps.effectBoundary.emitCardEvent('onKo', owner.sessionId, card);
  deps.effectBoundary.reapplyContinuousEffects();

  return true;
}

/**
 * Finds a character by instance id in the given player's character area and
 * applies KO rules to it.
 */
export function knockOutCharacterByIdInState(
  deps: DuelRoomCharacterKoDeps,
  playerSessionId: string,
  instanceId: string,
  reason: 'battle' | 'effect',
): boolean {
  const player = deps.state.players.get(playerSessionId);
  const runtimeState = new DuelRoomRuntimeState({ state: deps.state });
  const found =
    player && runtimeState.findCardInZone(player, 'characters', instanceId);

  if (!player || !found) {
    return false;
  }

  return knockOutCharacterInState(deps, player, found.card, reason);
}
