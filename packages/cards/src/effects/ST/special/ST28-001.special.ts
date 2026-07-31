import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * Ashura Doji (ST28-001) handler.
 *
 * [On Play] If your Leader has the "Land of Wano" type and your opponent has
 * 3 or more Life cards, K.O. up to 1 of your opponent's Characters with a
 * base cost of 5 or less.
 */
export const st28001SpecialHandler: SpecialHandlerDefinition = {
  id: 'st28-001-special',
  cardId: 'ST28-001',
  resolve(event, engine) {
    if (event.type !== 'onPlay') {
      return;
    }

    const player = engine.getPlayer(event.playerSessionId);
    if (!player) {
      return;
    }

    const leaderCards = engine.getCards(
      { player: 'self', zones: ['leader'], count: { kind: 'exact', value: 1 } },
      event.playerSessionId,
    );
    const leader = leaderCards[0];
    if (!leader) {
      return;
    }
    const families: string[] = Array.from(leader.families ?? []);
    const hasWanoTrait = families.includes('Land of Wano');

    if (!hasWanoTrait) {
      return;
    }

    const opponentLife = engine.getCards(
      { player: 'opponent', zones: ['life'] },
      event.playerSessionId,
    );
    if (opponentLife.length < 3) {
      return;
    }

    const opponentSessionId =
      engine.getOpponentSessionId(event.playerSessionId) ??
      event.playerSessionId;

    engine.chooseCards(
      `${event.sourceInstanceId}:st28-001:on-play-ko`,
      event.playerSessionId,
      {
        sourceInstanceId: event.sourceInstanceId,
        storedSelections: {},
      },
      event.playerSessionId,
      '[Ashura Doji] Select up to 1 opponent Character with a base cost of 5 or less to K.O.',
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'], baseCostMax: 5 },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (selectedCards: any[]) => {
        for (const target of selectedCards) {
          engine.koCharacter(opponentSessionId, target.instanceId, 'effect');
        }

        engine.reapplyContinuousEffects();
      },
    );
  },
};
