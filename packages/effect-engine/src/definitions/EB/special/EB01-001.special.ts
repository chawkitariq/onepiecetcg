import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

export const eb01001CounterRuleSpecialHandler: SpecialHandlerDefinition = {
  id: 'eb01-001-counter-rule',
  cardId: 'EB01-001',
  resolve(event, engine) {
    if (event.type !== 'onTurnStart' && event.type !== 'onCharacterPlayed') {
      return;
    }

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);

    if (!source) {
      return;
    }

    const wanoChars = host.getCards(
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
