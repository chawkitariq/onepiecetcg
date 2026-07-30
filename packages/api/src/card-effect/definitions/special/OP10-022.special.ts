/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../types/effect-registry';
import {
  hasResolvedOncePerTurn,
  markResolvedOncePerTurn,
} from './special-handler-utils';

export const op10022SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-022-special',
  cardId: 'OP10-022',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const decisions = anyEngine.decisions;
    const player = host.getPlayer(event.playerSessionId);
    const source = host.getCard(event.sourceInstanceId);
    if (!player || !source) return;
    const attachedDon = host.getCards(
      {
        player: 'self',
        zones: ['cost'],
        filter: { attachedTo: event.sourceInstanceId },
      },
      event.playerSessionId,
    );
    if (attachedDon.length < 1) return;
    const turn = host.state.turn;
    if (
      hasResolvedOncePerTurn(
        anyEngine,
        event.sourceInstanceId,
        'OP10-022',
        turn,
      )
    )
      return;
    const chars = host.getCards(
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
    decisions.chooseCards(
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
        host.moveCard(returnedChar, event.playerSessionId, 'hand');
        markResolvedOncePerTurn(
          anyEngine,
          event.sourceInstanceId,
          'OP10-022',
          turn,
        );
        const lifeTop = host.getCards(
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
        host.addLog(
          `Revealed top Life card: ${lifeCard.name} (${lifeCard.cardId})`,
        );
        const isSupernovas = lifeCard.families?.includes('Supernovas');
        const cost = lifeCard.cost ?? lifeCard.baseCost ?? 0;
        if (isSupernovas && cost <= 5) {
          host.moveCard(lifeCard, event.playerSessionId, 'characters');
        }
        engine.reapplyContinuousEffects();
      },
    );
  },
};
