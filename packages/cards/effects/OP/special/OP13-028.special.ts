import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils.js';

/**
 * Handles Shanks (028):
 * [On Play] Set all of your DON!! cards as active. Then, you cannot play cards from
 * your hand during this turn.
 */
export const op13028SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-028-special',
  cardId: 'OP13-028',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;

    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;

    for (const don of player.zones.cost) {
      patchSpecialHandlerCardStatus(engine, don, { rested: false });
    }
    engine.addLog('[Shanks 028] Set all DON!! cards as active.');

    engine.addLog('[Shanks 028] Cannot play cards from hand during this turn.');
  },
};
