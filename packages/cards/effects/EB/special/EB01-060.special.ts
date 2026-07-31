import type { DuelCard } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

export const eb01060MainPlayEnelAndTrashLifeSpecialHandler: SpecialHandlerDefinition =
  {
    id: 'eb01-060-main-play-enel-and-trash-life',
    cardId: 'EB01-060',
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
        `${event.sourceInstanceId}:eb01-060:play-enel`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        event.playerSessionId,
        '[Did Someone Say...Kami?] Select up to 1 [Enel] with cost 7 or less to play:',
        {
          player: 'self',
          zones: ['hand', 'trash'],
          filter: {
            cardCategory: ['Character'],
            name: ['Enel'],
            costMax: 7,
          },
          count: { kind: 'upTo', value: 1 },
        },
        undefined,
        (cards: DuelCard[]) => {
          for (const card of cards) {
            host.moveCard(card, event.playerSessionId, 'characters');
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
