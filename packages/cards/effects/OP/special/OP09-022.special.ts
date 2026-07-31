import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { createOncePerTurnKey } from '../../special-handler-utils.js';

/**
 * OP09-022 "Lim (Parallel)"
 * Your Character cards are played rested.
 * [Activate: Main] [Once Per Turn] You may rest 3 of your DON!! cards:
 * Add up to 1 DON!! card from your DON!! deck and rest it, and play up to 1
 * "ODYSSEY" type Character card with a cost of 5 or less from your hand.
 *
 * Note: The continuous "Your Character cards are played rested" effect needs
 * to be implemented as a continuous effect in op09.effects.ts — the special
 * handler cannot intercept other cards' play events.
 */
export const op09022SpecialHandler: SpecialHandlerDefinition = {
  id: 'op09-022-special',
  cardId: 'OP09-022',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const player = engine.getPlayer(event.playerSessionId);
    const source = engine.getCard(event.sourceInstanceId);
    if (!player || !source) return;

    const turn = engine.state.turn;
    if (
      engine.hasResolvedOncePerTurnKey(
        createOncePerTurnKey(event.sourceInstanceId, 'OP09-022', turn),
      )
    )
      return;

    const activeDon = engine.getCards(
      { player: 'self', zones: ['cost'], filter: { rested: false } },
      event.playerSessionId,
    );
    if (activeDon.length < 3) return;

    engine.chooseCards(
      `${event.sourceInstanceId}:op09-022:rest-don`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Lim] Rest 3 of your active DON!! cards:',
      {
        player: 'self',
        zones: ['cost'],
        filter: { rested: false },
        count: { kind: 'exact', value: 3 },
      },
      undefined,
      (selectedDon) => {
        for (const don of selectedDon) {
          engine.patchCardStatus(don.instanceId, { rested: true });
        }
        engine.markResolvedOncePerTurnKey(
          createOncePerTurnKey(event.sourceInstanceId, 'OP09-022', turn),
        );

        engine.addDonToCost(event.playerSessionId, 1, true);

        engine.chooseCards(
          `${event.sourceInstanceId}:op09-022:play-odyssey`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          '[Lim] Play up to 1 "ODYSSEY" type Character with cost 5 or less from your hand:',
          {
            player: 'self',
            zones: ['hand'],
            filter: {
              cardCategory: ['Character'],
              trait: ['ODYSSEY'],
              costMax: 5,
            },
            count: { kind: 'upTo', value: 1 },
          },
          undefined,
          (cards) => {
            for (const card of cards) {
              engine.playCard(card, event.playerSessionId, 'characters');
            }
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
