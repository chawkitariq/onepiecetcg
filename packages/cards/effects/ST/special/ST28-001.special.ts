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
    const anyEngine = engine as any;
    const host = anyEngine.host;

    if (event.type !== 'onPlay') {
      return;
    }

    const anyEvt = event as any;
    const player = host.getPlayer(anyEvt.playerSessionId);
    if (!player) {
      return;
    }

    const leaderCards = host.getCards(
      { player: 'self', zones: ['leader'], count: { kind: 'exact', value: 1 } },
      anyEvt.playerSessionId,
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

    const opponentLife = host.getCards(
      { player: 'opponent', zones: ['life'] },
      anyEvt.playerSessionId,
    );
    if (opponentLife.length < 3) {
      return;
    }

    const opponentSessionId =
      host.getOpponentSessionId(anyEvt.playerSessionId) ??
      anyEvt.playerSessionId;

    anyEngine.decisions.chooseCards(
      `${anyEvt.sourceInstanceId}:st28-001:on-play-ko`,
      anyEvt.playerSessionId,
      {
        sourceInstanceId: anyEvt.sourceInstanceId,
        storedSelections: {},
      },
      anyEvt.playerSessionId,
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
          host.koCharacter(opponentSessionId, target.instanceId, 'effect');
        }

        engine.reapplyContinuousEffects();
      },
    );
  },
};
