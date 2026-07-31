import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils.js';

/**
 * Handles Monkey.D.Luffy (001):
 * [DON!! x1] [On Your Opponent's Attack] If you have 5 or less active DON!! cards,
 * you may rest any number of your DON!! cards. For every DON!! card rested this way,
 * this Leader or up to 1 of your "Straw Hat Crew" type Characters gains +2000 power
 * during this battle.
 */
export const op13001SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-001-special',
  cardId: 'OP13-001',
  resolve(event, engine) {
    if (event.type !== 'onAttacked') return;

    const player = engine.getPlayer(event.playerSessionId);
    const source = engine.getCard(event.sourceInstanceId);
    if (!player || !source || source.attachedDon < 1) return;

    const activeDon = player.zones.cost.filter((d: any) => !d.rested);
    if (activeDon.length < 1) return;

    engine.chooseCards(
      `${event.sourceInstanceId}:op13-001:rest-don`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Monkey.D.Luffy 001] Choose any number of your active DON!! cards to rest:',
      {
        player: 'self',
        zones: ['cost'],
        filter: { cardCategory: ['DON!!'], rested: false },
        count: { kind: 'upTo', value: activeDon.length },
      },
      undefined,
      (selectedDon) => {
        const restedCount = selectedDon.length;
        if (restedCount === 0) return;

        for (const don of selectedDon) {
          patchSpecialHandlerCardStatus(engine, don, { rested: true });
        }

        engine.chooseCards(
          `${event.sourceInstanceId}:op13-001:power-target`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          `[Monkey.D.Luffy 001] Choose target to gain +${restedCount * 2000} power:`,
          {
            player: 'self',
            zones: ['leader', 'characters'],
            filter: {
              cardCategory: ['Leader', 'Character'],
              trait: ['Straw Hat Crew'],
            },
            count: { kind: 'exact', value: 1 },
          },
          undefined,
          (targetCards) => {
            for (const target of targetCards) {
              engine.addPowerModifier(
                event.sourceInstanceId,
                event.playerSessionId,
                target.instanceId,
                restedCount * 2000,
                'untilEndOfBattle',
              );
            }
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
