import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP14-017 Chambres
 * [Main] Select 2 of your opponent's Characters with 9000 base power or less.
 * Swap the base power of the selected Characters with each other during this
 * turn.
 */
export const op14017SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-017-special',
  cardId: 'OP14-017',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;

    engine.chooseCards(
      `${event.sourceInstanceId}:op14-017:select-two`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      "[Chambres] Select 2 of your opponent's Characters (9000 base power or less) to swap base power:",
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'], basePowerMax: 9000 },
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
