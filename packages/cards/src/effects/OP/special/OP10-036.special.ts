import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { createOncePerTurnKey } from '../../special-handler-utils.js';

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
    const source = engine.getCard(event.sourceInstanceId);
    if (!source) return;
    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;
    if ((engine.state as any).currentPlayerSessionId !== event.playerSessionId)
      return;
    const turn = engine.state.turn;
    if (
      engine.hasResolvedOncePerTurnKey(
        createOncePerTurnKey(event.sourceInstanceId, 'OP10-036', turn),
      )
    )
      return;
    engine.markResolvedOncePerTurnKey(
      createOncePerTurnKey(event.sourceInstanceId, 'OP10-036', turn),
    );
    engine.addDonToCost(event.playerSessionId, 1, false);
    engine.syncPlayer(event.playerSessionId);
    engine.reapplyContinuousEffects();
  },
};
