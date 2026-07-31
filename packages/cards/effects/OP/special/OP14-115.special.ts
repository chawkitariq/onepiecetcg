/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP14-115 Rindo
 * [Opponent's Turn] [On K.O.] Add up to 1 card from the top of your deck to
 * the top of your Life cards. Then, you take 1 damage.
 * [Trigger] If your Leader has the {Kuja Pirates} type, play this card.
 */
export const op14115SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-115-special',
  cardId: 'OP14-115',
  resolve(event, engine) {
    if (event.type === 'onKo') {
      const anyEngine = engine as any;
      const { host, decisions } = anyEngine;
      const opponentSessionId = host.getOpponentSessionId(
        event.playerSessionId,
      );
      const activePlayerSessionId = host.state.activePlayerSessionId;
      if (activePlayerSessionId !== opponentSessionId) return;

      decisions.pause(
        {
          id: `${event.sourceInstanceId}:op14-115:deck-to-life`,
          effectId: 'op14-115-special',
          effectCardId: event.sourceCardId,
          sourceInstanceId: event.sourceInstanceId,
          playerSessionId: event.playerSessionId,
          createdAt: new Date().toISOString(),
          prompt: {
            type: 'confirm',
            message:
              '[Rindo] Add 1 card from the top of your deck to the top of your Life cards and take 1 damage?',
            optional: true,
          },
        },
        (resp: { confirmed?: boolean }) => {
          if (!resp.confirmed) return;

          const deckTop = host.getCards(
            {
              player: 'self',
              zones: ['deck'],
              count: { kind: 'exact', value: 1 },
            },
            event.playerSessionId,
          );
          if (deckTop.length) {
            host.moveCard(deckTop[0], event.playerSessionId, 'life');
          }

          const lifeTop = host.getCards(
            {
              player: 'self',
              zones: ['life'],
              count: { kind: 'exact', value: 1 },
            },
            event.playerSessionId,
          );
          if (lifeTop.length) {
            host.moveCard(lifeTop[0], event.playerSessionId, 'trash');
          }

          host.syncPlayer(event.playerSessionId);
          engine.reapplyContinuousEffects();
        },
      );
    } else if (event.type === 'trigger') {
      const anyEngine = engine as any;
      const { host } = anyEngine;
      const player = host.getPlayer(event.playerSessionId);
      if (!player) return;
      const leader = player.zones.leader;
      if (!leader || !leader.families?.some((f: string) => f.includes('Kuja')))
        return;

      const source = host.getCard(event.sourceInstanceId);
      if (!source) return;
      host.playCard(source, event.playerSessionId, 'characters');
      host.syncPlayer(event.playerSessionId);
      engine.reapplyContinuousEffects();
    }
  },
};
