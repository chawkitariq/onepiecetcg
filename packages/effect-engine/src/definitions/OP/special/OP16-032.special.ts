import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

/**
 * OP16-032
 * [On Play] Up to 1 of your opponent's Characters other than [Monkey.D.Luffy]
 * cannot be rested until the end of your opponent's next End Phase.
 *
 * Stores a `cannotBeRested` flag on the target card. The duel room must check
 * this flag before resting any Character during the opponent's next turn.
 */
export const op16032SpecialHandler: SpecialHandlerDefinition = {
  id: 'op16-032-cannot-be-rested',
  cardId: 'OP16-032',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;

    const opponentSessionId = host.getOpponentSessionId(event.playerSessionId);
    if (!opponentSessionId) return;

    const currentTurn = host.state.turn;
    const targetExpiryTurn = currentTurn + 2;

    anyEngine.decisions.chooseCards(
      `${event.sourceInstanceId}:op16-032:select-restrict`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      'Select up to 1 opponent Character other than Monkey.D.Luffy:',
      {
        player: 'opponent',
        zones: ['characters'],
        filter: {
          cardCategory: ['Character'],
          excludeName: ['Monkey.D.Luffy'],
        },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (selected) => {
        for (const card of selected) {
          card.cannotBeRested = true;
          card.cannotBeRestedUntilTurn = targetExpiryTurn;
        }
        engine.reapplyContinuousEffects();
      },
    );
  },
};
