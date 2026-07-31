import { DuelCard, DuelPlayer, DuelState } from '@onepiecetcg/shared';
import { DuelRoomEffectBoundary } from '../effects/duel-room-effect-boundary';
import { createDuelRoomCharacterKoDeps } from './duel-room-character-ko-deps';

describe('duel-room-character-ko-deps', () => {
  it('forwards stateful KO callbacks to the provided room adapters', () => {
    const state = new DuelState();
    const effectBoundary = new DuelRoomEffectBoundary({
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
    const addLog = jest.fn<
      void,
      [string, 'action' | 'effect' | 'system', string]
    >();
    const unshiftIntoTrash = jest.fn<void, [DuelPlayer, DuelCard]>();
    const player = new DuelPlayer();
    const card = new DuelCard();

    const deps = createDuelRoomCharacterKoDeps({
      state,
      effectBoundary,
      addLog,
      unshiftIntoTrash,
    });

    deps.addLog('message', 'action', 'p1');
    deps.unshiftIntoTrash(player, card);

    expect(deps.state).toBe(state);
    expect(deps.effectBoundary).toBe(effectBoundary);
    expect(addLog).toHaveBeenCalledWith('message', 'action', 'p1');
    expect(unshiftIntoTrash).toHaveBeenCalledWith(player, card);
  });
});
