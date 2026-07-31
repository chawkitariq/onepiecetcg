import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

export const eb01001CounterRuleSpecialHandler: SpecialHandlerDefinition = {
  id: 'eb01-001-counter-rule',
  cardId: 'EB01-001',
  resolve(event, engine) {
    if (event.type !== 'onTurnStart' && event.type !== 'onCharacterPlayed') {
      return;
    }

    const source = engine.getCard(event.sourceInstanceId);

    if (!source) {
      return;
    }

    const wanoChars = engine.getCards(
      {
        player: 'self',
        zones: ['characters'],
        filter: { trait: ['Land of Wano'] },
        count: { kind: 'any' },
      },
      source.ownerSessionId,
    );

    for (const char of wanoChars) {
      if (char.counter <= 0) {
        char.counter = 1000;
      }
    }
  },
};
