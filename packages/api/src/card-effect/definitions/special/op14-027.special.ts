/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP14-027 Shanks
 * [Your Turn] When this Character becomes rested, rest up to 1 of your
 * opponent's Characters with 7000 base power or less.
 * [Opponent's Turn] If this Character is rested, give all of your opponent's
 * Characters 1000 power.
 */
export const op14027SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-027-special',
  cardId: 'OP14-027',
  resolve(event, engine) {
    if (event.type === 'onPlay' || event.type === 'onDonAttached') {
      const anyEngine = engine as any;
      const { host } = anyEngine;
      const source = host.getCard(event.sourceInstanceId);
      if (!source) return;
      const activePlayerSessionId = host.state.activePlayerSessionId;
      if (
        activePlayerSessionId ===
        host.getOpponentSessionId(event.playerSessionId)
      ) {
        if (source.rested) {
          const effect: StandardEffectDefinition = {
            id: 'op14-027-opponent-turn-power-down',
            text: "[Opponent's Turn] If this Character is rested, give all of your opponent's Characters 1000 power.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  count: { kind: 'any' },
                },
                amount: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          };
          engine.queueEffect(
            event.playerSessionId,
            event.sourceInstanceId,
            event.sourceCardId,
            effect,
          );
        }
      }
    }
  },
};
