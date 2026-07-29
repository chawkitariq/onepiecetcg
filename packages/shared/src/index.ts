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

export type InvalidDeckLine = {
  line: number;
  raw: string;
};

export type DeckImportResult = {
  payload: DeckPayload;
  validation: DeckValidation;
  invalidLines: InvalidDeckLine[];
};

export type DeckListResponse = {
  decks: Deck[];
};

/** Win/loss aggregate over a set of matches. */
export type ResultBreakdown = {
  played: number;
  wins: number;
  losses: number;
  winRate: number;
};

/** Result breakdown for one saved deck; `deckName` is null once the deck has been deleted. */
export type DeckStats = ResultBreakdown & {
  deckId: string;
  deckName: string | null;
};

/** Result breakdown for one Leader card, independent of any saved deck. */
export type LeaderStats = ResultBreakdown & {
  leaderCardId: string;
  leaderName: string | null;
  leaderImageUrl: string | null;
};

/** REST contract for `GET /stats/me` (docs/plan.md Etape 13). */
export type PlayerStats = ResultBreakdown & {
  currentStreak: { type: 'win' | 'loss'; length: number } | null;
  averageDurationSeconds: number | null;
  wentFirst: ResultBreakdown;
  wentSecond: ResultBreakdown;
  byDeck: DeckStats[];
  byLeader: LeaderStats[];
};

export type DescribedRoomSummary = {
  roomId: string;
  description: string;
  clients: number;
  maxClients: number;
};

export type DescribedRoomListResponse = {
  rooms: DescribedRoomSummary[];
};

export type DuelEndReason = 'life' | 'deckOut' | 'forfeit';

export type GamePhase =
  | 'setup'
  | 'mulligan'
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
  baseCost?: number | null;
  basePower?: number | null;
  power: number | null;
  life: number | null;
  counter: number | null;
  attributes?: string[];
  families?: string[];
  imageUrl: string | null;
  rested: boolean;
  attachedDon: number;
  playedThisTurn: boolean;
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
  cannotAttackUntilTurn: number;
  skipNextRefreshPhases: number;
};

export type PrivateCard = PublicCard & {
  text: string;
  trigger: string | null;
};

export type PlayerZoneCounts = Record<GameZone, number>;

export type TargetType = 'leader' | 'character';

export type CombatTarget = {
  type: TargetType;
  playerSessionId: string;
  instanceId: string;
};

export type CombatStep =
  | 'declared'
  | 'blocked'
  | 'countering'
  | 'resolving'
  | 'resolved';

export type CombatStatus = {
  attackerSessionId: string;
  attackerInstanceId: string;
  target: CombatTarget;
  blockerInstanceId: string | null;
  step: CombatStep;
  attackerPower: number;
  defenderPower: number;
};

export type ActivePlayer = {
  sessionId: string;
  turn: number;
};

export type FirstOrSecondChoice = 'first' | 'second';

export type DuelPlayerView = {
  sessionId: string;
  displayName: string;
  deckId: string;
  ready: boolean;
  connected: boolean;
  mulliganDecided: boolean;
  hasTakenFirstTurn: boolean;
  leader: PublicCard | null;
  stage: PublicCard | null;
  characters: PublicCard[];
  cost: PublicCard[];
  trash: PublicCard[];
  donDeckCount: number;
  hand: PrivateCard[];
  handCount: number;
  deck: PrivateCard[];
  deckCount: number;
  life: PrivateCard[];
  lifeCount: number;
};

export type DuelLogEntry = {
  id: string;
  message: string;
  createdAt: string;
};

export type DuelRoomView = {
  phase: GamePhase;
  activePlayer: ActivePlayer;
  players: Record<string, DuelPlayerView>;
  logs: DuelLogEntry[];
  combat: CombatStatus | null;
  startingPlayerSessionId: string | null;
  firstPlayerSessionId: string | null;
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

export function parseDeckText(
  text: string,
  name = 'Deck importe',
): { payload: DeckPayload; invalidLines: InvalidDeckLine[] } {
  const rawLines = text.split(/\r?\n/);
  const invalidLines: InvalidDeckLine[] = [];
  const parsed: Array<DeckCard | null> = [];

  rawLines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    if (!line) {
      return;
    }

    const match = line.match(/^(\d+)\s*x\s*([A-Za-z0-9-]+)$/);

    if (!match) {
      invalidLines.push({ line: index + 1, raw: rawLine });
      parsed.push(null);
      return;
    }

    parsed.push({
      quantity: Number(match[1]),
      cardId: normalizeCardId(match[2] ?? ''),
    });
  });
  const [leader] = parsed;

  return {
    payload: {
      name,
      leaderCardId: leader?.quantity === 1 ? leader.cardId : '',
      cards: normalizeDeckCards(parsed.slice(1).filter((card): card is DeckCard => card !== null)),
    },
    invalidLines,
  };
}

export * from './duel-state-schema.js';
export * from './effects.js';
