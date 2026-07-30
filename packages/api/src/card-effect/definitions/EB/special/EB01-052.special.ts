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

      const anyEngine = engine as any;
      const host = anyEngine.host;
      const decisions = anyEngine.decisions;
      const player = host.getPlayer(event.playerSessionId);

      if (!player) {
        return;
      }

      const opponentSessionId = host.getOpponentSessionId(
        event.playerSessionId,
      );

      if (!opponentSessionId) {
        return;
      }

      decisions.chooseChoices(
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
            const opponent = host.getPlayer(opponentSessionId);

            if (!opponent) {
              return;
            }

            const lifeCards = Array.from(opponent.zones.life);

            if (lifeCards.length === 0) {
              return;
            }

            for (const card of lifeCards) {
              card.faceDown = false;
            }

            const remaining: DuelCard[] = [...lifeCards];
            const topCards: DuelCard[] = [];
            const bottomCards: DuelCard[] = [];

            const pickNextCard = () => {
              if (remaining.length === 0) {
                opponent.zones.life.splice(
                  0,
                  opponent.zones.life.length,
                  ...topCards,
                  ...bottomCards,
                );

                for (const card of opponent.zones.life) {
                  card.faceDown = true;
                }

                host.syncPlayer(event.playerSessionId);
                return;
              }

              const card: DuelCard = remaining[0];
              remaining.shift();
              decisions.chooseChoices(
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
            for (const card of player.zones.life) {
              card.faceDown = true;
            }

            host.syncPlayer(event.playerSessionId);
          }
        },
      );
    },
  };
