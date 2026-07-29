import { describe, expect, it, jest } from '@jest/globals';
import {
  DuelPlayer,
  DuelState,
  createDuelCard,
  type Card,
} from '@onepiecetcg/shared';
import { DuelZoneEngine } from './duel-zone-engine';

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
  it('skips a move when a replacement effect handles it first', () => {
    const state = new DuelState();
    const sourcePlayer = createPlayer('p1');
    const targetPlayer = createPlayer('p2');
    state.players.set(sourcePlayer.sessionId, sourcePlayer);
    state.players.set(targetPlayer.sessionId, targetPlayer);

    const effectBoundary = {
      reapplyContinuousEffects: jest.fn(),
      applyMoveReplacement: jest.fn(() => true),
    };

    const zoneEngine = new DuelZoneEngine({
      state,
      effectBoundary,
      broadcastCardView: jest.fn(),
      syncZoneCounts: jest.fn(),
      findCardInZone: jest.fn(() => null),
      takeAttachableDonCards: jest.fn(() => []),
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
});
