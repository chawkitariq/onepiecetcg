/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils';

/**
 * OP14-033 Perona
 * [On Play] Up to 2 of your opponent's Characters with a cost of 5 or less
 * cannot be rested until the end of your opponent's next End Phase.
 * [On K.O.] You may rest 1 of your cards: Play up to 1 green Character card
 * with a cost of 5 or less from your hand.
 */
export const op14033SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-033-special',
  cardId: 'OP14-033',
  resolve(event, engine) {
    if (event.type === 'onPlay') {
      engine.chooseCards(
        `${event.sourceInstanceId}:op14-033:prevent-rest`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        event.playerSessionId,
        "[Perona] Select up to 2 opponent Characters (cost 5 or less). They cannot be rested until the end of opponent's next End Phase:",
        {
          player: 'opponent',
          zones: ['characters'],
          filter: { cardCategory: ['Character'], costMax: 5 },
          count: { kind: 'upTo', value: 2 },
        },
        undefined,
        (selected) => {
          for (const card of selected) {
            patchSpecialHandlerCardStatus(engine, card, {
              skipNextRefreshPhases: (card.skipNextRefreshPhases || 0) + 1,
            });
          }
          engine.syncPlayer(event.playerSessionId);
          engine.reapplyContinuousEffects();
        },
      );
    } else if (event.type === 'onKo') {
      engine.chooseCards(
        `${event.sourceInstanceId}:op14-033:rest-for-play`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        event.playerSessionId,
        '[Perona] Rest 1 of your cards to play 1 green Character (cost 5 or less) from your hand rested:',
        {
          player: 'self',
          zones: ['leader', 'characters', 'stage'],
          count: { kind: 'upTo', value: 1 },
        },
        undefined,
        (restedCards) => {
          if (!restedCards.length) {
            engine.reapplyContinuousEffects();
            return;
          }
          for (const card of restedCards) {
            patchSpecialHandlerCardStatus(engine, card, { rested: true });
          }

          engine.chooseCards(
            `${event.sourceInstanceId}:op14-033:play-from-hand`,
            event.playerSessionId,
            { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
            event.playerSessionId,
            '[Perona] Play up to 1 green Character (cost 5 or less) from your hand rested:',
            {
              player: 'self',
              zones: ['hand'],
              filter: {
                cardCategory: ['Character'],
                colors: ['Green'],
                costMax: 5,
              },
              count: { kind: 'upTo', value: 1 },
            },
            undefined,
            (playedCards) => {
              for (const card of playedCards) {
                engine.playCard(card, event.playerSessionId, 'characters', {
                  rested: true,
                });
              }
              engine.syncPlayer(event.playerSessionId);
              engine.reapplyContinuousEffects();
            },
          );
        },
      );
    }
  },
};
