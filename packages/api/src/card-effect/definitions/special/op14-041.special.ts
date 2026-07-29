/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../types/effect-registry';
import {
  createOncePerTurnKey,
  hasResolvedOncePerTurn,
  markResolvedOncePerTurn,
} from './special-handler-utils';

/**
 * OP14-041 Boa Hancock
 * [Opponent's Turn] When you play a Character, draw 1 card.
 * [DON!! x1] [Once Per Turn] When one of your {Amazon Lily} or {Kuja Pirates}
 * type Characters with 5000 base power or more is K.O.'d add up to 1 card
 * from the top of your opponent's Life cards to the owner's hand.
 */
export const op14041SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-041-special',
  cardId: 'OP14-041',
  resolve(event, engine) {
    if (event.type === 'onCharacterPlayed') {
      const anyEngine = engine as any;
      const { host } = anyEngine;
      const opponentSessionId = host.getOpponentSessionId(
        event.playerSessionId,
      );
      const activePlayerSessionId = host.state.activePlayerSessionId;
      if (activePlayerSessionId !== opponentSessionId) return;

      host.drawCard(event.playerSessionId);
      host.syncPlayer(event.playerSessionId);
      engine.reapplyContinuousEffects();
    } else if (event.type === 'onKo') {
      const anyEngine = engine as any;
      const { host, decisions } = anyEngine;
      const source = host.getCard(event.sourceInstanceId);
      if (!source || source.attachedDon < 1) return;
      const turn = host.state.turn;
      if (
        hasResolvedOncePerTurn(
          anyEngine,
          event.sourceInstanceId,
          'op14-041',
          turn,
        )
      )
        return;

      decisions.chooseCards(
        `${event.sourceInstanceId}:op14-041:life-to-hand`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        event.playerSessionId,
        "[Boa Hancock] Add up to 1 card from the top of opponent's Life cards to owner's hand:",
        {
          player: 'opponent',
          zones: ['life'],
          count: { kind: 'exact', value: 1 },
        },
        undefined,
        (selected) => {
          if (!selected.length) return;
          markResolvedOncePerTurn(
            anyEngine,
            event.sourceInstanceId,
            'op14-041',
            turn,
          );
          const target = selected[0];
          host.moveCard(target, target.ownerSessionId, 'hand');
          host.syncPlayer(event.playerSessionId);
          host.syncPlayer(target.ownerSessionId);
          engine.reapplyContinuousEffects();
        },
      );
    }
  },
};
