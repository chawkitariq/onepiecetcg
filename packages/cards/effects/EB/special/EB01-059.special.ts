import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

export const eb01059MainKoAndTrashLifeSpecialHandler: SpecialHandlerDefinition =
  {
    id: 'eb01-059-main-ko-and-trash-life-until-1',
    cardId: 'EB01-059',
    resolve(event, engine) {
      if (event.type !== 'activateMain') {
        return;
      }

      const player = engine.getPlayer(event.playerSessionId);

      if (!player) {
        return;
      }

      engine.chooseCards(
        `${event.sourceInstanceId}:eb01-059:ko`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        event.playerSessionId,
        '[Kingdom Come] Select up to 1 opponent Character to KO:',
        {
          player: 'opponent',
          zones: ['characters'],
          filter: { cardCategory: ['Character'] },
          count: { kind: 'upTo', value: 1 },
        },
        undefined,
        (cards) => {
          for (const card of cards) {
            engine.koCharacter(card.ownerSessionId, card.instanceId, 'effect');
          }

          while (player.zones.life.length > 1) {
            const topLife = player.zones.life[player.zones.life.length - 1];

            if (topLife) {
              engine.moveCard(topLife, event.playerSessionId, 'trash');
            }
          }

          engine.syncPlayer(event.playerSessionId);
          engine.reapplyContinuousEffects();
        },
      );
    },
  };
