import {
  BadGatewayException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type {
  Card,
  CardColor,
  CardFilterOptions,
  CardSearchQuery,
  CardSearchResponse,
  CardType,
} from '@onepiecetcg/shared';
import type { OptcgApiCard, OptcgCardBucket } from './optcg-api.types';

const CACHE_TTL_MS = 1000 * 60 * 60 * 12;
const OPTCG_BASE_URL = 'https://optcgapi.com/api';
const CARD_ENDPOINTS: Array<{ bucket: OptcgCardBucket; path: string }> = [
  { bucket: 'sets', path: '/allSetCards/' },
  { bucket: 'decks', path: '/allSTCards/' },
  { bucket: 'promos', path: '/allPromoCards/' },
  { bucket: 'don', path: '/allDonCards/' },
];

@Injectable()
export class CatalogService {
  private cardsCache: { cards: Card[]; cachedAt: Date } | null = null;

  async searchCards(query: CardSearchQuery): Promise<CardSearchResponse> {
    const { cards, cachedAt } = await this.getCards();
    const filtered = cards.filter((card) => this.matchesQuery(card, query));

    return {
      cards: filtered,
      total: filtered.length,
      filters: this.toFilterOptions(cards),
      cachedAt: cachedAt.toISOString(),
    };
  }

  async getCard(id: string): Promise<Card> {
    const normalizedId = id.trim().toUpperCase();
    const { cards } = await this.getCards();
    const card = cards.find((candidate) => candidate.id === normalizedId);

    if (!card) {
      throw new NotFoundException(`Card ${normalizedId} was not found`);
    }

    return card;
  }

  async getFilters(): Promise<CardFilterOptions> {
    const { cards } = await this.getCards();

    return this.toFilterOptions(cards);
  }

  private async getCards(): Promise<{ cards: Card[]; cachedAt: Date }> {
    if (
      this.cardsCache &&
      Date.now() - this.cardsCache.cachedAt.getTime() < CACHE_TTL_MS
    ) {
      return this.cardsCache;
    }

    const sourceCards = await this.fetchAllSourceCards();
    const normalizedCards = this.dedupeCards(
      sourceCards
        .map(({ card, bucket }) => this.normalizeCard(card, bucket))
        .filter((card): card is Card => card !== null),
    ).sort((left, right) => left.id.localeCompare(right.id));

    if (normalizedCards.length === 0) {
      throw new BadGatewayException('OPTCG API returned no usable cards');
    }

    this.cardsCache = { cards: normalizedCards, cachedAt: new Date() };

    return this.cardsCache;
  }

  /**
   * Removes duplicate cards sharing the same `id`. The OPTCG API sources cards from four
   * independent endpoints (sets, starter decks, promos, DON!!), and the same printing can be
   * returned by more than one of them, producing entries with an identical normalized `id`.
   * The first occurrence (source order: sets, decks, promos, don) is kept.
   */
  private dedupeCards(cards: Card[]): Card[] {
    const seenIds = new Set<string>();
    const deduped: Card[] = [];

    for (const card of cards) {
      if (seenIds.has(card.id)) {
        continue;
      }

      seenIds.add(card.id);
      deduped.push(card);
    }

    return deduped;
  }

  private async fetchAllSourceCards(): Promise<
    Array<{ card: OptcgApiCard; bucket: OptcgCardBucket }>
  > {
    const responses = await Promise.allSettled(
      CARD_ENDPOINTS.map(async (endpoint) => {
        try {
          const response = await fetch(`${OPTCG_BASE_URL}${endpoint.path}`);

          if (!response.ok) {
            throw new Error(
              `${endpoint.path} responded with ${response.status}`,
            );
          }

          const payload = (await response.json()) as unknown;
          const cards = this.extractCards(payload);

          return cards.map((card) => ({ card, bucket: endpoint.bucket }));
        } catch (error) {
          return {
            failedEndpoint: endpoint.path,
            reason: error instanceof Error ? error.message : 'unknown error',
          };
        }
      }),
    );

    const cards = responses.flatMap((response) => {
      if (response.status === 'rejected' || !Array.isArray(response.value)) {
        return [];
      }

      return response.value;
    });

    if (cards.length > 0) {
      return cards;
    }

    if (this.cardsCache) {
      return this.cardsCache.cards.map((card) => ({
        card: this.toSourceFallback(card),
        bucket: 'sets' as const,
      }));
    }

    const failureReason = responses
      .map((response) => {
        if (response.status === 'rejected') {
          return response.reason instanceof Error
            ? response.reason.message
            : 'unknown error';
        }

        return Array.isArray(response.value) ? null : response.value.reason;
      })
      .filter(Boolean)
      .join('; ');

    throw new ServiceUnavailableException(
      `OPTCG API is unavailable: ${failureReason || 'no source returned cards'}`,
    );
  }

  private extractCards(payload: unknown): OptcgApiCard[] {
    if (Array.isArray(payload)) {
      return payload.filter(this.isObject);
    }

    if (this.isObject(payload)) {
      for (const key of ['cards', 'results', 'data']) {
        const value = payload[key];

        if (Array.isArray(value)) {
          return value.filter(this.isObject);
        }
      }
    }

    return [];
  }

  private normalizeCard(
    source: OptcgApiCard,
    bucket: OptcgCardBucket,
  ): Card | null {
    const number = this.firstString(source, [
      'card_set_id',
      'card_id',
      'cardId',
      'id',
      'number',
      'card_number',
    ]);
    const name = this.firstString(source, ['card_name', 'cardName', 'name']);

    if (!number || !name) {
      return null;
    }

    const normalizedNumber = number.trim().toUpperCase();
    const type = this.toCardType(
      this.firstString(source, ['card_type', 'cardType', 'type']),
      bucket,
    );
    const setId =
      this.firstString(source, [
        'set_id',
        'setId',
        'set',
        'deck_id',
        'st_id',
      ]) ?? this.inferSetId(normalizedNumber, bucket);
    const setName =
      this.firstString(source, [
        'set_name',
        'setName',
        'set',
        'deck_name',
        'st_name',
      ]) ?? setId;

    return {
      id: normalizedNumber,
      number: normalizedNumber,
      name: name.trim(),
      type,
      colors: this.toColors(
        this.firstValue(source, ['color', 'colors', 'card_color', 'cardColor']),
      ),
      cost: this.toNumberOrNull(this.firstValue(source, ['cost', 'card_cost'])),
      power: this.toNumberOrNull(
        this.firstValue(source, ['power', 'card_power']),
      ),
      life: this.toNumberOrNull(this.firstValue(source, ['life', 'card_life'])),
      counter: this.toNumberOrNull(
        this.firstValue(source, ['counter_amount', 'counter', 'card_counter']),
      ),
      attributes: this.toStringList(
        this.firstValue(source, ['attribute', 'attributes']),
      ),
      families: this.toStringList(
        this.firstValue(source, ['sub_types', 'family', 'families', 'types']),
      ),
      text:
        this.firstString(source, ['effect', 'card_text', 'cardText', 'text']) ??
        '',
      trigger: this.firstString(source, [
        'trigger',
        'card_trigger',
        'cardTrigger',
      ]),
      imageUrl: this.firstString(source, [
        'card_image',
        'cardImage',
        'image',
        'image_url',
        'imageUrl',
      ]),
      set: {
        id: setId,
        name: setName,
      },
      rarity: this.firstString(source, ['rarity', 'card_rarity']),
    };
  }

  private matchesQuery(card: Card, query: CardSearchQuery): boolean {
    const search = query.q?.trim().toLowerCase();

    return (
      (!search ||
        card.name.toLowerCase().includes(search) ||
        card.number.toLowerCase().includes(search) ||
        card.text.toLowerCase().includes(search)) &&
      (!query.set ||
        card.set.id === query.set ||
        card.set.name === query.set) &&
      (!query.type || card.type === query.type) &&
      (!query.color || card.colors.includes(query.color)) &&
      (query.cost === undefined || card.cost === query.cost)
    );
  }

  private toFilterOptions(cards: Card[]): CardFilterOptions {
    const sets = Array.from(
      new Map(cards.map((card) => [card.set.id, card.set])).values(),
    ).sort((left, right) => left.id.localeCompare(right.id));

    return {
      sets,
      types: this.unique(cards.map((card) => card.type)),
      colors: this.unique(cards.flatMap((card) => card.colors)),
      costs: this.unique(
        cards
          .map((card) => card.cost)
          .filter((cost): cost is number => cost !== null),
      ).sort((left, right) => left - right),
    };
  }

  private toSourceFallback(card: Card): OptcgApiCard {
    return {
      card_id: card.id,
      card_name: card.name,
      card_type: card.type,
      color: card.colors,
      cost: card.cost,
      power: card.power,
      life: card.life,
      counter: card.counter,
      attribute: card.attributes,
      family: card.families,
      card_text: card.text,
      trigger: card.trigger,
      card_image: card.imageUrl,
      set_id: card.set.id,
      set_name: card.set.name,
      rarity: card.rarity,
    };
  }

  private toCardType(value: string | null, bucket: OptcgCardBucket): CardType {
    const normalized = value?.trim().toLowerCase();

    if (bucket === 'don' || normalized?.includes('don')) return 'DON!!';
    if (normalized?.includes('leader')) return 'Leader';
    if (normalized?.includes('event')) return 'Event';
    if (normalized?.includes('stage') || normalized?.includes('place'))
      return 'Stage';

    return 'Character';
  }

  private toColors(value: unknown): CardColor[] {
    const tokens = Array.isArray(value)
      ? value.flatMap((item) => this.toColors(item))
      : typeof value === 'string'
        ? value
            .split(/[\s,\/|&]+/)
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

    return tokens
      .map((color) => color.toLowerCase())
      .map((color) => {
        if (color.includes('red')) return 'Red';
        if (color.includes('green')) return 'Green';
        if (color.includes('blue')) return 'Blue';
        if (color.includes('purple')) return 'Purple';
        if (color.includes('black')) return 'Black';
        if (color.includes('yellow')) return 'Yellow';
        return null;
      })
      .filter((color): color is CardColor => color !== null);
  }

  private inferSetId(cardId: string, bucket: OptcgCardBucket): string {
    if (bucket === 'promos') return 'P';
    if (bucket === 'don') return 'DON';

    return cardId.split('-')[0] || bucket.toUpperCase();
  }

  private firstValue(source: OptcgApiCard, keys: string[]): unknown {
    for (const key of keys) {
      if (source[key] !== undefined && source[key] !== null) {
        return source[key];
      }
    }

    return null;
  }

  private firstString(source: OptcgApiCard, keys: string[]): string | null {
    const value = this.firstValue(source, keys);

    if (typeof value === 'string' && value.trim()) {
      return value;
    }

    if (typeof value === 'number') {
      return String(value);
    }

    return null;
  }

  private toNumberOrNull(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const match = value.match(/\d+/);
      return match ? Number(match[0]) : null;
    }

    return null;
  }

  private toStringList(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.flatMap((item) => this.toStringList(item));
    }

    if (typeof value === 'string') {
      return value
        .split(/[,/]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  }

  private unique<T>(values: T[]): T[] {
    return Array.from(new Set(values));
  }

  private isObject(value: unknown): value is OptcgApiCard {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
