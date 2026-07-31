/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

/**
 * OP10-099
 * [When Attacking] Return up to 1 Character with a cost of 5 or more
 * to the top or bottom of its owner's deck.
 */
export const op10099SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-099-special',
  cardId: 'OP10-099',
  resolve(event, engine) {
    if (event.type !== 'whenAttacking') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const decisions = anyEngine.decisions;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;
    decisions.chooseCards(
      `${event.sourceInstanceId}:op10-099:return-char`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      'Return 1 Character (cost 5 or more) to the top or bottom of the deck:',
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'], costMin: 5 },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (cards) => {
        const target = cards[0];
        if (!target) {
          engine.reapplyContinuousEffects();
          return;
        }
        decisions.chooseChoices(
          `${event.sourceInstanceId}:op10-099:top-or-bottom`,
          event.playerSessionId,
          'Place at top or bottom of deck?',
          [
            { id: 'top', label: 'Top of deck' },
            { id: 'bottom', label: 'Bottom of deck' },
          ],
          1,
          1,
          (choiceIds) => {
            const toBottom = choiceIds.includes('bottom');
            host.moveCard(target, target.ownerSessionId, 'deck', { toBottom });
            host.syncPlayer(event.playerSessionId);
            const oppId = host.getOpponentSessionId(event.playerSessionId);
            if (oppId) host.syncPlayer(oppId);
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
