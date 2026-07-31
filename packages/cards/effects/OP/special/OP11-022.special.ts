import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils.js';

/**
 * Shirahoshi Leader handler.
 *
 * Continuous "cannot attack" is expected in the main definition's `continuous` section.
 *
 * [Activate: Main] [Once Per Turn] You may rest 1 of your DON!! cards and
 * turn 1 card from the top of your Life cards face-up: Play up to 1
 * "Neptunian" type Character card or "Megalo" with a cost equal to or less
 * than the number of DON!! cards on your field from your hand.
 */
export const op11022SpecialHandler: SpecialHandlerDefinition = {
  id: 'op11-022-special',
  cardId: 'OP11-022',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;

    const oncePerTurnKey = `${event.sourceInstanceId}:op11-022:${engine.state.turn}`;
    if (engine.hasResolvedOncePerTurnKey(oncePerTurnKey)) return;

    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;

    const hasDonToRest = player.zones.cost.length > 0;
    const hasLife = player.zones.life.length > 0;
    if (!hasDonToRest || !hasLife) return;

    let totalDonOnField =
      player.zones.cost.length + (player.zones.leader.attachedDon ?? 0);
    for (const char of player.zones.characters) {
      totalDonOnField += char.attachedDon ?? 0;
    }

    const handCards = engine.getCards(
      {
        player: 'self',
        zones: ['hand'],
        filter: {
          cardCategory: ['Character'],
          costMax: totalDonOnField,
        },
        count: { kind: 'upTo', value: 1 },
      },
      event.playerSessionId,
    );
    if (handCards.length === 0) return;

    engine.pauseDecision(
      {
        id: `${event.sourceInstanceId}:op11-022:confirm`,
        effectId: 'op11-022-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message:
            '[Shirahoshi] Rest 1 DON!! and turn 1 Life face-up to play a Neptunian or Megalo?',
          optional: true,
        },
      },
      (response: { confirmed?: boolean }) => {
        if (!response.confirmed) return;

        engine.markResolvedOncePerTurnKey(oncePerTurnKey);

        if (player.zones.cost.length > 0) {
          const firstDon = player.zones.cost[0];
          patchSpecialHandlerCardStatus(engine, firstDon, { rested: true });
        }

        const topLife = engine.getCards(
          {
            player: 'self',
            zones: ['life'],
            filter: { zonePosition: 'top' },
            count: { kind: 'exact', value: 1 },
          },
          event.playerSessionId,
        );
        if (topLife.length > 0) {
          topLife[0].faceDown = false;
        }

        engine.chooseCards(
          `${event.sourceInstanceId}:op11-022:play`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          '[Shirahoshi] Choose a Neptunian or Megalo to play:',
          {
            player: 'self',
            zones: ['hand'],
            filter: {
              cardCategory: ['Character'],
              costMax: totalDonOnField,
            },
            count: { kind: 'upTo', value: 1 },
          },
          undefined,
          (selected) => {
            for (const card of selected) {
              engine.playCard(card, event.playerSessionId, 'characters');
            }
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
