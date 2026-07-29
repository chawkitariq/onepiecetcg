/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';
import {
  hasResolvedOncePerTurn,
  markResolvedOncePerTurn,
} from './special-handler-utils';

/**
 * Handles Jewelry Bonney (100):
 * [Your Turn] [Once Per Turn] This effect can be activated when you play a Character
 * with a [Trigger]. Give up to 2 rested DON!! cards to 1 of your Leader or Character
 * cards.
 */
export const op13100SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-100-special',
  cardId: 'OP13-100',
  resolve(event, engine) {
    if (event.type !== 'onCharacterPlayed') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;

    const isYourTurn = host.state.turnPlayer === event.playerSessionId;
    if (!isYourTurn) return;

    if (
      hasResolvedOncePerTurn(
        anyEngine,
        event.sourceInstanceId,
        'op13-100',
        host.state.turn,
      )
    )
      return;

    const playEvent = event as any;
    const playedCard = host.getCard(playEvent.targetInstanceId);
    if (!playedCard || !playedCard.trigger) return;

    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;

    const donDeckCount = player.zones.donDeck.length;
    if (donDeckCount < 1) return;

    markResolvedOncePerTurn(
      anyEngine,
      event.sourceInstanceId,
      'op13-100',
      host.state.turn,
    );

    const attachAmount = Math.min(2, donDeckCount);

    const def: StandardEffectDefinition = {
      id: 'op13-100-attach-rested-don',
      text: 'Give up to 2 rested DON!! cards to 1 of your Leader or Character cards.',
      trigger: { type: 'onCharacterPlayed' },
      actions: [
        {
          type: 'attachDon',
          player: 'self',
          selector: {
            player: 'self',
            zones: ['leader', 'characters'],
            count: { kind: 'upTo', value: 1 },
          },
          amount: attachAmount,
          rested: true,
        },
      ],
    };

    engine.queueEffect(
      event.playerSessionId,
      event.sourceInstanceId,
      event.sourceCardId,
      def,
    );
  },
};
