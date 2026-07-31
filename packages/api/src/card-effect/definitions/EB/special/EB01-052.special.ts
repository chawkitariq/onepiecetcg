import type { DuelCard } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

export const eb01052ChooseLifeManipulationSpecialHandler: SpecialHandlerDefinition =
  {
    id: 'eb01-052-on-play-choose-life-manipulation',
    cardId: 'EB01-052',
    resolve(event, engine) {
      if (event.type !== 'onPlay') {
        return;
      }

      const player = engine.getPlayer(event.playerSessionId);

      if (!player) {
        return;
      }

      const opponentSessionId = engine.getOpponentSessionId(
        event.playerSessionId,
      );

      if (!opponentSessionId) {
        return;
      }

      engine.chooseChoices(
        `${event.sourceInstanceId}:eb01-052:choose`,
        event.playerSessionId,
        '[Viola] Choose one:',
        [
          {
            id: 'look-opponent-life',
            label: 'Look at all of your opponent Life cards and reorder them',
          },
          {
            id: 'face-down-own-life',
            label: 'Turn all of your Life cards face-down',
          },
        ],
        1,
        1,
        (choiceIds) => {
          if (choiceIds[0] === 'look-opponent-life') {
            const opponent = engine.getPlayer(opponentSessionId);

            if (!opponent) {
              return;
            }

            const lifeCards = Array.from(opponent.zones.life) as DuelCard[];

            if (lifeCards.length === 0) {
              return;
            }

            for (const card of lifeCards) {
              engine.patchCardStatus(card.instanceId, { faceDown: false });
            }

            const remaining = lifeCards.slice();
            const topCards: DuelCard[] = [];
            const bottomCards: DuelCard[] = [];

            const pickNextCard = () => {
              if (remaining.length === 0) {
                engine.setZoneOrder(
                  opponentSessionId,
                  'life',
                  [...topCards, ...bottomCards].map((card) => card.instanceId),
                  { faceDown: true },
                );

                engine.syncPlayer(event.playerSessionId);
                return;
              }

              const card: DuelCard = remaining[0];
              remaining.shift();
              engine.chooseChoices(
                `${event.sourceInstanceId}:eb01-052:reorder:${card.instanceId}`,
                event.playerSessionId,
                `[Viola] Place ${card.name} at top or bottom of opponent Life?`,
                [
                  { id: 'top', label: 'Top of Life' },
                  { id: 'bottom', label: 'Bottom of Life' },
                ],
                1,
                1,
                (destChoiceIds) => {
                  if (destChoiceIds[0] === 'bottom') {
                    bottomCards.push(card);
                  } else {
                    topCards.push(card);
                  }

                  pickNextCard();
                },
              );
            };

            pickNextCard();
          } else if (choiceIds[0] === 'face-down-own-life') {
            engine.setZoneOrder(
              event.playerSessionId,
              'life',
              Array.from(player.zones.life, (card) => card.instanceId),
              { faceDown: true },
            );
          }
        },
      );
    },
  };
