export type CardType = 'Leader' | 'Character' | 'Event' | 'Stage' | 'DON!!';

export type CardColor =
  | 'Red'
  | 'Green'
  | 'Blue'
  | 'Purple'
  | 'Black'
  | 'Yellow';

export type Card = {
  id: string;
  number: string;
  name: string;
  type: CardType;
  colors: CardColor[];
  cost: number | null;
  power: number | null;
  life: number | null;
  counter: number | null;
  attributes: string[];
  families: string[];
  text: string;
  trigger: string | null;
  imageUrl: string | null;
  set: {
    id: string;
    name: string;
  };
  rarity: string | null;
};

export type CardSearchQuery = {
  q?: string;
  set?: string;
  type?: CardType;
  color?: CardColor;
  cost?: number;
};

export type CardSearchResponse = {
  cards: Card[];
  total: number;
  filters: CardFilterOptions;
  cachedAt: string;
};

export type CardFilterOptions = {
  sets: Array<{ id: string; name: string }>;
  types: CardType[];
  colors: CardColor[];
  costs: number[];
};

export type DeckCard = {
  cardId: string;
  quantity: number;
};

export type Deck = {
  id: string;
  name: string;
  leaderCardId: string;
  cards: DeckCard[];
  exportText: string;
  createdAt: string;
  updatedAt: string;
};

export type DeckValidationErrorCode =
  | 'MISSING_LEADER'
  | 'LEADER_QUANTITY'
  | 'LEADER_NOT_FOUND'
  | 'LEADER_TYPE'
  | 'MAIN_DECK_SIZE'
  | 'CARD_NOT_FOUND'
  | 'CARD_TYPE'
  | 'CARD_QUANTITY'
  | 'CARD_COLOR';

export type DeckValidationError = {
  code: DeckValidationErrorCode;
  message: string;
  cardId?: string;
};

export type DeckValidation = {
  valid: boolean;
  errors: DeckValidationError[];
  leaderCardId: string | null;
  mainDeckCount: number;
};

export type DeckPayload = {
  name: string;
  leaderCardId: string;
  cards: DeckCard[];
};

export type DeckImportResult = {
  payload: DeckPayload;
  validation: DeckValidation;
};

export type DeckListResponse = {
  decks: Deck[];
};

export type GamePhase =
  | 'setup'
  | 'refresh'
  | 'draw'
  | 'don'
  | 'main'
  | 'end'
  | 'finished';

export type GameZone =
  | 'leader'
  | 'deck'
  | 'donDeck'
  | 'hand'
  | 'life'
  | 'characters'
  | 'stage'
  | 'cost'
  | 'trash';

export type PublicCard = {
  instanceId: string;
  cardId: string;
  number: string;
  name: string;
  type: CardType;
  colors: CardColor[];
  cost: number | null;
  power: number | null;
  life: number | null;
  counter: number | null;
  imageUrl: string | null;
  rested: boolean;
  attachedDon: number;
  playedThisTurn: boolean;
};

export type PrivateCard = PublicCard & {
  text: string;
  trigger: string | null;
};

export type PlayerZoneCounts = Record<GameZone, number>;

export type DuelPlayerView = {
  sessionId: string;
  authUserId: string;
  displayName: string;
  deckId: string;
  ready: boolean;
  connected: boolean;
  leader: PublicCard | null;
  hand: PrivateCard[];
  opponentHandCount: number;
  lifeCount: number;
  deckCount: number;
  donDeckCount: number;
  characters: PublicCard[];
  stage: PublicCard | null;
  cost: PublicCard[];
  trash: PublicCard[];
};

export type DuelLogEntry = {
  id: string;
  message: string;
  createdAt: string;
};

export function normalizeCardId(cardId: string): string {
  return cardId.trim().toUpperCase();
}

export function normalizeDeckCards(cards: DeckCard[]): DeckCard[] {
  const quantities = new Map<string, number>();

  for (const card of cards) {
    const cardId = normalizeCardId(card.cardId);
    const quantity = Math.trunc(Number(card.quantity));

    if (!cardId || !Number.isFinite(quantity) || quantity <= 0) {
      continue;
    }

    quantities.set(cardId, (quantities.get(cardId) ?? 0) + quantity);
  }

  return Array.from(quantities.entries())
    .map(([cardId, quantity]) => ({ cardId, quantity }))
    .sort((left, right) => left.cardId.localeCompare(right.cardId));
}

export function exportDeckToText(deck: Pick<DeckPayload, 'leaderCardId' | 'cards'>): string {
  const leaderCardId = normalizeCardId(deck.leaderCardId);
  const lines = leaderCardId ? [`1x${leaderCardId}`] : [];

  for (const card of normalizeDeckCards(deck.cards)) {
    lines.push(`${card.quantity}x${card.cardId}`);
  }

  return lines.join('\n');
}

export function parseDeckText(text: string, name = 'Deck importe'): DeckPayload {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const parsed = lines.map((line) => {
    const match = line.match(/^(\d+)\s*x\s*([A-Za-z0-9-]+)$/);

    if (!match) {
      return null;
    }

    return {
      quantity: Number(match[1]),
      cardId: normalizeCardId(match[2] ?? ''),
    };
  });
  const [leader] = parsed;

  return {
    name,
    leaderCardId: leader?.quantity === 1 ? leader.cardId : '',
    cards: normalizeDeckCards(parsed.slice(1).filter((card): card is DeckCard => card !== null)),
  };
}
