/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import {
  hasResolvedOncePerTurn,
  markResolvedOncePerTurn,
} from '../../special-handler-utils.js';

/**
 * OP10-087
 * [Once Per Turn] When one of your Characters is K.O.'d, you may play
 * 1 {Wano} type Character card from your hand.
 *
 * NOTE: This handler fires on `onKo`. The effect engine broadcasts
 * `onKo` to all in-play cards for standard triggered effects but NOT
 * for special handlers. For this handler to fire when any character
 * is KO'd, the duel room or engine must be extended to route broadcast
 * events to relevant special handlers.
 */
export const op10087SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-087-special',
  cardId: 'OP10-087',
  resolve(event, engine) {
    if (event.type !== 'onKo') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const decisions = anyEngine.decisions;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;
    const turn = host.state.turn;
    if (
      hasResolvedOncePerTurn(
        anyEngine,
        event.sourceInstanceId,
        'OP10-087',
        turn,
      )
    )
      return;
    markResolvedOncePerTurn(
      anyEngine,
      event.sourceInstanceId,
      'OP10-087',
      turn,
    );
    decisions.chooseCards(
      `${event.sourceInstanceId}:op10-087:play-wano`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      'Play 1 Wano Character from your hand:',
      {
        player: 'self',
        zones: ['hand'],
        filter: { cardCategory: ['Character'], trait: ['Wano'] },
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
};
