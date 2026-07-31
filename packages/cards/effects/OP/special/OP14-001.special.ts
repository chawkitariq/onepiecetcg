import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP14-001 Trafalgar Law
 * [Activate:Main] [Once Per Turn] Select 2 of your {Supernovas} or
 * {Heart Pirates} type Characters. Swap the base power of the selected
 * Characters with each other during this turn.
 */
export const op14001SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-001-special',
  cardId: 'OP14-001',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;

    engine.chooseCards(
      `${event.sourceInstanceId}:op14-001:select-two`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Trafalgar Law] Select 2 of your {Supernovas} or {Heart Pirates} Characters to swap base power:',
      {
        player: 'self',
        zones: ['characters'],
        filter: {
          cardCategory: ['Character'],
          trait: ['Supernovas', 'Heart Pirates'],
        },
        count: { kind: 'exact', value: 2 },
      },
      undefined,
      (selected) => {
        if (selected.length < 2) return;
        const [cardA, cardB] = selected;
        const pA = cardA.basePower;
        const pB = cardB.basePower;
        engine.addPowerModifier(
          event.sourceInstanceId,
          event.playerSessionId,
          cardA.instanceId,
          pB - pA,
          'untilEndOfTurn',
        );
        engine.addPowerModifier(
          event.sourceInstanceId,
          event.playerSessionId,
          cardB.instanceId,
          pA - pB,
          'untilEndOfTurn',
        );
        engine.reapplyContinuousEffects();
      },
    );
  },
};
