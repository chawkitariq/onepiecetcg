import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { createOncePerTurnKey } from '../../special-handler-utils.js';

/**
 * OP15-008 "Krieg"
 * [On Play] Give up to 3 of your opponent's rested DON!! cards to 1 of your
 * opponent's Characters. Then, this Character gains [Rush] during this turn.
 * [Activate: Main] [Once Per Turn] If this Character was played on this turn,
 * give all of your opponent's Characters -1000 power during this turn for every
 * DON!! card given to that Character.
 */
export const op15008SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-008-special',
  cardId: 'OP15-008',
  resolve(event, engine) {
    if (event.type === 'onPlay') {
      const opponentId = engine.getOpponentSessionId(event.playerSessionId);
      if (!opponentId) return;

      const opponent = engine.getPlayer(opponentId);
      if (!opponent) return;

      const restedDonCount = Array.from(opponent.zones.cost).filter(
        (c: any) => c.rested,
      ).length;
      const maxDonToGive = Math.min(3, restedDonCount);

      if (maxDonToGive === 0) return;

      engine.chooseCards(
        `${event.sourceInstanceId}:op15-008:on-play-target-char`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        event.playerSessionId,
        '[Krieg] Choose 1 opponent Character to give DON!! to:',
        {
          player: 'opponent',
          zones: ['characters'],
          filter: { cardCategory: ['Character'] },
          count: { kind: 'exact', value: 1 },
        },
        undefined,
        (targets) => {
          const target = targets[0];
          if (!target) {
            engine.reapplyContinuousEffects();
            return;
          }

          engine.attachDon(opponentId, target.instanceId, maxDonToGive);

          engine.addKeywordModifier(
            event.sourceInstanceId,
            event.playerSessionId,
            event.sourceInstanceId,
            ['rush'],
            'untilEndOfTurn',
          );

          engine.syncPlayer(event.playerSessionId);
          engine.syncPlayer(opponentId);
          engine.reapplyContinuousEffects();
        },
      );
      return;
    }

    if (event.type !== 'activateMain') return;

    const source = engine.getCard(event.sourceInstanceId);
    if (!source || !source.playedThisTurn) return;

    const turn = engine.state.turn;
    if (
      engine.hasResolvedOncePerTurnKey(
        createOncePerTurnKey(event.sourceInstanceId, event.sourceCardId, turn),
      )
    )
      return;

    engine.markResolvedOncePerTurnKey(
      createOncePerTurnKey(event.sourceInstanceId, event.sourceCardId, turn),
    );

    const opponentChars = engine.getCards(
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'] },
        count: { kind: 'any' },
      },
      event.playerSessionId,
    );

    for (const char of opponentChars) {
      const donGiven = char.attachedDon ?? 0;
      if (donGiven > 0) {
        engine.addPowerModifier(
          event.sourceInstanceId,
          event.playerSessionId,
          char.instanceId,
          donGiven * -1000,
          'untilEndOfTurn',
        );
      }
    }

    engine.reapplyContinuousEffects();
  },
};
