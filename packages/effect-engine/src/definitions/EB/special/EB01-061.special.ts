import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

export const eb01061WhenAttackingCopyPowerSpecialHandler: SpecialHandlerDefinition =
  {
    id: 'eb01-061-when-attacking-copy-power',
    cardId: 'EB01-061',
    resolve(event, engine) {
      if (event.type !== 'whenAttacking') {
        return;
      }

      const anyEngine = engine as any;
      const host = anyEngine.host;
      const decisions = anyEngine.decisions;
      const modifiers = anyEngine.modifiers;
      const selfCard = host.getCard(event.sourceInstanceId);

      if (!selfCard) {
        return;
      }

      decisions.chooseCards(
        `${event.sourceInstanceId}:eb01-061:copy-target`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        event.playerSessionId,
        '[Mr.2 Bon Kurei] Select up to 1 opponent Character to copy power:',
        {
          player: 'opponent',
          zones: ['characters'],
          filter: { cardCategory: ['Character'] },
          count: { kind: 'upTo', value: 1 },
        },
        undefined,
        (targets) => {
          if (targets.length === 0) {
            return;
          }

          const target = targets[0];
          const targetPower = target.power;
          const delta = targetPower - selfCard.basePower;

          modifiers.addPowerModifier(
            event.sourceInstanceId,
            event.playerSessionId,
            event.sourceInstanceId,
            delta,
            'untilEndOfTurn',
          );

          engine.reapplyContinuousEffects();
        },
      );
    },
  };
