import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op06103SpecialHandler: SpecialHandlerDefinition = {
  id: 'op06-103-special',
  cardId: 'OP06-103',
  resolve(event, engine) {
    if (event.type !== 'whenAttacking') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;

    const handCards = host.getCards(
      { player: 'self', zones: ['hand'] },
      event.playerSessionId,
    );
    if (handCards.length < 2) return;

    anyEngine.decisions.chooseCards(
      `${event.sourceInstanceId}:op06-103:trash-2`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Kawamatsu] Trash 2 cards from your hand:',
      { player: 'self', zones: ['hand'], count: { kind: 'exact', value: 2 } },
      undefined,
      (trashed) => {
        for (const card of trashed)
          host.moveCard(card, event.playerSessionId, 'trash');

        anyEngine.decisions.chooseCards(
          `${event.sourceInstanceId}:op06-103:choose-0-power`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          '[Kawamatsu] Choose up to 1 of your Characters with 0 power to add to Life:',
          {
            player: 'self',
            zones: ['characters'],
            filter: { cardCategory: ['Character'], powerMax: 0 },
            count: { kind: 'upTo', value: 1 },
          },
          undefined,
          (selected) => {
            for (const card of selected) {
              anyEngine.decisions.chooseChoice(
                `${event.sourceInstanceId}:op06-103:position`,
                event.playerSessionId,
                {
                  sourceInstanceId: event.sourceInstanceId,
                  storedSelections: {},
                },
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
    );
  },
};
