import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * Sanji (ST21-003) handler.
 *
 * [On Play] Select up to 1 of your {Straw Hat Crew} type Characters with
 * 6000 power or more. If the selected Character attacks during this turn,
 * your opponent cannot activate [Blocker].
 */
export const st21003SpecialHandler: SpecialHandlerDefinition = {
  id: 'st21-003-special',
  cardId: 'ST21-003',
  resolve(event, engine) {
    if (event.type === 'onPlay') {
      const player = engine.getPlayer(event.playerSessionId);
      if (!player) {
        return;
      }

      const selectableCards = engine.getCards(
        {
          player: 'self',
          zones: ['characters'],
          filter: {
            cardCategory: ['Character'],
            trait: ['Straw Hat Crew'],
            powerMin: 6000,
          },
          count: { kind: 'upTo', value: 1 },
        },
        event.playerSessionId,
      );

      if (selectableCards.length === 0) {
        return;
      }

      engine.chooseCards(
        `${event.sourceInstanceId}:st21-003:select-target`,
        event.playerSessionId,
        {
          sourceInstanceId: event.sourceInstanceId,
          storedSelections: {},
        },
        event.playerSessionId,
        '[Sanji] Select up to 1 {Straw Hat Crew} Character with 6000 power or more.',
        {
          player: 'self',
          zones: ['characters'],
          filter: {
            cardCategory: ['Character'],
            trait: ['Straw Hat Crew'],
            powerMin: 6000,
          },
          count: { kind: 'upTo', value: 1 },
        },
        undefined,
        () => {
          for (const target of engine.getCards(
            {
              player: 'opponent',
              zones: ['characters'],
              filter: { cardCategory: ['Character'] },
            },
            event.playerSessionId,
          )) {
            engine.addKeywordModifier(
              event.sourceInstanceId,
              event.playerSessionId,
              target.instanceId,
              ['cannotBlock'],
              'untilEndOfTurn',
            );
          }

          engine.reapplyContinuousEffects();
        },
      );
    }
  },
};
