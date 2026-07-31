import { ArraySchema, MapSchema, Schema, view, type } from '@colyseus/schema';
import type {
  Card,
  CardColor,
  CardType,
  DuelEndReason,
  DuelLogLevel,
  GamePhase,
} from './index.js';

/**
 * Colyseus room state for the `duel` room, shared between `apps/api`
 * (authoritative, registers the room with these classes) and `apps/web`
 * (passes `DuelState` as `joinOrCreate`'s `rootSchema` argument instead of
 * relying on Colyseus's Reflection protocol, which proved fragile with
 * `@colyseus/schema` 3.x for this state shape).
 *
 * Hidden-zone cards (hand/deck/life) are only added to their owner's
 * `StateView` (see `duel.room.ts`), so `@view()`-tagged fields below stay
 * unpopulated for every other client -- this replaces the `@filter`/
 * `@filterChildren` decorators removed in Colyseus 0.16.
 */
export class DuelCard extends Schema {
  @type('string')
  instanceId = '';

  @type('string')
  ownerSessionId = '';

  @type('boolean')
  privateToOwner = false;

  @view()
  @type('string')
  cardId = '';

  @view()
  @type('string')
  number = '';

  @view()
  @type('string')
  name = '';

  @view()
  @type('string')
  type: CardType = 'Character';

  @view()
  @type(['string'])
  colors = new ArraySchema<CardColor>();

  @view()
  @type('number')
  cost = -1;

  @view()
  @type('number')
  baseCost = -1;

  @view()
  @type('number')
  basePower = -1;

  @view()
  @type('number')
  power = -1;

  @view()
  @type('number')
  life = -1;

  @view()
  @type('number')
  counter = -1;

  @view()
  @type(['string'])
  attributes = new ArraySchema<string>();

  @view()
  @type(['string'])
  families = new ArraySchema<string>();

  @view()
  @type('string')
  imageUrl = '';

  @view()
  @type('string')
  text = '';

  @view()
  @type('string')
  trigger = '';

  @type('boolean')
  faceDown = false;

  @type('boolean')
  rested = false;

  @type('number')
  attachedDon = 0;

  @type('boolean')
  playedThisTurn = false;

  @view()
  @type('boolean')
  hasRush = false;

  @view()
  @type('boolean')
  hasDoubleAttack = false;

  @view()
  @type('boolean')
  hasBanish = false;

  @view()
  @type('boolean')
  canAttackActiveCharacters = false;

  @view()
  @type('boolean')
  mustBeAttackTarget = false;

  @view()
  @type('boolean')
  cannotAttack = false;

  @view()
  @type('boolean')
  cannotAttackLeaderOnTurnPlayed = false;

  @view()
  @type('boolean')
  cannotBlock = false;

  @view()
  @type('boolean')
  cannotBeKoedInBattle = false;

  @view()
  @type('boolean')
  cannotBeKoedByEffects = false;

  @view()
  @type('boolean')
  cannotBeKoedBySlashInBattle = false;

  @view()
  @type('boolean')
  cannotBeKoedByStrikeInBattle = false;

  @view()
  @type('boolean')
  winOnDeckOut = false;

  @view()
  @type('boolean')
  cannotBeRemovedByOpponentEffects = false;

  @view()
  @type('boolean')
  effectNegated = false;

  @view()
  @type('number')
  cannotAttackUntilTurn = 0;

  @view()
  @type('number')
  skipNextRefreshPhases = 0;
}

export class DuelZones extends Schema {
  @type([DuelCard])
  deck = new ArraySchema<DuelCard>();

  @type([DuelCard])
  donDeck = new ArraySchema<DuelCard>();

  @type([DuelCard])
  hand = new ArraySchema<DuelCard>();

  @type([DuelCard])
  life = new ArraySchema<DuelCard>();

  @type([DuelCard])
  characters = new ArraySchema<DuelCard>();

  @type([DuelCard])
  cost = new ArraySchema<DuelCard>();

  @type([DuelCard])
  trash = new ArraySchema<DuelCard>();

  @type(DuelCard)
  leader = new DuelCard();

  @type(DuelCard)
  stage = new DuelCard();
}

export class DuelPlayer extends Schema {
  @type('string')
  sessionId = '';

  @type('string')
  displayName = '';

  @type('string')
  deckId = '';

  @type('boolean')
  ready = false;

  @type('boolean')
  connected = true;

  @type('boolean')
  mulliganDecided = false;

  @type('boolean')
  hasTakenFirstTurn = false;

  @type('number')
  handCount = 0;

  @type('number')
  deckCount = 0;

  @type('number')
  lifeCount = 0;

  @type('boolean')
  cannotPlayCharacters = false;

  @type(DuelZones)
  zones = new DuelZones();
}

export class DuelLog extends Schema {
  @type('string')
  id = '';

  @type('string')
  message = '';

  @type('string')
  level: DuelLogLevel = 'info';

  @type('string')
  actorSessionId = '';

  @type('string')
  createdAt = '';
}

/**
 * Structural combat state (docs/optcg-rules.md §6). `step` drives which
 * declarative prompt the defender sees; `blockerInstanceId`/counter fields
 * are set by the defender's own declarations and never validated against
 * card text, per the spec's declarative-Blocker/Counter model.
 */
export class DuelCombat extends Schema {
  @type('string')
  attackerSessionId = '';

  @type('string')
  attackerInstanceId = '';

  @type('string')
  defenderSessionId = '';

  @type('string')
  targetType: 'leader' | 'character' = 'leader';

  @type('string')
  targetInstanceId = '';

  @type('string')
  blockerInstanceId = '';

  @type('string')
  step: 'declared' | 'blocked' | 'countering' | 'resolving' | 'resolved' =
    'declared';

  @type('number')
  counterPowerBonus = 0;

  @type('boolean')
  awaitingTriggerDecision = false;
}

export class DuelState extends Schema {
  @type('string')
  phase: GamePhase = 'setup';

  @type('string')
  activePlayerSessionId = '';

  @type('number')
  turn = 0;

  /** ISO timestamp set when mulligans are over and the duel's first turn begins. */
  @type('string')
  startedAt = '';

  /** ISO timestamp set once the duel reaches a structural finished state. */
  @type('string')
  finishedAt = '';

  /** Randomly designated player who chooses to play first or second (setup step 4). */
  @type('string')
  startingPlayerSessionId = '';

  /** Session id of whoever will take the first turn, once the starting player has chosen (setup step 5). */
  @type('string')
  firstPlayerSessionId = '';

  /** Session id that should immediately take an extra turn after the current one ends. */
  @type('string')
  pendingExtraTurnSessionId = '';

  @type({ map: DuelPlayer })
  players = new MapSchema<DuelPlayer>();

  @type([DuelLog])
  logs = new ArraySchema<DuelLog>();

  /** `attackerInstanceId === ''` means no combat is currently in progress. */
  @type(DuelCombat)
  combat = new DuelCombat();

  /** Set alongside `phase: 'finished'` by a clean game-end (life-to-zero, deck-out, or forfeit); empty otherwise. */
  @type('string')
  winnerSessionId = '';

  /** Set alongside `winnerSessionId`; `''` while the game is still in progress. */
  @type('string')
  endReason: DuelEndReason | '' = '';
}

function replaceArraySchema<T>(
  target: ArraySchema<T>,
  values: Iterable<T>,
): ArraySchema<T> {
  target.splice(0, target.length);
  target.push(...values);

  return target;
}

/**
 * Creates a detached deep clone of a runtime duel card schema.
 */
export function cloneDuelCard(source: DuelCard): DuelCard {
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
  target.cannotAttackUntilTurn = source.cannotAttackUntilTurn;
  target.skipNextRefreshPhases = source.skipNextRefreshPhases;

  return target;
}

/**
 * Creates a detached deep clone of the mutable duel zones for one player.
 */
export function cloneDuelZones(source: DuelZones): DuelZones {
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

/**
 * Creates a detached deep clone of one duel player schema.
 */
export function cloneDuelPlayer(source: DuelPlayer): DuelPlayer {
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
  assignDuelZones(target.zones, source.zones);

  return target;
}

/**
 * Creates a detached deep clone of one duel log entry.
 */
export function cloneDuelLog(source: DuelLog): DuelLog {
  const cloned = new DuelLog();
  cloned.id = source.id;
  cloned.message = source.message;
  cloned.level = source.level;
  cloned.actorSessionId = source.actorSessionId;
  cloned.createdAt = source.createdAt;

  return cloned;
}

/**
 * Creates a detached deep clone of the mutable combat schema.
 */
export function cloneDuelCombat(source: DuelCombat): DuelCombat {
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
 * Creates a detached deep clone of the whole duel state schema.
 */
export function cloneDuelState(source: DuelState): DuelState {
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
 * Replaces the content of an existing live duel state with another detached
 * state, preserving the original root object identity for Colyseus.
 */
export function adoptDuelState(target: DuelState, source: DuelState): DuelState {
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

export function createDuelCard(
  card: Card,
  instanceId: string,
  ownerSessionId: string,
  privateToOwner = false,
): DuelCard {
  const duelCard = new DuelCard();
  duelCard.instanceId = instanceId;
  duelCard.ownerSessionId = ownerSessionId;
  duelCard.privateToOwner = privateToOwner;
  duelCard.cardId = card.id;
  duelCard.number = card.number;
  duelCard.name = card.name;
  duelCard.type = card.type;
  duelCard.colors.push(...card.colors);
  duelCard.cost = card.cost ?? -1;
  duelCard.baseCost = card.cost ?? -1;
  duelCard.basePower = card.power ?? -1;
  duelCard.power = card.power ?? -1;
  duelCard.life = card.life ?? -1;
  duelCard.counter = card.counter ?? -1;
  duelCard.attributes.push(...card.attributes);
  duelCard.families.push(...card.families);
  duelCard.imageUrl = card.imageUrl ?? '';
  duelCard.text = card.text;
  duelCard.trigger = card.trigger ?? '';
  duelCard.faceDown = privateToOwner;

  return duelCard;
}
