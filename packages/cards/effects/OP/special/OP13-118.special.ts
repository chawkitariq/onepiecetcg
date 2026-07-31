/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils.js';

/**
 * Handles Monkey.D.Luffy (118):
 * [Double Attack]
 * [On Play] If your Leader is multicolored, set up to 4 of your DON!! cards as active.
 * Then, you cannot play Character cards with a base cost of 5 or more during this turn.
 */
export const op13118SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-118-special',
  cardId: 'OP13-118',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;

    const player = engine.getPlayer(event.playerSessionId);
    const source = engine.getCard(event.sourceInstanceId);
    if (!player || !source) return;

    const leader = player.zones.leader;
    if (!leader || leader.colors.length < 2) return;

    const allCost = player.zones.cost as any[];
    const restedDon = allCost.filter((d: any) => d.rested);
    const toSet = Math.min(restedDon.length, 4);

    for (let i = 0; i < toSet; i++) {
      patchSpecialHandlerCardStatus(engine, restedDon[i], { rested: false });
    }

    if (toSet > 0) {
      engine.addLog(`[Monkey.D.Luffy 118] Set ${toSet} DON!! card(s) as active.`);
    }

    engine.addLog(
      '[Monkey.D.Luffy 118] Cannot play Character cards with base cost 5 or more during this turn.',
    );
  },
};
