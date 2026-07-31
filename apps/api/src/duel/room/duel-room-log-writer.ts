import { DuelLog, type DuelLogLevel, type DuelState } from '@onepiecetcg/shared';

/**
 * Appends one replicated duel-room log entry onto the provided duel state.
 */
export function appendDuelRoomLog(
  state: DuelState,
  message: string,
  level: DuelLogLevel = 'info',
  actorSessionId = '',
): DuelLog {
  const log = new DuelLog();
  log.id = `${Date.now()}:${state.logs.length}`;
  log.message = message;
  log.level = level;
  log.actorSessionId = actorSessionId;
  log.createdAt = new Date().toISOString();
  state.logs.push(log);

  return log;
}
