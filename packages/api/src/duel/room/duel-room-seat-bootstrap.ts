import { StateView } from '@colyseus/schema';
import { DuelCard, DuelPlayer, createDuelCard } from '@onepiecetcg/shared';
import type { Client } from 'colyseus';
import type { ValidatedGameDeck } from '../../deck/deck.service';

type DuelJoinOptions = {
  displayName?: string;
};

/**
 * Dependencies required to bootstrap a duel seat from a validated deck and to
 * expose the appropriate public/private cards through Colyseus `StateView`.
 */
export type DuelRoomSeatBootstrapDeps = {
  syncZoneCounts: (player: DuelPlayer) => void;
  broadcastCardView: (card: DuelCard) => void;
};

/**
 * Builds fully-initialized duel players and handles the initial per-client
 * visibility wiring when they join a room.
 */
export class DuelRoomSeatBootstrap {
  public constructor(private readonly deps: DuelRoomSeatBootstrapDeps) {}

  /**
   * Creates a ready duel player from a validated deck, including the leader,
   * main deck cards, DON!! deck, and replicated zone counters.
   */
  public createPlayer(
    client: Pick<Client, 'sessionId'>,
    options: DuelJoinOptions,
    gameDeck: ValidatedGameDeck,
  ): DuelPlayer {
    const player = new DuelPlayer();
    player.sessionId = client.sessionId;
    player.displayName =
      options.displayName?.trim().slice(0, 40) ||
      `Player ${gameDeck.ownerAuthUserId.slice(0, 8)}`;
    player.deckId = gameDeck.id;
    player.ready = true;
    player.zones.leader = createDuelCard(
      gameDeck.leader,
      `${client.sessionId}:leader:${gameDeck.leader.id}`,
      client.sessionId,
    );
    player.zones.deck.push(
      ...gameDeck.cards.map((card, index) =>
        createDuelCard(
          card,
          `${client.sessionId}:deck:${index + 1}`,
          client.sessionId,
          true,
        ),
      ),
    );
    player.zones.donDeck.push(
      ...Array.from({ length: 10 }, (_, index) =>
        this.createDonCard(client.sessionId, index),
      ),
    );
    this.deps.syncZoneCounts(player);
    return player;
  }

  /**
   * Wires the joining client's private/public card visibility and publishes
   * the new player's always-public cards to already-connected clients.
   */
  public initializeClientView(
    client: Pick<Client, 'view'>,
    player: DuelPlayer,
    existingPlayers: Iterable<DuelPlayer>,
  ): void {
    client.view = new StateView();

    for (const card of player.zones.deck) {
      client.view.add(card);
    }

    for (const existingPlayer of existingPlayers) {
      if (existingPlayer.sessionId === player.sessionId) {
        continue;
      }

      client.view.add(existingPlayer.zones.leader);

      for (const donCard of existingPlayer.zones.donDeck) {
        client.view.add(donCard);
      }
    }

    this.deps.broadcastCardView(player.zones.leader);

    for (const donCard of player.zones.donDeck) {
      this.deps.broadcastCardView(donCard);
    }
  }

  private createDonCard(sessionId: string, index: number): DuelCard {
    const card = new DuelCard();
    card.instanceId = `${sessionId}:don:${index + 1}`;
    card.ownerSessionId = sessionId;
    card.cardId = 'DON!!';
    card.number = 'DON!!';
    card.name = 'DON!!';
    card.type = 'DON!!';
    return card;
  }
}
