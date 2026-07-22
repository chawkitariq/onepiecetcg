import {
  ArraySchema,
  MapSchema,
  Schema,
  filter,
  filterChildren,
  type,
} from '@colyseus/schema';
import type { Card, CardColor, CardType, GamePhase } from '@onepiecetcg/shared';

type FilterClient = {
  sessionId: string;
};

export function canViewPrivateCard(
  client: FilterClient,
  root: DuelCard,
): boolean {
  return !root.privateToOwner || root.ownerSessionId === client.sessionId;
}

export function ownsCard(
  client: FilterClient,
  _key: number,
  value: DuelCard,
): boolean {
  return value.ownerSessionId === client.sessionId;
}

export class DuelCard extends Schema {
  @type('string')
  instanceId = '';

  @type('string')
  ownerSessionId = '';

  @type('boolean')
  privateToOwner = false;

  @filter(function (client: FilterClient, _value: string, root: DuelCard) {
    return canViewPrivateCard(client, root);
  })
  @type('string')
  cardId = '';

  @filter(function (client: FilterClient, _value: string, root: DuelCard) {
    return canViewPrivateCard(client, root);
  })
  @type('string')
  number = '';

  @filter(function (client: FilterClient, _value: string, root: DuelCard) {
    return canViewPrivateCard(client, root);
  })
  @type('string')
  name = '';

  @filter(function (client: FilterClient, _value: string, root: DuelCard) {
    return canViewPrivateCard(client, root);
  })
  @type('string')
  type: CardType = 'Character';

  @filter(function (client: FilterClient, _value: CardColor[], root: DuelCard) {
    return canViewPrivateCard(client, root);
  })
  @type(['string'])
  colors = new ArraySchema<CardColor>();

  @filter(function (client: FilterClient, _value: number, root: DuelCard) {
    return canViewPrivateCard(client, root);
  })
  @type('number')
  cost = -1;

  @filter(function (client: FilterClient, _value: number, root: DuelCard) {
    return canViewPrivateCard(client, root);
  })
  @type('number')
  power = -1;

  @filter(function (client: FilterClient, _value: number, root: DuelCard) {
    return canViewPrivateCard(client, root);
  })
  @type('number')
  life = -1;

  @filter(function (client: FilterClient, _value: number, root: DuelCard) {
    return canViewPrivateCard(client, root);
  })
  @type('number')
  counter = -1;

  @filter(function (client: FilterClient, _value: string, root: DuelCard) {
    return canViewPrivateCard(client, root);
  })
  @type('string')
  imageUrl = '';

  @filter(function (client: FilterClient, _value: string, root: DuelCard) {
    return canViewPrivateCard(client, root);
  })
  @type('string')
  text = '';

  @filter(function (client: FilterClient, _value: string, root: DuelCard) {
    return canViewPrivateCard(client, root);
  })
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
}

export class DuelZones extends Schema {
  @filterChildren(ownsCard)
  @type([DuelCard])
  deck = new ArraySchema<DuelCard>();

  @type([DuelCard])
  donDeck = new ArraySchema<DuelCard>();

  @filterChildren(ownsCard)
  @type([DuelCard])
  hand = new ArraySchema<DuelCard>();

  @filterChildren(ownsCard)
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

export class DuelState extends Schema {
  @type('string')
  phase: GamePhase = 'setup';

  @type('string')
  activePlayerSessionId = '';

  @type('number')
  turn = 0;

  @type({ map: DuelPlayer })
  players = new MapSchema<DuelPlayer>();

  @type([DuelLog])
  logs = new ArraySchema<DuelLog>();
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
  duelCard.power = card.power ?? -1;
  duelCard.life = card.life ?? -1;
  duelCard.counter = card.counter ?? -1;
  duelCard.imageUrl = card.imageUrl ?? '';
  duelCard.text = card.text;
  duelCard.trigger = card.trigger ?? '';
  duelCard.faceDown = privateToOwner;

  return duelCard;
}
