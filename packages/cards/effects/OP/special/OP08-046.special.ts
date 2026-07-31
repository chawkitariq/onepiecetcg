import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { createOncePerTurnKey } from '../../special-handler-utils.js';

export const op08046SpecialHandler: SpecialHandlerDefinition = {
  id: 'op08-046-special',
  cardId: 'OP08-046',
  resolve(event, engine) {
    if (event.type !== 'onCardRemovedByEffect') return;
    const source = engine.getCard(event.sourceInstanceId);
    if (!source) return;
    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;
    const isYourTurn = (engine.state as any).turnPlayer === event.playerSessionId;
    if (!isYourTurn) return;
    const opponentHand = engine.getCards(
      { player: 'opponent', zones: ['hand'] },
      event.playerSessionId,
    );
    if (opponentHand.length < 5) return;
    if (
      engine.hasResolvedOncePerTurnKey(
        createOncePerTurnKey(
          event.sourceInstanceId,
          'op08-046',
          engine.state.turn,
        ),
      )
    ) {
      return;
    }
    engine.markResolvedOncePerTurnKey(
      createOncePerTurnKey(
        event.sourceInstanceId,
        'op08-046',
        engine.state.turn,
      ),
    );
    engine.chooseCards(
      `${event.sourceInstanceId}:op08-046:bottom-card`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      engine.getOpponentSessionId(event.playerSessionId),
      '[Shakuyaku] Place 1 card from your hand at the bottom of your deck:',
      {
        player: 'opponent',
        zones: ['hand'],
        count: { kind: 'exact', value: 1 },
      },
      undefined,
      (cards) => {
        for (const card of cards) {
          engine.moveCard(card, card.ownerSessionId, 'deck', {
            toBottom: true,
          });
        }
        engine.patchCardStatus(source.instanceId, { rested: true });
        engine.reapplyContinuousEffects();
      },
    );
  },
};
