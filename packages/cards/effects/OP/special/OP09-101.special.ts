import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP09-101 "Kuzan"
 * [On Play] Place 1 of your opponent's Characters with a cost of 3 or less at
 * the top or bottom of your opponent's Life cards face-up: Your opponent
 * trashes 1 card from their hand.
 */
export const op09101SpecialHandler: SpecialHandlerDefinition = {
  id: 'op09-101-special',
  cardId: 'OP09-101',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;

    engine.chooseCards(
      `${event.sourceInstanceId}:op09-101:place-in-life`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      "[Kuzan] Place 1 of your opponent's Characters (cost 3 or less) at the top or bottom of your opponent's Life:",
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'], costMax: 3 },
        count: { kind: 'exact', value: 1 },
      },
      undefined,
      (cards) => {
        const target = cards[0];
        if (!target) {
          engine.reapplyContinuousEffects();
          return;
        }

        engine.chooseChoices(
          `${event.sourceInstanceId}:op09-101:top-or-bottom`,
          event.playerSessionId,
          '[Kuzan] Place at top or bottom of Life?',
          [
            { id: 'top', label: 'Top of Life' },
            { id: 'bottom', label: 'Bottom of Life' },
          ],
          1,
          1,
          (choiceIds) => {
            const toBottom = choiceIds.includes('bottom');
            engine.moveCard(target, target.ownerSessionId, 'life', {
              faceDown: false,
              toBottom,
            });

            const opponentSessionId = engine.getOpponentSessionId(
              event.playerSessionId,
            );
            if (opponentSessionId) {
              engine.chooseCards(
                `${event.sourceInstanceId}:op09-101:opponent-trash`,
                event.playerSessionId,
                {
                  sourceInstanceId: event.sourceInstanceId,
                  storedSelections: {},
                },
                opponentSessionId,
                '[Kuzan] Trash 1 card from your hand.',
                {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
                undefined,
                (trashed) => {
                  for (const card of trashed) {
                    engine.moveCard(card, opponentSessionId, 'trash');
                  }
                  engine.syncPlayer(event.playerSessionId);
                  if (opponentSessionId) {
                    engine.syncPlayer(opponentSessionId);
                  }
                  engine.reapplyContinuousEffects();
                },
              );
            } else {
              engine.reapplyContinuousEffects();
            }
          },
        );
      },
    );
  },
};
