import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP16-079
 * When a {Land of Wano} type Character card is played from your trash,
 * that Character gains [Rush] during this turn.
 *
 * Expects the duel room to set `(event as any).sourceZone` to the zone the
 * card was played from (e.g., `'trash'`). Only fires when OP16-079 itself
 * (a Land of Wano Character) is played from trash.
 */
export const op16079SpecialHandler: SpecialHandlerDefinition = {
  id: 'op16-079-land-of-wano-from-trash-rush',
  cardId: 'OP16-079',
  resolve(event, engine) {
    if (event.type !== 'onCharacterPlayed') return;

    const playedCard = engine.getCard(event.sourceInstanceId);
    if (!playedCard) return;

    if ((event as any).sourceZone !== 'trash') return;

    const families: string[] = Array.from(playedCard.families ?? []);
    if (!families.includes('Land of Wano')) return;

    engine.addKeywordModifier(
      event.sourceInstanceId,
      event.playerSessionId,
      playedCard.instanceId,
      ['rush'],
      { type: 'untilEndOfTurn' },
    );

    engine.reapplyContinuousEffects();
  },
};
