import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import {
  patchSpecialHandlerCardStatus,
  patchSpecialHandlerPlayerStatus,
} from '../../special-handler-utils.js';

/**
 * OP14-020 Dracule Mihawk (Leader)
 * If your opponent's Leader has the "Slash" attribute, this leader gains +1000
 * power.
 * [Activate:Main] [Once Per Turn] You may rest 1 of your cards: If there is a
 * Character with a cost of 5 or more, set up to 3 of your DON!! cards as
 * active. Then, you cannot play character cards during this turn.
 */
export const op14020SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-020-special',
  cardId: 'OP14-020',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;

    const ownChars = engine.getCards(
      {
        player: 'self',
        zones: ['characters', 'stage'],
        filter: { cardCategory: ['Character', 'Stage'] },
      },
      event.playerSessionId,
    );
    const hasHighCost = ownChars.some((c: { cost: number }) => c.cost >= 5);
    if (!hasHighCost) return;

    engine.chooseCards(
      `${event.sourceInstanceId}:op14-020:rest-card`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Dracule Mihawk] Rest 1 of your cards (Leader, Character, or Stage) to set up to 3 DON!! as active:',
      {
        player: 'self',
        zones: ['leader', 'characters', 'stage'],
        count: { kind: 'exact', value: 1 },
      },
      undefined,
      (cards) => {
        if (cards.length < 1) return;
        const card = cards[0];
        patchSpecialHandlerCardStatus(engine, card, { rested: true });
        engine.syncPlayer(event.playerSessionId);

        const activeDon = engine.getCards(
          { player: 'self', zones: ['cost'], filter: { rested: true } },
          event.playerSessionId,
        );
        const amount = Math.min(activeDon.length, 3);
        if (amount > 0) {
          for (const don of activeDon.slice(0, amount)) {
            patchSpecialHandlerCardStatus(engine, don, { rested: false });
          }
        }

        patchSpecialHandlerPlayerStatus(engine, player, {
          cannotPlayCharacters: true,
        });

        engine.syncPlayer(event.playerSessionId);
        engine.reapplyContinuousEffects();
      },
    );
  },
};
