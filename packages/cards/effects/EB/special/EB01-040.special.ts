import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import {
  hasResolvedOncePerTurn,
  markResolvedOncePerTurn,
} from '../../special-handler-utils.js';

export const eb01040LifeFaceUpKoCost0SpecialHandler: SpecialHandlerDefinition =
  {
    id: 'eb01-040-activate-main-life-face-up-ko-cost-0',
    cardId: 'EB01-040',
    resolve(event, engine) {
      if (event.type !== 'activateMain') {
        return;
      }

      const anyEngine = engine as any;
      const host = anyEngine.host;
      const decisions = anyEngine.decisions;
      const turn = host.state.turn;

      if (
        hasResolvedOncePerTurn(
          anyEngine,
          event.sourceInstanceId,
          'EB01-040',
          turn,
        )
      ) {
        return;
      }

      const player = host.getPlayer(event.playerSessionId);

      if (!player) {
        return;
      }

      if (player.zones.life.length === 0) {
        return;
      }

      decisions.pause(
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
          markResolvedOncePerTurn(
            anyEngine,
            event.sourceInstanceId,
            'EB01-040',
            turn,
          );

          decisions.chooseCards(
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
                host.koCharacter(
                  card.ownerSessionId,
                  card.instanceId,
                  'effect',
                );
              }

              host.syncPlayer(event.playerSessionId);
              engine.reapplyContinuousEffects();
            },
          );
        },
      );
    },
  };
