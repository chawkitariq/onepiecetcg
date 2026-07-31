/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

/**
 * OP10-118
 * [When Attacking] Place 3 cards from your trash at the bottom of your
 * deck. If your opponent has 5 or more cards in their hand, your
 * opponent trashes 1 card from their hand.
 */
export const op10118SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-118-special',
  cardId: 'OP10-118',
  resolve(event, engine) {
    if (event.type !== 'whenAttacking') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const decisions = anyEngine.decisions;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;
    decisions.chooseCards(
      `${event.sourceInstanceId}:op10-118:trash-to-deck`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      'Place 3 cards from your trash at the bottom of your deck:',
      {
        player: 'self',
        zones: ['trash'],
        count: { kind: 'exact', value: 3 },
      },
      undefined,
      (trashCards) => {
        if (trashCards.length < 3) {
          engine.reapplyContinuousEffects();
          return;
        }
        for (const card of trashCards) {
          host.moveCard(card, event.playerSessionId, 'deck', {
            toBottom: true,
          });
        }
        const opponentSessionId = host.getOpponentSessionId(
          event.playerSessionId,
        );
        if (!opponentSessionId) {
          engine.reapplyContinuousEffects();
          return;
        }
        const opponent = host.getPlayer(opponentSessionId);
        if (!opponent) {
          engine.reapplyContinuousEffects();
          return;
        }
        if (opponent.zones.hand.length >= 5) {
          decisions.chooseCards(
            `${event.sourceInstanceId}:op10-118:opponent-trash`,
            event.playerSessionId,
            { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
            opponentSessionId,
            'Your opponent forces you to trash 1 card from your hand.',
            {
              player: 'self',
              zones: ['hand'],
              count: { kind: 'exact', value: 1 },
            },
            undefined,
            (discarded) => {
              for (const card of discarded) {
                host.moveCard(card, opponentSessionId, 'trash');
              }
              host.syncPlayer(event.playerSessionId);
              host.syncPlayer(opponentSessionId);
              engine.reapplyContinuousEffects();
            },
          );
        } else {
          host.syncPlayer(event.playerSessionId);
          engine.reapplyContinuousEffects();
        }
      },
    );
  },
};
