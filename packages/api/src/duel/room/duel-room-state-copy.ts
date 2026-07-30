import {
  DuelCard,
  DuelCombat,
  DuelLog,
  DuelPlayer,
  DuelState,
  DuelZones,
} from '@onepiecetcg/shared';
import { ArraySchema } from '@colyseus/schema';

function replaceArraySchema<T>(
  target: ArraySchema<T>,
  values: Iterable<T>,
): ArraySchema<T> {
  target.splice(0, target.length);
  target.push(...values);

  return target;
}

function cloneDuelCard(source: DuelCard): DuelCard {
  const cloned = new DuelCard();
  cloned.instanceId = source.instanceId;
  cloned.ownerSessionId = source.ownerSessionId;
  cloned.privateToOwner = source.privateToOwner;
  cloned.cardId = source.cardId;
  cloned.number = source.number;
  cloned.name = source.name;
  cloned.type = source.type;
  replaceArraySchema(cloned.colors, source.colors);
  cloned.cost = source.cost;
  cloned.baseCost = source.baseCost;
  cloned.basePower = source.basePower;
  cloned.power = source.power;
  cloned.life = source.life;
  cloned.counter = source.counter;
  replaceArraySchema(cloned.attributes, source.attributes);
  replaceArraySchema(cloned.families, source.families);
  cloned.imageUrl = source.imageUrl;
  cloned.text = source.text;
  cloned.trigger = source.trigger;
  cloned.faceDown = source.faceDown;
  cloned.rested = source.rested;
  cloned.attachedDon = source.attachedDon;
  cloned.playedThisTurn = source.playedThisTurn;
  cloned.hasRush = source.hasRush;
  cloned.hasDoubleAttack = source.hasDoubleAttack;
  cloned.hasBanish = source.hasBanish;
  cloned.canAttackActiveCharacters = source.canAttackActiveCharacters;
  cloned.mustBeAttackTarget = source.mustBeAttackTarget;
  cloned.cannotAttack = source.cannotAttack;
  cloned.cannotAttackLeaderOnTurnPlayed = source.cannotAttackLeaderOnTurnPlayed;
  cloned.cannotBlock = source.cannotBlock;
  cloned.cannotBeKoedInBattle = source.cannotBeKoedInBattle;
  cloned.cannotBeKoedByEffects = source.cannotBeKoedByEffects;
  cloned.cannotBeKoedBySlashInBattle = source.cannotBeKoedBySlashInBattle;
  cloned.cannotBeKoedByStrikeInBattle = source.cannotBeKoedByStrikeInBattle;
  cloned.winOnDeckOut = source.winOnDeckOut;
  cloned.cannotBeRemovedByOpponentEffects =
    source.cannotBeRemovedByOpponentEffects;
  cloned.cannotAttackUntilTurn = source.cannotAttackUntilTurn;
  cloned.skipNextRefreshPhases = source.skipNextRefreshPhases;

  return cloned;
}

function cloneDuelZones(source: DuelZones): DuelZones {
  const cloned = new DuelZones();
  replaceArraySchema(
    cloned.deck,
    Array.from(source.deck, (card) => cloneDuelCard(card)),
  );
  replaceArraySchema(
    cloned.donDeck,
    Array.from(source.donDeck, (card) => cloneDuelCard(card)),
  );
  replaceArraySchema(
    cloned.hand,
    Array.from(source.hand, (card) => cloneDuelCard(card)),
  );
  replaceArraySchema(
    cloned.life,
    Array.from(source.life, (card) => cloneDuelCard(card)),
  );
  replaceArraySchema(
    cloned.characters,
    Array.from(source.characters, (card) => cloneDuelCard(card)),
  );
  replaceArraySchema(
    cloned.cost,
    Array.from(source.cost, (card) => cloneDuelCard(card)),
  );
  replaceArraySchema(
    cloned.trash,
    Array.from(source.trash, (card) => cloneDuelCard(card)),
  );
  cloned.leader = cloneDuelCard(source.leader);
  cloned.stage = cloneDuelCard(source.stage);

  return cloned;
}

function cloneDuelPlayer(source: DuelPlayer): DuelPlayer {
  const cloned = new DuelPlayer();
  cloned.sessionId = source.sessionId;
  cloned.displayName = source.displayName;
  cloned.deckId = source.deckId;
  cloned.ready = source.ready;
  cloned.connected = source.connected;
  cloned.mulliganDecided = source.mulliganDecided;
  cloned.hasTakenFirstTurn = source.hasTakenFirstTurn;
  cloned.handCount = source.handCount;
  cloned.deckCount = source.deckCount;
  cloned.lifeCount = source.lifeCount;
  cloned.zones = cloneDuelZones(source.zones);

  return cloned;
}

function cloneDuelLog(source: DuelLog): DuelLog {
  const cloned = new DuelLog();
  cloned.id = source.id;
  cloned.message = source.message;
  cloned.createdAt = source.createdAt;

  return cloned;
}

function cloneDuelCombat(source: DuelCombat): DuelCombat {
  const cloned = new DuelCombat();
  cloned.attackerSessionId = source.attackerSessionId;
  cloned.attackerInstanceId = source.attackerInstanceId;
  cloned.defenderSessionId = source.defenderSessionId;
  cloned.targetType = source.targetType;
  cloned.targetInstanceId = source.targetInstanceId;
  cloned.blockerInstanceId = source.blockerInstanceId;
  cloned.step = source.step;
  cloned.counterPowerBonus = source.counterPowerBonus;
  cloned.awaitingTriggerDecision = source.awaitingTriggerDecision;

  return cloned;
}

/**
 * Creates a detached deep clone of the whole duel room state.
 */
export function cloneRoomDuelState(source: DuelState): DuelState {
  const cloned = new DuelState();
  cloned.phase = source.phase;
  cloned.activePlayerSessionId = source.activePlayerSessionId;
  cloned.turn = source.turn;
  cloned.startedAt = source.startedAt;
  cloned.finishedAt = source.finishedAt;
  cloned.startingPlayerSessionId = source.startingPlayerSessionId;
  cloned.firstPlayerSessionId = source.firstPlayerSessionId;
  cloned.pendingExtraTurnSessionId = source.pendingExtraTurnSessionId;
  cloned.players.clear();
  for (const [sessionId, player] of source.players.entries()) {
    cloned.players.set(sessionId, cloneDuelPlayer(player));
  }
  replaceArraySchema(
    cloned.logs,
    Array.from(source.logs, (log) => cloneDuelLog(log)),
  );
  cloned.combat = cloneDuelCombat(source.combat);
  cloned.winnerSessionId = source.winnerSessionId;
  cloned.endReason = source.endReason;

  return cloned;
}

/**
 * Replaces the content of an existing live duel room state while preserving
 * the root Colyseus schema identity.
 */
export function adoptRoomDuelState(
  target: DuelState,
  source: DuelState,
): DuelState {
  target.phase = source.phase;
  target.activePlayerSessionId = source.activePlayerSessionId;
  target.turn = source.turn;
  target.startedAt = source.startedAt;
  target.finishedAt = source.finishedAt;
  target.startingPlayerSessionId = source.startingPlayerSessionId;
  target.firstPlayerSessionId = source.firstPlayerSessionId;
  target.pendingExtraTurnSessionId = source.pendingExtraTurnSessionId;
  target.players.clear();
  for (const [sessionId, player] of source.players.entries()) {
    target.players.set(sessionId, cloneDuelPlayer(player));
  }
  replaceArraySchema(
    target.logs,
    Array.from(source.logs, (log) => cloneDuelLog(log)),
  );
  target.combat = cloneDuelCombat(source.combat);
  target.winnerSessionId = source.winnerSessionId;
  target.endReason = source.endReason;

  return target;
}
