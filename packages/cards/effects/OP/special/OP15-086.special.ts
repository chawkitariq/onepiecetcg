import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils.js';

/**
 * OP15-086 "Nami (OP15-086)"
 * [On Play] If your Leader has the {Straw Hat Crew} type, play up to 1
 * {Straw Hat Crew} type Character with a cost of 7 or less from your trash.
 * The Character played with this effect gains [Rush] during this turn.
 */
export const op15086SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-086-special',
  cardId: 'OP15-086',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;

    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;

    const leaderHasStrawHat = (player.zones.leader.families ?? []).includes(
      'Straw Hat Crew',
    );
    if (!leaderHasStrawHat) return;

    engine.chooseCards(
      `${event.sourceInstanceId}:op15-086:play-from-trash`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Nami] Play up to 1 {Straw Hat Crew} Character (cost 7 or less) from your trash:',
      {
        player: 'self',
        zones: ['trash'],
        filter: {
          cardCategory: ['Character'],
          costMax: 7,
          trait: ['Straw Hat Crew'],
        },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (cards) => {
        for (const card of cards) {
          engine.playCard(card, event.playerSessionId, 'characters');
          patchSpecialHandlerCardStatus(engine, card, {
            hasRush: true,
          });
        }
        engine.syncPlayer(event.playerSessionId);
        engine.reapplyContinuousEffects();
      },
    );
  },
};
