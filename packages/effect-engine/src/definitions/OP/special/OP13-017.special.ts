/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';
import {
  hasResolvedOncePerTurn,
  markResolvedOncePerTurn,
} from '../../special-handler-utils';

/**
 * Handles Monkey.D.Dragon:
 * [Once Per Turn] If your "Revolutionary Army" type Character would be removed from
 * the field by your opponent's effect, you may give this Character 2000 power during
 * this turn instead.
 */
export const op13017SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-017-special',
  cardId: 'OP13-017',
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

    const isRevolutionaryArmy = removedCard.families?.some((f: string) =>
      f.includes('Revolutionary Army'),
    );
    if (!isRevolutionaryArmy) return;

    if (
      hasResolvedOncePerTurn(
        anyEngine,
        event.sourceInstanceId,
        'op13-017',
        host.state.turn,
      )
    )
      return;

    anyEngine.decisions.pause(
      {
        id: `${event.sourceInstanceId}:op13-017:confirm`,
        effectId: 'op13-017-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message:
            '[Monkey.D.Dragon] Give this Character +2000 power instead of being removed?',
          optional: true,
        },
      },
      (response: { confirmed?: boolean }) => {
        if (!response.confirmed) return;

        markResolvedOncePerTurn(
          anyEngine,
          event.sourceInstanceId,
          'op13-017',
          host.state.turn,
        );

        anyEngine.modifiers.addPowerModifier(
          event.sourceInstanceId,
          event.playerSessionId,
          event.sourceInstanceId,
          2000,
          'untilEndOfTurn',
        );

        engine.reapplyContinuousEffects();
        host.addLog(
          '[Monkey.D.Dragon] Revolutionary Army character saved from removal.',
        );
      },
    );
  },
};
