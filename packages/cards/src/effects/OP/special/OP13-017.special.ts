/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { createOncePerTurnKey } from '../../special-handler-utils.js';

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

    const source = engine.getCard(event.sourceInstanceId);
    if (!source) return;

    const removeEvent = event as any;
    const removedCard = engine.getCard(removeEvent.targetInstanceId);
    if (!removedCard || removedCard.ownerSessionId !== event.playerSessionId)
      return;

    const isRevolutionaryArmy = removedCard.families?.some((f: string) =>
      f.includes('Revolutionary Army'),
    );
    if (!isRevolutionaryArmy) return;

    if (
      engine.hasResolvedOncePerTurnKey(
        createOncePerTurnKey(
          event.sourceInstanceId,
          'op13-017',
          engine.state.turn,
        ),
      )
    )
      return;

    engine.pauseDecision(
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

        engine.markResolvedOncePerTurnKey(
          createOncePerTurnKey(
            event.sourceInstanceId,
            'op13-017',
            engine.state.turn,
          ),
        );

        engine.addPowerModifier(
          event.sourceInstanceId,
          event.playerSessionId,
          event.sourceInstanceId,
          2000,
          'untilEndOfTurn',
        );

        engine.reapplyContinuousEffects();
        engine.addLog(
          '[Monkey.D.Dragon] Revolutionary Army character saved from removal.',
        );
      },
    );
  },
};
