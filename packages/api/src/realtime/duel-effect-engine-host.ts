import type {
  DuelCard,
  DuelPlayer,
  DuelState,
  PendingEffectDecision,
  EffectTargetSelector,
} from '@onepiecetcg/shared';
import type { EffectEngineHost } from '../card-effect/effect-engine';

/**
 * Runtime dependencies needed to build the authoritative effect-engine host
 * for the duel server.
 */
export type DuelEffectEngineHostDeps = {
  state: DuelState;
  addLog: (message: string) => void;
  onPendingEffectDecisionChange?: (
    decision: PendingEffectDecision | null,
  ) => void;
  getPlayer: (sessionId: string) => DuelPlayer | undefined;
  getOpponentSessionId: (sessionId: string) => string | null;
  getCard: (instanceId: string) => DuelCard | null;
  getCards: (
    selector: EffectTargetSelector,
    controllerSessionId: string,
  ) => DuelCard[];
  moveCard: EffectEngineHost['moveCard'];
  shuffleDeck: (playerSessionId: string) => void;
  drawCard: (playerSessionId: string) => DuelCard | null;
  trashTopDeckCards: (playerSessionId: string, amount: number) => DuelCard[];
  addDonToCost: (
    playerSessionId: string,
    amount: number,
    rested: boolean,
  ) => number;
  attachDon: EffectEngineHost['attachDon'];
  returnDonToDonDeck: (playerSessionId: string, amount: number) => number;
  koCharacter: EffectEngineHost['koCharacter'];
  syncPlayer: (playerSessionId: string) => void;
};

/**
 * Builds the `EffectEngineHost` adapter from duel runtime dependencies so the
 * boundary stays focused on event translation rather than host wiring.
 */
export function createDuelEffectEngineHost(
  deps: DuelEffectEngineHostDeps,
): EffectEngineHost {
  return {
    state: deps.state,
    addLog: deps.addLog,
    onPendingDecisionChange: (decision) =>
      deps.onPendingEffectDecisionChange?.(decision),
    getPlayer: deps.getPlayer,
    getOpponentSessionId: deps.getOpponentSessionId,
    getCard: deps.getCard,
    getCards: deps.getCards,
    moveCard: deps.moveCard,
    shuffleDeck: deps.shuffleDeck,
    drawCard: deps.drawCard,
    trashTopDeckCards: deps.trashTopDeckCards,
    addDonToCost: deps.addDonToCost,
    attachDon: deps.attachDon,
    returnDonToDonDeck: deps.returnDonToDonDeck,
    koCharacter: deps.koCharacter,
    syncPlayer: deps.syncPlayer,
  };
}
