/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP09-058 "Special Muggy Ball"
 * [Main] Your opponent chooses 1 of their Character with a cost of 6 or less
 *   and return to the owner's hand.
 * [Trigger] Return up to 1 Character with a cost of 3 or less to the owner's
 *   hand.
 */
export const op09058SpecialHandler: SpecialHandlerDefinition = {
  id: 'op09-058-special',
  cardId: 'OP09-058',
  resolve(event, engine) {
    if (event.type === 'activateMain') {
      const anyEngine = engine as any;
      const host = anyEngine.host;
      const decisions = anyEngine.decisions;
      const opponentSessionId = host.getOpponentSessionId(
        event.playerSessionId,
      );
      if (!opponentSessionId) return;

      decisions.chooseCards(
        `${event.sourceInstanceId}:op09-058:main`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        opponentSessionId,
        '[Special Muggy Ball] Your opponent chooses 1 of your Characters (cost 6 or less) to return to hand:',
        {
          player: 'self',
          zones: ['characters'],
          filter: { cardCategory: ['Character'], costMax: 6 },
          count: { kind: 'upTo', value: 1 },
        },
        undefined,
        (cards) => {
          for (const card of cards) {
            host.moveCard(card, card.ownerSessionId, 'hand');
          }
          engine.reapplyContinuousEffects();
        },
      );
    } else if (event.type === 'trigger') {
      const anyEngine = engine as any;
      const host = anyEngine.host;
      const decisions = anyEngine.decisions;

      decisions.chooseCards(
        `${event.sourceInstanceId}:op09-058:trigger`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        event.playerSessionId,
        "[Special Muggy Ball] Return up to 1 Character (cost 3 or less) to the owner's hand:",
        {
          player: 'opponent',
          zones: ['characters'],
          filter: { cardCategory: ['Character'], costMax: 3 },
          count: { kind: 'upTo', value: 1 },
        },
        undefined,
        (cards) => {
          for (const card of cards) {
            host.moveCard(card, card.ownerSessionId, 'hand');
          }
          engine.reapplyContinuousEffects();
        },
      );
    }
  },
};
