import { createDuelEffectEngineHost } from './duel-effect-engine-host';

describe('createDuelEffectEngineHost', () => {
  it('exposes explicit card patch commands from the duel runtime', () => {
    const patchCardStatus = jest.fn();
    const patchCardStats = jest.fn();

    const host = createDuelEffectEngineHost({
      state: {} as never,
      addLog: jest.fn(),
      getPlayer: jest.fn(),
      getOpponentSessionId: jest.fn(),
      getCard: jest.fn(),
      getCards: jest.fn().mockReturnValue([]),
      playCard: jest.fn().mockReturnValue(true),
      moveCard: jest.fn(),
      shuffleDeck: jest.fn(),
      drawCard: jest.fn().mockReturnValue(null),
      trashTopDeckCards: jest.fn().mockReturnValue([]),
      addDonToCost: jest.fn().mockReturnValue(0),
      attachDon: jest.fn().mockReturnValue(0),
      returnDonToDonDeck: jest.fn().mockReturnValue(0),
      koCharacter: jest.fn().mockReturnValue(false),
      syncPlayer: jest.fn(),
      patchCardStatus,
      patchCardStats,
    });

    host.patchCardStatus?.('card-1', { rested: true, effectNegated: true });
    host.patchCardStats?.('card-1', { basePower: 7000, attachedDon: 2 });

    expect(patchCardStatus).toHaveBeenCalledWith('card-1', {
      rested: true,
      effectNegated: true,
    });
    expect(patchCardStats).toHaveBeenCalledWith('card-1', {
      basePower: 7000,
      attachedDon: 2,
    });
  });
});
