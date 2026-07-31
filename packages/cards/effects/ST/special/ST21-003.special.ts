/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
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
    const anyEngine = engine as any;
    const host = anyEngine.host;

    if (event.type === 'onPlay') {
      const anyEvt = event as any;
      const player = host.getPlayer(anyEvt.playerSessionId);
      if (!player) {
        return;
      }

      const selectableCards = host.getCards(
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
        anyEvt.playerSessionId,
      );

      if (selectableCards.length === 0) {
        return;
      }

      anyEngine.decisions.chooseCards(
        `${anyEvt.sourceInstanceId}:st21-003:select-target`,
        anyEvt.playerSessionId,
        {
          sourceInstanceId: anyEvt.sourceInstanceId,
          storedSelections: {},
        },
        anyEvt.playerSessionId,
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
    }
  },
};
