/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP12-040
 * [When Attacking] [Once Per Turn] If you have 5+ DON!! active,
 * opponent trashes 2 from hand.
 */
export const op12040SpecialHandler: SpecialHandlerDefinition = {
  id: 'op12-040-special',
  cardId: 'OP12-040',
  resolve(event, engine) {
    if (event.type !== 'whenAttacking') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;

    const activeDon = (player.zones.cost ?? []).filter(
      (c: { rested: boolean }) => !c.rested,
    ).length;
    if (activeDon < 5) return;

    const opponentSessionId = host.getOpponentSessionId(event.playerSessionId);
    if (!opponentSessionId) return;

    const opponent = host.getPlayer(opponentSessionId);
    if (!opponent) return;

    const definition: StandardEffectDefinition = {
      id: 'op12-040-when-attacking',
      text: '[When Attacking] [Once Per Turn] If you have 5+ DON!! active, opponent trashes 2 from hand.',
      trigger: { type: 'whenAttacking', oncePerTurn: true },
      actions: [
        {
          type: 'trashFromHand',
          selector: {
            player: 'opponent',
            zones: ['hand'],
            count: { kind: 'exact', value: 2 },
          },
        },
      ],
    };

    engine.queueEffect(
      event.playerSessionId,
      event.sourceInstanceId,
      event.sourceCardId,
      definition,
    );
  },
};
