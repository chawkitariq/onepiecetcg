/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../types/effect-registry';
import {
  hasResolvedOncePerTurn,
  markResolvedOncePerTurn,
} from './special-handler-utils';

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
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const decisions = anyEngine.decisions;
    const player = host.getPlayer(event.playerSessionId);
    const source = host.getCard(event.sourceInstanceId);
    if (!player || !source) return;

    const turn = host.state.turn;
    if (
      hasResolvedOncePerTurn(
        anyEngine,
        event.sourceInstanceId,
        'OP09-022',
        turn,
      )
    )
      return;

    const activeDon = host.getCards(
      { player: 'self', zones: ['cost'], filter: { rested: false } },
      event.playerSessionId,
    );
    if (activeDon.length < 3) return;

    decisions.chooseCards(
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
          host.restCard(don);
        }
        markResolvedOncePerTurn(
          anyEngine,
          event.sourceInstanceId,
          'OP09-022',
          turn,
        );

        host.addDonToCost(event.playerSessionId, 1, true);

        decisions.chooseCards(
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
              host.playCard(card, event.playerSessionId, 'characters');
            }
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
