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
  assignDuelCard(cloned, source);

  return cloned;
}

function assignDuelCard(target: DuelCard, source: DuelCard): DuelCard {
  target.instanceId = source.instanceId;
  target.ownerSessionId = source.ownerSessionId;
  target.privateToOwner = source.privateToOwner;
  target.cardId = source.cardId;
  target.number = source.number;
  target.name = source.name;
  target.type = source.type;
  replaceArraySchema(target.colors, source.colors);
  target.cost = source.cost;
  target.baseCost = source.baseCost;
  target.basePower = source.basePower;
  target.power = source.power;
  target.life = source.life;
  target.counter = source.counter;
  replaceArraySchema(target.attributes, source.attributes);
  replaceArraySchema(target.families, source.families);
  target.imageUrl = source.imageUrl;
  target.text = source.text;
  target.trigger = source.trigger;
  target.faceDown = source.faceDown;
  target.rested = source.rested;
  target.attachedDon = source.attachedDon;
  target.playedThisTurn = source.playedThisTurn;
  target.hasRush = source.hasRush;
  target.hasDoubleAttack = source.hasDoubleAttack;
  target.hasBanish = source.hasBanish;
  target.canAttackActiveCharacters = source.canAttackActiveCharacters;
  target.mustBeAttackTarget = source.mustBeAttackTarget;
  target.cannotAttack = source.cannotAttack;
  target.cannotAttackLeaderOnTurnPlayed = source.cannotAttackLeaderOnTurnPlayed;
  target.cannotBlock = source.cannotBlock;
  target.cannotBeKoedInBattle = source.cannotBeKoedInBattle;
  target.cannotBeKoedByEffects = source.cannotBeKoedByEffects;
  target.cannotBeKoedBySlashInBattle = source.cannotBeKoedBySlashInBattle;
  target.cannotBeKoedByStrikeInBattle = source.cannotBeKoedByStrikeInBattle;
  target.winOnDeckOut = source.winOnDeckOut;
  target.cannotBeRemovedByOpponentEffects =
    source.cannotBeRemovedByOpponentEffects;
  target.effectNegated = source.effectNegated;
  target.cannotAttackUntilTurn = source.cannotAttackUntilTurn;
  target.skipNextRefreshPhases = source.skipNextRefreshPhases;

  return target;
}

function cloneDuelZones(source: DuelZones): DuelZones {
  const cloned = new DuelZones();
  assignDuelZones(cloned, source);

  return cloned;
}

function assignDuelZones(target: DuelZones, source: DuelZones): DuelZones {
  replaceArraySchema(
    target.deck,
    Array.from(source.deck, (card) => cloneDuelCard(card)),
  );
  replaceArraySchema(
    target.donDeck,
    Array.from(source.donDeck, (card) => cloneDuelCard(card)),
  );
  replaceArraySchema(
    target.hand,
    Array.from(source.hand, (card) => cloneDuelCard(card)),
  );
  replaceArraySchema(
    target.life,
    Array.from(source.life, (card) => cloneDuelCard(card)),
  );
  replaceArraySchema(
    target.characters,
    Array.from(source.characters, (card) => cloneDuelCard(card)),
  );
  replaceArraySchema(
    target.cost,
    Array.from(source.cost, (card) => cloneDuelCard(card)),
  );
  replaceArraySchema(
    target.trash,
    Array.from(source.trash, (card) => cloneDuelCard(card)),
  );
  assignDuelCard(target.leader, source.leader);
  assignDuelCard(target.stage, source.stage);

  return target;
}

function cloneDuelPlayer(source: DuelPlayer): DuelPlayer {
  const cloned = new DuelPlayer();
  assignDuelPlayer(cloned, source);

  return cloned;
}

function assignDuelPlayer(target: DuelPlayer, source: DuelPlayer): DuelPlayer {
  target.sessionId = source.sessionId;
  target.displayName = source.displayName;
  target.deckId = source.deckId;
  target.ready = source.ready;
  target.connected = source.connected;
  target.mulliganDecided = source.mulliganDecided;
  target.hasTakenFirstTurn = source.hasTakenFirstTurn;
  target.handCount = source.handCount;
  target.deckCount = source.deckCount;
  target.lifeCount = source.lifeCount;
  target.cannotPlayCharacters = source.cannotPlayCharacters;
  assignDuelZones(target.zones, source.zones);

  return target;
}

function cloneDuelLog(source: DuelLog): DuelLog {
  const cloned = new DuelLog();
  cloned.id = source.id;
  cloned.message = source.message;
  cloned.level = source.level;
  cloned.actorSessionId = source.actorSessionId;
  cloned.createdAt = source.createdAt;

  return cloned;
}

function cloneDuelCombat(source: DuelCombat): DuelCombat {
  const cloned = new DuelCombat();
  assignDuelCombat(cloned, source);

  return cloned;
}

function assignDuelCombat(target: DuelCombat, source: DuelCombat): DuelCombat {
  target.attackerSessionId = source.attackerSessionId;
  target.attackerInstanceId = source.attackerInstanceId;
  target.defenderSessionId = source.defenderSessionId;
  target.targetType = source.targetType;
  target.targetInstanceId = source.targetInstanceId;
  target.blockerInstanceId = source.blockerInstanceId;
  target.step = source.step;
  target.counterPowerBonus = source.counterPowerBonus;
  target.awaitingTriggerDecision = source.awaitingTriggerDecision;

  return target;
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
  assignDuelCombat(cloned.combat, source.combat);
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
  assignDuelCombat(target.combat, source.combat);
  target.winnerSessionId = source.winnerSessionId;
  target.endReason = source.endReason;

  return target;
}
