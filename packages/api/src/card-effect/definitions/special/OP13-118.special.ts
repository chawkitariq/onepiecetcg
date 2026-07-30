/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

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

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    const source = host.getCard(event.sourceInstanceId);
    if (!player || !source) return;

    const leader = player.zones.leader;
    if (!leader || leader.colors.length < 2) return;

    const allCost = player.zones.cost as any[];
    const restedDon = allCost.filter((d: any) => d.rested);
    const toSet = Math.min(restedDon.length, 4);

    for (let i = 0; i < toSet; i++) {
      restedDon[i].rested = false;
    }

    if (toSet > 0) {
      host.addLog(`[Monkey.D.Luffy 118] Set ${toSet} DON!! card(s) as active.`);
    }

    host.addLog(
      '[Monkey.D.Luffy 118] Cannot play Character cards with base cost 5 or more during this turn.',
    );
  },
};
