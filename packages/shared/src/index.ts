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
