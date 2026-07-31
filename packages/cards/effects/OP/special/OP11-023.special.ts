import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * Arlong handler.
 *
 * [Trigger] Rest up to 1 of your opponent's Characters with a cost of 4 or less.
 *
 * The continuous cost-reduction effect (in hand costs 3 when leader Fish-Man,
 * <=3 Life, opponent >=5 rested) is best expressed as a main-definition
 * `continuous` effect.  This handler also re-evaluates conditions on each
 * received event and re-registers a `nextPlayCostModifier` as a fallback.
 */
export const op11023SpecialHandler: SpecialHandlerDefinition = {
  id: 'op11-023-special',
  cardId: 'OP11-023',
  resolve(event, engine) {
    if (event.type === 'trigger') {
      const triggerDef: StandardEffectDefinition = {
        id: 'arlong-trigger-rest-cost-4-or-less',
        text: "[Trigger] Rest up to 1 of your opponent's Characters with a cost of 4 or less.",
        trigger: { type: 'trigger' },
        actions: [
          {
            type: 'rest',
            selector: {
              player: 'opponent',
              zones: ['characters'],
              filter: { cardCategory: ['Character'], costMax: 4 },
              count: { kind: 'upTo', value: 1 },
            },
          },
        ],
      };

      engine.queueEffect(
        event.playerSessionId,
        event.sourceInstanceId,
        event.sourceCardId,
        triggerDef,
      );
      return;
    }

    const player = engine.getPlayer(event.playerSessionId);

    if (!player || !(player as any).leader) return;

    const leaderIsFishMan = (player as any).leader.types?.some(
      (t: string) => t === 'Fish-Man',
    );
    if (!leaderIsFishMan) return;

    if (player.zones.life.length > 3) return;

    const opponentId = engine.getOpponentSessionId(event.playerSessionId);
    if (!opponentId) return;

    const opponent = engine.getPlayer(opponentId);
    if (!opponent) return;

    let restedCount = 0;
    for (const char of opponent.zones.characters) {
      if (char.rested) restedCount++;
    }
    if (restedCount < 5) return;

    const source = engine.getCard(event.sourceInstanceId);
    if (!source) return;

    const baseCost = source.baseCost ?? source.cost ?? 0;
    if (baseCost <= 3) return;

    const reduction = 3 - baseCost;

    engine.registerNextPlayCostModifier(
      event.playerSessionId,
      event.sourceInstanceId,
      {
        cardCategory: ['Character'],
        name: [source.name],
      },
      'hand',
      reduction,
    );

    engine.reapplyContinuousEffects();
  },
};
