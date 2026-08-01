jest.mock('@onepiecetcg/cards/effects', () => ({
  loadEffectSources: () => ({ definitions: [], specialHandlers: [] }),
}));

import { DuelCard, DuelPlayer, DuelState } from '@onepiecetcg/shared';
import { DuelEffectBoundary } from '@onepiecetcg/duel-engine';
import {
  createIsolatedDuelRoomKoRuntime,
  createLiveDuelRoomKoRuntime,
} from './duel-room-ko-runtime';
import { DuelRoomStateServices } from './duel-room-state-services';

function createEffectBoundary(state: DuelState): DuelEffectBoundary {
  return new DuelEffectBoundary({
    state,
    addLog: () => undefined,
    onPendingEffectDecisionChange: () => undefined,
    getPlayer: () => undefined,
    getOpponentSessionId: () => '',
    getCard: () => null,
    getCards: () => [],
    playCard: () => false,
    moveCard: () => false,
    setZoneOrder: () => false,
    shuffleDeck: () => undefined,
    drawCard: () => null,
    trashTopDeckCards: () => [],
    addDonToCost: () => 0,
    attachDon: () => 0,
    returnDonToDonDeck: () => 0,
    koCharacter: () => false,
    syncPlayer: () => undefined,
    patchPlayerStatus: () => undefined,
    patchCardStatus: () => null,
    getZoneCards: () => [],
    getZoneOwnerSessionId: () => null,
    revealCard: () => undefined,
    clearTemporaryReveal: () => undefined,
    clearAllTemporaryReveals: () => undefined,
    getTopCards: () => [],
    findZone: () => null,
  });
}

describe('duel-room-ko-runtime', () => {
  it('builds live KO callbacks with live logging deps', () => {
    const state = new DuelState();
    const player = new DuelPlayer();
    player.sessionId = 'session-a';
    const card = new DuelCard();
    card.instanceId = 'card-a';
    player.zones.characters.push(card);
    state.players.set(player.sessionId, player);
    const effectBoundary = createEffectBoundary(state);
    const stateServices = new DuelRoomStateServices({
      liveState: state,
      disconnectRoom: jest.fn(),
      logLiveMessage: jest.fn(),
      reportMatchResultError: jest.fn(),
      unshiftIntoTrash: (owner, movedCard) =>
        owner.zones.trash.unshift(movedCard),
    });

    const runtime = createLiveDuelRoomKoRuntime({
      stateServices,
      state,
      effectBoundary,
    });

    runtime.knockOutCharacter(player, card, 'effect');

    expect(player.zones.characters).toHaveLength(0);
    expect(player.zones.trash[0]).toBe(card);
    expect(state.logs).toHaveLength(1);
  });

  it('builds isolated KO callbacks with isolated logging deps', () => {
    const liveState = new DuelState();
    const isolatedState = new DuelState();
    const player = new DuelPlayer();
    player.sessionId = 'session-a';
    const card = new DuelCard();
    card.instanceId = 'card-a';
    player.zones.characters.push(card);
    isolatedState.players.set(player.sessionId, player);
    const effectBoundary = createEffectBoundary(isolatedState);
    const stateServices = new DuelRoomStateServices({
      liveState,
      disconnectRoom: jest.fn(),
      logLiveMessage: jest.fn(),
      reportMatchResultError: jest.fn(),
      unshiftIntoTrash: (owner, movedCard) =>
        owner.zones.trash.unshift(movedCard),
    });

    const runtime = createIsolatedDuelRoomKoRuntime({
      stateServices,
    });

    runtime.knockOutCharacter(
      isolatedState,
      effectBoundary,
      player,
      card,
      'battle',
    );

    expect(player.zones.characters).toHaveLength(0);
    expect(player.zones.trash[0]).toBe(card);
    expect(isolatedState.logs).toHaveLength(1);
    expect(liveState.logs).toHaveLength(0);
  });
});
