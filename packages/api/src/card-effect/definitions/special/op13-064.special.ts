/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * Handles Gol.D.Roger (064):
 * 1. Your Leader and all of your Characters that do not have a type including
 *    "Roger Pirates" have their effects negated.
 * 2. [On Play] DON!! 3: Your Leader gains +2000 power until the end of your opponent's
 *    next End Phase. Then, give all of your opponent's Characters -2000 power until the
 *    end of your opponent's next End Phase.
 */
export const op13064SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-064-special',
  cardId: 'OP13-064',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    const source = host.getCard(event.sourceInstanceId);
    if (!player || !source) return;

    host.addLog(
      '[Gol.D.Roger 064] Non-Roger Pirates cards have their effects negated (continuous).',
    );

    const totalDonOnField =
      player.zones.cost.length +
      (player.zones.leader.attachedDon || 0) +
      (player.zones.characters as any[]).reduce(
        (sum: number, c: any) => sum + (Number(c.attachedDon) || 0),
        0,
      );

    if (totalDonOnField < 3) return;

    anyEngine.decisions.pause(
      {
        id: `${event.sourceInstanceId}:op13-064:confirm-don3`,
        effectId: 'op13-064-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message:
            "[Gol.D.Roger 064] Pay DON!! 3 effect? Leader +2000, all opponent Characters -2000 until end of opponent's next End Phase.",
          optional: true,
        },
      },
      (response: { confirmed?: boolean }) => {
        if (!response.confirmed) return;

        const leaderDef: StandardEffectDefinition = {
          id: 'op13-064-leader-power',
          text: 'Leader gains +2000 power.',
          trigger: { type: 'onPlay' },
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
          leaderDef,
        );

        const opponentId = host.getOpponentSessionId(event.playerSessionId);
        if (!opponentId) return;

        const opponent = host.getPlayer(opponentId);
        if (!opponent || opponent.zones.characters.length === 0) return;

        for (const char of opponent.zones.characters) {
          anyEngine.modifiers.addPowerModifier(
            event.sourceInstanceId,
            event.playerSessionId,
            char.instanceId,
            -2000,
            'untilEndOfOpponentNextTurn',
          );
        }

        engine.reapplyContinuousEffects();
        host.addLog(
          "[Gol.D.Roger 064] All opponent Characters -2000 power until end of opponent's next End Phase.",
        );
      },
    );
  },
};
