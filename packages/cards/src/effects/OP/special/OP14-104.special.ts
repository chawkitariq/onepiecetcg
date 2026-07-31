import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP14-104 Gecko Moria
 * [On Play] Select up to 1 {Thriller Bark Pirates} type Character with a cost
 * of 4 or less from your trash and play it or add it to the top of your Life
 * cards face-up.
 * [Trigger] Play up to 1 Character card with a cost of 4 or less from your
 * trash.
 */
export const op14104SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-104-special',
  cardId: 'OP14-104',
  resolve(event, engine) {
    if (event.type === 'onPlay') {
      engine.chooseCards(
        `${event.sourceInstanceId}:op14-104:from-trash`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        event.playerSessionId,
        '[Gecko Moria] Select up to 1 {Thriller Bark Pirates} Character (cost 4 or less) from your trash:',
        {
          player: 'self',
          zones: ['trash'],
          filter: {
            cardCategory: ['Character'],
            trait: ['Thriller Bark Pirates'],
            costMax: 4,
          },
          count: { kind: 'upTo', value: 1 },
        },
        undefined,
        (selected) => {
          if (!selected.length) return;
          const card = selected[0];

          engine.chooseChoices(
            `${event.sourceInstanceId}:op14-104:mode`,
            event.playerSessionId,
            '[Gecko Moria] Play or add to top of Life face-up?',
            [
              { id: 'play', label: 'Play' },
              { id: 'life', label: 'Add to top of Life face-up' },
            ],
            1,
            1,
            (choiceIds) => {
              if (choiceIds.includes('play')) {
                engine.playCard(card, event.playerSessionId, 'characters');
              } else {
                engine.moveCard(card, event.playerSessionId, 'life', {
                  faceDown: false,
                });
              }
              engine.syncPlayer(event.playerSessionId);
              engine.reapplyContinuousEffects();
            },
          );
        },
      );
    } else if (event.type === 'trigger') {
      engine.chooseCards(
        `${event.sourceInstanceId}:op14-104:trigger`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        event.playerSessionId,
        '[Gecko Moria] Play up to 1 Character (cost 4 or less) from your trash:',
        {
          player: 'self',
          zones: ['trash'],
          filter: { cardCategory: ['Character'], costMax: 4 },
          count: { kind: 'upTo', value: 1 },
        },
        undefined,
        (selected) => {
          for (const card of selected) {
            engine.playCard(card, event.playerSessionId, 'characters');
          }
          engine.syncPlayer(event.playerSessionId);
          engine.reapplyContinuousEffects();
        },
      );
    }
  },
};
