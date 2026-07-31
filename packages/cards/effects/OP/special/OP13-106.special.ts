/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * Handles Conney:
 * 1. [Opponent's Turn] When a [Trigger] activates, this Character gains [Blocker]
 *    during this turn.
 * 2. [Trigger] Play this card.
 */
export const op13106SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-106-special',
  cardId: 'OP13-106',
  resolve(event, engine) {
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;

    if (event.type === 'trigger') {
      const def: StandardEffectDefinition = {
        id: 'op13-106-trigger-play',
        text: '[Trigger] Play this card.',
        trigger: { type: 'trigger' },
        actions: [
          {
            type: 'play',
            selector: {
              player: 'self',
              zones: ['hand', 'trash'],
              filter: { cardCategory: ['Character'] },
              count: { kind: 'exact', value: 1 },
            },
            destination: 'characters',
          },
        ],
      };

      engine.queueEffect(
        event.playerSessionId,
        event.sourceInstanceId,
        event.sourceCardId,
        def,
      );
      return;
    }

    if (event.type === 'onEventActivated') {
      const isOpponentTurn = host.state.turnPlayer !== event.playerSessionId;
      if (!isOpponentTurn) return;

      const triggeredEvent = event as any;
      if (triggeredEvent.triggerType !== 'trigger') return;

      host.addLog(
        "[Conney] Trigger activated on opponent's turn — gains [Blocker] this turn.",
      );

      if (source.zones !== 'characters' || !source) return;

      anyEngine.modifiers.addKeywordModifier(
        event.sourceInstanceId,
        event.playerSessionId,
        source.instanceId,
        'cannotBlock',
        'untilEndOfTurn',
      );
      engine.reapplyContinuousEffects();
    }
  },
};
