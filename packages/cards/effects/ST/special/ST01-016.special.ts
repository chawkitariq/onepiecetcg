import type { DuelCard } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * Diable Jambe (ST01-016) handler.
 *
 * [Main] Select up to 1 of your {Straw Hat Crew} type Leader or Character
 * cards. Your opponent cannot activate [Blocker] if that Leader or Character
 * attacks during this turn.
 *
 * [Trigger] K.O. up to 1 of your opponent's [Blocker] Characters with a cost
 * of 3 or less.
 */
export const st01016SpecialHandler: SpecialHandlerDefinition = {
  id: 'st01-016-special',
  cardId: 'ST01-016',
  resolve(event, engine) {
    if (event.type === 'activateMain') {
      const player = engine.getPlayer(event.playerSessionId);
      if (!player) {
        return;
      }

      const selectableCards = engine.getCards(
        {
          player: 'self',
          zones: ['leader', 'characters'],
          filter: { trait: ['Straw Hat Crew'] },
          count: { kind: 'upTo', value: 1 },
        },
        event.playerSessionId,
      );

      if (selectableCards.length === 0) {
        return;
      }

      engine.chooseCards(
        `${event.sourceInstanceId}:st01-016:select-target`,
        event.playerSessionId,
        {
          sourceInstanceId: event.sourceInstanceId,
          storedSelections: {},
        },
        event.playerSessionId,
        '[Diable Jambe] Select up to 1 {Straw Hat Crew} Leader or Character.',
        {
          player: 'self',
          zones: ['leader', 'characters'],
          filter: { trait: ['Straw Hat Crew'] },
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
    } else if (event.type === 'trigger') {
      const player = engine.getPlayer(event.playerSessionId);
      if (!player) {
        return;
      }

      const blockerCandidates = engine
        .getCards(
          {
            player: 'opponent',
            zones: ['characters'],
            filter: { cardCategory: ['Character'], costMax: 3 },
          },
          event.playerSessionId,
        )
        .filter((card: DuelCard) => {
          return card.text?.includes('[Blocker]') === true;
        });

      if (blockerCandidates.length === 0) {
        return;
      }

      engine.chooseCards(
        `${event.sourceInstanceId}:st01-016:trigger-ko-blocker`,
        event.playerSessionId,
        {
          sourceInstanceId: event.sourceInstanceId,
          storedSelections: {},
        },
        event.playerSessionId,
        '[Diable Jambe] Select up to 1 [Blocker] Character with cost 3 or less to K.O.',
        {
          player: 'opponent',
          zones: ['characters'],
          filter: { cardCategory: ['Character'], costMax: 3 },
          count: { kind: 'upTo', value: 1 },
        },
        undefined,
        (selectedCards: any[]) => {
          for (const target of selectedCards) {
            if (target.text?.includes('[Blocker]')) {
              engine.koCharacter(
                event.playerSessionId,
                target.instanceId,
                'effect',
              );
            }
          }

          engine.reapplyContinuousEffects();
        },
      );
    }
  },
};
