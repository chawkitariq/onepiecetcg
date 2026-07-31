import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { createOncePerTurnKey } from '../../special-handler-utils.js';

/**
 * OP15-058 "Enel (OP15-058)"
 * Under the rules of this game, your DON!! deck consists of 6 cards.
 * [Activate: Main] [Once Per Turn] If it is your second turn or later, add up
 * to 1 DON!! card from your DON!! deck and set it as active, and add up to 4
 * additional DON!! cards and rest them. Then, give up to 4 rested DON!! cards
 * to 1 of your Characters.
 */
export const op15058SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-058-special',
  cardId: 'OP15-058',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;

    const turn = engine.state.turn;

    if (turn < 2) return;

    if (
      engine.hasResolvedOncePerTurnKey(
        createOncePerTurnKey(event.sourceInstanceId, event.sourceCardId, turn),
      )
    )
      return;

    engine.markResolvedOncePerTurnKey(
      createOncePerTurnKey(event.sourceInstanceId, event.sourceCardId, turn),
    );

    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;

    // Add up to 1 DON!! active
    if (player.zones.donDeck.length > 0) {
      engine.addDonToCost(event.playerSessionId, 1, false);
    }

    // Add up to 4 DON!! rested
    const toAdd = Math.min(4, player.zones.donDeck.length);
    if (toAdd > 0) {
      engine.addDonToCost(event.playerSessionId, toAdd, true);
    }

    // Give up to 4 rested DON!! to 1 Character
    engine.chooseCards(
      `${event.sourceInstanceId}:op15-058:target-char`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Enel] Give up to 4 rested DON!! to 1 of your Characters:',
      {
        player: 'self',
        zones: ['characters', 'leader'],
        filter: { cardCategory: ['Character', 'Leader'] },
        count: { kind: 'exact', value: 1 },
      },
      undefined,
      (targets) => {
        const target = targets[0];
        if (!target) {
          engine.reapplyContinuousEffects();
          return;
        }

        const movedCount = engine.attachDon(
          event.playerSessionId,
          target.instanceId,
          Math.min(4, toAdd),
          { rested: true },
        );

        engine.syncPlayer(event.playerSessionId);
        engine.reapplyContinuousEffects();
      },
    );
  },
};
