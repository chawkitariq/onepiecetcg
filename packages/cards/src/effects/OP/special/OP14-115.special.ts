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
      const opponentSessionId = engine.getOpponentSessionId(
        event.playerSessionId,
      );
      const activePlayerSessionId = engine.state.activePlayerSessionId;
      if (activePlayerSessionId !== opponentSessionId) return;

      engine.pauseDecision(
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

          const deckTop = engine.getCards(
            {
              player: 'self',
              zones: ['deck'],
              count: { kind: 'exact', value: 1 },
            },
            event.playerSessionId,
          );
          if (deckTop.length) {
            engine.moveCard(deckTop[0], event.playerSessionId, 'life');
          }

          const lifeTop = engine.getCards(
            {
              player: 'self',
              zones: ['life'],
              count: { kind: 'exact', value: 1 },
            },
            event.playerSessionId,
          );
          if (lifeTop.length) {
            engine.moveCard(lifeTop[0], event.playerSessionId, 'trash');
          }

          engine.syncPlayer(event.playerSessionId);
          engine.reapplyContinuousEffects();
        },
      );
    } else if (event.type === 'trigger') {
      const player = engine.getPlayer(event.playerSessionId);
      if (!player) return;
      const leader = player.zones.leader;
      if (!leader || !leader.families?.some((f: string) => f.includes('Kuja')))
        return;

      const source = engine.getCard(event.sourceInstanceId);
      if (!source) return;
      engine.playCard(source, event.playerSessionId, 'characters');
      engine.syncPlayer(event.playerSessionId);
      engine.reapplyContinuousEffects();
    }
  },
};
