import { DuelCard, DuelPlayer, DuelState } from '@onepiecetcg/shared';
import { DuelRoomEventDraftFacade } from './duel-room-event-draft-facade';

function createPlayer(sessionId: string): DuelPlayer {
  const player = new DuelPlayer();
  player.sessionId = sessionId;
  player.displayName = sessionId;
  player.zones.leader.instanceId = `leader-${sessionId}`;
  player.zones.leader.cardId = `leader-card-${sessionId}`;
  return player;
}

describe('duel-room-event-draft-facade', () => {
  it('captures snapshots and delegates draft building with player ids', () => {
    const state = new DuelState();
    const player = createPlayer('session-a');
    const card = new DuelCard();

    card.instanceId = 'card-1';
    card.cardId = 'card-def-1';
    player.zones.hand.push(card);
    state.players.set(player.sessionId, player);
    state.phase = 'main';
    state.turn = 2;
    state.activePlayerSessionId = player.sessionId;

    const facade = new DuelRoomEventDraftFacade(
      (sessionId) => `player:${sessionId}`,
    );

    const snapshot = facade.captureStateSnapshot(state);
    const locations = facade.captureCardLocations(state);
    const costRest = facade.captureCostZoneRestSnapshot(state);
    const foundCard = facade.findCardByInstanceId(state, 'card-1');
    const terminalDrafts = facade.buildTerminalEventDrafts(
      {
        ...snapshot,
        phase: 'main',
        endReason: '',
        winnerSessionId: '',
      },
      state,
    );

    expect(snapshot.turn).toBe(2);
    expect(locations.get('card-1')).toEqual({
      ownerSessionId: 'session-a',
      zone: 'hand',
      cardId: 'card-def-1',
    });
    expect(costRest.size).toBe(0);
    expect(foundCard).toBe(card);
    expect(terminalDrafts).toEqual([]);
  });

  it('builds movement drafts through the shared player-id resolver', () => {
    const before = new Map([
      [
        'card-1',
        {
          ownerSessionId: 'session-a',
          zone: 'deck',
          cardId: 'card-def-1',
        },
      ],
    ]);
    const state = new DuelState();
    const player = createPlayer('session-a');
    const card = new DuelCard();

    card.instanceId = 'card-1';
    card.cardId = 'card-def-1';
    player.zones.hand.push(card);
    state.players.set(player.sessionId, player);

    const facade = new DuelRoomEventDraftFacade(
      (sessionId) => `player:${sessionId}`,
    );

    expect(
      facade.buildCardMovementDrafts(before, new Map(), new Map(), state),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          payload: expect.objectContaining({
            playerId: 'player:session-a',
            cardInstanceId: 'card-1',
          }),
        }),
      ]),
    );
  });
});
