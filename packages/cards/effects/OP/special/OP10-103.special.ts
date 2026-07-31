/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP10-103
 * [On Play] Choose 1 card from the top or bottom of your Life cards and
 * add it to your hand. Then, add up to 1 {Supernovas} type Character
 * card from your hand to the top of your Life cards face-up.
 */
export const op10103SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-103-special',
  cardId: 'OP10-103',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const decisions = anyEngine.decisions;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;
    if (player.zones.life.length === 0) {
      engine.reapplyContinuousEffects();
      return;
    }
    decisions.chooseChoices(
      `${event.sourceInstanceId}:op10-103:life-top-or-bottom`,
      event.playerSessionId,
      'Add top or bottom Life card to hand?',
      [
        { id: 'top', label: 'Top of Life' },
        { id: 'bottom', label: 'Bottom of Life' },
      ],
      1,
      1,
      (choiceIds) => {
        const fromBottom = choiceIds.includes('bottom');
        const lifeCards = host.getCards(
          { player: 'self', zones: ['life'] },
          event.playerSessionId,
        );
        const targetLife = fromBottom
          ? lifeCards[lifeCards.length - 1]
          : lifeCards[0];
        if (!targetLife) {
          engine.reapplyContinuousEffects();
          return;
        }
        host.moveCard(targetLife, event.playerSessionId, 'hand');
        decisions.chooseCards(
          `${event.sourceInstanceId}:op10-103:add-supernovas`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          'Add 1 Supernovas Character from hand to top of Life face-up:',
          {
            player: 'self',
            zones: ['hand'],
            filter: { cardCategory: ['Character'], families: ['Supernovas'] },
            count: { kind: 'upTo', value: 1 },
          },
          undefined,
          (cards) => {
            for (const card of cards) {
              host.moveCard(card, event.playerSessionId, 'life');
            }
            host.syncPlayer(event.playerSessionId);
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
