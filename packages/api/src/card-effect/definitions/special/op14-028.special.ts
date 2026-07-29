/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP14-028 Johnny
 * [Your Turn] When this Character becomes rested, K.O. up to 1 of your
 * opponent's rested Characters with a cost of 2 or less.
 */
export const op14028SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-028-special',
  cardId: 'OP14-028',
  resolve(event, engine) {
    if (event.type !== 'onDonAttached' && event.type !== 'onPlay') return;
    const anyEngine = engine as any;
    const { host } = anyEngine;
    const source = host.getCard(event.sourceInstanceId);
    if (!source || !source.rested) return;
    const activePlayerSessionId = host.state.activePlayerSessionId;
    if (activePlayerSessionId !== event.playerSessionId) return;

    const effect: StandardEffectDefinition = {
      id: 'op14-028-ko-rested',
      text: "K.O. up to 1 of your opponent's rested Characters with a cost of 2 or less.",
      trigger: { type: 'onDonAttached' },
      actions: [
        {
          type: 'ko',
          selector: {
            player: 'opponent',
            zones: ['characters'],
            filter: { cardCategory: ['Character'], costMax: 2, rested: true },
            count: { kind: 'upTo', value: 1 },
          },
          reason: 'effect',
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
