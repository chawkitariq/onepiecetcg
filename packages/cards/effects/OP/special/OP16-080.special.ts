import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import {
  hasResolvedOncePerTurn,
  markResolvedOncePerTurn,
} from '../../special-handler-utils.js';

/**
 * OP16-080
 * [On your Opponent's Attack] [Once Per Turn] You may trash 1 card with
 * a [Trigger] from your hand: Change the target of that attack to this
 * Leader or to one of your {Blackbeard Pirates} type Character cards.
 *
 * 'this Leader' refers to the card controller's Leader. When the opponent
 * attacks, the controller may pay by trashing a Trigger card to redirect.
 */
export const op16080SpecialHandler: SpecialHandlerDefinition = {
  id: 'op16-080-attack-redirect',
  cardId: 'OP16-080',
  resolve(event, engine) {
    if (event.type !== 'onAttacked') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const defender = host.getPlayer(event.playerSessionId);
    if (!defender) return;

    const opponentSessionId = host.getOpponentSessionId(event.playerSessionId);
    if (!opponentSessionId) return;

    const isOpponentTurn = host.state.turnPlayer === opponentSessionId;
    if (!isOpponentTurn) return;

    if (
      hasResolvedOncePerTurn(
        anyEngine,
        event.sourceInstanceId,
        'op16-080',
        host.state.turn,
      )
    ) {
      return;
    }

    const triggerCards = host.getCards(
      { player: 'self', zones: ['hand'], filter: { hasTrigger: true } },
      event.playerSessionId,
    );
    if (triggerCards.length === 0) return;

    anyEngine.decisions.chooseCards(
      `${event.sourceInstanceId}:op16-080:trash-trigger`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      'Trash 1 card with [Trigger] from your hand to redirect the attack?',
      {
        player: 'self',
        zones: ['hand'],
        filter: { hasTrigger: true },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (trashed) => {
        if (trashed.length === 0) return;

        markResolvedOncePerTurn(
          anyEngine,
          event.sourceInstanceId,
          'op16-080',
          host.state.turn,
        );

        for (const card of trashed) {
          host.moveCard(card, event.playerSessionId, 'trash');
        }

        anyEngine.decisions.chooseCards(
          `${event.sourceInstanceId}:op16-080:redirect-target`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          'Choose the new attack target (your Leader or a Blackbeard Pirates Character):',
          {
            player: 'self',
            zones: ['leader', 'characters'],
            filter: {
              cardCategory: ['Leader', 'Character'],
            },
            count: { kind: 'exact', value: 1 },
          },
          undefined,
          (targets) => {
            if (targets.length === 0) return;
            host.state.combat.targetInstanceId = targets[0].instanceId;
            host.state.combat.targetType =
              targets[0].type === 'Leader' ? 'leader' : 'character';
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
