import { ArraySchema, MapSchema, Schema, view, type } from '@colyseus/schema';
import type { Card, CardColor, CardType, DuelEndReason, GamePhase } from './index.js';

/**
 * Colyseus room state for the `duel` room, shared between `packages/api`
 * (authoritative, registers the room with these classes) and `packages/web`
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

  @type(DuelZones)
  zones = new DuelZones();
}

export class DuelLog extends Schema {
  @type('string')
  id = '';

  @type('string')
  message = '';

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
