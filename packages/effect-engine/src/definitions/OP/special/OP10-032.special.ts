/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';
import {
  hasResolvedOncePerTurn,
  markResolvedOncePerTurn,
} from '../../special-handler-utils';

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
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;
    const attachedDon = host.getCards(
      {
        player: 'self',
        zones: ['cost'],
        filter: { attachedTo: event.sourceInstanceId },
      },
      event.playerSessionId,
    );
    if (attachedDon.length < 1) return;
    const turn = host.state.turn;
    if (
      hasResolvedOncePerTurn(
        anyEngine,
        event.sourceInstanceId,
        'OP10-032',
        turn,
      )
    )
      return;
    const opponentSessionId = host.getOpponentSessionId(event.playerSessionId);
    if (!opponentSessionId) return;
    const playedChar = host.getCard(event.sourceInstanceId);
    if (!playedChar) return;
    const playedCost = playedChar.cost ?? playedChar.baseCost ?? 0;
    const koCandidates = host.getCards(
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'], costMax: playedCost },
        count: { kind: 'upTo', value: 1 },
      },
      event.playerSessionId,
    );
    if (koCandidates.length === 0) return;
    markResolvedOncePerTurn(
      anyEngine,
      event.sourceInstanceId,
      'OP10-032',
      turn,
    );
    for (const target of koCandidates) {
      host.koCharacter(target.ownerSessionId, target.instanceId, 'effect');
    }
    host.syncPlayer(event.playerSessionId);
    if (opponentSessionId) host.syncPlayer(opponentSessionId);
  },
};
