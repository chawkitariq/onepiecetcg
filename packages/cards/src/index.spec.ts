import { describe, expect, it } from 'vitest';
import {
  buildCatalogFilterOptions,
  effectDefinitionEditions,
  findCatalogCard,
  getCatalogRoot,
  listCatalogEditions,
  loadEffectSources,
  loadCatalogCards,
  loadCatalogEdition,
  matchesCatalogQuery,
  searchCatalogCards,
  searchCatalogCardsInMemory,
  specialHandlerDefinitions,
} from './index';

describe('@onepiecetcg/cards', () => {
  it('lists catalog editions from the packaged snapshots', async () => {
    const editions = await listCatalogEditions();

    expect(editions.length).toBeGreaterThan(0);
    expect(editions.some((edition) => edition.editionId === 'OP-01')).toBe(true);
    expect(
      editions.every((edition) => edition.absolutePath.startsWith(getCatalogRoot())),
    ).toBe(true);
  });

  it('loads one edition snapshot by id', async () => {
    const edition = await loadCatalogEdition('op-01');

    expect(edition.editionId).toBe('OP-01');
    expect(edition.cards.length).toBeGreaterThan(0);
    expect(edition.cards[0]?.set.id).toBe('OP-01');
  });

  it('loads and looks up cards across the full catalog', async () => {
    const cards = await loadCatalogCards();
    const card = findCatalogCard(cards, 'op01-001');

    expect(cards.length).toBeGreaterThan(1000);
    expect(card).toBeTruthy();
    expect(card?.name).toMatch(/Roronoa Zoro/);
    expect(card?.type).toBe('Leader');
  });

  it('builds filter options from an in-memory card list', async () => {
    const edition = await loadCatalogEdition('ST-01');
    const filters = buildCatalogFilterOptions(edition.cards);

    expect(filters.sets.some((set) => set.id === 'ST-01')).toBe(true);
    expect(filters.types).toContain('Leader');
    expect(filters.colors).toContain('Red');
  });

  it('matches and searches cards with the shared query contract', async () => {
    const edition = await loadCatalogEdition('OP-01');
    const leader = edition.cards.find((card) => card.id === 'OP01-001');

    expect(leader).toBeTruthy();
    expect(
      leader &&
        matchesCatalogQuery(leader, {
          q: 'zoro',
          type: 'Leader',
          color: 'Red',
        }),
    ).toBe(true);

    const inMemoryResult = searchCatalogCardsInMemory(edition.cards, {
      q: 'zoro',
      type: 'Leader',
      color: 'Red',
    });

    expect(inMemoryResult.total).toBeGreaterThan(0);
  });

  it('searches across the packaged snapshots', async () => {
    const result = await searchCatalogCards({
      q: 'blocker',
      type: 'Character',
    });

    expect(result.total).toBeGreaterThan(0);
    expect(result.cards.every((card) => card.type === 'Character')).toBe(true);
  });

  it('exposes the packaged effect definitions and special handlers', () => {
    const sources = loadEffectSources();

    expect(effectDefinitionEditions.length).toBeGreaterThan(0);
    expect(specialHandlerDefinitions.length).toBeGreaterThan(0);
    expect(
      effectDefinitionEditions.some((edition) => edition.editionId === 'OP-01'),
    ).toBe(true);
    expect(sources.definitions).toBe(effectDefinitionEditions);
    expect(sources.specialHandlers).toBe(specialHandlerDefinitions);
  });
});
