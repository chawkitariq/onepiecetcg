/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

/**
 * Handles Gol.D.Roger (003):
 * 1. If you have any DON!! cards on your field, 1 DON!! card placed during your DON!! Phase
 *    is given to your Leader.
 * 2. If you have 9 or less DON!! cards on your field, give this Leader 2000 power.
 *
 * Effect 1 is a rules-level modification to DON!! phase placement — the handler logs
 * the intent. Effect 2 applies a continuous power boost when the condition is met.
 */
export const op13003SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-003-special',
  cardId: 'OP13-003',
  resolve(event, engine) {
    if (event.type !== 'onPlay' && event.type !== 'onTurnStart') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    const source = host.getCard(event.sourceInstanceId);
    if (!player || !source) return;

    const donOnFieldCount =
      player.zones.cost.length +
      (player.zones.leader.attachedDon || 0) +
      (player.zones.characters as any[]).reduce(
        (sum: number, c: any) => sum + (Number(c.attachedDon) || 0),
        0,
      );

    if (event.type === 'onPlay') {
      host.addLog(
        '[Gol.D.Roger 003] If you have any DON!! on field, first DON!! placed this turn goes to Leader.',
      );
    }

    if (donOnFieldCount <= 9) {
      const def: StandardEffectDefinition = {
        id: 'op13-003-power-if-9-or-less-don',
        text: 'If you have 9 or less DON!! cards on your field, give this Leader 2000 power.',
        trigger: { type: event.type },
        actions: [
          {
            type: 'modifyPower',
            selector: {
              player: 'self',
              zones: ['leader'],
              count: { kind: 'exact', value: 1 },
            },
            amount: 2000,
            duration: { type: 'untilEndOfTurn' },
          },
        ],
      };

      engine.queueEffect(
        event.playerSessionId,
        event.sourceInstanceId,
        event.sourceCardId,
        def,
      );
    }
  },
};
