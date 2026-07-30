/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP09-018 "Get Out of Here!"
 * [Main] K.O. up to 2 of your opponent's Characters with a total power of 4000 or less.
 */
export const op09018SpecialHandler: SpecialHandlerDefinition = {
  id: 'op09-018-special',
  cardId: 'OP09-018',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const decisions = anyEngine.decisions;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;

    decisions.chooseCards(
      `${event.sourceInstanceId}:op09-018`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      "K.O. up to 2 of your opponent's Characters with a total power of 4000 or less.",
      {
        player: 'opponent',
        zones: ['characters'],
        count: { kind: 'upTo', value: 2 },
      },
      undefined,
      (cards) => {
        const totalPower = cards.reduce(
          (sum: number, card: { power: number }) => sum + (card.power ?? 0),
          0,
        );
        if (totalPower > 4000) return;
        for (const card of cards) {
          host.koCharacter(card.ownerSessionId, card.instanceId, 'effect');
        }
      },
    );
  },
};
