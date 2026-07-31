import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

export const op04047SpecialHandler: SpecialHandlerDefinition = {
  id: 'op04-047-special',
  cardId: 'OP04-047',
  resolve(event, engine) {
    if (event.type !== 'whenAttacking') {
      return;
    }

    const combat = engine.state.combat;

    if (
      combat.attackerInstanceId !== event.sourceInstanceId ||
      combat.targetType !== 'character'
    ) {
      return;
    }

    const target = engine.getCard(combat.targetInstanceId);

    if (
      !target ||
      target.ownerSessionId === event.playerSessionId ||
      target.cost > 5
    ) {
      return;
    }

    engine.scheduleMoveAtEndOfBattle(
      target.instanceId,
      target.ownerSessionId,
      'deck',
      { toBottom: true },
    );
  },
};
