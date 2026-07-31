import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP15-020 "Fire Fist"
 * [Main] Your Leader gains +3000 power during this turn and give up to 1 of
 * your opponent's Characters -8000 power until the end of your opponent's next
 * End Phase. Then, you may trash 2 cards from your hand. If you do, K.O. up to
 * 1 of your opponent's Characters with 0 power or less.
 */
export const op15020SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-020-special',
  cardId: 'OP15-020',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;

    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;

    // Leader +3000 power during this turn
    engine.addPowerModifier(
      event.sourceInstanceId,
      event.playerSessionId,
      player.zones.leader.instanceId ?? event.sourceInstanceId,
      3000,
      'untilEndOfTurn',
    );

    // Opponent Character -8000 until end of opponent's next End Phase
    engine.chooseCards(
      `${event.sourceInstanceId}:op15-020:power-down-target`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Fire Fist] Give up to 1 opponent Character -8000 power:',
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'] },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (targets) => {
        const opponentId = engine.getOpponentSessionId(event.playerSessionId);
        for (const target of targets) {
          engine.addPowerModifier(
            event.sourceInstanceId,
            event.playerSessionId,
            target.instanceId,
            -8000,
            'untilStartOfYourNextTurn',
          );
        }

        // Then, may trash 2 from hand to KO 0-power character
        engine.chooseCards(
          `${event.sourceInstanceId}:op15-020:trash-cost`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          '[Fire Fist] Trash 2 cards from hand to KO a 0-power opponent Character?',
          {
            player: 'self',
            zones: ['hand'],
            count: { kind: 'exact', value: 2 },
          },
          undefined,
          (trashed) => {
            if (trashed.length < 2) {
              engine.reapplyContinuousEffects();
              return;
            }
            for (const card of trashed) {
              engine.moveCard(card, event.playerSessionId, 'trash');
            }

            engine.chooseCards(
              `${event.sourceInstanceId}:op15-020:ko-zero-power`,
              event.playerSessionId,
              {
                sourceInstanceId: event.sourceInstanceId,
                storedSelections: {},
              },
              event.playerSessionId,
              '[Fire Fist] KO up to 1 opponent Character with 0 power or less:',
              {
                player: 'opponent',
                zones: ['characters'],
                filter: { cardCategory: ['Character'], powerMax: 0 },
                count: { kind: 'upTo', value: 1 },
              },
              undefined,
              (koTargets) => {
                for (const koTarget of koTargets) {
                  engine.koCharacter(
                    koTarget.ownerSessionId,
                    koTarget.instanceId,
                    'effect',
                  );
                }
                engine.syncPlayer(event.playerSessionId);
                if (opponentId) engine.syncPlayer(opponentId);
                engine.reapplyContinuousEffects();
              },
            );
          },
        );
      },
    );
  },
};
