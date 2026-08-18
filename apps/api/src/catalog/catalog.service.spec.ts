import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
  const fetchMock = jest.fn();
  let service: CatalogService;

  function createOptcgCard(overrides: Record<string, unknown> = {}) {
    return {
      inventory_price: 0.07,
      market_price: 0.16,
      card_name: 'Monkey.D.Luffy',
      set_name: 'Romance Dawn',
      card_text: 'Leader text',
      set_id: 'OP01',
      rarity: 'L',
      card_set_id: 'OP01-001',
      card_color: 'Red',
      card_type: 'Leader',
      life: '5',
      card_cost: null,
      card_power: '5000',
      sub_types: 'East Blue Straw Hat Crew',
      counter_amount: null,
      attribute: 'Strike',
      date_scraped: '2026-08-17',
      card_image_id: 'OP01-001',
      card_image: 'https://example.test/luffy.png',
      ...overrides,
    }
  }

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
    service = new CatalogService();
  });

  it('normalizes OPTCG cards and filters by search, color, type and cost', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          createOptcgCard(),
          createOptcgCard({
            card_name: 'Nami',
            set_name: 'Romance Dawn',
            card_text: 'Search your deck.',
            set_id: 'OP01',
            rarity: 'UC',
            card_set_id: 'OP01-016',
            card_color: 'Red',
            card_type: 'Character',
            life: null,
            card_cost: '1',
            card_power: '2000',
            sub_types: 'East Blue Straw Hat Crew',
            counter_amount: 1000,
            attribute: 'Wisdom',
            card_image_id: 'OP01-016',
            card_image: 'https://example.test/nami.png',
          }),
          createOptcgCard({
            card_name: 'Nami',
            set_name: 'A Fist of Divine Speed',
            card_text: 'Leader text',
            set_id: 'OP11',
            rarity: 'L',
            card_set_id: 'OP11-041',
            card_color: 'Blue Yellow',
            card_type: 'Leader',
            life: '4',
            card_cost: null,
            card_power: '5000',
            sub_types: 'Straw Hat Crew',
            counter_amount: null,
            attribute: 'Special',
            card_image_id: 'OP11-041',
            card_image: '[https://example.test/nami-leader.png](https://example.test/nami-leader.png)',
          }),
        ],
      })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    const response = await service.searchCards({
      q: 'nami',
      color: 'Red',
      type: 'Character',
      cost: 1,
    });

    expect(response.total).toBe(1);
      expect(response.cards[0]).toMatchObject({
      id: 'OP01-016',
      name: 'Nami',
      type: 'Character',
      colors: ['Red'],
      cost: 1,
      power: 2000,
      counter: 1000,
      families: ['East Blue Straw Hat Crew'],
      imageUrl: 'https://example.test/nami.png',
      imageId: 'OP01-016',
      set: { id: 'OP01', name: 'Romance Dawn' },
    });
    expect(response.filters.sets).toEqual([
      { id: 'OP01', name: 'Romance Dawn' },
      { id: 'OP11', name: 'A Fist of Divine Speed' },
    ]);

    await expect(service.searchCards({})).resolves.toMatchObject({
      total: 3,
        cards: expect.arrayContaining([
          expect.objectContaining({
          id: 'OP11-041',
          colors: ['Blue', 'Yellow'],
          imageUrl: 'https://example.test/nami-leader.png',
          imageId: 'OP11-041',
          set: { id: 'OP11', name: 'A Fist of Divine Speed' },
        }),
      ]),
    });
  });

  it('serves card details from the local cache without calling the source API again', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          createOptcgCard({
            card_name: 'Monkey.D.Luffy',
            set_name: 'Starter Deck 1',
            card_text: '',
            set_id: 'ST01',
            rarity: 'L',
            card_set_id: 'ST01-001',
            card_color: 'Red',
            card_type: 'Leader',
            life: 5,
            card_cost: null,
            card_power: 5000,
            sub_types: 'Straw Hat Crew',
            counter_amount: null,
            attribute: 'Strike',
            card_image_id: 'ST01-001',
            card_image: 'https://example.test/st01-001.png',
          }),
        ],
      })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    await service.searchCards({});
    await expect(service.getCard('st01-001')).resolves.toMatchObject({
      id: 'ST01-001',
      type: 'Leader',
    });
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('dedupes cards sharing the same id across different OPTCG source endpoints', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          createOptcgCard({
            card_name: 'Izo',
            set_name: 'Romance Dawn',
            card_text: '',
            set_id: 'OP01',
            rarity: 'R',
            card_set_id: 'OP01-033',
            card_color: 'Purple',
            card_type: 'Character',
            life: null,
            card_cost: 5,
            card_power: '5000',
            sub_types: 'Whitebeard Pirates',
            counter_amount: 1000,
            attribute: 'Slash',
            card_image_id: 'OP01-033',
            card_image: 'https://example.test/izo.png',
          }),
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          createOptcgCard({
            card_name: 'Izo',
            set_name: 'Romance Dawn',
            card_text: '',
            set_id: 'OP01',
            rarity: 'R',
            card_set_id: 'OP01-033',
            card_color: 'Purple',
            card_type: 'Character',
            life: null,
            card_cost: 5,
            card_power: '5000',
            sub_types: 'Whitebeard Pirates',
            counter_amount: 1000,
            attribute: 'Slash',
            card_image_id: 'OP01-033',
            card_image: 'https://example.test/izo.png',
          }),
        ],
      })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    const response = await service.searchCards({});

    expect(response.total).toBe(1);
    expect(response.cards).toHaveLength(1);
    expect(response.cards[0]).toMatchObject({ id: 'OP01-033', name: 'Izo' });
  });

  it('keeps the catalog available when one optional OPTCG endpoint fails', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          createOptcgCard({
            card_name: 'Monkey.D.Luffy',
            set_name: 'Romance Dawn',
            card_text: 'Leader text',
            set_id: 'OP01',
            rarity: 'L',
            card_set_id: 'OP01-001',
            card_color: 'Red',
            card_type: 'Leader',
            life: 5,
            card_cost: null,
            card_power: 5000,
            sub_types: 'East Blue',
            counter_amount: null,
            attribute: 'Strike',
            card_image_id: 'OP01-001',
            card_image: 'https://example.test/luffy.png',
          }),
        ],
      })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    await expect(service.searchCards({})).resolves.toMatchObject({
      total: 1,
      cards: [
        {
          id: 'OP01-001',
          name: 'Monkey.D.Luffy',
          type: 'Leader',
        },
      ],
    });
  });
});
