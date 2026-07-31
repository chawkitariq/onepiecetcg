import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils.js';

/**
 * Handles "If I Bowed Down to Power, What's the Point in Living?":
 * 1. [Main] You may rest 1 of your DON!! cards: If you have 1 or less Life cards,
 *    your opponent cannot activate [Blocker] whenever your Leader attacks during this turn.
 * 2. [Counter] Your Leader gains +3000 power during this battle.
 */
export const op13057SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-057-special',
  cardId: 'OP13-057',
  resolve(event, engine) {
    const source = engine.getCard(event.sourceInstanceId);
    if (!source) return;

    if (event.type === 'activateMain') {
      const player = engine.getPlayer(event.playerSessionId);
      if (!player) return;

      const activeDon = player.zones.cost.filter((d: any) => !d.rested);
      if (activeDon.length < 1) return;

      engine.pauseDecision(
        {
          id: `${event.sourceInstanceId}:op13-057:confirm-rest-don`,
          effectId: 'op13-057-special',
          effectCardId: event.sourceCardId,
          sourceInstanceId: event.sourceInstanceId,
          playerSessionId: event.playerSessionId,
          createdAt: new Date().toISOString(),
          prompt: {
            type: 'confirm',
            message:
              '[If I Bowed Down...] Rest 1 DON!! to activate Blocker prevention on Leader attacks?',
            optional: true,
          },
        },
        (response: { confirmed?: boolean }) => {
          if (!response.confirmed) return;

          patchSpecialHandlerCardStatus(engine, activeDon[0], {
            rested: true,
          });

          if (player.zones.life.length <= 1) {
            const opponentId = engine.getOpponentSessionId(
              event.playerSessionId,
            );
            if (opponentId) {
              const opponent = engine.getPlayer(opponentId);
              if (opponent) {
                for (const char of opponent.zones.characters) {
                  engine.addKeywordModifier(
                    event.sourceInstanceId,
                    event.playerSessionId,
                    char.instanceId,
                    'cannotBlock',
                    'untilEndOfTurn',
                  );
                }
                engine.addLog(
                  '[If I Bowed Down...] Opponent Characters cannot activate [Blocker] when your Leader attacks this turn.',
                );
                engine.reapplyContinuousEffects();
              }
            }
          }
        },
      );
      return;
    }

    if (event.type === 'activateCounter') {
      const def: StandardEffectDefinition = {
        id: 'op13-057-counter-power',
        text: '[Counter] Your Leader gains +3000 power during this battle.',
        trigger: { type: 'activateCounter' },
        actions: [
          {
            type: 'modifyPower',
            selector: {
              player: 'self',
              zones: ['leader'],
              count: { kind: 'exact', value: 1 },
            },
            amount: 3000,
            duration: { type: 'untilEndOfBattle' },
          },
        ],
      };

      engine.queueEffect(
        event.playerSessionId,
        event.sourceInstanceId,
        event.sourceCardId,
        def,
      );
    }
  },
};
