import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  Card,
  CardColor,
  CardFilterOptions,
  CardSearchQuery,
  CardType,
} from '../../shared/dist/esm/index.js';

const catalogRoot = fileURLToPath(new URL('../catalog', import.meta.url));

/** Snapshot payload stored on disk for one catalog edition file. */
export type CatalogEdition = {
  editionId: string;
  name: string;
  cards: Card[];
};

/** One discoverable catalog snapshot file with its resolved location. */
export type CatalogEditionEntry = {
  family: string;
  editionId: string;
  name: string;
  relativePath: string;
  absolutePath: string;
};

/** Search result returned by the local catalog package. */
export type CatalogSearchResult = {
  cards: Card[];
  total: number;
  filters: CardFilterOptions;
};

let editionEntriesPromise: Promise<CatalogEditionEntry[]> | null = null;
const editionCache = new Map<string, Promise<CatalogEdition>>();
let allCardsPromise: Promise<Card[]> | null = null;

/**
 * Returns the absolute filesystem path of the versioned catalog directory.
 */
export function getCatalogRoot(): string {
  return catalogRoot;
}

/**
 * Lists every catalog snapshot file available in the package.
 */
export async function listCatalogEditions(): Promise<CatalogEditionEntry[]> {
  if (!editionEntriesPromise) {
    editionEntriesPromise = buildEditionEntries();
  }

  return editionEntriesPromise;
}

/**
 * Loads one catalog edition snapshot by edition id such as `OP-01` or `P`.
 */
export async function loadCatalogEdition(
  editionId: string,
): Promise<CatalogEdition> {
  const normalizedEditionId = normalizeEditionId(editionId);
  const cachedEdition = editionCache.get(normalizedEditionId);

  if (cachedEdition) {
    return cachedEdition;
  }

  const loadPromise = loadEditionFromDisk(normalizedEditionId);
  editionCache.set(normalizedEditionId, loadPromise);

  return loadPromise;
}

/**
 * Loads and flattens every card stored in the local catalog snapshots.
 */
export async function loadCatalogCards(): Promise<Card[]> {
  if (!allCardsPromise) {
    allCardsPromise = (async () => {
      const editions = await listCatalogEditions();
      const cards = await Promise.all(
        editions.map((edition) => loadCatalogEdition(edition.editionId)),
      );

      return cards
        .flatMap((edition) => edition.cards)
        .sort((left, right) => left.id.localeCompare(right.id));
    })();
  }

  return allCardsPromise;
}

/**
 * Finds a card by id or number inside an already loaded card list.
 */
export function findCatalogCard(cards: Card[], cardId: string): Card | null {
  const normalizedCardId = normalizeCardId(cardId);

  return (
    cards.find(
      (card) =>
        normalizeCardId(card.id) === normalizedCardId ||
        normalizeCardId(card.number) === normalizedCardId,
    ) ?? null
  );
}

/**
 * Loads the full catalog and returns a single card by id or number.
 */
export async function getCatalogCard(cardId: string): Promise<Card | null> {
  const cards = await loadCatalogCards();
  return findCatalogCard(cards, cardId);
}

/**
 * Returns the shared deck-builder filter options computed from a card list.
 */
export function buildCatalogFilterOptions(cards: Card[]): CardFilterOptions {
  const sets = Array.from(
    new Map(cards.map((card) => [card.set.id, card.set])).values(),
  ).sort((left, right) => left.id.localeCompare(right.id));

  return {
    sets,
    types: unique(cards.map((card) => card.type)),
    colors: unique(cards.flatMap((card) => card.colors)),
    costs: unique(
      cards
        .map((card) => card.cost)
        .filter((cost): cost is number => cost !== null),
    ).sort((left, right) => left - right),
  };
}

/**
 * Evaluates whether one card matches a shared card-catalog search query.
 */
export function matchesCatalogQuery(
  card: Card,
  query: CardSearchQuery,
): boolean {
  const search = query.q?.trim().toLowerCase();

  return (
    (!search ||
      card.name.toLowerCase().includes(search) ||
      card.number.toLowerCase().includes(search) ||
      card.text.toLowerCase().includes(search)) &&
    (!query.set || card.set.id === query.set || card.set.name === query.set) &&
    (!query.type || card.type === query.type) &&
    (!query.color || card.colors.includes(query.color)) &&
    (query.cost === undefined || card.cost === query.cost)
  );
}

/**
 * Filters an already loaded card list with the shared catalog query contract.
 */
export function searchCatalogCardsInMemory(
  cards: Card[],
  query: CardSearchQuery,
): CatalogSearchResult {
  const filteredCards = cards.filter((card) => matchesCatalogQuery(card, query));

  return {
    cards: filteredCards,
    total: filteredCards.length,
    filters: buildCatalogFilterOptions(cards),
  };
}

/**
 * Loads the full local catalog and applies the shared search query contract.
 */
export async function searchCatalogCards(
  query: CardSearchQuery,
): Promise<CatalogSearchResult> {
  const cards = await loadCatalogCards();
  return searchCatalogCardsInMemory(cards, query);
}

async function buildEditionEntries(): Promise<CatalogEditionEntry[]> {
  const absolutePaths = await collectJsonFiles(catalogRoot);
  const editions = await Promise.all(
    absolutePaths.map(async (absolutePath) => {
      const edition = await readCatalogEditionFile(absolutePath);
      const relativePath = path.relative(catalogRoot, absolutePath);
      const family = relativePath.split(path.sep)[0] ?? 'UNKNOWN';

      return {
        family,
        editionId: edition.editionId,
        name: edition.name,
        relativePath,
        absolutePath,
      };
    }),
  );

  return editions.sort((left, right) =>
    left.relativePath.localeCompare(right.relativePath),
  );
}

async function collectJsonFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const discovered = await Promise.all(
    entries
      .sort((left, right) => left.name.localeCompare(right.name))
      .map(async (entry) => {
        const absolutePath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
          return collectJsonFiles(absolutePath);
        }

        return entry.name.endsWith('.json') ? [absolutePath] : [];
      }),
  );

  return discovered.flat();
}

async function loadEditionFromDisk(editionId: string): Promise<CatalogEdition> {
  const editions = await listCatalogEditions();
  const entry = editions.find(
    (candidate) => normalizeEditionId(candidate.editionId) === editionId,
  );

  if (!entry) {
    throw new Error(`Catalog edition ${editionId} was not found`);
  }

  return readCatalogEditionFile(entry.absolutePath);
}

async function readCatalogEditionFile(
  absolutePath: string,
): Promise<CatalogEdition> {
  const rawContent = await readFile(absolutePath, 'utf8');
  const parsed = JSON.parse(rawContent) as unknown;

  if (!isCatalogEdition(parsed)) {
    throw new Error(`Invalid catalog edition snapshot: ${absolutePath}`);
  }

  return parsed;
}

function isCatalogEdition(value: unknown): value is CatalogEdition {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.editionId === 'string' &&
    typeof value.name === 'string' &&
    Array.isArray(value.cards)
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeEditionId(editionId: string): string {
  return editionId.trim().toUpperCase();
}

function normalizeCardId(cardId: string): string {
  return cardId.trim().toUpperCase();
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

export type {
  Card,
  CardColor,
  CardSearchQuery,
  CardType,
} from '../../shared/dist/esm/index.js';
