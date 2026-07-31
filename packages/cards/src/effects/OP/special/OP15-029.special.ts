import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP15-029 "Bartholomew Kuma (OP15-029)"
 * [On Play] Up to 1 of your opponent's Characters with a cost of 5 or less
 * cannot be rested until the end of your opponent's next End Phase.
 */
export const op15029SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-029-special',
  cardId: 'OP15-029',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;

    engine.chooseCards(
      `${event.sourceInstanceId}:op15-029:target`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      "[Bartholomew Kuma] Up to 1 opponent Character (cost 5 or less) cannot be rested until end of opponent's next End Phase:",
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'], costMax: 5 },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (cards) => {
        // The "cannot be rested" restriction persists until the end of the
        // opponent's next End Phase.  We record the target turn so the duel
        // room can enforce the restriction when rest effects are evaluated.
        // Until the turn-end cleanup is triggered, the modifier engine
        // prevents the target from being rested via declare/effect actions.
        for (const card of cards) {
          card.cannotBeRestedUntilTurn =
            engine.state.turn + (engine.state.turn % 2 === 0 ? 2 : 1);
        }
        const opponentId = engine.getOpponentSessionId(event.playerSessionId);
        engine.syncPlayer(event.playerSessionId);
        if (opponentId) engine.syncPlayer(opponentId);
        engine.reapplyContinuousEffects();
      },
    );
  },
};
