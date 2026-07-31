import { describe, expect, it } from 'vitest';
import { DuelCard, DuelPlayer, DuelState } from '@onepiecetcg/shared';
import {
  captureDuelRoomCardKeywordSnapshot,
  iterateDuelPlayerCards,
  restoreDuelRoomCardKeywordSnapshot,
} from './duel-card-keyword-snapshot.js';

function createCard(instanceId: string): DuelCard {
  const card = new DuelCard();
  card.instanceId = instanceId;
  card.ownerSessionId = 'session-a';
  card.cardId = `card-${instanceId}`;
  card.name = instanceId;

  return card;
}

function createPlayer(): DuelPlayer {
  const player = new DuelPlayer();
  player.sessionId = 'session-a';
  player.displayName = 'Alice';
  player.zones.leader = createCard('leader-1');

  return player;
}

describe('duel-card-keyword-snapshot', () => {
  it('iterates leader, occupied stage, and all zone cards', () => {
    const player = createPlayer();
    player.zones.stage = createCard('stage-1');
    player.zones.deck.push(createCard('deck-1'));
    player.zones.hand.push(createCard('hand-1'));
    player.zones.characters.push(createCard('char-1'));

    expect(Array.from(iterateDuelPlayerCards(player), (card) => card.instanceId))
      .toEqual(['leader-1', 'stage-1', 'deck-1', 'hand-1', 'char-1']);
  });

  it('restores truthy keyword flags and max skip refresh count', () => {
    const state = new DuelState();
    const player = createPlayer();
    const card = createCard('char-1');
    card.hasRush = true;
    card.cannotAttack = true;
    card.skipNextRefreshPhases = 2;
    player.zones.characters.push(card);
    state.players.set(player.sessionId, player);

    const snapshot = captureDuelRoomCardKeywordSnapshot(state);

    card.hasRush = false;
    card.cannotAttack = false;
    card.skipNextRefreshPhases = 1;

    restoreDuelRoomCardKeywordSnapshot(state, snapshot);

    expect(card.hasRush).toBe(true);
    expect(card.cannotAttack).toBe(true);
    expect(card.skipNextRefreshPhases).toBe(2);
  });

  it('does not revive cards missing from the snapshot', () => {
    const state = new DuelState();
    const player = createPlayer();
    const card = createCard('char-1');
    player.zones.characters.push(card);
    state.players.set(player.sessionId, player);

    restoreDuelRoomCardKeywordSnapshot(state, new Map());

    expect(card.hasRush).toBe(false);
    expect(card.skipNextRefreshPhases).toBe(0);
  });
});
