import { DuelCard, DuelPlayer, DuelState } from '@onepiecetcg/shared';
import { rebuildDuelRoomClientViews } from './duel-room-client-view-builder';

function createCard(instanceId: string): DuelCard {
  const card = new DuelCard();
  card.instanceId = instanceId;
  card.cardId = `card-${instanceId}`;
  card.ownerSessionId = 'session-a';
  card.name = instanceId;

  return card;
}

function createPlayer(sessionId: string): DuelPlayer {
  const player = new DuelPlayer();
  player.sessionId = sessionId;
  player.displayName = sessionId;
  player.zones.leader = createCard(`${sessionId}-leader`);

  return player;
}

describe('rebuildDuelRoomClientViews', () => {
  it('rebuilds independent StateView instances for every client', () => {
    const state = new DuelState();
    const alice = createPlayer('session-a');
    const bob = createPlayer('session-b');
    alice.zones.stage = createCard('stage-a');
    alice.zones.donDeck.push(createCard('don-a'));
    alice.zones.characters.push(createCard('char-a'));
    alice.zones.cost.push(createCard('cost-a'));
    alice.zones.trash.push(createCard('trash-a'));
    alice.zones.deck.push(createCard('deck-a'));
    alice.zones.hand.push(createCard('hand-a'));
    alice.zones.life.push(createCard('life-a'));
    state.players.set(alice.sessionId, alice);
    state.players.set(bob.sessionId, bob);

    const aliceClient = { sessionId: 'session-a', view: undefined as any };
    const bobClient = { sessionId: 'session-b', view: undefined as any };

    rebuildDuelRoomClientViews([aliceClient, bobClient], state);

    expect(aliceClient.view).toBeTruthy();
    expect(bobClient.view).toBeTruthy();
    expect(aliceClient.view).not.toBe(bobClient.view);
    expect(aliceClient.view.constructor.name).toBe('StateView');
    expect(bobClient.view.constructor.name).toBe('StateView');
  });
});
