import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Card } from '@onepiecetcg/shared';
import { PlayerAccountService } from '../player-account/player-account.service';
import { CatalogService } from '../catalog/catalog.service';
import { DeckService } from './deck.service';
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

describe('DeckService', () => {
  let service: DeckService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        DeckService,
        {
          provide: getRepositoryToken(SavedDeck),
          useValue: {},
        },
        {
          provide: PlayerAccountService,
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

    service = moduleRef.get(DeckService);
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

  it('rejects a missing leader', async () => {
    const validation = await service.validate({
      name: 'No leader',
      leaderCardId: '',
      cards: [{ cardId: 'C-001', quantity: 50 }],
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors.map((error) => error.code)).toEqual(
      expect.arrayContaining(['MISSING_LEADER']),
    );
  });

  it('rejects a leader id that does not exist in the catalog', async () => {
    const validation = await service.validate({
      name: 'Unknown leader',
      leaderCardId: 'L-999',
      cards: [{ cardId: 'C-001', quantity: 50 }],
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors).toContainEqual(
      expect.objectContaining({ code: 'LEADER_NOT_FOUND', cardId: 'L-999' }),
    );
  });

  it('rejects a non-Leader card used as leader', async () => {
    const validation = await service.validate({
      name: 'Character as leader',
      leaderCardId: 'C-001',
      cards: [{ cardId: 'C-002', quantity: 50 }],
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors).toContainEqual(
      expect.objectContaining({ code: 'LEADER_TYPE', cardId: 'C-001' }),
    );
  });

  it('rejects a main deck card id that does not exist in the catalog', async () => {
    const validation = await service.validate({
      name: 'Unknown card',
      leaderCardId: 'L-001',
      cards: [{ cardId: 'C-999', quantity: 50 }],
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors).toContainEqual(
      expect.objectContaining({ code: 'CARD_NOT_FOUND', cardId: 'C-999' }),
    );
  });

  it('accepts exactly 49 cards as invalid (boundary below 50)', async () => {
    const validation = await service.validate({
      name: 'Too few',
      leaderCardId: 'L-001',
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
        { cardId: 'S-001', quantity: 1 },
      ],
    });

    expect(validation.mainDeckCount).toBe(49);
    expect(validation.valid).toBe(false);
    expect(validation.errors.map((error) => error.code)).toEqual(
      expect.arrayContaining(['MAIN_DECK_SIZE']),
    );
  });

  it('rejects 51 cards as invalid (boundary above 50)', async () => {
    const validation = await service.validate({
      name: 'Too many',
      leaderCardId: 'L-001',
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
        { cardId: 'S-001', quantity: 3 },
      ],
    });

    expect(validation.mainDeckCount).toBe(51);
    expect(validation.valid).toBe(false);
    expect(validation.errors.map((error) => error.code)).toEqual(
      expect.arrayContaining(['MAIN_DECK_SIZE']),
    );
  });

  it('accepts exactly 4 copies of a card as the maximum allowed (boundary)', async () => {
    const validation = await service.validate({
      name: 'Max copies',
      leaderCardId: 'L-001',
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

    expect(validation.errors.map((error) => error.code)).not.toContain(
      'CARD_QUANTITY',
    );
  });

  it('rejects a card color mismatch isolated from any other error', async () => {
    const validation = await service.validate({
      name: 'Off color only',
      leaderCardId: 'L-001',
      cards: [
        { cardId: 'C-001', quantity: 4 },
        { cardId: 'C-002', quantity: 4 },
        { cardId: 'C-003', quantity: 4 },
        { cardId: 'C-004', quantity: 4 },
        { cardId: 'C-005', quantity: 4 },
        { cardId: 'C-006', quantity: 4 },
        { cardId: 'C-007', quantity: 4 },
        { cardId: 'C-008', quantity: 4 },
        { cardId: 'C-009', quantity: 4 },
        { cardId: 'C-010', quantity: 4 },
        { cardId: 'C-011', quantity: 4 },
        { cardId: 'E-001', quantity: 4 },
        { cardId: 'S-001', quantity: 2 },
      ],
    });

    expect(validation.mainDeckCount).toBe(50);
    expect(validation.errors).toContainEqual(
      expect.objectContaining({ code: 'CARD_COLOR', cardId: 'C-003' }),
    );
    expect(validation.errors.map((error) => error.code)).not.toContain(
      'MAIN_DECK_SIZE',
    );
    expect(validation.errors.map((error) => error.code)).not.toContain(
      'CARD_QUANTITY',
    );
  });

  it('rejects a DON!! card placed in the main deck via CARD_TYPE, isolated from other errors', async () => {
    const validation = await service.validate({
      name: 'DON in main deck',
      leaderCardId: 'L-001',
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
        { cardId: 'E-001', quantity: 2 },
        { cardId: 'DON-001', quantity: 4 },
      ],
    });

    expect(validation.mainDeckCount).toBe(50);
    expect(validation.errors).toContainEqual(
      expect.objectContaining({ code: 'CARD_TYPE', cardId: 'DON-001' }),
    );
    expect(validation.errors.map((error) => error.code)).not.toContain(
      'MAIN_DECK_SIZE',
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
