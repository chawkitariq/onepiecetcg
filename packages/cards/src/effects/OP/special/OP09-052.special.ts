import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP09-052 "Marco"
 * [Opponent's Turn] You may trash 1 card from your hand: When this Character
 * is K.O.'d by your opponent's effect, play this Character card from your
 * trash rested.
 */
export const op09052SpecialHandler: SpecialHandlerDefinition = {
  id: 'op09-052-special',
  cardId: 'OP09-052',
  resolve(event, engine) {
    if (event.type !== 'onKo') return;

    const opponentSessionId = engine.getOpponentSessionId(
      event.playerSessionId,
    );
    const activePlayerSessionId = engine.state.activePlayerSessionId;
    if (activePlayerSessionId !== opponentSessionId) return;

    engine.chooseCards(
      `${event.sourceInstanceId}:op09-052:trash-hand`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Marco] You may trash 1 card from your hand to play Marco from trash rested:',
      {
        player: 'self',
        zones: ['hand'],
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (cards) => {
        if (cards.length === 0) {
          engine.reapplyContinuousEffects();
          return;
        }
        for (const card of cards) {
          engine.moveCard(card, event.playerSessionId, 'trash');
        }
        const marcoCard = engine.getCard(event.sourceInstanceId);
        if (marcoCard) {
          engine.moveCard(marcoCard, event.playerSessionId, 'characters', {
            rested: true,
          });
        }
        engine.reapplyContinuousEffects();
      },
    );
  },
};
