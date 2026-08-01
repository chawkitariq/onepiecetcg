import type {
  DuelCard,
  DuelPlayer,
  DuelState,
  EffectDecisionResponse,
  EffectTargetSelector,
  GameZone,
  PendingEffectDecision,
} from '@onepiecetcg/shared';

export type EffectEngineCardStatusPatch = {
  faceDown?: boolean;
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

export type DuelEngineCardEventType = string;

export type DuelEngineCardEventContext = {
  sourceZone?: GameZone;
  targetInstanceId?: string;
  targetCardId?: string;
  playedByEffect?: boolean;
};

export type DuelEngineEffectBoundaryDeps = {
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
  playCard: (
    card: DuelCard,
    playerSessionId: string,
    zone: 'characters' | 'stage',
    options?: { rested?: boolean },
  ) => boolean;
  moveCard: (
    card: DuelCard,
    destinationPlayerSessionId: string,
    destinationZone: string,
    options?: { faceDown?: boolean; rested?: boolean; toBottom?: boolean },
  ) => void;
  setZoneOrder: (
    playerSessionId: string,
    zone: Extract<GameZone, 'deck' | 'life'>,
    orderedInstanceIds: string[],
    options?: { faceDown?: boolean },
  ) => boolean;
  shuffleDeck: (playerSessionId: string) => void;
  drawCard: (playerSessionId: string) => DuelCard | null;
  trashTopDeckCards: (playerSessionId: string, amount: number) => DuelCard[];
  addDonToCost: (
    playerSessionId: string,
    amount: number,
    rested: boolean,
  ) => number;
  attachDon: (
    playerSessionId: string,
    targetInstanceId: string,
    amount: number,
    options?: { rested?: boolean },
  ) => number;
  returnDonToDonDeck: (playerSessionId: string, amount: number) => number;
  koCharacter: (
    playerSessionId: string,
    instanceId: string,
    reason: 'battle' | 'effect',
  ) => boolean;
  syncPlayer: (playerSessionId: string) => void;
  patchPlayerStatus?: (
    playerSessionId: string,
    patch: { cannotPlayCharacters?: boolean },
  ) => DuelPlayer | undefined;
  patchCardStatus?: (
    instanceId: string,
    patch: EffectEngineCardStatusPatch,
  ) => DuelCard | null;
  patchCardStats?: (
    instanceId: string,
    patch: EffectEngineCardStatPatch,
  ) => DuelCard | null;
  broadcastCardView: (card: DuelCard) => void;
};

export type DuelEngineEffectBoundary = {
  hasPendingPlayerInteraction(): boolean;
  getPendingEffectDecision(): PendingEffectDecision | null;
  answerEffectDecision(response: EffectDecisionResponse): void;
  reapplyContinuousEffects(): void;
  clearTurnModifiers(): void;
  clearTurnStartModifiers(playerSessionId: string): void;
  clearCombatModifiers(): void;
  exportState(): unknown;
  importState(state: unknown): void;
  applyKoReplacement(
    playerSessionId: string,
    sourceInstanceId: string,
    reason: 'battle' | 'effect',
  ): boolean;
  applyMoveReplacement(
    playerSessionId: string,
    sourceInstanceId: string,
    destinationPlayerSessionId: string,
    destinationZone: string,
  ): boolean;
  emitCardEvent(
    event: DuelEngineCardEventType,
    playerSessionId: string,
    card: DuelCard,
    context?: DuelEngineCardEventContext,
  ): void;
  emitWindowEffects(
    type: 'onTurnStart' | 'onTurnEnd',
    playerSessionId: string,
  ): void;
  emitPlayedCard(
    playerSessionId: string,
    card: DuelCard,
    sourceZone?: 'hand' | 'deck' | 'trash',
  ): void;
  emitDonAttached(playerSessionId: string, card: DuelCard): void;
  emitDonReturned(playerSessionId: string, card: DuelCard): void;
  emitBattleKo(playerSessionId: string, card: DuelCard): void;
  getNextPlayCostModifier(card: DuelCard): number;
  consumeNextPlayCostModifier(card: DuelCard): void;
  hasCounterEffect(cardId: string): boolean;
  emitCounterUsage(playerSessionId: string, card: DuelCard): void;
  resolveRevealedLifeCard(
    defender: DuelPlayer,
    revealedCard: DuelCard,
  ): 'addedToHand' | 'engineTrigger' | 'manualFallback';
  resolveManualTriggerDecision(
    playerSessionId: string,
    activate: boolean,
  ): { ok: true } | { ok: false; error: string };
};
