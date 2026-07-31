import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Card } from '@onepiecetcg/shared';
import { DuelPlayer, DuelState, createDuelCard } from '@onepiecetcg/shared';
import { DuelTurnEngine, type DuelTurnEngineDeps } from './duel-turn-engine.js';

const leader: Card = {
  id: 'L-001',
  number: 'L-001',
  name: 'Leader',
  type: 'Leader',
  colors: ['Red'],
  cost: null,
  power: 5000,
  life: 1,
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

function createPlayer(sessionId: string, displayName: string): DuelPlayer {
  const player = new DuelPlayer();
  player.sessionId = sessionId;
  player.displayName = displayName;
  player.zones.leader = createDuelCard(
    leader,
    `${sessionId}:leader`,
    sessionId,
  );

  for (let index = 0; index < 6; index += 1) {
    player.zones.deck.push(
      createDuelCard(
        {
          ...character,
          id: `${character.id}-${sessionId}-${index}`,
          number: `${character.number}-${index}`,
        },
        `${sessionId}:deck:${index + 1}`,
        sessionId,
        true,
      ),
    );
  }

  return player;
}

function createDeps(): {
  deps: DuelTurnEngineDeps;
  state: DuelState;
  addLog: ReturnType<typeof vi.fn>;
  effectBoundary: DuelTurnEngineDeps['effectBoundary'];
  emitWindowEffects: ReturnType<typeof vi.fn>;
  onMatchStarted: ReturnType<typeof vi.fn>;
} {
  const state = new DuelState();
  state.players.set('session-a', createPlayer('session-a', 'Alice'));
  state.players.set('session-b', createPlayer('session-b', 'Bob'));
  const addLog = vi.fn();
  const emitWindowEffects = vi.fn();
  const effectBoundary = {
    emitWindowEffects,
    clearTurnModifiers: vi.fn(),
    clearTurnStartModifiers: vi.fn(),
    reapplyContinuousEffects: vi.fn(),
    hasPendingPlayerInteraction: vi.fn(() => false),
  };
  const onMatchStarted = vi.fn();

  return {
    deps: {
      state,
      maxClients: 2,
      effectBoundary,
      addLog,
      shuffle: vi.fn(),
      syncZoneCounts: vi.fn(),
      returnDonToCost: vi.fn(),
      getOpponentSessionId: (sessionId) =>
        sessionId === 'session-a' ? 'session-b' : 'session-a',
      isCombatInProgress: vi.fn(() => false),
      finalizeMatch: vi.fn(),
      recordMatchResult: vi.fn(),
      onMatchStarted,
    },
    state,
    addLog,
    effectBoundary,
    emitWindowEffects,
    onMatchStarted,
  };
}

describe('DuelTurnEngine', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes the game by dealing hands and entering mulligan setup', () => {
    const { deps, state, addLog } = createDeps();
    const engine = new DuelTurnEngine(deps);
    vi.spyOn(Math, 'random').mockReturnValue(0);

    engine.initializeGame();

    expect(state.phase).toBe('mulligan');
    expect(state.startingPlayerSessionId).toBe('session-a');
    expect(state.players.get('session-a')?.zones.hand).toHaveLength(5);
    expect(state.players.get('session-a')?.zones.deck).toHaveLength(1);
    expect(state.players.get('session-b')?.zones.hand).toHaveLength(5);
    expect(addLog).toHaveBeenCalledWith(
      'Alice a ete designe pour choisir de jouer en premier ou en second.',
      'session-a',
    );
  });

  it('starts the first turn once both mulligans are decided', () => {
    const { deps, state, emitWindowEffects, onMatchStarted } = createDeps();
    const engine = new DuelTurnEngine(deps);
    vi.spyOn(Math, 'random').mockReturnValue(0);
    engine.initializeGame();

    engine.handleChooseFirstOrSecond('session-a', 'first');
    engine.handleMulligan('session-a', false);
    engine.handleMulligan('session-b', false);

    expect(state.firstPlayerSessionId).toBe('session-a');
    expect(state.turn).toBe(1);
    expect(state.phase).toBe('refresh');
    expect(state.activePlayerSessionId).toBe('session-a');
    expect(state.players.get('session-a')?.zones.life).toHaveLength(1);
    expect(state.players.get('session-b')?.zones.life).toHaveLength(1);
    expect(onMatchStarted).toHaveBeenCalledTimes(1);
    expect(emitWindowEffects).toHaveBeenCalledWith(
      'onTurnStart',
      'session-a',
    );
  });

  it('awards the win to the drawing player when their Leader has winOnDeckOut', () => {
    const { deps, state } = createDeps();
    const engine = new DuelTurnEngine(deps);
    vi.spyOn(Math, 'random').mockReturnValue(0);
    engine.initializeGame();

    engine.handleChooseFirstOrSecond('session-a', 'first');
    engine.handleMulligan('session-a', false);
    engine.handleMulligan('session-b', false);

    const activePlayer = state.players.get('session-a');
    expect(activePlayer).toBeDefined();
    activePlayer!.zones.leader.winOnDeckOut = true;
    activePlayer!.zones.deck.splice(0);
    state.turn = 2;
    state.phase = 'refresh';
    state.activePlayerSessionId = 'session-a';

    const result = engine.handleEndPhase('session-a');

    expect(result).toBeNull();
    expect(deps.finalizeMatch).toHaveBeenCalledWith('deckOut', 'session-a');
    expect(deps.recordMatchResult).toHaveBeenCalledTimes(1);
  });

  it('grants the same player an extra turn when one is pending at end of turn', () => {
    const { deps, state, effectBoundary } = createDeps();
    const engine = new DuelTurnEngine(deps);

    state.activePlayerSessionId = 'session-a';
    state.phase = 'end';
    state.turn = 4;
    state.pendingExtraTurnSessionId = 'session-a';

    const result = engine.handleEndPhase('session-a');

    expect(result).toBeNull();
    expect(state.pendingExtraTurnSessionId).toBe('');
    expect(state.activePlayerSessionId).toBe('session-a');
    expect(state.turn).toBe(5);
    expect(state.phase).toBe('refresh');
    expect(effectBoundary.reapplyContinuousEffects).toHaveBeenCalledTimes(1);
    expect(effectBoundary.emitWindowEffects).toHaveBeenCalledWith(
      'onTurnStart',
      'session-a',
    );
  });
});
