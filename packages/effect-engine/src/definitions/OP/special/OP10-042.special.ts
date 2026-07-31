/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

/**
 * OP10-042
 * [When Attacking] Rest up to 1 of your opponent's Characters with a cost
 * less than or equal to the number of rested DON!! cards on your field.
 */
export const op10042SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-042-special',
  cardId: 'OP10-042',
  resolve(event, engine) {
    if (event.type !== 'whenAttacking') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const decisions = anyEngine.decisions;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;
    const restedDon = host.getCards(
      { player: 'self', zones: ['cost'], filter: { rested: true } },
      event.playerSessionId,
    );
    const restedDonCount = restedDon.length;
    decisions.chooseCards(
      `${event.sourceInstanceId}:op10-042:rest-char`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      `Rest 1 opponent Character with cost <= ${restedDonCount}:`,
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'], costMax: restedDonCount },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (cards) => {
        for (const card of cards) {
          host.restCard(card);
        }
        engine.reapplyContinuousEffects();
      },
    );
  },
};
