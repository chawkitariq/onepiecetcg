import { describe, expect, it, vi } from 'vitest';
import {
  DuelPlayer,
  DuelState,
  createDuelCard,
  type Card,
} from '@onepiecetcg/shared';
import { DuelZoneEngine } from './duel-zone-engine.js';

const card: Card = {
  id: 'C-001',
  number: 'C-001',
  name: 'Card',
  type: 'Character',
  colors: ['Red'],
  cost: 1,
  power: 1000,
  life: null,
  counter: 1000,
  attributes: [],
  families: [],
  text: '',
  trigger: null,
  imageUrl: null,
  set: { id: 'TEST', name: 'Test' },
  rarity: null,
};

function createPlayer(sessionId: string): DuelPlayer {
  const player = new DuelPlayer();
  player.sessionId = sessionId;
  player.displayName = sessionId;
  player.zones.leader = createDuelCard(
    {
      ...card,
      id: `${sessionId}-leader`,
      number: `${sessionId}-leader`,
      type: 'Leader',
    },
    `${sessionId}:leader`,
    sessionId,
  );
  return player;
}

describe('DuelZoneEngine', () => {
  function createZoneEngineFixture() {
    const state = new DuelState();
    const player = createPlayer('p1');
    const effectBoundary = {
      reapplyContinuousEffects: vi.fn(),
      applyMoveReplacement: vi.fn(() => false),
    };
    const broadcastCardView = vi.fn();
    const syncZoneCounts = vi.fn();
    const zoneEngine = new DuelZoneEngine({
      state,
      effectBoundary,
      broadcastCardView,
      syncZoneCounts,
      findCardInZone: vi.fn(() => null),
      takeAttachableDonCards: vi.fn(() => []),
    });

    state.players.set(player.sessionId, player);

    return {
      player,
      effectBoundary,
      broadcastCardView,
      syncZoneCounts,
      zoneEngine,
    };
  }

  it('skips a move when a replacement effect handles it first', () => {
    const state = new DuelState();
    const sourcePlayer = createPlayer('p1');
    const targetPlayer = createPlayer('p2');
    state.players.set(sourcePlayer.sessionId, sourcePlayer);
    state.players.set(targetPlayer.sessionId, targetPlayer);

    const effectBoundary = {
      reapplyContinuousEffects: vi.fn(),
      applyMoveReplacement: vi.fn(() => true),
    };

    const zoneEngine = new DuelZoneEngine({
      state,
      effectBoundary,
      broadcastCardView: vi.fn(),
      syncZoneCounts: vi.fn(),
      findCardInZone: vi.fn(() => null),
      takeAttachableDonCards: vi.fn(() => []),
    });

    const source = createDuelCard(card, 'p1:card', 'p1');
    sourcePlayer.zones.characters.push(source);

    zoneEngine.moveCardToZone(source, 'p1', 'trash');

    expect(effectBoundary.applyMoveReplacement).toHaveBeenCalledWith(
      'p1',
      source.instanceId,
      'p1',
      'trash',
    );
    expect(sourcePlayer.zones.characters).toContain(source);
    expect(sourcePlayer.zones.trash).toHaveLength(0);
  });

  it('reorders a hidden zone through an explicit duel command', () => {
    const { player, effectBoundary, broadcastCardView, syncZoneCounts, zoneEngine } =
      createZoneEngineFixture();
    const first = createDuelCard(card, 'p1:life:1', 'p1');
    const second = createDuelCard(card, 'p1:life:2', 'p1');
    first.faceDown = false;
    second.faceDown = false;
    player.zones.life.push(first, second);

    const reordered = zoneEngine.setZoneOrder(
      player.sessionId,
      'life',
      [second.instanceId, first.instanceId],
      { faceDown: true },
    );

    expect(reordered).toBe(true);
    expect(Array.from(player.zones.life, (lifeCard) => lifeCard.instanceId)).toEqual(
      [second.instanceId, first.instanceId],
    );
    expect(first.faceDown).toBe(true);
    expect(second.faceDown).toBe(true);
    expect(broadcastCardView).toHaveBeenCalledTimes(2);
    expect(syncZoneCounts).toHaveBeenCalledWith(player);
    expect(effectBoundary.reapplyContinuousEffects).toHaveBeenCalled();
  });

  it('rejects zone reorder requests that do not describe the full zone', () => {
    const { player, zoneEngine } = createZoneEngineFixture();
    const first = createDuelCard(card, 'p1:life:1', 'p1');
    const second = createDuelCard(card, 'p1:life:2', 'p1');
    player.zones.life.push(first, second);

    const reordered = zoneEngine.setZoneOrder(player.sessionId, 'life', [
      second.instanceId,
    ]);

    expect(reordered).toBe(false);
    expect(Array.from(player.zones.life, (lifeCard) => lifeCard.instanceId)).toEqual(
      [first.instanceId, second.instanceId],
    );
  });
});
