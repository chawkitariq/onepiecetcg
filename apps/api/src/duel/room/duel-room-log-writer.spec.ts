import { DuelState } from '@onepiecetcg/shared';
import { appendDuelRoomLog } from './duel-room-log-writer';

describe('appendDuelRoomLog', () => {
  it('appends a replicated log entry to the duel state', () => {
    const state = new DuelState();

    const log = appendDuelRoomLog(
      state,
      'Alice joue une carte.',
      'action',
      'session-a',
    );

    expect(state.logs).toHaveLength(1);
    expect(state.logs[0]).toBe(log);
    expect(log.message).toBe('Alice joue une carte.');
    expect(log.level).toBe('action');
    expect(log.actorSessionId).toBe('session-a');
    expect(log.createdAt).toBeTruthy();
  });
});
