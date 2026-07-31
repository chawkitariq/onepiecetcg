import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils.js';

/**
 * OP14-111 Perona
 * [On Play]/[On K.O.] Up to 1 of your opponent's Characters with a cost of 6
 * or less cannot attack until the end of your opponent's next End Phase.
 * [Trigger] Play up to 1 {Thriller Bark Pirates} type Character card with a
 * cost of 4 or less from your trash rested.
 */
export const op14111SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-111-special',
  cardId: 'OP14-111',
  resolve(event, engine) {
    if (event.type === 'onPlay' || event.type === 'onKo') {
      engine.chooseCards(
        `${event.sourceInstanceId}:op14-111:prevent-attack`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        event.playerSessionId,
        "[Perona] Choose up to 1 opponent Character (cost 6 or less). They cannot attack until end of opponent's next End Phase:",
        {
          player: 'opponent',
          zones: ['characters'],
          filter: { cardCategory: ['Character'], costMax: 6 },
          count: { kind: 'upTo', value: 1 },
        },
        undefined,
        (selected) => {
          const turn = engine.state.turn;
          for (const card of selected) {
            patchSpecialHandlerCardStatus(engine, card, {
              cannotAttackUntilTurn: turn + 2,
            });
          }
          engine.syncPlayer(event.playerSessionId);
          engine.reapplyContinuousEffects();
        },
      );
    } else if (event.type === 'trigger') {
      engine.chooseCards(
        `${event.sourceInstanceId}:op14-111:trigger`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        event.playerSessionId,
        '[Perona] Play up to 1 {Thriller Bark Pirates} Character (cost 4 or less) from your trash rested:',
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
          for (const card of selected) {
            engine.playCard(card, event.playerSessionId, 'characters');
            patchSpecialHandlerCardStatus(engine, card, { rested: true });
          }
          engine.syncPlayer(event.playerSessionId);
          engine.reapplyContinuousEffects();
        },
      );
    }
  },
};
