/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * Handles St. Topman Warcury:
 * 1. If you have 7 or more cards in your trash, this Character cannot be removed
 *    from the field by your opponent's effects and gains [Blocker].
 * 2. [On K.O.] Draw 1 card.
 *
 * The immunity+Blocker is a continuous passive — the handler applies the
 * keyword modifier on relevant game-state events. [Blocker] is player-declared
 * per the spec and not enforced server-side.
 */
export const op13089SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-089-special',
  cardId: 'OP13-089',
  resolve(event, engine) {
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;

    if (event.type === 'onKo') {
      const def: StandardEffectDefinition = {
        id: 'op13-089-on-ko-draw',
        text: '[On K.O.] Draw 1 card.',
        trigger: { type: 'onKo' },
        actions: [{ type: 'draw', player: 'self', amount: 1 }],
      };

      engine.queueEffect(
        event.playerSessionId,
        event.sourceInstanceId,
        event.sourceCardId,
        def,
      );
      return;
    }

    if (
      event.type === 'onPlay' ||
      event.type === 'onTurnStart' ||
      event.type === 'onCardDrawn'
    ) {
      const player = host.getPlayer(event.playerSessionId);
      if (!player) return;

      const trashCount = player.zones.trash.length;
      if (trashCount >= 7) {
        anyEngine.modifiers.addKeywordModifier(
          event.sourceInstanceId,
          event.playerSessionId,
          event.sourceInstanceId,
          'cannotBeRemovedByOpponentEffects',
          'untilEndOfTurn',
        );

        host.addLog(
          '[St. Topman Warcury] 7+ cards in trash — cannot be removed by opponent effects and gains [Blocker].',
        );
        engine.reapplyContinuousEffects();
      }
    }
  },
};
