import type {
  EffectDecisionResponse,
  EffectKeyword,
  EffectTargetSelector,
  PendingEffectDecision,
  StandardEffectDefinition,
} from '@onepiecetcg/shared';
import type { DuelCard, DuelPlayer, DuelState } from '@onepiecetcg/shared';

/**
 * Gameplay event windows that can enqueue one or more authored card effects.
 */
export type EffectEventType =
  | 'onPlay'
  | 'activateCounter'
  | 'onEventActivated'
  | 'onCharacterPlayed'
  | 'onDonAttached'
  | 'onDonReturned'
  | 'onBattleKo'
  | 'whenAttacking'
  | 'onKo'
  | 'trigger'
  | 'onBlock'
  | 'onTurnStart'
  | 'onTurnEnd'
  | 'activateMain';

/**
 * Runtime event payload dispatched by the duel room into the effect engine.
 */
export type EffectEvent = {
  type: EffectEventType;
  playerSessionId: string;
  sourceInstanceId: string;
  sourceCardId: string;
};

/**
 * Replacement hook queries emitted by structural gameplay resolution.
 */
export type ReplacementQuery = {
  type: 'wouldKoCharacter';
  playerSessionId: string;
  sourceInstanceId: string;
  reason: 'battle' | 'effect';
};

export type RuntimeModifier = {
  sourceInstanceId: string;
  targetInstanceId: string;
  amount: number;
  expiresAtEndOfTurn: boolean;
  expiresAtEndOfBattle: boolean;
  expiresAtTurnStartOfPlayerSessionId?: string;
};

export type RuntimeCostModifier = {
  sourceInstanceId: string;
  targetInstanceId: string;
  amount: number;
  expiresAtEndOfTurn: boolean;
  expiresAtEndOfBattle: boolean;
  expiresAtTurnStartOfPlayerSessionId?: string;
};

export type RuntimeKeywordModifier = {
  sourceInstanceId: string;
  targetInstanceId: string;
  keywords: EffectKeyword[];
  expiresAtEndOfTurn: boolean;
  expiresAtEndOfBattle: boolean;
  expiresAtTurnStartOfPlayerSessionId?: string;
};

export type RuntimePlayerRestriction = {
  playerSessionId: string;
  type: 'preventOwnEffectLifeToHand';
  expiresAtEndOfTurn: boolean;
  expiresAtTurnStartOfPlayerSessionId?: string;
};

export type RuntimeNextPlayCostModifier = {
  playerSessionId: string;
  sourceInstanceId: string;
  sourceZone: 'hand';
  filter: import('@onepiecetcg/shared').EffectCardFilter;
  amount: number;
};

export type RuntimeDelayedMove = {
  targetInstanceId: string;
  destinationPlayerSessionId: string;
  destinationZone: string;
  faceDown?: boolean;
  rested?: boolean;
  toBottom?: boolean;
};

export type QueuedEffect = {
  controllerSessionId: string;
  sourceInstanceId: string;
  sourceCardId: string;
  definition: StandardEffectDefinition;
};

export type PendingDecisionState = {
  decision: PendingEffectDecision;
  continuation: (response: EffectDecisionResponse) => void;
};

export type EffectResolutionContext = {
  sourceInstanceId: string;
  storedSelections: Record<string, DuelCard[]>;
};

/**
 * Host adapter used by the effect engine so the duel room remains the
 * Colyseus/network boundary while gameplay resolution stays testable.
 */
export interface EffectEngineHost {
  state: DuelState;
  addLog(message: string): void;
  onPendingDecisionChange?(decision: PendingEffectDecision | null): void;
  getPlayer(sessionId: string): DuelPlayer | undefined;
  getOpponentSessionId(sessionId: string): string | null;
  getCard(instanceId: string): DuelCard | null;
  getCards(
    selector: EffectTargetSelector,
    controllerSessionId: string,
  ): DuelCard[];
  moveCard(
    card: DuelCard,
    destinationPlayerSessionId: string,
    destinationZone: string,
    options?: { faceDown?: boolean; rested?: boolean; toBottom?: boolean },
  ): void;
  shuffleDeck(playerSessionId: string): void;
  drawCard(playerSessionId: string): DuelCard | null;
  trashTopDeckCards(playerSessionId: string, amount: number): DuelCard[];
  addDonToCost(
    playerSessionId: string,
    amount: number,
    rested: boolean,
  ): number;
  attachDon(
    playerSessionId: string,
    targetInstanceId: string,
    amount: number,
    options?: { rested?: boolean },
  ): number;
  returnDonToDonDeck(playerSessionId: string, amount: number): number;
  koCharacter(
    playerSessionId: string,
    instanceId: string,
    reason: 'battle' | 'effect',
  ): boolean;
  syncPlayer(playerSessionId: string): void;
}
