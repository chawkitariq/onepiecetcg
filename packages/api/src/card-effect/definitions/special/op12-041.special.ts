/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP12-041
 * [On K.O.] If you have 3 or less cards in hand, draw up to 3 cards.
 * Then trash 2 from hand.
 */
export const op12041SpecialHandler: SpecialHandlerDefinition = {
  id: 'op12-041-special',
  cardId: 'OP12-041',
  resolve(event, engine) {
    if (event.type !== 'onKo') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;

    const handSize = player.zones.hand.length;
    if (handSize > 3) return;

    const drawAmount = Math.min(3 - handSize, 3, player.zones.deck.length);
    if (drawAmount <= 0) return;

    const definition: StandardEffectDefinition = {
      id: 'op12-041-on-ko',
      text: '[On K.O.] If you have 3 or less cards in hand, draw up to 3 cards. Then trash 2 from hand.',
      trigger: { type: 'onKo' },
      actions: [
        {
          type: 'draw',
          player: 'self',
          amount: drawAmount,
        },
        {
          type: 'trashFromHand',
          selector: {
            player: 'self',
            zones: ['hand'],
            count: { kind: 'exact', value: 2 },
          },
        },
      ],
    };

    engine.queueEffect(
      event.playerSessionId,
      event.sourceInstanceId,
      event.sourceCardId,
      definition,
    );
  },
};
