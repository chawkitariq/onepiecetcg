import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op06014SpecialHandler: SpecialHandlerDefinition = {
  id: 'op06-014-special',
  cardId: 'OP06-014',
  resolve(event, engine) {
    if (event.type !== 'onAttacked') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;

    const filmCards = host.getCards(
      { player: 'self', zones: ['hand'], filter: { trait: ['FILM'] } },
      event.playerSessionId,
    );

    anyEngine.decisions.chooseCards(
      `${event.sourceInstanceId}:op06-014:trash-film`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Ratchet] Choose FILM cards to trash (any number):',
      { player: 'self', zones: ['hand'], filter: { trait: ['FILM'] } },
      { kind: 'any' },
      (cards) => {
        const count = cards.length;
        for (const card of cards) {
          host.moveCard(card, event.playerSessionId, 'trash');
        }
        if (count > 0) {
          anyEngine.modifiers.addPowerModifier(
            event.sourceInstanceId,
            event.playerSessionId,
            player.leader?.instanceId,
            1000 * count,
            'untilEndOfBattle',
          );
        }
        engine.reapplyContinuousEffects();
      },
    );
  },
};
