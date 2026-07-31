/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

/**
 * OP10-119
 * [On Play] Reveal 1 {Supernovas} type Character card from your hand
 * and add it to the top of your Life cards face-down.
 */
export const op10119SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-119-special',
  cardId: 'OP10-119',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const decisions = anyEngine.decisions;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;
    decisions.chooseCards(
      `${event.sourceInstanceId}:op10-119:reveal-supernovas`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      'Reveal 1 Supernovas Character from your hand to add to top of Life face-down:',
      {
        player: 'self',
        zones: ['hand'],
        filter: { cardCategory: ['Character'], families: ['Supernovas'] },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (cards) => {
        const card = cards[0];
        if (!card) {
          engine.reapplyContinuousEffects();
          return;
        }
        host.addLog(`Revealed ${card.name} from hand`);
        host.moveCard(card, event.playerSessionId, 'life', { faceDown: true });
        host.syncPlayer(event.playerSessionId);
        engine.reapplyContinuousEffects();
      },
    );
  },
};
