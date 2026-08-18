import { StateView } from '@colyseus/schema';
import type { Card } from '@onepiecetcg/shared';
import { DuelPlayer } from '@onepiecetcg/shared';
import type { ValidatedGameDeck } from '../../deck/deck.service';
import { DuelRoomSeatBootstrap } from './duel-room-seat-bootstrap';

const leader: Card = {
  id: 'L-001',
  number: 'L-001',
  name: 'Leader',
  type: 'Leader',
  colors: ['Red'],
  cost: null,
  power: 5000,
  life: 4,
  counter: null,
  attributes: [],
  families: [],
  text: '',
  trigger: null,
  imageUrl: null,
  set: { id: 'TEST', name: 'Test' },
  rarity: null,
};

const character: Card = {
  ...leader,
  id: 'C-001',
  number: 'C-001',
  name: 'Character',
  type: 'Character',
  cost: 1,
  power: 1000,
  life: null,
  counter: 1000,
};

function createGameDeck(): ValidatedGameDeck {
  return {
    id: 'deck-a',
    name: 'Deck A',
    ownerAuthUserId: 'owner-auth-user-id',
    leader,
    cards: [
      { ...character, id: 'C-001', number: 'C-001', copyIndex: 1 },
      { ...character, id: 'C-002', number: 'C-002', copyIndex: 2 },
    ],
  };
}

describe('DuelRoomSeatBootstrap', () => {
  it('creates a ready player from a validated deck', () => {
    const syncZoneCounts = jest.fn();
    const bootstrap = new DuelRoomSeatBootstrap({
      syncZoneCounts,
      broadcastCardView: jest.fn(),
    });

    const player = bootstrap.createPlayer(
      { sessionId: 'session-a' },
      { displayName: '  Alice  ' },
      createGameDeck(),
    );

    expect(player.sessionId).toBe('session-a');
    expect(player.displayName).toBe('Alice');
    expect(player.deckId).toBe('deck-a');
    expect(player.ready).toBe(true);
    expect(player.zones.leader.instanceId).toBe('session-a:leader:L-001');
    expect(player.zones.leader.cardId).toBe('L-001');
    expect(player.zones.deck).toHaveLength(2);
    expect(player.zones.deck[0]?.privateToOwner).toBe(true);
    expect(player.zones.donDeck).toHaveLength(10);
    expect(player.zones.donDeck[0]?.instanceId).toBe('session-a:don:1');
    expect(syncZoneCounts).toHaveBeenCalledWith(player);
  });

  it('rejects missing display names instead of generating one on the fly', () => {
    const bootstrap = new DuelRoomSeatBootstrap({
      syncZoneCounts: jest.fn(),
      broadcastCardView: jest.fn(),
    });

    expect(() =>
      bootstrap.createPlayer(
        { sessionId: 'session-a' },
        { displayName: '   ' },
        createGameDeck(),
      ),
    ).toThrow('Nom de joueur requis');

    expect(() =>
      bootstrap.createPlayer(
        { sessionId: 'session-a' },
        {},
        createGameDeck(),
      ),
    ).toThrow('Nom de joueur requis');
  });

  it("initializes the joining client's StateView and publishes public cards", () => {
    const broadcastCardView = jest.fn();
    const bootstrap = new DuelRoomSeatBootstrap({
      syncZoneCounts: jest.fn(),
      broadcastCardView,
    });
    const joiningPlayer = bootstrap.createPlayer(
      { sessionId: 'session-a' },
      { displayName: 'Alice' },
      createGameDeck(),
    );
    const existingPlayer = new DuelPlayer();
    existingPlayer.sessionId = 'session-b';
    existingPlayer.zones.leader.instanceId = 'session-b:leader:L-001';
    existingPlayer.zones.leader.cardId = 'L-001';
    existingPlayer.zones.donDeck.push(
      ...joiningPlayer.zones.donDeck.slice(0, 2).map((card, index) => {
        const clone = card.clone();
        clone.instanceId = `session-b:don:${index + 1}`;
        clone.ownerSessionId = 'session-b';
        return clone;
      }),
    );

    const client: { view?: StateView } = {};
    bootstrap.initializeClientView(client, joiningPlayer, [
      joiningPlayer,
      existingPlayer,
    ]);

    expect(client.view).toBeInstanceOf(StateView);
    expect(client.view?.has(joiningPlayer.zones.deck[0])).toBe(true);
    expect(client.view?.has(joiningPlayer.zones.deck[1])).toBe(true);
    expect(client.view?.has(existingPlayer.zones.leader)).toBe(true);
    expect(client.view?.has(existingPlayer.zones.donDeck[0])).toBe(true);
    expect(client.view?.has(existingPlayer.zones.donDeck[1])).toBe(true);

    expect(broadcastCardView).toHaveBeenCalledWith(joiningPlayer.zones.leader);
    expect(broadcastCardView).toHaveBeenCalledTimes(
      1 + joiningPlayer.zones.donDeck.length,
    );
  });
});
