/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP14-034 Monkey.D.Luffy
 * [Your Turn] All of your green {Straw Hat Crew} type Characters with a base
 * cost of 4 or more gain +1000 power.
 * [Once Per Turn] If your {Straw Hat Crew} type Character would be K.O.'d by
 * your opponent's effect, you may rest 1 of your Characters instead.
 */
export const op14034SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-034-special',
  cardId: 'OP14-034',
  resolve(event, engine) {
    if (event.type === 'onPlay' || event.type === 'onDonAttached') {
      const anyEngine = engine as any;
      const { host } = anyEngine;
      const activePlayerSessionId = host.state.activePlayerSessionId;
      if (activePlayerSessionId !== event.playerSessionId) return;

      const effect: StandardEffectDefinition = {
        id: 'op14-034-straw-hat-power-up',
        text: 'All green Straw Hat Crew Characters with base cost 4+ gain +1000 power.',
        trigger: { type: 'onPlay' },
        actions: [
          {
            type: 'modifyPower',
            selector: {
              player: 'self',
              zones: ['characters'],
              filter: {
                cardCategory: ['Character'],
                color: ['Green'],
                trait: ['Straw Hat Crew'],
                baseCostMin: 4,
              },
              count: { kind: 'any' },
            },
            amount: 1000,
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
