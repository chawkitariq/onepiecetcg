import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils.js';

export const op06083SpecialHandler: SpecialHandlerDefinition = {
  id: 'op06-083-special',
  cardId: 'OP06-083',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const source = engine.getCard(event.sourceInstanceId);
    if (!source) return;

    engine.chooseCards(
      `${event.sourceInstanceId}:op06-083:ko-thriller`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Oars] Choose 1 of your Thriller Bark Pirates Characters to K.O.:',
      {
        player: 'self',
        zones: ['characters'],
        filter: {
          cardCategory: ['Character'],
          trait: ['Thriller Bark Pirates'],
        },
        count: { kind: 'exact', value: 1 },
      },
      undefined,
      (cards) => {
        for (const card of cards) {
          engine.moveCard(card, event.playerSessionId, 'trash');
        }
        patchSpecialHandlerCardStatus(engine, source, {
          effectNegated: false,
          cannotAttack: false,
        });
        engine.syncPlayer(source.ownerSessionId);
        engine.reapplyContinuousEffects();
      },
    );
  },
};
