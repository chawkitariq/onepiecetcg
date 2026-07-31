/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

/**
 * OP10-034
 * [On Play] Set up to 2 DON!! cards from your DON!! deck as active.
 * Then, your opponent adds 1 card from the top of their deck to their
 * Life cards. Then, if the total number of DON!! cards on the field
 * is 8 or more, draw 1 card.
 */
export const op10034SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-034-special',
  cardId: 'OP10-034',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const decisions = anyEngine.decisions;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;
    const opponentSessionId = host.getOpponentSessionId(event.playerSessionId);
    if (!opponentSessionId) return;
    decisions.chooseChoices(
      `${event.sourceInstanceId}:op10-034:don-amount`,
      event.playerSessionId,
      'Set how many DON!! active? (up to 2)',
      [
        { id: '0', label: '0' },
        { id: '1', label: '1' },
        { id: '2', label: '2' },
      ],
      1,
      1,
      (choiceIds) => {
        const amount = parseInt(choiceIds[0], 10);
        if (amount > 0) {
          host.addDonToCost(event.playerSessionId, amount, false);
        }
        const opponentDeckTop = host.getCards(
          {
            player: 'self',
            zones: ['deck'],
            count: { kind: 'exact', value: 1 },
          },
          opponentSessionId,
        );
        if (opponentDeckTop.length > 0) {
          host.moveCard(opponentDeckTop[0], opponentSessionId, 'life');
        }
        const selfDon = host.getCards(
          { player: 'self', zones: ['cost'] },
          event.playerSessionId,
        );
        const oppDon = host.getCards(
          { player: 'opponent', zones: ['cost'] },
          event.playerSessionId,
        );
        const totalDonOnField = selfDon.length + oppDon.length;
        if (totalDonOnField >= 8) {
          host.drawCard(event.playerSessionId);
        }
        host.syncPlayer(event.playerSessionId);
        host.syncPlayer(opponentSessionId);
        engine.reapplyContinuousEffects();
      },
    );
  },
};
