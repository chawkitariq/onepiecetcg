import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op06106SpecialHandler: SpecialHandlerDefinition = {
  id: 'op06-106-special',
  cardId: 'OP06-106',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;

    anyEngine.decisions.chooseCards(
      `${event.sourceInstanceId}:op06-106:take-life`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Kouzuki Hiyori] Add 1 card from the top or bottom of your Life cards to your hand:',
      {
        player: 'self',
        zones: ['life'],
        filter: { zonePosition: 'topOrBottom' },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (taken) => {
        for (const card of taken) {
          host.moveCard(card, event.playerSessionId, 'hand');
        }

        anyEngine.decisions.chooseCards(
          `${event.sourceInstanceId}:op06-106:put-life`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          '[Kouzuki Hiyori] Choose up to 1 card from your hand to add to the top of your Life cards:',
          {
            player: 'self',
            zones: ['hand'],
            count: { kind: 'upTo', value: 1 },
          },
          undefined,
          (added) => {
            for (const card of added) {
              host.moveCard(card, event.playerSessionId, 'life', {
                toBottom: false,
                faceDown: true,
              });
            }
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
