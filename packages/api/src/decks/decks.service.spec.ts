import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Card } from '@onepiecetcg/shared';
import { AccountsService } from '../accounts/accounts.service';
import { CatalogService } from '../catalog/catalog.service';
import { DecksService } from './decks.service';
import { SavedDeck } from './saved-deck.entity';

jest.mock('@onepiecetcg/shared', () => {
  const sharedMock: typeof import('./shared-test.mock') =
    jest.requireActual('./shared-test.mock');

  return sharedMock;
});

const cards: Card[] = [
  card('L-001', 'Leader', ['Red']),
  card('C-001', 'Character', ['Red']),
  card('C-002', 'Character', ['Red']),
  card('C-004', 'Character', ['Red']),
  card('C-005', 'Character', ['Red']),
  card('C-006', 'Character', ['Red']),
  card('C-007', 'Character', ['Red']),
  card('C-008', 'Character', ['Red']),
  card('C-009', 'Character', ['Red']),
  card('C-010', 'Character', ['Red']),
  card('C-011', 'Character', ['Red']),
  card('C-012', 'Character', ['Red']),
  card('C-013', 'Character', ['Red']),
  card('C-014', 'Character', ['Red']),
  card('E-001', 'Event', ['Red']),
  card('S-001', 'Stage', ['Red']),
  card('C-003', 'Character', ['Blue']),
  card('DON-001', 'DON!!', []),
];

describe('DecksService', () => {
  let service: DecksService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        DecksService,
        {
          provide: getRepositoryToken(SavedDeck),
          useValue: {},
        },
        {
          provide: AccountsService,
          useValue: {},
        },
        {
          provide: CatalogService,
          useValue: {
            searchCards: jest.fn().mockResolvedValue({
              cards,
              total: cards.length,
              filters: { sets: [], types: [], colors: [], costs: [] },
              cachedAt: new Date().toISOString(),
            }),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(DecksService);
  });

  it('accepts a valid leader plus 50-card main deck', async () => {
    const validation = await service.validate({
      name: 'Red deck',
      leaderCardId: 'l-001',
      cards: [
        { cardId: 'C-001', quantity: 4 },
        { cardId: 'C-002', quantity: 4 },
        { cardId: 'C-004', quantity: 4 },
        { cardId: 'C-005', quantity: 4 },
        { cardId: 'C-006', quantity: 4 },
        { cardId: 'C-007', quantity: 4 },
        { cardId: 'C-008', quantity: 4 },
        { cardId: 'C-009', quantity: 4 },
        { cardId: 'C-010', quantity: 4 },
        { cardId: 'C-011', quantity: 4 },
        { cardId: 'C-012', quantity: 4 },
        { cardId: 'E-001', quantity: 4 },
        { cardId: 'S-001', quantity: 2 },
      ],
    });

    expect(validation).toMatchObject({
      valid: true,
      errors: [],
      leaderCardId: 'L-001',
      mainDeckCount: 50,
    });
  });

  it('rejects invalid size, off-color cards, non-main cards, and quantity overflow', async () => {
    const validation = await service.validate({
      name: 'Bad deck',
      leaderCardId: 'L-001',
      cards: [
        { cardId: 'C-001', quantity: 5 },
        { cardId: 'C-003', quantity: 4 },
        { cardId: 'DON-001', quantity: 1 },
      ],
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors.map((error) => error.code)).toEqual(
      expect.arrayContaining([
        'MAIN_DECK_SIZE',
        'CARD_QUANTITY',
        'CARD_COLOR',
        'CARD_TYPE',
      ]),
    );
  });
});

function card(id: string, type: Card['type'], colors: Card['colors']): Card {
  return {
    id,
    number: id,
    name: id,
    type,
    colors,
    cost: type === 'Leader' || type === 'DON!!' ? null : 1,
    power: type === 'Leader' || type === 'Character' ? 5000 : null,
    life: type === 'Leader' ? 5 : null,
    counter: type === 'Character' ? 1000 : null,
    attributes: [],
    families: [],
    text: '',
    trigger: null,
    imageUrl: null,
    set: { id: 'TEST', name: 'Test' },
    rarity: null,
  };
}
