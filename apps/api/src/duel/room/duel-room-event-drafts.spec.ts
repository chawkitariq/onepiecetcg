import { DuelCard, DuelPlayer, DuelState } from '@onepiecetcg/shared';
import {
  buildCardMovementDrafts,
  buildInitialEventStreamDrafts,
  buildMulliganEventDrafts,
  buildTerminalEventDrafts,
  buildTurnStepDrafts,
  buildTurnTransitionDrafts,
} from './duel-room-event-drafts';
import {
  captureCardLocations,
  captureDuelStateSnapshot,
  captureOrderedZoneSnapshot,
  captureRefreshStepSnapshot,
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
  player.deckId = `${sessionId}-deck`;
  player.zones.leader = createCard(`${sessionId}-leader`);

  return player;
}

const deps = {
  getPlayerId: (sessionId: string) => `player:${sessionId}`,
};

describe('duel-room-event-drafts', () => {
  it('builds mulligan and match start drafts', () => {
    const before = {
      phase: 'mulligan' as const,
      turn: 0,
      activePlayerSessionId: '',
      startedAt: '',
      winnerSessionId: '',
      endReason: '',
    };
    const state = new DuelState();
    state.startedAt = '2026-07-31T09:00:00.000Z';
    state.turn = 1;
    state.phase = 'refresh';
    state.activePlayerSessionId = 'session-a';
    state.firstPlayerSessionId = 'session-a';

    expect(
      buildMulliganEventDrafts(deps, before, state, 'session-a', true).map(
        (draft) => draft.type,
      ),
    ).toEqual([
      'MulliganRequested',
      'DeckShuffled',
      'MulliganResolved',
      'MatchStarted',
      'TurnStarted',
      'PhaseChanged',
    ]);
  });

  it('builds turn transition and terminal drafts', () => {
    const before = {
      phase: 'end' as const,
      turn: 1,
      activePlayerSessionId: 'session-a',
      startedAt: '2026-07-31T09:00:00.000Z',
      winnerSessionId: '',
      endReason: '',
    };
    const state = new DuelState();
    state.turn = 2;
    state.phase = 'refresh';
    state.activePlayerSessionId = 'session-b';

    expect(buildTurnTransitionDrafts(deps, before, state).map((draft) => draft.type))
      .toEqual(['TurnEnded', 'TurnStarted', 'PhaseChanged']);

    state.phase = 'finished';
    state.winnerSessionId = 'session-b';
    state.endReason = 'life';
    state.finishedAt = '2026-07-31T09:30:00.000Z';

    expect(buildTerminalEventDrafts(deps, before, state)).toEqual([
      {
        type: 'MatchEnded',
        version: 1,
        payload: {
          winnerPlayerId: 'player:session-b',
          endReason: 'life',
          finishedAt: '2026-07-31T09:30:00.000Z',
        },
      },
    ]);
  });

  it('builds turn step drafts for draw, don, and refresh', () => {
    const beforeState = new DuelState();
    const beforePlayer = createPlayer();
    const drawCard = createCard('draw-1');
    const donCard = createCard('don-1');
    const attachedCard = createCard('char-1');
    attachedCard.attachedDon = 1;
    beforePlayer.zones.deck.push(drawCard);
    beforePlayer.zones.donDeck.push(donCard);
    beforePlayer.zones.characters.push(attachedCard);
    beforeState.players.set(beforePlayer.sessionId, beforePlayer);

    const drawState = new DuelState();
    const drawPlayer = createPlayer();
    drawPlayer.zones.hand.push(drawCard);
    drawState.phase = 'draw';
    drawState.players.set(drawPlayer.sessionId, drawPlayer);

    expect(
      buildTurnStepDrafts(
        deps,
        { ...captureDuelStateSnapshot(beforeState), phase: 'refresh' },
        captureCardLocations(beforeState),
        captureRefreshStepSnapshot(beforeState),
        drawState,
      ).map((draft) => draft.type),
    ).toEqual(['CardDrawn']);

    const donState = new DuelState();
    const donPlayer = createPlayer();
    donPlayer.zones.cost.push(donCard);
    donState.phase = 'don';
    donState.players.set(donPlayer.sessionId, donPlayer);

    expect(
      buildTurnStepDrafts(
        deps,
        { ...captureDuelStateSnapshot(beforeState), phase: 'draw' },
        captureCardLocations(beforeState),
        captureRefreshStepSnapshot(beforeState),
        donState,
      ).map((draft) => draft.type),
    ).toEqual(['DonAdded']);

    const refreshState = new DuelState();
    const refreshPlayer = createPlayer();
    const refreshedDon = createCard('rested-1');
    refreshedDon.rested = false;
    const detachedCharacter = createCard('char-1');
    detachedCharacter.attachedDon = 0;
    refreshState.phase = 'refresh';
    refreshPlayer.zones.characters.push(detachedCharacter);
    refreshPlayer.zones.cost.push(refreshedDon);
    refreshState.players.set(refreshPlayer.sessionId, refreshPlayer);
    const refreshBeforeState = new DuelState();
    const refreshBeforePlayer = createPlayer();
    const beforeRefreshedDon = createCard('rested-1');
    beforeRefreshedDon.rested = true;
    const beforeDetachedCharacter = createCard('char-1');
    beforeDetachedCharacter.attachedDon = 2;
    refreshBeforePlayer.zones.characters.push(beforeDetachedCharacter);
    refreshBeforePlayer.zones.cost.push(beforeRefreshedDon);
    refreshBeforeState.players.set(refreshBeforePlayer.sessionId, refreshBeforePlayer);

    expect(
      buildTurnStepDrafts(
        deps,
        { ...captureDuelStateSnapshot(refreshBeforeState), phase: 'end' },
        captureCardLocations(refreshBeforeState),
        captureRefreshStepSnapshot(refreshBeforeState),
        refreshState,
      ).map((draft) => draft.type),
    ).toEqual(['DonDetached', 'DonRefreshed']);
  });

  it('builds movement and initialization drafts', () => {
    const beforeState = new DuelState();
    const beforePlayer = createPlayer();
    const returnedCard = createCard('return-1');
    const deckCard = createCard('deck-1');
    const lifeCard = createCard('life-1');
    beforePlayer.zones.characters.push(returnedCard, deckCard, lifeCard);
    beforeState.players.set(beforePlayer.sessionId, beforePlayer);

    const afterState = new DuelState();
    const afterPlayer = createPlayer();
    afterPlayer.zones.hand.push(returnedCard);
    afterPlayer.zones.deck.push(deckCard);
    afterPlayer.zones.life.push(lifeCard);
    afterState.players.set(afterPlayer.sessionId, afterPlayer);

    expect(
      buildCardMovementDrafts(
        deps,
        captureCardLocations(beforeState),
        captureOrderedZoneSnapshot(beforeState, 'deck'),
        captureOrderedZoneSnapshot(beforeState, 'life'),
        afterState,
      ).map((draft) => draft.type),
    ).toEqual([
      'CardMoved',
      'CardReturnedToHand',
      'CardMoved',
      'CardPlacedOnDeck',
      'CardMoved',
      'CardAddedToLife',
    ]);

    const initState = new DuelState();
    const initPlayer = createPlayer();
    initPlayer.zones.hand.push(createCard('hand-1'));
    initState.players.set(initPlayer.sessionId, initPlayer);

    expect(buildInitialEventStreamDrafts(deps, initState).map((draft) => draft.type))
      .toEqual(['PlayerJoined', 'DeckLocked', 'OpeningHandDrawn']);
  });
});
