/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * Hatchan handler.
 *
 * [Activate: Main] You may rest this Character: If your Leader has the
 * "Fish-Man" or "Merfolk" type, up to 1 of your opponent's Characters
 * with a cost of 3 or less cannot be rested until the end of your
 * opponent's next turn.
 *
 * NOTE: "cannot be rested" uses a custom keyword modifier.  The duel room
 * must enforce this keyword when a player attempts to rest a character.
 */
export const op11034SpecialHandler: SpecialHandlerDefinition = {
  id: 'op11-034-special',
  cardId: 'OP11-034',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);

    if (!player || !player.leader) return;

    const leaderIsFishManOrMerfolk = player.leader.types?.some(
      (t: string) => t === 'Fish-Man' || t === 'Merfolk',
    );
    if (!leaderIsFishManOrMerfolk) return;

    const opponentChars = host.getCards(
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'], costMax: 3 },
        count: { kind: 'upTo', value: 1 },
      },
      event.playerSessionId,
    );

    if (opponentChars.length === 0) return;

    anyEngine.decisions.chooseCards(
      `${event.sourceInstanceId}:op11-034:select-target`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Hatchan] Choose up to 1 opponent Character (cost 3 or less) that cannot be rested:',
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'], costMax: 3 },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (selected) => {
        for (const card of selected) {
          anyEngine.modifiers.addKeywordModifier(
            event.sourceInstanceId,
            event.playerSessionId,
            card.instanceId,
            ['cannotBeRested'] as any,
            'untilStartOfYourNextTurn',
          );
        }

        engine.reapplyContinuousEffects();
      },
    );
  },
};
