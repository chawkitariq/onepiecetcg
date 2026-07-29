import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op06107SpecialHandler: SpecialHandlerDefinition = {
  id: 'op06-107-special',
  cardId: 'OP06-107',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;

    anyEngine.decisions.chooseCards(
      `${event.sourceInstanceId}:op06-107:choose-char`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Kouzuki Momonosuke] Choose up to 1 "Land of Wano" Character other than [Kouzuki Momonosuke] to add to Life:',
      {
        player: 'self',
        zones: ['characters'],
        filter: {
          cardCategory: ['Character'],
          trait: ['Land of Wano'],
          excludeName: ['Kouzuki Momonosuke'],
        },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (selected) => {
        for (const card of selected) {
          anyEngine.decisions.chooseChoice(
            `${event.sourceInstanceId}:op06-107:position`,
            event.playerSessionId,
            { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
            event.playerSessionId,
            'Place at top or bottom of Life cards?',
            [
              { id: 'top', label: 'Top' },
              { id: 'bottom', label: 'Bottom' },
            ],
            1,
            1,
            (pos) => {
              host.moveCard(card, event.playerSessionId, 'life', {
                toBottom: pos[0] === 'bottom',
                faceDown: false,
              });
            },
          );
        }
        engine.reapplyContinuousEffects();
      },
    );
  },
};
