import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { createOncePerTurnKey } from '../../special-handler-utils.js';

export const eb01040LifeFaceUpKoCost0SpecialHandler: SpecialHandlerDefinition =
  {
    id: 'eb01-040-activate-main-life-face-up-ko-cost-0',
    cardId: 'EB01-040',
    resolve(event, engine) {
      if (event.type !== 'activateMain') {
        return;
      }

      const turn = engine.state.turn;

      if (
        engine.hasResolvedOncePerTurnKey(
          createOncePerTurnKey(event.sourceInstanceId, 'EB01-040', turn),
        )
      ) {
        return;
      }

      const player = engine.getPlayer(event.playerSessionId);

      if (!player) {
        return;
      }

      if (player.zones.life.length === 0) {
        return;
      }

      engine.pauseDecision(
        {
          id: `${event.sourceInstanceId}:eb01-040:confirm`,
          effectId: 'eb01-040-activate-main-life-face-up-ko-cost-0',
          effectCardId: event.sourceCardId,
          sourceInstanceId: event.sourceInstanceId,
          playerSessionId: event.playerSessionId,
          createdAt: new Date().toISOString(),
          prompt: {
            type: 'confirm',
            message:
              '[Kyros] Turn 1 Life card face-up and KO up to 1 opponent cost-0 Character?',
            optional: true,
          },
        },
        (response) => {
          if (!response.confirmed) {
            return;
          }

          const topLife = player.zones.life[player.zones.life.length - 1];

          if (!topLife) {
            return;
          }

          topLife.faceDown = false;
          engine.markResolvedOncePerTurnKey(
            createOncePerTurnKey(event.sourceInstanceId, 'EB01-040', turn),
          );

          engine.chooseCards(
            `${event.sourceInstanceId}:eb01-040:ko-cost-0`,
            event.playerSessionId,
            { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
            event.playerSessionId,
            '[Kyros] Select up to 1 opponent Character with cost 0 to KO:',
            {
              player: 'opponent',
              zones: ['characters'],
              filter: {
                cardCategory: ['Character'],
                costMin: 0,
                costMax: 0,
              },
              count: { kind: 'upTo', value: 1 },
            },
            undefined,
            (cards) => {
              for (const card of cards) {
                engine.koCharacter(
                  card.ownerSessionId,
                  card.instanceId,
                  'effect',
                );
              }

              engine.syncPlayer(event.playerSessionId);
              engine.reapplyContinuousEffects();
            },
          );
        },
      );
    },
  };
