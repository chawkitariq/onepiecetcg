import { StateView } from '@colyseus/schema';
import type { DuelPlayer, DuelState } from '@onepiecetcg/shared';
import type { Client } from 'colyseus';

export type DuelRoomViewClient = Pick<Client, 'sessionId' | 'view'>;

/**
 * Rebuilds per-client Colyseus `StateView` visibility from the authoritative
 * duel state, exposing public cards to everyone and private hidden zones only
 * to their owner.
 */
export function rebuildDuelRoomClientViews(
  clients: Iterable<DuelRoomViewClient>,
  state: DuelState,
): void {
  for (const client of clients) {
    client.view = new StateView();
    const ownerSessionId = client.sessionId;

    for (const player of state.players.values()) {
      addAlwaysPublicCardsToView(client, player);

      if (player.sessionId === ownerSessionId) {
        addPrivateCardsToView(client, player);
      }
    }
  }
}

function addAlwaysPublicCardsToView(
  client: DuelRoomViewClient,
  player: DuelPlayer,
): void {
  client.view?.add(player.zones.leader);

  if (player.zones.stage.instanceId) {
    client.view?.add(player.zones.stage);
  }

  for (const card of player.zones.donDeck) {
    client.view?.add(card);
  }

  for (const card of player.zones.characters) {
    client.view?.add(card);
  }

  for (const card of player.zones.cost) {
    client.view?.add(card);
  }

  for (const card of player.zones.trash) {
    client.view?.add(card);
  }
}

function addPrivateCardsToView(
  client: DuelRoomViewClient,
  player: DuelPlayer,
): void {
  for (const zone of [
    player.zones.deck,
    player.zones.hand,
    player.zones.life,
  ]) {
    for (const card of zone) {
      client.view?.add(card);
    }
  }
}
