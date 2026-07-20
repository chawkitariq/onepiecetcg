import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
  const fetchMock = jest.fn();
  let service: CatalogService;

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
          {
            card_id: 'OP01-001',
            card_name: 'Monkey.D.Luffy',
            card_type: 'Leader',
            color: 'Red',
            life: '5',
            power: '5000',
            card_text: 'Leader text',
            set_id: 'OP01',
            set_name: 'Romance Dawn',
            rarity: 'L',
          },
          {
            card_id: 'OP01-016',
            card_set_id: 'OP01-016',
            card_name: 'Nami',
            card_type: 'Character',
            card_color: 'Red',
            card_cost: '1',
            counter_amount: 1000,
            power: '2000',
            sub_types: 'East Blue Straw Hat Crew',
            card_text: 'Search your deck.',
            card_image: 'https://example.test/nami.png',
            set_id: 'OP01',
            set_name: 'Romance Dawn',
          },
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
      set: { id: 'OP01', name: 'Romance Dawn' },
    });
    expect(response.filters.sets).toEqual([{ id: 'OP01', name: 'Romance Dawn' }]);
  });

  it('serves card details from the local cache without calling the source API again', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            card_id: 'ST01-001',
            card_name: 'Monkey.D.Luffy',
            card_type: 'Leader',
            color: 'Red',
            life: 5,
            power: 5000,
          },
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

  it('keeps the catalog available when one optional OPTCG endpoint fails', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            card_id: 'OP01-001',
            card_name: 'Monkey.D.Luffy',
            card_type: 'Leader',
            color: 'Red',
            life: 5,
            power: 5000,
          },
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
