import { describe, expect, it, vi } from 'vitest';
import { createDuelEffectEngineHost } from './duel-effect-engine-host.js';

describe('createDuelEffectEngineHost', () => {
  it('exposes explicit card patch commands from the duel runtime', () => {
    const patchCardStatus = vi.fn();
    const patchCardStats = vi.fn();
    const setZoneOrder = vi.fn().mockReturnValue(true);

    const host = createDuelEffectEngineHost({
      state: {} as never,
      addLog: vi.fn(),
      getPlayer: vi.fn(),
      getOpponentSessionId: vi.fn(),
      getCard: vi.fn(),
      getCards: vi.fn().mockReturnValue([]),
      playCard: vi.fn().mockReturnValue(true),
      moveCard: vi.fn(),
      setZoneOrder,
      shuffleDeck: vi.fn(),
      drawCard: vi.fn().mockReturnValue(null),
      trashTopDeckCards: vi.fn().mockReturnValue([]),
      addDonToCost: vi.fn().mockReturnValue(0),
      attachDon: vi.fn().mockReturnValue(0),
      returnDonToDonDeck: vi.fn().mockReturnValue(0),
      koCharacter: vi.fn().mockReturnValue(false),
      syncPlayer: vi.fn(),
      patchCardStatus,
      patchCardStats,
    });

    host.patchCardStatus?.('card-1', {
      faceDown: true,
      rested: true,
      effectNegated: true,
    });
    host.patchCardStats?.('card-1', { basePower: 7000, attachedDon: 2 });
    host.setZoneOrder('player-1', 'life', ['life-2', 'life-1'], {
      faceDown: true,
    });

    expect(patchCardStatus).toHaveBeenCalledWith('card-1', {
      faceDown: true,
      rested: true,
      effectNegated: true,
    });
    expect(patchCardStats).toHaveBeenCalledWith('card-1', {
      basePower: 7000,
      attachedDon: 2,
    });
    expect(setZoneOrder).toHaveBeenCalledWith(
      'player-1',
      'life',
      ['life-2', 'life-1'],
      { faceDown: true },
    );
  });
});
