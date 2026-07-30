import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';
import {
  createOncePerTurnKey,
  hasResolvedOncePerTurn,
  markResolvedOncePerTurn,
} from '../../special-handler-utils';

/**
 * OP15-002 "Lucy"
 * [When Attacking]/[On Your Opponent's Attack] Trash any number of Event or
 * Stage cards from your hand. This Leader gains +1000 power during this battle
 * for every card trashed.
 * [Activate: Main] [Once Per Turn] If you have activated an Event with a base
 * cost of 3 or more during this turn, draw 1 card.
 */
export const op15002SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-002-special',
  cardId: 'OP15-002',
  resolve(event, engine) {
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const decisions = anyEngine.decisions;

    if (event.type === 'whenAttacking' || event.type === 'onAttacked') {
      decisions.chooseCards(
        `${event.sourceInstanceId}:op15-002:trash-events-stage`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        event.playerSessionId,
        '[Lucy] Trash any number of Event or Stage cards from hand (+1000 power each during this battle):',
        {
          player: 'self',
          zones: ['hand'],
          filter: { cardCategory: ['Event', 'Stage'] },
          count: { kind: 'any' },
        },
        undefined,
        (cards) => {
          const count = cards.length;
          for (const card of cards) {
            host.moveCard(card, event.playerSessionId, 'trash');
          }
          if (count > 0) {
            anyEngine.modifiers.addPowerModifier(
              event.sourceInstanceId,
              event.playerSessionId,
              event.sourceInstanceId,
              count * 1000,
              'untilEndOfBattle',
            );
          }
          host.syncPlayer(event.playerSessionId);
          engine.reapplyContinuousEffects();
        },
      );
      return;
    }

    if (event.type !== 'activateMain') return;

    const turn = host.state.turn;
    if (
      hasResolvedOncePerTurn(
        anyEngine,
        event.sourceInstanceId,
        event.sourceCardId,
        turn,
      )
    )
      return;

    markResolvedOncePerTurn(
      anyEngine,
      event.sourceInstanceId,
      event.sourceCardId,
      turn,
    );

    const definition: StandardEffectDefinition = {
      id: 'lucy-002-activate-main-draw',
      text: '[Activate: Main] [Once Per Turn] If you have activated an Event with a base cost of 3 or more during this turn, draw 1 card.',
      trigger: { type: 'activateMain', optional: true },
      actions: [{ type: 'draw', player: 'self', amount: 1 }],
    };

    engine.queueEffect(
      event.playerSessionId,
      event.sourceInstanceId,
      event.sourceCardId,
      definition,
    );
  },
};
