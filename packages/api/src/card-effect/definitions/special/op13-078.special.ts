/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';
import {
  hasResolvedOncePerTurn,
  markResolvedOncePerTurn,
} from './special-handler-utils';

/**
 * Handles Oro Jackson:
 * [Once Per Turn] When your Character with a type including "Roger Pirates" is
 * removed from the field by your opponent's effect, add up to 1 DON!! card from
 * your DON!! deck and rest it.
 */
export const op13078SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-078-special',
  cardId: 'OP13-078',
  resolve(event, engine) {
    if ((event as any).type !== 'onCardRemovedByEffect') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;

    const removeEvent = event as any;
    const removedCard = host.getCard(removeEvent.targetInstanceId);
    if (!removedCard || removedCard.ownerSessionId !== event.playerSessionId)
      return;

    const isRogerPirates = Array.from(removedCard.families ?? []).some(
      (f: string) => f.includes('Roger Pirates'),
    );
    if (!isRogerPirates) return;

    if (
      hasResolvedOncePerTurn(
        anyEngine,
        event.sourceInstanceId,
        'op13-078',
        host.state.turn,
      )
    )
      return;

    markResolvedOncePerTurn(
      anyEngine,
      event.sourceInstanceId,
      'op13-078',
      host.state.turn,
    );

    const def: StandardEffectDefinition = {
      id: 'op13-078-add-don-rested',
      text: 'Add up to 1 DON!! card from your DON!! deck and rest it.',
      trigger: { type: 'onPlay' },
      actions: [
        {
          type: 'addDon',
          player: 'self',
          amount: 1,
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
