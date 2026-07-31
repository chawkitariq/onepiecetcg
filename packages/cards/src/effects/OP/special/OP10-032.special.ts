import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { createOncePerTurnKey } from '../../special-handler-utils.js';

/**
 * OP10-032
 * [DON!! x1] [Once Per Turn] When opponent plays a Character from hand,
 * K.O. 1 of the opponent's Characters with a cost less than or equal to
 * the cost of the played Character.
 *
 * NOTE: This handler expects to be called on `onCharacterPlayed` events.
 * The effect engine broadcasts `onCharacterPlayed` to all in-play cards
 * for standard triggered effects but not for special handlers. For this
 * handler to fire when an opponent plays a character, either the duel
 * room must fire the event with this card as the source, or the engine
 * must be extended to route broadcast events to relevant special handlers.
 */
export const op10032SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-032-special',
  cardId: 'OP10-032',
  resolve(event, engine) {
    if (event.type !== 'onCharacterPlayed') return;
    const source = engine.getCard(event.sourceInstanceId);
    if (!source) return;
    const attachedDon = engine.getCards(
      {
        player: 'self',
        zones: ['cost'],
        filter: { attachedTo: event.sourceInstanceId } as any,
      },
      event.playerSessionId,
    );
    if (attachedDon.length < 1) return;
    const turn = engine.state.turn;
    if (
      engine.hasResolvedOncePerTurnKey(
        createOncePerTurnKey(event.sourceInstanceId, 'OP10-032', turn),
      )
    )
      return;
    const opponentSessionId = engine.getOpponentSessionId(event.playerSessionId);
    if (!opponentSessionId) return;
    const playedChar = engine.getCard(event.sourceInstanceId);
    if (!playedChar) return;
    const playedCost = playedChar.cost ?? playedChar.baseCost ?? 0;
    const koCandidates = engine.getCards(
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'], costMax: playedCost },
        count: { kind: 'upTo', value: 1 },
      },
      event.playerSessionId,
    );
    if (koCandidates.length === 0) return;
    engine.markResolvedOncePerTurnKey(
      createOncePerTurnKey(event.sourceInstanceId, 'OP10-032', turn),
    );
    for (const target of koCandidates) {
      engine.koCharacter(target.ownerSessionId, target.instanceId, 'effect');
    }
    engine.syncPlayer(event.playerSessionId);
    if (opponentSessionId) engine.syncPlayer(opponentSessionId);
  },
};
