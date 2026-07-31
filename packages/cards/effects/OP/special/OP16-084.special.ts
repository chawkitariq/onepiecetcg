import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP16-084
 * [Activate: Main] You may trash this Character with a cost of 20 or more:
 * If you have 9 or more DON!! cards on your field, play up to 1
 * [Kouzuki Momonosuke] with a cost of 9 from your trash.
 *
 * The source card itself is trashed as cost, then the player searches their
 * trash for a Kouzuki Momonosuke (cost 9) to play.
 */
export const op16084SpecialHandler: SpecialHandlerDefinition = {
  id: 'op16-084-trash-self-cost-20-play-momo',
  cardId: 'OP16-084',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;

    const source = engine.getCard(event.sourceInstanceId);
    if (!source) return;

    if ((source.baseCost ?? source.cost) < 20) return;

    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;

    const donOnField = player.zones.cost.length;
    if (donOnField < 9) return;

    engine.moveCard(source, event.playerSessionId, 'trash');

    engine.chooseCards(
      `${event.sourceInstanceId}:op16-084:play-momo`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      'Play up to 1 [Kouzuki Momonosuke] cost 9 from your trash:',
      {
        player: 'self',
        zones: ['trash'],
        filter: {
          cardCategory: ['Character'],
          name: ['Kouzuki Momonosuke'],
          costMax: 9,
          costMin: 9,
        },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (momoCards) => {
        for (const card of momoCards) {
          engine.moveCard(card, event.playerSessionId, 'characters');
        }
        engine.reapplyContinuousEffects();
      },
    );
  },
};
