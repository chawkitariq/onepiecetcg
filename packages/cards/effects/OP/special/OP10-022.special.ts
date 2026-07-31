import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { createOncePerTurnKey } from '../../special-handler-utils.js';

export const op10022SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-022-special',
  cardId: 'OP10-022',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const player = engine.getPlayer(event.playerSessionId);
    const source = engine.getCard(event.sourceInstanceId);
    if (!player || !source) return;
    const attachedDon = engine.getCards(
      {
        player: 'self',
        zones: ['cost'],
        filter: { attachedTo: event.sourceInstanceId } as any,
      },
      event.playerSessionId,
    );
    if (attachedDon.length < 1) return;
    const turn = engine.state.turn;
    if (
      engine.hasResolvedOncePerTurnKey(
        createOncePerTurnKey(event.sourceInstanceId, 'OP10-022', turn),
      )
    )
      return;
    const chars = engine.getCards(
      {
        player: 'self',
        zones: ['characters'],
        filter: { cardCategory: ['Character'] },
      },
      event.playerSessionId,
    );
    const totalCost = chars.reduce(
      (sum: number, c: { cost: number }) => sum + (c.cost ?? 0),
      0,
    );
    if (totalCost < 5) return;
    engine.chooseCards(
      `${event.sourceInstanceId}:op10-022:return-char`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      'Return 1 of your Characters to hand:',
      {
        player: 'self',
        zones: ['characters'],
        filter: { cardCategory: ['Character'] },
        count: { kind: 'exact', value: 1 },
      },
      undefined,
      (returned) => {
        const returnedChar = returned[0];
        if (!returnedChar) {
          engine.reapplyContinuousEffects();
          return;
        }
        engine.moveCard(returnedChar, event.playerSessionId, 'hand');
        engine.markResolvedOncePerTurnKey(
          createOncePerTurnKey(event.sourceInstanceId, 'OP10-022', turn),
        );
        const lifeTop = engine.getCards(
          {
            player: 'self',
            zones: ['life'],
            count: { kind: 'exact', value: 1 },
          },
          event.playerSessionId,
        );
        if (lifeTop.length === 0) {
          engine.reapplyContinuousEffects();
          return;
        }
        const lifeCard = lifeTop[0];
        engine.addLog(
          `Revealed top Life card: ${lifeCard.name} (${lifeCard.cardId})`,
        );
        const isSupernovas = lifeCard.families?.includes('Supernovas');
        const cost = lifeCard.cost ?? lifeCard.baseCost ?? 0;
        if (isSupernovas && cost <= 5) {
          engine.moveCard(lifeCard, event.playerSessionId, 'characters');
        }
        engine.reapplyContinuousEffects();
      },
    );
  },
};
