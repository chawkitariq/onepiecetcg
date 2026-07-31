/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils';

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
    const anyEngine = engine as any;
    const { host } = anyEngine;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;

    const syncCannotAttack = () => {
      patchSpecialHandlerCardStatus(host, source, {
        cannotAttack: source['op14-056:negatedTurn'] !== host.state.turn,
      });
      host.syncPlayer(source.ownerSessionId);
    };

    if (event.type === 'onPlay' || event.type === 'onTurnStart') {
      syncCannotAttack();
      return;
    }

    if (event.type === 'onTurnEnd') {
      if (source['op14-056:negatedTurn'] === host.state.turn) {
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
      source['op14-056:negatedTurn'] = host.state.turn;
      syncCannotAttack();
    }
  },
};
