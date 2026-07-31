import { DuelCard, DuelPlayer, DuelState } from '@onepiecetcg/shared';
import {
  captureCardLocations,
  captureCostZoneRestSnapshot,
  captureDuelStateSnapshot,
  captureOrderedZoneSnapshot,
  countNewlyRestedCostDonCards,
  findCardByInstanceId,
  findMovedCards,
  inferZonePlacement,
  toEventZoneName,
} from './duel-room-state-snapshot';

function createCard(instanceId: string, cardId = `card-${instanceId}`): DuelCard {
  const card = new DuelCard();
  card.instanceId = instanceId;
  card.cardId = cardId;
  card.ownerSessionId = 'session-a';
  card.name = instanceId;

  return card;
}

function createPlayer(sessionId = 'session-a'): DuelPlayer {
  const player = new DuelPlayer();
  player.sessionId = sessionId;
  player.displayName = sessionId;
  player.zones.leader = createCard(`${sessionId}-leader`);

  return player;
}

describe('duel-room-state-snapshot', () => {
  it('captures the minimal duel state transition snapshot', () => {
    const state = new DuelState();
    state.phase = 'main';
    state.turn = 3;
    state.activePlayerSessionId = 'session-a';
    state.startedAt = '2026-07-31T09:00:00.000Z';
    state.winnerSessionId = 'session-b';
    state.endReason = 'life';

    expect(captureDuelStateSnapshot(state)).toEqual({
      phase: 'main',
      turn: 3,
      activePlayerSessionId: 'session-a',
      startedAt: '2026-07-31T09:00:00.000Z',
      winnerSessionId: 'session-b',
      endReason: 'life',
    });
  });

  it('captures card locations and detects moved cards', () => {
    const beforeState = new DuelState();
    const player = createPlayer();
    const card = createCard('char-1');
    player.zones.hand.push(card);
    beforeState.players.set(player.sessionId, player);
    const before = captureCardLocations(beforeState);

    const afterState = new DuelState();
    const afterPlayer = createPlayer();
    afterPlayer.zones.characters.push(card);
    afterState.players.set(afterPlayer.sessionId, afterPlayer);
    const after = captureCardLocations(afterState);

    expect(findMovedCards(before, after)).toEqual([
      {
        instanceId: 'char-1',
        from: {
          ownerSessionId: 'session-a',
          zone: 'hand',
          cardId: 'card-char-1',
        },
        to: {
          ownerSessionId: 'session-a',
          zone: 'characters',
          cardId: 'card-char-1',
        },
      },
    ]);
  });

  it('infers ordered-zone placement and deck rest changes', () => {
    const player = createPlayer();
    const top = createCard('top');
    const middle = createCard('middle');
    const bottom = createCard('bottom');
    player.zones.deck.push(top, middle, bottom);
    const state = new DuelState();
    state.players.set(player.sessionId, player);

    expect(captureOrderedZoneSnapshot(state, 'deck').get(player.sessionId)).toEqual(
      ['top', 'middle', 'bottom'],
    );
    expect(
      inferZonePlacement('top', player.zones.deck, ['middle', 'bottom']),
    ).toBe('top');
    expect(
      inferZonePlacement('bottom', player.zones.deck, ['top', 'middle']),
    ).toBe('bottom');

    const don = createCard('don-1');
    don.rested = false;
    player.zones.cost.push(don);
    const beforeRest = captureCostZoneRestSnapshot(state);
    don.rested = true;

    expect(
      countNewlyRestedCostDonCards(beforeRest, state, player.sessionId),
    ).toBe(1);
  });

  it('finds cards globally and maps event zone names', () => {
    const state = new DuelState();
    const player = createPlayer();
    const stage = createCard('stage-1');
    player.zones.stage = stage;
    state.players.set(player.sessionId, player);

    expect(findCardByInstanceId(state, 'stage-1')).toBe(stage);
    expect(toEventZoneName('stage')).toBe('STAGE_AREA');
    expect(toEventZoneName('trash')).toBe('TRASH');
  });
});
