import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * Handles Ace & Sabo & Luffy:
 * [Activate: Main] You may give 1 of your active DON!! cards to 1 of your Leader or
 * Character cards and trash this Character: Give up to 1 of your opponent's Characters
 * -3000 power during this turn.
 */
export const op13007SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-007-special',
  cardId: 'OP13-007',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;

    const player = engine.getPlayer(event.playerSessionId);
    const source = engine.getCard(event.sourceInstanceId);
    if (!player || !source) return;

    const activeDon = player.zones.cost.filter((d: any) => !d.rested);
    if (activeDon.length < 1) return;

    engine.pauseDecision(
      {
        id: `${event.sourceInstanceId}:op13-007:confirm`,
        effectId: 'op13-007-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message:
            '[Ace & Sabo & Luffy] Give 1 active DON!! to your Leader/Character, trash this, give -3000 power to opponent Character?',
          optional: true,
        },
      },
      (response: { confirmed?: boolean }) => {
        if (!response.confirmed) return;

        engine.chooseCards(
          `${event.sourceInstanceId}:op13-007:don-target`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          '[Ace & Sabo & Luffy] Choose which DON!! to give (active):',
          {
            player: 'self',
            zones: ['cost'],
            filter: { cardCategory: ['DON!!'], rested: false },
            count: { kind: 'exact', value: 1 },
          },
          undefined,
          () => {
            engine.chooseCards(
              `${event.sourceInstanceId}:op13-007:attach-target`,
              event.playerSessionId,
              {
                sourceInstanceId: event.sourceInstanceId,
                storedSelections: {},
              },
              event.playerSessionId,
              '[Ace & Sabo & Luffy] Choose which Leader or Character to give the DON!! to:',
              {
                player: 'self',
                zones: ['leader', 'characters'],
                filter: { cardCategory: ['Leader', 'Character'] },
                count: { kind: 'exact', value: 1 },
              },
              undefined,
              (attachTargets) => {
                const attachTarget = attachTargets[0];
                engine.attachDon(
                  event.playerSessionId,
                  attachTarget.instanceId,
                  1,
                );

                engine.moveCard(source, event.playerSessionId, 'trash');

                engine.chooseCards(
                  `${event.sourceInstanceId}:op13-007:power-target`,
                  event.playerSessionId,
                  {
                    sourceInstanceId: event.sourceInstanceId,
                    storedSelections: {},
                  },
                  event.playerSessionId,
                  '[Ace & Sabo & Luffy] Choose up to 1 opponent Character to give -3000 power:',
                  {
                    player: 'opponent',
                    zones: ['characters'],
                    filter: { cardCategory: ['Character'] },
                    count: { kind: 'upTo', value: 1 },
                  },
                  undefined,
                  (debuffTargets) => {
                    for (const t of debuffTargets) {
                      engine.addPowerModifier(
                        event.sourceInstanceId,
                        event.playerSessionId,
                        t.instanceId,
                        -3000,
                        'untilEndOfTurn',
                      );
                    }
                    engine.reapplyContinuousEffects();
                  },
                );
              },
            );
          },
        );
      },
    );
  },
};
