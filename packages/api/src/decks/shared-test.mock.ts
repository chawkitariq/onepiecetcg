export const normalizeCardId = (cardId: string) => cardId.trim().toUpperCase();

export const normalizeDeckCards = (
  cards: Array<{ cardId: string; quantity: number }>,
) => {
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
};

export const exportDeckToText = (deck: {
  leaderCardId: string;
  cards: Array<{ cardId: string; quantity: number }>;
}) =>
  [
    `1x${normalizeCardId(deck.leaderCardId)}`,
    ...normalizeDeckCards(deck.cards).map(
      (card) => `${card.quantity}x${card.cardId}`,
    ),
  ].join('\n');

export const parseDeckText = (text: string, name = 'Deck importe') => {
  const parsed = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(\d+)\s*x\s*([A-Za-z0-9-]+)$/);

      return match
        ? {
            quantity: Number(match[1]),
            cardId: normalizeCardId(match[2] ?? ''),
          }
        : null;
    });
  const [leader] = parsed;

  return {
    name,
    leaderCardId: leader?.quantity === 1 ? leader.cardId : '',
    cards: normalizeDeckCards(parsed.slice(1).filter((card) => card !== null)),
  };
};
