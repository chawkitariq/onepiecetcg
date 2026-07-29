/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP14-032 Humandrill
 * [Your Turn] When this Character becomes rested, rest up to 1 of your
 * opponent's Characters with a cost of 4 or less.
 */
export const op14032SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-032-special',
  cardId: 'OP14-032',
  resolve(event, engine) {
    if (event.type !== 'onDonAttached' && event.type !== 'onPlay') return;
    const anyEngine = engine as any;
    const { host } = anyEngine;
    const source = host.getCard(event.sourceInstanceId);
    if (!source || !source.rested) return;
    const activePlayerSessionId = host.state.activePlayerSessionId;
    if (activePlayerSessionId !== event.playerSessionId) return;

    const effect: StandardEffectDefinition = {
      id: 'op14-032-rest-opponent',
      text: "Rest up to 1 of your opponent's Characters with a cost of 4 or less.",
      trigger: { type: 'onDonAttached' },
      actions: [
        {
          type: 'rest',
          selector: {
            player: 'opponent',
            zones: ['characters'],
            filter: { cardCategory: ['Character'], costMax: 4 },
            count: { kind: 'upTo', value: 1 },
          },
        },
      ],
    };
    engine.queueEffect(
      event.playerSessionId,
      event.sourceInstanceId,
      event.sourceCardId,
      effect,
    );
  },
};
