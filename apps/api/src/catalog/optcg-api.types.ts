export type OptcgApiCard = {
  inventory_price: number | null;
  market_price: number | null;
  card_name: string;
  set_name: string;
  card_text: string;
  set_id: string;
  rarity: string | null;
  card_set_id: string;
  card_color: string | null;
  card_type: string;
  life: string | number | null;
  card_cost: string | number | null;
  card_power: string | number | null;
  sub_types: string | null;
  counter_amount: string | number | null;
  attribute: string | null;
  date_scraped: string;
  card_image_id: string;
  card_image: string | null;
};

export type OptcgCardBucket = 'sets' | 'decks' | 'promos' | 'don';
