import { describe, expect, it } from 'vitest';
import {
  DuelCard,
  DuelLog,
  DuelPlayer,
  DuelState,
  adoptDuelState,
  cloneDuelState,
} from './duel-state-schema.js';

function createCard(instanceId: string, ownerSessionId: string): DuelCard {
  const card = new DuelCard();
  card.instanceId = instanceId;
  card.ownerSessionId = ownerSessionId;
  card.cardId = `${instanceId}-card`;
  card.number = `${instanceId}-number`;
  card.name = `${instanceId}-name`;
  card.type = 'Character';
  card.colors.push('Red');
  card.attributes.push('Slash');
  card.families.push('Straw Hat Crew');
  card.text = 'Test';
  card.rested = true;
  card.attachedDon = 2;
  card.playedThisTurn = true;

  return card;
}

function createPlayer(sessionId: string): DuelPlayer {
  const player = new DuelPlayer();
  player.sessionId = sessionId;
  player.displayName = `Player ${sessionId}`;
  player.deckId = `deck-${sessionId}`;
  player.ready = true;
  player.connected = true;
  player.mulliganDecided = true;
  player.hasTakenFirstTurn = true;
  player.zones.leader = createCard(`${sessionId}-leader`, sessionId);
  player.zones.stage = createCard(`${sessionId}-stage`, sessionId);
  player.zones.deck.push(createCard(`${sessionId}-deck-1`, sessionId));
  player.zones.hand.push(createCard(`${sessionId}-hand-1`, sessionId));
  player.zones.life.push(createCard(`${sessionId}-life-1`, sessionId));
  player.zones.characters.push(createCard(`${sessionId}-char-1`, sessionId));
  player.zones.cost.push(createCard(`${sessionId}-cost-1`, sessionId));
  player.zones.trash.push(createCard(`${sessionId}-trash-1`, sessionId));
  player.handCount = player.zones.hand.length;
  player.deckCount = player.zones.deck.length;
  player.lifeCount = player.zones.life.length;

  return player;
}

function createState(): DuelState {
  const state = new DuelState();
  state.phase = 'main';
  state.activePlayerSessionId = 'session-a';
  state.turn = 3;
  state.startedAt = '2026-07-30T10:00:00.000Z';
  state.finishedAt = '';
  state.startingPlayerSessionId = 'session-a';
  state.firstPlayerSessionId = 'session-a';
  state.pendingExtraTurnSessionId = '';
  state.players.set('session-a', createPlayer('session-a'));
  state.players.set('session-b', createPlayer('session-b'));
  const log = new DuelLog();
  log.id = 'log-1';
  log.message = 'hello';
  log.createdAt = '2026-07-30T10:00:01.000Z';
  state.logs.push(log);
  state.combat.attackerSessionId = 'session-a';
  state.combat.attackerInstanceId = 'session-a-char-1';
  state.combat.defenderSessionId = 'session-b';
  state.combat.targetType = 'leader';
  state.combat.targetInstanceId = 'session-b-leader';
  state.combat.step = 'blocked';
  state.combat.counterPowerBonus = 1000;

  return state;
}

describe('cloneDuelState', () => {
  it('deep clones nested schemas so mutations do not affect the source', () => {
    const source = createState();
    const cloned = cloneDuelState(source);

    cloned.phase = 'end';
    cloned.players.get('session-a')?.zones.hand[0] &&
      (cloned.players.get('session-a')!.zones.hand[0].name = 'Changed');
    cloned.logs[0] && (cloned.logs[0].message = 'changed');
    cloned.combat.counterPowerBonus = 2000;

    expect(cloned).not.toBe(source);
    expect(cloned.players.get('session-a')).not.toBe(
      source.players.get('session-a'),
    );
    expect(source.phase).toBe('main');
    expect(source.players.get('session-a')?.zones.hand[0]?.name).toBe(
      'session-a-hand-1-name',
    );
    expect(source.logs[0]?.message).toBe('hello');
    expect(source.combat.counterPowerBonus).toBe(1000);
  });
});

describe('adoptDuelState', () => {
  it('replaces a live state content while preserving the original root identity', () => {
    const liveState = createState();
    const workingCopy = cloneDuelState(liveState);

    workingCopy.phase = 'finished';
    workingCopy.turn = 4;
    workingCopy.winnerSessionId = 'session-a';
    workingCopy.endReason = 'life';
    workingCopy.players.get('session-a')?.zones.characters.push(
      createCard('session-a-char-2', 'session-a'),
    );
    workingCopy.logs.push(
      Object.assign(new DuelLog(), {
        id: 'log-2',
        message: 'adopted',
        createdAt: '2026-07-30T10:00:02.000Z',
      }),
    );

    const adopted = adoptDuelState(liveState, workingCopy);

    expect(adopted).toBe(liveState);
    expect(liveState.phase).toBe('finished');
    expect(liveState.turn).toBe(4);
    expect(liveState.winnerSessionId).toBe('session-a');
    expect(liveState.endReason).toBe('life');
    expect(liveState.players.get('session-a')?.zones.characters).toHaveLength(2);
    expect(liveState.logs).toHaveLength(2);
    expect(liveState.players.get('session-a')).not.toBe(
      workingCopy.players.get('session-a'),
    );
  });
});
