import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP16-119
 * [Trigger] Negate the effect of up to 1 of your opponent's Characters
 * during this turn. Then, K.O. up to 1 of your opponent's Characters
 * with a cost of 5 or less.
 */
export const op16119SpecialHandler: SpecialHandlerDefinition = {
  id: 'op16-119-negate-and-ko-trigger',
  cardId: 'OP16-119',
  resolve(event, engine) {
    if (event.type !== 'trigger') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;

    anyEngine.decisions.chooseCards(
      `${event.sourceInstanceId}:op16-119:negate`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      'Negate the effect of up to 1 opponent Character:',
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'] },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (negateTargets) => {
        for (const card of negateTargets) {
          card.effectNegated = true;
        }

        anyEngine.decisions.chooseCards(
          `${event.sourceInstanceId}:op16-119:ko`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          'K.O. up to 1 opponent Character with cost 5 or less:',
          {
            player: 'opponent',
            zones: ['characters'],
            filter: { cardCategory: ['Character'], costMax: 5 },
            count: { kind: 'upTo', value: 1 },
          },
          undefined,
          (koTargets) => {
            for (const card of koTargets) {
              host.moveCard(card, card.ownerSessionId, 'trash');
            }
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
