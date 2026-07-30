import type { Card } from '@onepiecetcg/shared';
import { DuelPlayer, DuelState, createDuelCard } from '@onepiecetcg/shared';
import { DuelRoomEffectBoundary } from './duel-room-effect-boundary';

jest.mock('@onepiecetcg/shared', () => {
  const sharedMock: typeof import('../../deck/shared-test.mock') =
    jest.requireActual('../../deck/shared-test.mock');

  return sharedMock;
});

const leader: Card = {
  id: 'L-001',
  number: 'L-001',
  name: 'Leader',
  type: 'Leader',
  colors: ['Red'],
  cost: null,
  power: 5000,
  life: 5,
  counter: null,
  attributes: [],
  families: [],
  text: '',
  trigger: null,
  imageUrl: null,
  set: { id: 'TEST', name: 'Test' },
  rarity: null,
};

const vanillaLifeCard: Card = {
  ...leader,
  id: 'C-001',
  number: 'C-001',
  name: 'Vanilla Life',
  type: 'Character',
  cost: 1,
  power: 1000,
  life: null,
  counter: 1000,
};

const manualTriggerLifeCard: Card = {
  ...vanillaLifeCard,
  id: 'TRIGGER-MANUAL',
  number: 'TRIGGER-MANUAL',
  name: 'Manual Trigger',
  trigger: 'Do something manually.',
};

const localTriggerLifeCard: Card = {
  ...vanillaLifeCard,
  id: 'OP01-057',
  number: 'OP01-057',
  name: 'Basil Hawkins',
  trigger: 'Play this card.',
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
  return player;
}

function createBoundaryFixture() {
  const state = new DuelState();
  const logs: string[] = [];
  const synced: string[] = [];
  const broadcasted: string[] = [];
  const alice = createPlayer('alice', 'Alice');
  const bob = createPlayer('bob', 'Bob');

  state.players.set(alice.sessionId, alice);
  state.players.set(bob.sessionId, bob);

  const boundary = new DuelRoomEffectBoundary({
    state,
    addLog: (message) => {
      logs.push(message);
    },
    getPlayer: (sessionId) => state.players.get(sessionId),
    getOpponentSessionId: (sessionId) =>
      sessionId === alice.sessionId ? bob.sessionId : alice.sessionId,
    getCard: () => null,
    getCards: () => [],
    moveCard: () => undefined,
    shuffleDeck: () => undefined,
    drawCard: () => null,
    trashTopDeckCards: () => [],
    addDonToCost: () => 0,
    attachDon: () => 0,
    returnDonToDonDeck: () => 0,
    koCharacter: () => undefined,
    syncPlayer: (sessionId) => {
      synced.push(sessionId);
    },
    broadcastCardView: (card) => {
      broadcasted.push(card.instanceId);
    },
  });

  return { state, logs, synced, broadcasted, alice, bob, boundary };
}

describe('DuelRoomEffectBoundary', () => {
  it('keeps vanilla life cards structural by adding them to hand', () => {
    const { alice, boundary, synced } = createBoundaryFixture();
    const revealedCard = createDuelCard(
      vanillaLifeCard,
      'alice:life:1',
      alice.sessionId,
    );

    const result = boundary.resolveRevealedLifeCard(alice, revealedCard);

    expect(result).toBe('addedToHand');
    expect(alice.zones.hand).toContain(revealedCard);
    expect(synced).toEqual([alice.sessionId]);
    expect(boundary.hasPendingPlayerInteraction()).toBe(false);
  });

  it('isolates manual trigger fallback until the defender answers', () => {
    const { alice, boundary, logs, synced, broadcasted, state } =
      createBoundaryFixture();
    const revealedCard = createDuelCard(
      manualTriggerLifeCard,
      'alice:life:2',
      alice.sessionId,
    );

    const result = boundary.resolveRevealedLifeCard(alice, revealedCard);

    expect(result).toBe('manualFallback');
    expect(boundary.hasPendingPlayerInteraction()).toBe(true);
    expect(state.combat.awaitingTriggerDecision).toBe(true);

    const wrongPlayer = boundary.resolveManualTriggerDecision('bob', true);
    expect(wrongPlayer).toEqual({
      ok: false,
      error: "Seul le defenseur peut decider d'activer ce Declenchement.",
    });

    const resolved = boundary.resolveManualTriggerDecision(
      alice.sessionId,
      true,
    );
    expect(resolved).toEqual({ ok: true });
    expect(alice.zones.trash).toContain(revealedCard);
    expect(broadcasted).toEqual([revealedCard.instanceId]);
    expect(synced).toEqual([alice.sessionId]);
    expect(logs.at(-1)).toContain('effet a appliquer manuellement');
    expect(boundary.hasPendingPlayerInteraction()).toBe(false);
    expect(state.combat.awaitingTriggerDecision).toBe(false);
  });

  it('routes local trigger definitions through the effect engine boundary', () => {
    const { alice, boundary, broadcasted, synced } = createBoundaryFixture();
    const revealedCard = createDuelCard(
      localTriggerLifeCard,
      'alice:life:3',
      alice.sessionId,
    );

    const result = boundary.resolveRevealedLifeCard(alice, revealedCard);

    expect(result).toBe('engineTrigger');
    expect(alice.zones.trash).toContain(revealedCard);
    expect(broadcasted).toEqual([revealedCard.instanceId]);
    expect(synced).toEqual([]);
    expect(boundary.hasPendingPlayerInteraction()).toBe(false);
  });
});
