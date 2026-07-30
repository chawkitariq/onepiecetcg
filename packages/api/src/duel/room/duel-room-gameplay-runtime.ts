import type {
  DuelCard,
  DuelEndReason,
  DuelLogLevel,
  DuelPlayer,
  DuelState,
  GameZone,
  PendingEffectDecision,
} from '@onepiecetcg/shared';
import { DuelRoomEffectBoundary } from '../effects/duel-room-effect-boundary';
import { DuelCardQueryEngine } from '../game-engine/duel-card-query-engine';
import { DuelCombatEngine } from '../game-engine/duel-combat-engine';
import { DuelMainPhaseEngine } from '../game-engine/duel-main-phase-engine';
import { DuelTurnEngine } from '../game-engine/duel-turn-engine';
import { DuelZoneEngine } from '../game-engine/duel-zone-engine';
import { DuelRoomRuntimeState } from './duel-room-runtime-state';

/**
 * Runtime bundle for one duel-state execution scope. The same factory can wire
 * live room state today and isolated working copies later.
 */
export type DuelRoomGameplayRuntime = {
  effectBoundary: DuelRoomEffectBoundary;
  turnEngine: DuelTurnEngine;
  mainPhaseEngine: DuelMainPhaseEngine;
  combatEngine: DuelCombatEngine;
  zoneEngine: DuelZoneEngine;
  cardQueryEngine: DuelCardQueryEngine;
  runtimeState: DuelRoomRuntimeState;
};

/**
 * Dependencies needed to wire the gameplay helpers for one duel-state scope.
 */
export type CreateDuelRoomGameplayRuntimeInput = {
  state: DuelState;
  maxClients: number;
  addLog: (
    message: string,
    level?: DuelLogLevel,
    actorSessionId?: string,
  ) => void;
  reportMainPhaseError: (message: string) => void;
  reportCombatError: (message: string) => void;
  broadcastCardView: (card: DuelCard) => void;
  onPendingEffectDecisionChange: (
    decision: PendingEffectDecision | null,
  ) => void;
  shuffleCards: (cards: {
    length: number;
    [index: number]: DuelCard | undefined;
  }) => void;
  finalizeMatch: (endReason: DuelEndReason, winnerSessionId: string) => void;
  recordMatchResult: () => void;
  markMatchStarted: (startedAt: Date) => void;
  unshiftIntoTrash: (player: DuelPlayer, card: DuelCard) => void;
  knockOutCharacter: (
    owner: DuelPlayer,
    card: DuelCard,
    reason?: 'battle' | 'effect',
    skipReplacement?: boolean,
  ) => void;
  knockOutCharacterById: (
    playerSessionId: string,
    instanceId: string,
    reason: 'battle' | 'effect',
  ) => boolean;
  isProtectedFromBattleKo: (
    defendingCard: DuelCard,
    attackerCard: DuelCard,
  ) => boolean;
};

/**
 * Creates all state-scoped gameplay helpers used by the duel room.
 */
export function createDuelRoomGameplayRuntime(
  input: CreateDuelRoomGameplayRuntimeInput,
): DuelRoomGameplayRuntime {
  const addActionLog = (message: string, actorSessionId?: string) =>
    input.addLog(message, 'action', actorSessionId);
  const addEffectLog = (message: string) => input.addLog(message, 'effect');
  const addSystemLog = (message: string, actorSessionId?: string) =>
    input.addLog(message, 'system', actorSessionId);
  const runtimeState = new DuelRoomRuntimeState({
    state: input.state,
  });

  const cardQueryEngineRef: { current: DuelCardQueryEngine | null } = {
    current: null,
  };
  const zoneEngineRef: { current: DuelZoneEngine | null } = {
    current: null,
  };

  const findCardZone = (
    instanceId: string,
  ): { playerSessionId: string; zone: GameZone } | null => {
    for (const player of input.state.players.values()) {
      if (player.zones.leader.instanceId === instanceId) {
        return { playerSessionId: player.sessionId, zone: 'leader' };
      }

      if (player.zones.stage.instanceId === instanceId) {
        return { playerSessionId: player.sessionId, zone: 'stage' };
      }

      for (const zone of [
        'deck',
        'donDeck',
        'hand',
        'life',
        'characters',
        'cost',
        'trash',
      ] as const) {
        if (player.zones[zone].some((card) => card.instanceId === instanceId)) {
          return { playerSessionId: player.sessionId, zone };
        }
      }
    }

    return null;
  };

  const effectBoundary = new DuelRoomEffectBoundary({
    state: input.state,
    addLog: addEffectLog,
    onPendingEffectDecisionChange: input.onPendingEffectDecisionChange,
    getPlayer: (sessionId) => input.state.players.get(sessionId),
    getOpponentSessionId: (sessionId) =>
      runtimeState.getOpponentSessionId(sessionId),
    getCard: (instanceId) =>
      cardQueryEngineRef.current?.getCardByInstanceId(instanceId) ?? null,
    getCards: (selector, controllerSessionId) =>
      cardQueryEngineRef.current?.getCardsForSelector(
        selector,
        controllerSessionId,
      ) ?? [],
    playCard: (card, playerSessionId, zone, options) => {
      const player = input.state.players.get(playerSessionId);

      if (!player) {
        return false;
      }

      if (zone === 'characters' && player.zones.characters.length >= 5) {
        return false;
      }

      const originZone = findCardZone(card.instanceId)?.zone;

      if (zone === 'stage' && player.zones.stage.instanceId) {
        zoneEngineRef.current?.moveCardToZone(
          player.zones.stage,
          playerSessionId,
          'trash',
        );
      }

      zoneEngineRef.current?.moveCardToZone(card, playerSessionId, zone, {
        rested: options?.rested ?? false,
      });

      card.playedThisTurn = true;

      if (card.type === 'Character') {
        effectBoundary.emitCardEvent(
          'onCharacterPlayed',
          playerSessionId,
          card,
          {
            sourceZone: originZone,
            playedByEffect: true,
          },
        );
      }

      effectBoundary.emitCardEvent('onPlay', playerSessionId, card, {
        sourceZone: originZone,
        playedByEffect: true,
      });

      return true;
    },
    moveCard: (card, destinationPlayerSessionId, destinationZone, options) =>
      zoneEngineRef.current?.moveCardToZone(
        card,
        destinationPlayerSessionId,
        destinationZone,
        options,
      ),
    shuffleDeck: (playerSessionId) => {
      const player = input.state.players.get(playerSessionId);

      if (player) {
        input.shuffleCards(player.zones.deck);
      }
    },
    drawCard: (playerSessionId) =>
      zoneEngineRef.current?.drawCardForEffect(playerSessionId) ?? null,
    trashTopDeckCards: (playerSessionId, amount) =>
      zoneEngineRef.current?.trashTopDeckCards(playerSessionId, amount) ?? [],
    addDonToCost: (playerSessionId, amount, rested) =>
      zoneEngineRef.current?.addDonToCost(playerSessionId, amount, rested) ?? 0,
    attachDon: (playerSessionId, targetInstanceId, amount, options) =>
      zoneEngineRef.current?.attachDonFromCost(
        playerSessionId,
        targetInstanceId,
        amount,
        options,
      ) ?? 0,
    returnDonToDonDeck: (playerSessionId, amount) => {
      const returned =
        zoneEngineRef.current?.returnEffectDonToDeck(playerSessionId, amount) ??
        0;
      const player = input.state.players.get(playerSessionId);

      if (returned > 0 && player) {
        effectBoundary.emitDonReturned(playerSessionId, player.zones.leader);
      }

      return returned;
    },
    koCharacter: (playerSessionId, instanceId, reason) =>
      input.knockOutCharacterById(playerSessionId, instanceId, reason),
    syncPlayer: (playerSessionId) => {
      const player = input.state.players.get(playerSessionId);

      if (player) {
        runtimeState.syncZoneCounts(player);
      }
    },
    patchPlayerStatus: (playerSessionId, patch) => {
      const player = input.state.players.get(playerSessionId);

      if (!player) {
        return undefined;
      }

      if (patch.cannotPlayCharacters !== undefined) {
        player.cannotPlayCharacters = patch.cannotPlayCharacters;
      }

      return player;
    },
    patchCardStatus: (instanceId, patch) => {
      const card = cardQueryEngineRef.current?.getCardByInstanceId(instanceId);

      if (!card) {
        return null;
      }

      if (patch.rested !== undefined) {
        card.rested = patch.rested;
      }
      if (patch.playedThisTurn !== undefined) {
        card.playedThisTurn = patch.playedThisTurn;
      }
      if (patch.cannotAttack !== undefined) {
        card.cannotAttack = patch.cannotAttack;
      }
      if (patch.cannotAttackLeaderOnTurnPlayed !== undefined) {
        card.cannotAttackLeaderOnTurnPlayed =
          patch.cannotAttackLeaderOnTurnPlayed;
      }
      if (patch.cannotBlock !== undefined) {
        card.cannotBlock = patch.cannotBlock;
      }
      if (patch.cannotBeKoedInBattle !== undefined) {
        card.cannotBeKoedInBattle = patch.cannotBeKoedInBattle;
      }
      if (patch.cannotBeKoedByEffects !== undefined) {
        card.cannotBeKoedByEffects = patch.cannotBeKoedByEffects;
      }
      if (patch.cannotBeKoedBySlashInBattle !== undefined) {
        card.cannotBeKoedBySlashInBattle =
          patch.cannotBeKoedBySlashInBattle;
      }
      if (patch.cannotBeKoedByStrikeInBattle !== undefined) {
        card.cannotBeKoedByStrikeInBattle =
          patch.cannotBeKoedByStrikeInBattle;
      }
      if (patch.hasRush !== undefined) {
        card.hasRush = patch.hasRush;
      }
      if (patch.hasDoubleAttack !== undefined) {
        card.hasDoubleAttack = patch.hasDoubleAttack;
      }
      if (patch.hasBanish !== undefined) {
        card.hasBanish = patch.hasBanish;
      }
      if (patch.canAttackActiveCharacters !== undefined) {
        card.canAttackActiveCharacters = patch.canAttackActiveCharacters;
      }
      if (patch.mustBeAttackTarget !== undefined) {
        card.mustBeAttackTarget = patch.mustBeAttackTarget;
      }
      if (patch.winOnDeckOut !== undefined) {
        card.winOnDeckOut = patch.winOnDeckOut;
      }
      if (patch.cannotBeRemovedByOpponentEffects !== undefined) {
        card.cannotBeRemovedByOpponentEffects =
          patch.cannotBeRemovedByOpponentEffects;
      }
      if (patch.effectNegated !== undefined) {
        card.effectNegated = patch.effectNegated;
      }
      if (patch.cannotAttackUntilTurn !== undefined) {
        card.cannotAttackUntilTurn = patch.cannotAttackUntilTurn;
      }
      if (patch.skipNextRefreshPhases !== undefined) {
        card.skipNextRefreshPhases = patch.skipNextRefreshPhases;
      }

      return card;
    },
    patchCardStats: (instanceId, patch) => {
      const card = cardQueryEngineRef.current?.getCardByInstanceId(instanceId);

      if (!card) {
        return null;
      }

      if (patch.basePower !== undefined) {
        card.basePower = patch.basePower;
      }
      if (patch.baseCost !== undefined) {
        card.baseCost = patch.baseCost;
      }
      if (patch.power !== undefined) {
        card.power = patch.power;
      }
      if (patch.cost !== undefined) {
        card.cost = patch.cost;
      }
      if (patch.attachedDon !== undefined) {
        card.attachedDon = patch.attachedDon;
      }

      return card;
    },
    broadcastCardView: input.broadcastCardView,
  });

  const cardQueryEngine = new DuelCardQueryEngine({
    state: input.state,
    getOpponentSessionId: (sessionId) =>
      runtimeState.getOpponentSessionId(sessionId),
    cardPower: (card) => runtimeState.cardPower(card),
  });
  cardQueryEngineRef.current = cardQueryEngine;

  const zoneEngine = new DuelZoneEngine({
    state: input.state,
    effectBoundary,
    broadcastCardView: input.broadcastCardView,
    syncZoneCounts: (player) => runtimeState.syncZoneCounts(player),
    findCardInZone: (player, zone, instanceId) =>
      runtimeState.findCardInZone(player, zone, instanceId),
    takeAttachableDonCards: (player, amount, rested) =>
      runtimeState.takeAttachableDonCards(player, amount, rested),
  });
  zoneEngineRef.current = zoneEngine;

  const mainPhaseEngine = new DuelMainPhaseEngine({
    state: input.state,
    effectBoundary,
    addLog: addActionLog,
    sendError: input.reportMainPhaseError,
    broadcastCardView: input.broadcastCardView,
    syncZoneCounts: (player) => runtimeState.syncZoneCounts(player),
    unshiftIntoTrash: input.unshiftIntoTrash,
    returnDonToCost: (player, sessionId, count) =>
      runtimeState.returnDonToCost(player, sessionId, count),
    findCardInZone: (player, zone, instanceId) =>
      runtimeState.findCardInZone(player, zone, instanceId),
    takeUntappedDonCards: (player, amount) =>
      runtimeState.takeUntappedDonCards(player, amount),
  });

  const combatEngine = new DuelCombatEngine({
    state: input.state,
    effectBoundary,
    addLog: addActionLog,
    sendError: input.reportCombatError,
    broadcastCardView: input.broadcastCardView,
    syncZoneCounts: (player) => runtimeState.syncZoneCounts(player),
    unshiftIntoTrash: input.unshiftIntoTrash,
    isCombatInProgress: () => runtimeState.isCombatInProgress(),
    getOpponentSessionId: (sessionId) =>
      runtimeState.getOpponentSessionId(sessionId),
    findCardInZone: (player, zone, instanceId) =>
      runtimeState.findCardInZone(player, zone, instanceId),
    cardPower: (card) => runtimeState.cardPower(card),
    knockOutCharacter: (owner, card) => input.knockOutCharacter(owner, card),
    isProtectedFromBattleKo: input.isProtectedFromBattleKo,
    finalizeMatch: input.finalizeMatch,
    recordMatchResult: input.recordMatchResult,
  });

  const turnEngine = new DuelTurnEngine({
    state: input.state,
    maxClients: input.maxClients,
    effectBoundary,
    addLog: addSystemLog,
    shuffle: input.shuffleCards,
    syncZoneCounts: (player) => runtimeState.syncZoneCounts(player),
    returnDonToCost: (player, sessionId, count) =>
      runtimeState.returnDonToCost(player, sessionId, count),
    getOpponentSessionId: (sessionId) =>
      runtimeState.getOpponentSessionId(sessionId),
    isCombatInProgress: () => runtimeState.isCombatInProgress(),
    finalizeMatch: input.finalizeMatch,
    recordMatchResult: input.recordMatchResult,
    onMatchStarted: input.markMatchStarted,
  });

  return {
    effectBoundary,
    turnEngine,
    mainPhaseEngine,
    combatEngine,
    zoneEngine,
    cardQueryEngine,
    runtimeState,
  };
}
