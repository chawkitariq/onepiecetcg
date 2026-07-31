import { DuelCard, DuelPlayer, DuelState } from '@onepiecetcg/shared';
import type { DuelDomainEventsService } from '../../duel-events/duel-domain-events.service';
import { DuelRoomEventOutbox } from './duel-room-event-outbox';

function createCard(instanceId: string): DuelCard {
  const card = new DuelCard();
  card.instanceId = instanceId;
  card.cardId = `card-${instanceId}`;
  card.ownerSessionId = 'session-a';
  card.name = instanceId;

  return card;
}

function createPlayer(sessionId = 'session-a'): DuelPlayer {
  const player = new DuelPlayer();
  player.sessionId = sessionId;
  player.displayName = sessionId;
  player.deckId = `${sessionId}-deck`;
  player.zones.leader = createCard(`${sessionId}-leader`);
  player.zones.hand.push(createCard(`${sessionId}-hand-1`));

  return player;
}

function createService() {
  return {
    createStream: jest.fn().mockResolvedValue(undefined),
    record: jest.fn().mockResolvedValue(undefined),
  } as unknown as Pick<DuelDomainEventsService, 'createStream' | 'record'>;
}

describe('DuelRoomEventOutbox', () => {
  it('creates the stream once and records initial drafts', async () => {
    const state = new DuelState();
    state.players.set('session-a', createPlayer());
    const service = createService();
    const outbox = new DuelRoomEventOutbox({
      duelEventsService: service as DuelDomainEventsService,
      roomId: 'room-1',
      getPlayerId: (sessionId) => `player:${sessionId}`,
      listParticipants: () => [
        { authUserId: 'user-a', playerId: 'player:session-a' },
      ],
      createCommandId: () => 'cmd-1',
      createActionId: () => 'act-1',
      reportPersistError: () => undefined,
    });

    await outbox.ensureInitialized(state);
    await outbox.ensureInitialized(state);

    expect(service.createStream).toHaveBeenCalledTimes(1);
    expect(service.record).toHaveBeenCalledTimes(1);
    expect(service.record).toHaveBeenCalledWith(
      expect.objectContaining({
        matchId: 'room-1',
        actorPlayerId: undefined,
        commandId: 'cmd-1',
        actionId: 'act-1',
        eventDrafts: expect.arrayContaining([
          expect.objectContaining({ type: 'PlayerJoined' }),
          expect.objectContaining({ type: 'DeckLocked' }),
          expect.objectContaining({ type: 'OpeningHandDrawn' }),
        ]),
      }),
    );
  });

  it('swallows record errors only in record()', async () => {
    const service = createService();
    const reportPersistError = jest.fn();
    (service.record as jest.Mock).mockRejectedValueOnce(new Error('outbox down'));
    const outbox = new DuelRoomEventOutbox({
      duelEventsService: service as DuelDomainEventsService,
      roomId: 'room-1',
      getPlayerId: (sessionId) => `player:${sessionId}`,
      listParticipants: () => [],
      createCommandId: () => 'cmd-1',
      createActionId: () => 'act-1',
      reportPersistError,
    });

    outbox.markStreamCreated();
    await outbox.record('session-a', [
      {
        type: 'TurnStarted',
        version: 1,
        payload: { turn: 1, playerId: 'player:session-a' },
      },
    ]);

    expect(reportPersistError).toHaveBeenCalledTimes(1);
  });

  it('rethrows errors in recordOrThrow()', async () => {
    const service = createService();
    (service.record as jest.Mock).mockRejectedValueOnce(new Error('outbox down'));
    const outbox = new DuelRoomEventOutbox({
      duelEventsService: service as DuelDomainEventsService,
      roomId: 'room-1',
      getPlayerId: (sessionId) => `player:${sessionId}`,
      listParticipants: () => [],
      createCommandId: () => 'cmd-1',
      createActionId: () => 'act-1',
      reportPersistError: () => undefined,
    });

    outbox.markStreamCreated();

    await expect(
      outbox.recordOrThrow('session-a', [
        {
          type: 'TurnStarted',
          version: 1,
          payload: { turn: 1, playerId: 'player:session-a' },
        },
      ]),
    ).rejects.toThrow('outbox down');
  });
});
