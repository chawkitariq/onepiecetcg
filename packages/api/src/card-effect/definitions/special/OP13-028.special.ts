/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

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

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;

    for (const don of player.zones.cost) {
      don.rested = false;
    }
    host.addLog('[Shanks 028] Set all DON!! cards as active.');

    host.addLog('[Shanks 028] Cannot play cards from hand during this turn.');
  },
};
