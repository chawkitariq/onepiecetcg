import type {
  EffectDecisionResponse,
  EffectKeyword,
  EffectTargetSelector,
  PendingEffectDecision,
  StandardEffectDefinition,
} from '@onepiecetcg/shared';
import type {
  DuelCard,
  DuelPlayer,
  DuelState,
  GameZone,
} from '@onepiecetcg/shared';

/**
 * Gameplay event windows that can enqueue one or more authored card effects.
 */
export type EffectEventType =
  | 'onPlay'
  | 'activateCounter'
  | 'onEventActivated'
  | 'onCardRemovedByEffect'
  | 'onCharacterPlayed'
  | 'onDonAttached'
  | 'onDonReturned'
  | 'onBattleKo'
  | 'onLifeDamageDealt'
  | 'onCardDrawn'
  | 'whenAttacking'
  | 'onAttacked'
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
  targetInstanceId?: string;
  targetCardId?: string;
  sourceZone?: GameZone;
  destinationZone?: GameZone;
  effectControllerSessionId?: string;
  playedByEffect?: boolean;
};

/**
 * Replacement hook queries emitted by structural gameplay resolution.
 */
export type ReplacementQuery = {
  type: 'wouldKoCharacter' | 'wouldMoveCard';
  playerSessionId: string;
  sourceInstanceId: string;
  targetInstanceId?: string;
  targetCardId?: string;
  destinationPlayerSessionId?: string;
  destinationZone?: string;
  reason?: 'battle' | 'effect';
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
  sourceCard?: DuelCard;
  definition: StandardEffectDefinition;
  triggeringEvent?: EffectEvent;
};

export type PendingDecisionState = {
  decision: PendingEffectDecision;
  continuation: (response: EffectDecisionResponse) => void;
};

export type SerializedQueuedEffect = Omit<QueuedEffect, 'sourceCard'>;

export type EffectModifierEngineState = {
  modifiers: RuntimeModifier[];
  costModifiers: RuntimeCostModifier[];
  keywordModifiers: RuntimeKeywordModifier[];
  playerRestrictions: RuntimePlayerRestriction[];
  nextPlayCostModifiers: RuntimeNextPlayCostModifier[];
  delayedMovesAtEndOfBattle: RuntimeDelayedMove[];
};

export type EffectEngineState = {
  queue: SerializedQueuedEffect[];
  delayedTurnEndQueue: SerializedQueuedEffect[];
  resolvedOncePerTurnKeys: string[];
  modifiers: EffectModifierEngineState;
  cannotRestKeys: string[];
};

export type EffectResolutionContext = {
  sourceInstanceId: string;
  storedSelections: Record<string, DuelCard[]>;
  eventTargetInstanceId?: string;
  triggeringEvent?: EffectEvent;
};

export type EffectEngineCardStatusPatch = {
  rested?: boolean;
  playedThisTurn?: boolean;
  cannotAttack?: boolean;
  cannotAttackLeaderOnTurnPlayed?: boolean;
  cannotBlock?: boolean;
  cannotBeKoedInBattle?: boolean;
  cannotBeKoedByEffects?: boolean;
  cannotBeKoedBySlashInBattle?: boolean;
  cannotBeKoedByStrikeInBattle?: boolean;
  hasRush?: boolean;
  hasDoubleAttack?: boolean;
  hasBanish?: boolean;
  canAttackActiveCharacters?: boolean;
  mustBeAttackTarget?: boolean;
  winOnDeckOut?: boolean;
  cannotBeRemovedByOpponentEffects?: boolean;
  effectNegated?: boolean;
  cannotAttackUntilTurn?: number;
  skipNextRefreshPhases?: number;
};

export type EffectEngineCardStatPatch = {
  baseCost?: number;
  basePower?: number;
  power?: number;
  cost?: number;
  attachedDon?: number;
};

export type EffectEnginePlayerStatusPatch = {
  cannotPlayCharacters?: boolean;
};

export interface EffectEngineQueryPort {
  state: DuelState;
  getPlayer(sessionId: string): DuelPlayer | undefined;
  getOpponentSessionId(sessionId: string): string | null;
  getCard(instanceId: string): DuelCard | null;
  getCards(
    selector: EffectTargetSelector,
    controllerSessionId: string,
  ): DuelCard[];
}

export interface EffectEngineCommandPort {
  addLog(message: string): void;
  onPendingDecisionChange?(decision: PendingEffectDecision | null): void;
  playCard?(
    card: DuelCard,
    playerSessionId: string,
    zone: 'characters' | 'stage',
    options?: { rested?: boolean },
  ): boolean;
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
  patchPlayerStatus?(
    playerSessionId: string,
    patch: EffectEnginePlayerStatusPatch,
  ): DuelPlayer | undefined;
  patchCardStatus?(
    instanceId: string,
    patch: EffectEngineCardStatusPatch,
  ): DuelCard | null;
  patchCardStats?(
    instanceId: string,
    patch: EffectEngineCardStatPatch,
  ): DuelCard | null;
}

/**
 * Host adapter used by the effect engine so the duel room remains the
 * Colyseus/network boundary while gameplay resolution stays testable.
 */
export interface EffectEngineHost
  extends EffectEngineQueryPort,
    EffectEngineCommandPort {}
