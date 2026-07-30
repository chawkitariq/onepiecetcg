import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * Mr.2 Bon.Kurei (ST08-013) handler.
 *
 * [DON!! x1] At the end of a battle in which this Character battles your
 * opponent's Character, you may K.O. the opponent's Character you battled
 * with. If you do, K.O. this Character.
 */
export const st08013SpecialHandler: SpecialHandlerDefinition = {
  id: 'st08-013-special',
  cardId: 'ST08-013',
  resolve(event, engine) {
    if (event.type !== 'whenAttacking') {
      return;
    }

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);

    if (!source || source.attachedDon < 1) {
      return;
    }

    const combat = host.state.combat;

    if (
      combat.attackerInstanceId !== event.sourceInstanceId ||
      combat.targetType !== 'character'
    ) {
      return;
    }

    const target = host.getCard(combat.targetInstanceId);

    if (!target || target.ownerSessionId === event.playerSessionId) {
      return;
    }

    const targetInstanceId = target.instanceId;
    const sourceInstanceId = source.instanceId;
    const playerSessionId = event.playerSessionId;

    anyEngine.decisions.pause(
      {
        id: `${event.sourceInstanceId}:st08-013:mutual-ko`,
        effectId: 'st08-013-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message:
            '[Mr.2 Bon.Kurei] K.O. the battled character? If you do, K.O. this character.',
          optional: true,
        },
      },
      (response: { confirmed?: boolean }) => {
        if (!response.confirmed) {
          return;
        }

        const targetCard = host.getCard(targetInstanceId);
        const sourceCard = host.getCard(sourceInstanceId);

        if (targetCard) {
          host.koCharacter(playerSessionId, targetInstanceId, 'effect');
        }

        if (sourceCard) {
          host.koCharacter(playerSessionId, sourceInstanceId, 'effect');
        }

        engine.reapplyContinuousEffects();
      },
    );
  },
};
