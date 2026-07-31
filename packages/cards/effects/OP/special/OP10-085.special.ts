import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP10-085
 * [DON!! x1] If there are 8 or more cards in your trash, this card
 * gains [Rush].
 *
 * NOTE: This handler runs on `onCharacterPlayed` (when this card enters
 * play) to apply the Rush keyword if the trash condition is met.
 * The Rush persists until end of turn. Re-evaluation when trash count
 * changes mid-turn requires the duel room to re-dispatch the event or
 * the engine to support continuous special handler re-evaluation.
 */
export const op10085SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-085-special',
  cardId: 'OP10-085',
  resolve(event, engine) {
    if (event.type !== 'onCharacterPlayed') return;
    const source = engine.getCard(event.sourceInstanceId);
    if (!source) return;
    const attachedDon = engine.getCards(
      {
        player: 'self',
        zones: ['cost'],
        filter: { attachedTo: event.sourceInstanceId } as any,
      },
      event.playerSessionId,
    );
    if (attachedDon.length < 1) return;
    const trashCards = engine.getCards(
      { player: 'self', zones: ['trash'] },
      event.playerSessionId,
    );
    if (trashCards.length < 8) return;
    engine.addKeywordModifier(
      event.sourceInstanceId,
      event.playerSessionId,
      source.instanceId,
      ['rush'],
      'untilEndOfTurn',
    );
    engine.reapplyContinuousEffects();
  },
};
