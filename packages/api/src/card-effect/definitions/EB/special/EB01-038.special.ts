import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

export const eb01038CounterRedirectAttackSpecialHandler: SpecialHandlerDefinition =
  {
    id: 'eb01-038-counter-redirect-attack',
    cardId: 'EB01-038',
    resolve(event, engine) {
      if (event.type !== 'activateCounter') {
        return;
      }

      const anyEngine = engine as any;
      const host = anyEngine.host;
      const decisions = anyEngine.decisions;
      const player = host.getPlayer(event.playerSessionId);

      if (!player) {
        return;
      }

      const opponentSessionId = host.getOpponentSessionId(
        event.playerSessionId,
      );

      if (!opponentSessionId) {
        return;
      }

      if (player.zones.cost.length < 1) {
        return;
      }

      const leader = player.zones.leader;

      if (!leader.families.includes('Baroque Works')) {
        return;
      }

      const characters = host.getCards(
        {
          player: 'self',
          zones: ['characters'],
          count: { kind: 'any' },
        },
        event.playerSessionId,
      );

      if (characters.length === 0) {
        return;
      }

      decisions.chooseCards(
        `${event.sourceInstanceId}:eb01-038:redirect-target`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        event.playerSessionId,
        '[Oh Come My Way] Select 1 of your Characters to redirect the attack to:',
        {
          player: 'self',
          zones: ['characters'],
          count: { kind: 'exact', value: 1 },
        },
        undefined,
        (targets) => {
          if (targets.length === 0) {
            return;
          }

          host.returnDonToDonDeck(event.playerSessionId, 1);
          host.state.combat.targetInstanceId = targets[0].instanceId;
          host.state.combat.targetType = 'character';
          host.state.combat.blockerInstanceId = targets[0].instanceId;
          engine.reapplyContinuousEffects();
        },
      );
    },
  };
