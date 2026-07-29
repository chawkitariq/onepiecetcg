/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP14-061 Vergo
 * [Once Per Turn] If your {Donquixote Pirates} type Character would be removed
 * from the field by your opponent's effect, you may return 1 DON!! card from
 * your field to your DON!! deck instead.
 * [When Attacking] DON!! 1: Give up to 1 of your opponent's Characters 2000
 * power during this turn.
 */
export const op14061SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-061-special',
  cardId: 'OP14-061',
  resolve(event, engine) {
    if (event.type === 'whenAttacking') {
      const anyEngine = engine as any;
      const { host } = anyEngine;
      const source = host.getCard(event.sourceInstanceId);
      if (!source || source.attachedDon < 1) return;

      const effect: StandardEffectDefinition = {
        id: 'op14-061-when-attacking-power-down',
        text: "Give up to 1 of your opponent's Characters 2000 power during this turn.",
        trigger: { type: 'whenAttacking' },
        actions: [
          {
            type: 'modifyPower',
            selector: {
              player: 'opponent',
              zones: ['characters'],
              count: { kind: 'upTo', value: 1 },
            },
            amount: -2000,
            duration: { type: 'untilEndOfTurn' },
          },
        ],
      };
      engine.queueEffect(
        event.playerSessionId,
        event.sourceInstanceId,
        event.sourceCardId,
        effect,
      );
    }
  },
};
