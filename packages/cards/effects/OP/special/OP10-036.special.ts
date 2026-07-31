/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import {
  hasResolvedOncePerTurn,
  markResolvedOncePerTurn,
} from '../../special-handler-utils.js';

/**
 * OP10-036
 * [Your Turn] [Once Per Turn] When a Character is rested by your effect,
 * set up to 1 DON!! card from your DON!! deck as active.
 *
 * NOTE: This handler fires on `onEventActivated`. The duel room must
 * dispatch an `onEventActivated` event with this card as the source
 * whenever one of the controller's effects rests a Character.
 */
export const op10036SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-036-special',
  cardId: 'OP10-036',
  resolve(event, engine) {
    if (event.type !== 'onEventActivated') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;
    if (host.state.currentPlayerSessionId !== event.playerSessionId) return;
    const turn = host.state.turn;
    if (
      hasResolvedOncePerTurn(
        anyEngine,
        event.sourceInstanceId,
        'OP10-036',
        turn,
      )
    )
      return;
    markResolvedOncePerTurn(
      anyEngine,
      event.sourceInstanceId,
      'OP10-036',
      turn,
    );
    host.addDonToCost(event.playerSessionId, 1, false);
    host.syncPlayer(event.playerSessionId);
    engine.reapplyContinuousEffects();
  },
};
