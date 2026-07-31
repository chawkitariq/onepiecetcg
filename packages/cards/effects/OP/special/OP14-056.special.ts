import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils.js';

/**
 * OP14-056 Wadatsumi
 * This Character cannot attack.
 * When a card is trashed from your hand by an effect, this Character's effect
 * is negated during this turn.
 */
export const op14056SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-056-special',
  cardId: 'OP14-056',
  resolve(event, engine) {
    const source = engine.getCard(event.sourceInstanceId);
    if (!source) return;

    const syncCannotAttack = () => {
      patchSpecialHandlerCardStatus(engine, source, {
        cannotAttack: source['op14-056:negatedTurn'] !== engine.state.turn,
      });
      engine.syncPlayer(source.ownerSessionId);
    };

    if (event.type === 'onPlay' || event.type === 'onTurnStart') {
      syncCannotAttack();
      return;
    }

    if (event.type === 'onTurnEnd') {
      if (source['op14-056:negatedTurn'] === engine.state.turn) {
        source['op14-056:negatedTurn'] = undefined;
      }
      syncCannotAttack();
      return;
    }

    if (
      event.type === 'onCardRemovedByEffect' &&
      event.playerSessionId === source.ownerSessionId &&
      event.sourceZone === 'hand' &&
      event.destinationZone === 'trash'
    ) {
      source['op14-056:negatedTurn'] = engine.state.turn;
      syncCannotAttack();
    }
  },
};
