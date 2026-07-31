/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

/**
 * Handles Nico Robin:
 * [On Play] Up to 1 of your opponent's Characters with a cost of 8 or less cannot be
 * rested until the end of your opponent's next End Phase.
 *
 * "Cannot be rested" means the opponent cannot rest the selected character.
 * This is implemented as a custom tracked restriction on the target card.
 */
export const op13032SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-032-special',
  cardId: 'OP13-032',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;

    anyEngine.decisions.chooseCards(
      `${event.sourceInstanceId}:op13-032:restriction-target`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      "[Nico Robin] Choose up to 1 opponent Character (cost 8 or less) that cannot be rested until end of opponent's next End Phase:",
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'], costMax: 8 },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (selected) => {
        for (const target of selected) {
          // Track restriction via custom internal state on engine
          if (!anyEngine._cannotRestKeys) {
            anyEngine._cannotRestKeys = new Set<string>();
          }
          anyEngine._cannotRestKeys.add(
            `${target.instanceId}:${host.state.turn}`,
          );
          host.addLog(
            `[Nico Robin] ${target.name} cannot be rested until end of opponent's next End Phase.`,
          );
        }
        engine.reapplyContinuousEffects();
      },
    );
  },
};
