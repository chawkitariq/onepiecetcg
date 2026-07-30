import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

export const eb01059MainKoAndTrashLifeSpecialHandler: SpecialHandlerDefinition =
  {
    id: 'eb01-059-main-ko-and-trash-life-until-1',
    cardId: 'EB01-059',
    resolve(event, engine) {
      if (event.type !== 'activateMain') {
        return;
      }

      const anyEngine = engine as any;
      const host = anyEngine.host;
      const decisions = anyEngine.decisions;
      const player = host.getPlayer(event.playerSessionId);

      if (!player) {
        return;
      }

      decisions.chooseCards(
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
            host.koCharacter(card.ownerSessionId, card.instanceId, 'effect');
          }

          while (player.zones.life.length > 1) {
            const topLife = player.zones.life[player.zones.life.length - 1];

            if (topLife) {
              host.moveCard(topLife, event.playerSessionId, 'trash');
            }
          }

          host.syncPlayer(event.playerSessionId);
          engine.reapplyContinuousEffects();
        },
      );
    },
  };
