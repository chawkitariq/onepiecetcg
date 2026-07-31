import { DuelState } from '@onepiecetcg/shared';
import { DuelRoomEventStream } from './duel-room-event-stream';

describe('duel-room-event-stream', () => {
  it('delegates ensureInitialized, record, and recordOrThrow to the outbox', async () => {
    const ensureInitialized = jest.fn().mockResolvedValue(undefined);
    const record = jest.fn().mockResolvedValue(undefined);
    const recordOrThrow = jest.fn().mockResolvedValue(undefined);
    const stream = new DuelRoomEventStream({
      ensureInitialized,
      record,
      recordOrThrow,
    } as never);
    const state = new DuelState();
    const drafts = [
      {
        type: 'TurnStarted',
        version: 1,
        payload: { turn: 1, playerId: 'player:session-a' },
      },
    ];

    await stream.ensureInitialized(state);
    await stream.record('session-a', drafts);
    await stream.recordOrThrow('session-b', drafts);

    expect(ensureInitialized).toHaveBeenCalledWith(state);
    expect(record).toHaveBeenCalledWith('session-a', drafts);
    expect(recordOrThrow).toHaveBeenCalledWith('session-b', drafts);
  });
});
