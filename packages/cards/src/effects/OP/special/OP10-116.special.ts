import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP10-116
 * [Main] Look at the top card of your or your opponent's Life cards.
 * Place it at the top or bottom of the Life cards. Then, K.O. up to 1
 * Character with a cost of 5 or less.
 */
export const op10116SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-116-special',
  cardId: 'OP10-116',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;
    const opponentSessionId = engine.getOpponentSessionId(event.playerSessionId);
    engine.chooseChoices(
      `${event.sourceInstanceId}:op10-116:choose-life`,
      event.playerSessionId,
      'Look at Life from you or opponent?',
      [
        { id: 'self', label: 'Your Life' },
        { id: 'opponent', label: "Opponent's Life" },
      ],
      1,
      1,
      (choiceIds) => {
        const targetPlayerId =
          choiceIds.includes('opponent') && opponentSessionId
            ? opponentSessionId
            : event.playerSessionId;
        const targetPlayer = engine.getPlayer(targetPlayerId);
        if (!targetPlayer || targetPlayer.zones.life.length === 0) {
          engine.reapplyContinuousEffects();
          return;
        }
        const lifeCards = engine.getCards(
          { player: 'self', zones: ['life'] },
          targetPlayerId,
        );
        const topLife = lifeCards[0];
        if (!topLife) {
          engine.reapplyContinuousEffects();
          return;
        }
        engine.addLog(`Revealed top Life card: ${topLife.name}`);
        engine.chooseChoices(
          `${event.sourceInstanceId}:op10-116:place-top-bottom`,
          event.playerSessionId,
          'Place at top or bottom of Life?',
          [
            { id: 'top', label: 'Top of Life' },
            { id: 'bottom', label: 'Bottom of Life' },
          ],
          1,
          1,
          (placeChoiceIds) => {
            const toBottom = placeChoiceIds.includes('bottom');
            engine.moveCard(topLife, targetPlayerId, 'life', { toBottom });
            engine.chooseCards(
              `${event.sourceInstanceId}:op10-116:ko-char`,
              event.playerSessionId,
              {
                sourceInstanceId: event.sourceInstanceId,
                storedSelections: {},
              },
              event.playerSessionId,
              'K.O. 1 Character with cost 5 or less:',
              {
                player: 'either',
                zones: ['characters'],
                filter: { cardCategory: ['Character'], costMax: 5 },
                count: { kind: 'upTo', value: 1 },
              },
              undefined,
              (koCards) => {
                for (const card of koCards) {
                  engine.koCharacter(
                    card.ownerSessionId,
                    card.instanceId,
                    'effect',
                  );
                }
                engine.syncPlayer(event.playerSessionId);
                if (opponentSessionId) engine.syncPlayer(opponentSessionId);
                engine.reapplyContinuousEffects();
              },
            );
          },
        );
      },
    );
  },
};
