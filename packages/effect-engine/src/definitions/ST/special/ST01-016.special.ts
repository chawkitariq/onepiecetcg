/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { DuelCard } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

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
    const anyEngine = engine as any;
    const host = anyEngine.host;

    if (event.type === 'activateMain') {
      const anyEvt = event as any;
      const player = host.getPlayer(anyEvt.playerSessionId);
      if (!player) {
        return;
      }

      const selectableCards = host.getCards(
        {
          player: 'self',
          zones: ['leader', 'characters'],
          filter: { trait: ['Straw Hat Crew'] },
          count: { kind: 'upTo', value: 1 },
        },
        anyEvt.playerSessionId,
      );

      if (selectableCards.length === 0) {
        return;
      }

      anyEngine.decisions.chooseCards(
        `${anyEvt.sourceInstanceId}:st01-016:select-target`,
        anyEvt.playerSessionId,
        {
          sourceInstanceId: anyEvt.sourceInstanceId,
          storedSelections: {},
        },
        anyEvt.playerSessionId,
        '[Diable Jambe] Select up to 1 {Straw Hat Crew} Leader or Character.',
        {
          player: 'self',
          zones: ['leader', 'characters'],
          filter: { trait: ['Straw Hat Crew'] },
          count: { kind: 'upTo', value: 1 },
        },
        undefined,
        () => {
          for (const target of host.getCards(
            {
              player: 'opponent',
              zones: ['characters'],
              filter: { cardCategory: ['Character'] },
            },
            anyEvt.playerSessionId,
          )) {
            anyEngine.modifiers.addKeywordModifier(
              anyEvt.sourceInstanceId,
              anyEvt.playerSessionId,
              target.instanceId,
              ['cannotBlock'],
              'untilEndOfTurn',
            );
          }

          engine.reapplyContinuousEffects();
        },
      );
    } else if (event.type === 'trigger') {
      const anyEvt = event as any;
      const player = host.getPlayer(anyEvt.playerSessionId);
      if (!player) {
        return;
      }

      const blockerCandidates = host
        .getCards(
          {
            player: 'opponent',
            zones: ['characters'],
            filter: { cardCategory: ['Character'], costMax: 3 },
          },
          anyEvt.playerSessionId,
        )
        .filter((card: DuelCard) => {
          return card.text?.includes('[Blocker]') === true;
        });

      if (blockerCandidates.length === 0) {
        return;
      }

      anyEngine.decisions.chooseCards(
        `${anyEvt.sourceInstanceId}:st01-016:trigger-ko-blocker`,
        anyEvt.playerSessionId,
        {
          sourceInstanceId: anyEvt.sourceInstanceId,
          storedSelections: {},
        },
        anyEvt.playerSessionId,
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
              host.koCharacter(
                anyEvt.playerSessionId,
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
