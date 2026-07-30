import {
  BadRequestException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { IncomingHttpHeaders } from 'http';
import { Room, type Client } from 'colyseus';
import { ArraySchema } from '@colyseus/schema';
import type { DeckService } from '../deck/deck.service';
import type {
  DomainEventDraft,
  PlayerId,
} from '../duel-events/duel-domain-event.types';
import { DuelDomainEventsService } from '../duel-events/duel-domain-events.service';
import type { StatsService } from '../stats/stats.service';
import {
  DuelCard,
  DuelLog,
  DuelPlayer,
  DuelState,
  type DuelEndReason,
  type EffectDecisionResponse,
  type FirstOrSecondChoice,
  type GamePhase,
} from '@onepiecetcg/shared';
import { DuelRoomEffectBoundary } from './effects/duel-room-effect-boundary';
import { DuelCombatEngine } from './game-engine/duel-combat-engine';
import { DuelCardQueryEngine } from './game-engine/duel-card-query-engine';
import { DuelMainPhaseEngine } from './game-engine/duel-main-phase-engine';
import { DuelTurnEngine } from './game-engine/duel-turn-engine';
import { DuelZoneEngine } from './game-engine/duel-zone-engine';
import { DuelRoomClientNotifier } from './room/duel-room-client-notifier';
import { createDuelRoomGameplayRuntime } from './room/duel-room-gameplay-runtime';
import { DuelRoomLifecycle } from './room/duel-room-lifecycle';
import { DuelRoomRuntimeState } from './room/duel-room-runtime-state';
import {
  adoptRoomDuelState,
  cloneRoomDuelState,
} from './room/duel-room-state-copy';
import { DuelRoomSeatBootstrap } from './room/duel-room-seat-bootstrap';

type DeclareAttackMessage = {
  attackerInstanceId: string;
  targetType: 'leader' | 'character';
  targetInstanceId?: string;
};

type DeclareBlockMessage = {
  blockerInstanceId?: string | null;
};

type DeclareCounterMessage = {
  discardInstanceId: string;
  counterPowerBonus: number;
};

type ResolveTriggerMessage = {
  activate: boolean;
};

type ResolveEffectDecisionMessage = EffectDecisionResponse;

const RECONNECTION_SECONDS = 120;

type DuelRoomServices = {
  decksService: DeckService;
  statsService?: StatsService;
  duelEventsService: DuelDomainEventsService;
};

type DuelJoinOptions = {
  displayName?: string;
  deckId?: string;
  description?: string;
};

const MAX_DESCRIPTION_LENGTH = 140;

type DuelAuthData = {
  userId: string;
};

type ChooseFirstOrSecondMessage = {
  choice: FirstOrSecondChoice;
};

type MulliganMessage = {
  mulligan: boolean;
};

type PlayCardMessage = {
  instanceId: string;
  discardCharacterInstanceId?: string;
};

type AttachDonMessage = {
  target: 'leader' | 'character';
  targetInstanceId?: string;
  count?: number;
};

type DuelSessionResolver = (
  headers: IncomingHttpHeaders,
) => Promise<{ user: { id: string } } | null>;

type DuelStateSnapshot = {
  phase: GamePhase;
  turn: number;
  activePlayerSessionId: string;
  startedAt: string;
  winnerSessionId: string;
  endReason: DuelEndReason | '';
};

type CardLocation = {
  ownerSessionId: string;
  zone:
    | 'leader'
    | 'stage'
    | 'deck'
    | 'donDeck'
    | 'hand'
    | 'life'
    | 'characters'
    | 'cost'
    | 'trash';
  cardId: string;
};

type IsolatedGameplayRuntime = ReturnType<
  DuelRoom['createIsolatedGameplayRuntime']
>;

let services: DuelRoomServices | null = null;
let resolveSession: DuelSessionResolver | null = null;

/** Injects `DeckService` into `DuelRoom`, which Colyseus instantiates outside Nest's DI container. */
export function configureDuelRoomServices(nextServices: DuelRoomServices) {
  services = nextServices;
}

/**
 * Wired to Better Auth's `auth.api.getSession` by `main.ts`. Kept as an
 * injectable function (rather than importing `../auth` directly here) so
 * Colyseus can instantiate `DuelRoom` outside Nest's DI, and so unit tests
 * can stub session resolution without loading the real Better Auth ESM build.
 */
export function configureDuelRoomAuth(nextResolver: DuelSessionResolver) {
  resolveSession = nextResolver;
}

export class DuelRoom extends Room<DuelState> {
  private readonly logger = new Logger(DuelRoom.name);

  private eventStreamCreated = false;

  private effectBoundary!: DuelRoomEffectBoundary;

  private turnEngine!: DuelTurnEngine;

  private mainPhaseEngine!: DuelMainPhaseEngine;

  private combatEngine!: DuelCombatEngine;

  private zoneEngine!: DuelZoneEngine;

  private cardQueryEngine!: DuelCardQueryEngine;

  private lifecycle!: DuelRoomLifecycle;

  private runtimeState!: DuelRoomRuntimeState;

  private seatBootstrap!: DuelRoomSeatBootstrap;

  private notifier!: DuelRoomClientNotifier;

  maxClients = 2;

  static async onAuth(
    _token: string,
    _options: DuelJoinOptions,
    context: { headers: IncomingHttpHeaders },
  ): Promise<DuelAuthData> {
    if (!resolveSession) {
      throw new ServiceUnavailableException('Duel room auth is unavailable');
    }

    const session = await resolveSession(context.headers);

    if (!session?.user?.id) {
      throw new BadRequestException('Session invalide');
    }

    return { userId: session.user.id };
  }

  async onCreate(options: DuelJoinOptions = {}) {
    this.setState(new DuelState());
    this.lifecycle = new DuelRoomLifecycle({
      state: this.state,
      statsService: services?.statsService,
      addLog: (message) => this.addLog(message),
      getOpponentSessionId: (sessionId) =>
        this.runtimeState.getOpponentSessionId(sessionId),
      disconnectRoom: () => this.disconnect(),
      reportStatsError: (error) => {
        this.logger.error('Failed to record match result', error);
      },
    });
    this.runtimeState = new DuelRoomRuntimeState({
      state: this.state,
    });
    this.notifier = new DuelRoomClientNotifier({
      getClients: () => this.clients,
      broadcast: (type, message) => this.broadcast(type, message),
      getPendingEffectDecision: () =>
        this.effectBoundary.getPendingEffectDecision(),
    });
    this.seatBootstrap = new DuelRoomSeatBootstrap({
      syncZoneCounts: (player) => this.runtimeState.syncZoneCounts(player),
      broadcastCardView: (card) => this.notifier.broadcastCardView(card),
    });
    const gameplayRuntime = createDuelRoomGameplayRuntime({
      state: this.state,
      maxClients: this.maxClients,
      addLog: (message) => this.addLog(message),
      reportMainPhaseError: (message) =>
        this.notifier.sendMainPhaseError(message),
      reportCombatError: (message) => this.notifier.sendCombatError(message),
      broadcastCardView: (card) => this.notifier.broadcastCardView(card),
      onPendingEffectDecisionChange: (decision) =>
        this.notifier.syncPendingEffectDecision(decision),
      shuffleCards: (cards) => this.shuffle(cards),
      finalizeMatch: (endReason, winnerSessionId) =>
        this.lifecycle.finalizeMatch(endReason, winnerSessionId),
      recordMatchResult: () => this.lifecycle.recordMatchResult(),
      markMatchStarted: (startedAt) =>
        this.lifecycle.markMatchStarted(startedAt),
      unshiftIntoTrash: (player, card) =>
        this.unshiftIntoZone(player.zones.trash, card),
      knockOutCharacter: (owner, card, reason, skipReplacement) =>
        this.knockOutCharacter(owner, card, reason, skipReplacement),
      knockOutCharacterById: (playerSessionId, instanceId, reason) =>
        this.knockOutCharacterById(playerSessionId, instanceId, reason),
      isProtectedFromBattleKo: (defendingCard, attackerCard) =>
        this.isProtectedFromBattleKo(defendingCard, attackerCard),
    });
    this.effectBoundary = gameplayRuntime.effectBoundary;
    this.turnEngine = gameplayRuntime.turnEngine;
    this.cardQueryEngine = gameplayRuntime.cardQueryEngine;
    this.zoneEngine = gameplayRuntime.zoneEngine;
    this.mainPhaseEngine = gameplayRuntime.mainPhaseEngine;
    this.combatEngine = gameplayRuntime.combatEngine;
    this.runtimeState = gameplayRuntime.runtimeState;

    const description = options.description
      ?.trim()
      .slice(0, MAX_DESCRIPTION_LENGTH);

    if (description) {
      await this.setMetadata({ description });
    }

    this.onMessage(
      'chooseFirstOrSecond',
      (client: Client, message: ChooseFirstOrSecondMessage) => {
        void this.handleChooseFirstOrSecond(client, message);
      },
    );

    this.onMessage('mulligan', (client: Client, message: MulliganMessage) => {
      void this.handleMulligan(client, message);
    });

    this.onMessage('endPhase', (client: Client) => {
      void this.handleEndPhase(client);
    });

    this.onMessage('playCard', (client: Client, message: PlayCardMessage) => {
      void this.handlePlayCard(client, message);
    });

    this.onMessage('attachDon', (client: Client, message: AttachDonMessage) => {
      void this.handleAttachDon(client, message);
    });

    this.onMessage(
      'declareAttack',
      (client: Client, message: DeclareAttackMessage) => {
        void this.handleDeclareAttack(client, message);
      },
    );

    this.onMessage(
      'declareBlock',
      (client: Client, message: DeclareBlockMessage) => {
        void this.handleDeclareBlock(client, message);
      },
    );

    this.onMessage(
      'declareCounter',
      (client: Client, message: DeclareCounterMessage) => {
        void this.handleDeclareCounter(client, message);
      },
    );

    this.onMessage('finishCounterStep', (client: Client) => {
      void this.handleFinishCounterStep(client);
    });

    this.onMessage(
      'resolveTrigger',
      (client: Client, message: ResolveTriggerMessage) => {
        void this.handleResolveTrigger(client, message);
      },
    );

    this.onMessage(
      'resolveEffectDecision',
      (client: Client, message: ResolveEffectDecisionMessage) => {
        void this.handleResolveEffectDecision(client, message);
      },
    );
  }

  async onJoin(client: Client, options: DuelJoinOptions, auth?: DuelAuthData) {
    if (!services) {
      throw new ServiceUnavailableException(
        'Duel room services are unavailable',
      );
    }

    if (this.state.players.size >= this.maxClients) {
      throw new BadRequestException('La room est deja complete');
    }

    const authUserId = auth?.userId;
    const deckId = options.deckId?.trim();

    if (!authUserId || !deckId) {
      throw new BadRequestException('Utilisateur et deck requis');
    }

    if (this.lifecycle.hasJoined(authUserId)) {
      throw new BadRequestException('Ce joueur est deja dans la room');
    }

    const gameDeck = await services.decksService.getValidatedGameDeck(
      authUserId,
      deckId,
    );
    const player = this.seatBootstrap.createPlayer(client, options, gameDeck);
    this.lifecycle.registerPlayer(client.sessionId, gameDeck.ownerAuthUserId);
    this.state.players.set(client.sessionId, player);
    this.seatBootstrap.initializeClientView(
      client,
      player,
      this.state.players.values(),
    );

    this.addLog(`${player.displayName} a rejoint la room avec un deck valide.`);
    this.notifier.sendPendingEffectDecisionToClient(client);

    if (this.state.players.size === this.maxClients) {
      await this.initializeGame();
    }
  }

  async onLeave(client: Client, consented: boolean) {
    const player = this.state.players.get(client.sessionId);

    if (!player) {
      return;
    }

    player.connected = false;
    this.addLog(`${player.displayName} est deconnecte.`);

    if (consented) {
      const snapshot = this.captureStateSnapshot();
      this.lifecycle.declareForfeitIfMatchInProgress(player);
      await this.recordRoomEvents(client.sessionId, [
        {
          type: 'PlayerConceded',
          version: 1,
          payload: { playerId: this.getPlayerId(client.sessionId) },
        },
        ...this.buildTerminalEventDrafts(snapshot),
      ]);
      this.lifecycle.removePlayer(client.sessionId);
      return;
    }

    try {
      await this.allowReconnection(client, RECONNECTION_SECONDS);
      player.connected = true;
      this.addLog(`${player.displayName} est reconnecte.`);
      this.notifier.sendPendingEffectDecisionToClient(client);
    } catch {
      this.addLog(`${player.displayName} a perdu par forfait.`);
      this.lifecycle.removePlayer(client.sessionId);
    }
  }

  /**
   * Inserts `card` at the front of `zone` (most-recent-on-top ordering,
   * e.g. the trash). `ArraySchema#unshift()` never re-parents the inserted
   * item's `ChangeTree` (unlike `push()`), leaving it "detached" and making
   * `StateView#add()` throw -- so we `push()` (which does re-parent) then
   * rotate it to the front via the supported `move()` swap API instead.
   */
  private unshiftIntoZone(zone: ArraySchema<DuelCard>, card: DuelCard) {
    zone.push(card);
    zone.move(() => {
      for (let index = zone.length - 1; index > 0; index -= 1) {
        [zone[index], zone[index - 1]] = [zone[index - 1], zone[index]];
      }
    });
  }

  private async initializeGame() {
    this.turnEngine.initializeGame();
    await this.ensureEventStreamInitialized();
    void this.lock();
  }

  private async handleChooseFirstOrSecond(
    client: Client,
    message: ChooseFirstOrSecondMessage,
  ) {
    const beforeFirstPlayerSessionId = this.state.firstPlayerSessionId;
    this.turnEngine.handleChooseFirstOrSecond(client.sessionId, message.choice);

    if (
      !beforeFirstPlayerSessionId &&
      this.state.firstPlayerSessionId &&
      this.eventStreamCreated
    ) {
      await this.recordRoomEvents(client.sessionId, [
        {
          type: 'StartingPlayerDetermined',
          version: 1,
          payload: {
            chooserPlayerId: this.getPlayerId(client.sessionId),
            firstPlayerId: this.getPlayerId(this.state.firstPlayerSessionId),
            choice: message.choice,
          },
        },
      ]);
    }
  }

  private async handleMulligan(client: Client, message: MulliganMessage) {
    const before = this.captureStateSnapshot();
    this.turnEngine.handleMulligan(client.sessionId, message.mulligan);

    const drafts: DomainEventDraft[] = [
      {
        type: 'MulliganResolved',
        version: 1,
        payload: {
          playerId: this.getPlayerId(client.sessionId),
          tookMulligan: message.mulligan,
        },
      },
    ];

    if (!before.startedAt && this.state.startedAt) {
      drafts.push(
        {
          type: 'MatchStarted',
          version: 1,
          payload: {
            startedAt: this.state.startedAt,
            firstPlayerId: this.getPlayerId(this.state.firstPlayerSessionId),
          },
        },
        {
          type: 'TurnStarted',
          version: 1,
          payload: {
            turn: this.state.turn,
            playerId: this.getPlayerId(this.state.activePlayerSessionId),
          },
        },
        {
          type: 'PhaseChanged',
          version: 1,
          payload: {
            turn: this.state.turn,
            playerId: this.getPlayerId(this.state.activePlayerSessionId),
            fromPhase: before.phase,
            toPhase: this.state.phase,
          },
        },
      );
    }

    await this.recordRoomEvents(client.sessionId, drafts);
  }

  private async handleEndPhase(client: Client) {
    const before = this.captureStateSnapshot();
    const error = this.turnEngine.handleEndPhase(client.sessionId);

    if (error) {
      this.notifier.sendActionError(client, error);
      return;
    }

    await this.recordRoomEvents(client.sessionId, [
      ...this.buildTurnTransitionDrafts(before),
      ...this.buildTerminalEventDrafts(before),
    ]);
  }

  private async handleDeclareAttack(
    client: Client,
    message: DeclareAttackMessage,
  ) {
    this.notifier.bindCombatClient(client);
    const before = this.captureStateSnapshot();
    const handled = this.combatEngine.handleDeclareAttack(
      client.sessionId,
      message,
    );

    if (!handled) {
      return;
    }

    await this.recordRoomEvents(client.sessionId, [
      {
        type: 'AttackDeclared',
        version: 1,
        payload: {
          playerId: this.getPlayerId(client.sessionId),
          attackerInstanceId: message.attackerInstanceId,
        },
      },
      {
        type: 'AttackTargetSelected',
        version: 1,
        payload: {
          playerId: this.getPlayerId(client.sessionId),
          targetType: message.targetType,
          targetInstanceId: this.state.combat.targetInstanceId,
        },
      },
      ...this.buildTerminalEventDrafts(before),
    ]);
  }

  private async handleDeclareBlock(
    client: Client,
    message: DeclareBlockMessage,
  ) {
    this.notifier.bindCombatClient(client);
    const before = this.captureStateSnapshot();
    const handled = this.combatEngine.handleDeclareBlock(
      client.sessionId,
      message,
    );

    if (!handled) {
      return;
    }

    await this.recordRoomEvents(client.sessionId, [
      {
        type: 'BlockerDeclared',
        version: 1,
        payload: {
          playerId: this.getPlayerId(client.sessionId),
          blockerInstanceId: message.blockerInstanceId ?? null,
        },
      },
      ...this.buildTerminalEventDrafts(before),
    ]);
  }

  private async handleDeclareCounter(
    client: Client,
    message: DeclareCounterMessage,
  ) {
    this.notifier.bindCombatClient(client);
    const before = this.captureStateSnapshot();
    const handled = this.combatEngine.handleDeclareCounter(
      client.sessionId,
      message,
    );

    if (!handled) {
      return;
    }

    await this.recordRoomEvents(client.sessionId, [
      {
        type: 'CounterUsed',
        version: 1,
        payload: {
          playerId: this.getPlayerId(client.sessionId),
          discardInstanceId: message.discardInstanceId,
          counterPowerBonus: Math.max(0, Math.trunc(message.counterPowerBonus)),
        },
      },
      ...this.buildTerminalEventDrafts(before),
    ]);
  }

  private async handleFinishCounterStep(client: Client) {
    this.notifier.bindCombatClient(client);
    const before = this.captureStateSnapshot();
    const beforeLocations = this.captureCardLocations();
    const combatBefore = {
      attackerSessionId: this.state.combat.attackerSessionId,
      attackerInstanceId: this.state.combat.attackerInstanceId,
      defenderSessionId: this.state.combat.defenderSessionId,
      targetType: this.state.combat.targetType,
      targetInstanceId: this.state.combat.targetInstanceId,
      blockerInstanceId: this.state.combat.blockerInstanceId,
      counterPowerBonus: this.state.combat.counterPowerBonus,
    };
    const attackerCard = this.cardQueryEngine.getCardByInstanceId(
      combatBefore.attackerInstanceId,
    );
    const defendingInstanceId =
      combatBefore.blockerInstanceId || combatBefore.targetInstanceId;
    const defendingCard =
      this.cardQueryEngine.getCardByInstanceId(defendingInstanceId);
    const attackerPower = attackerCard
      ? this.runtimeState.cardPower(attackerCard)
      : null;
    const defenderPower = defendingCard
      ? this.runtimeState.cardPower(defendingCard) +
        combatBefore.counterPowerBonus
      : null;
    const handled = this.combatEngine.handleFinishCounterStep(client.sessionId);

    if (!handled) {
      return;
    }

    const drafts: DomainEventDraft[] = [];

    if (attackerPower !== null && defenderPower !== null) {
      drafts.push({
        type: 'BattleResolved',
        version: 1,
        payload: {
          attackerPlayerId: this.getPlayerId(combatBefore.attackerSessionId),
          attackerInstanceId: combatBefore.attackerInstanceId,
          defenderPlayerId: this.getPlayerId(combatBefore.defenderSessionId),
          defendingInstanceId,
          targetType: combatBefore.targetType,
          attackerPower,
          defenderPower,
          outcome:
            attackerPower >= defenderPower ? 'attackerWon' : 'attackerLost',
        },
      });
    }

    if (
      attackerPower !== null &&
      defenderPower !== null &&
      attackerPower >= defenderPower &&
      combatBefore.targetType === 'leader' &&
      attackerCard
    ) {
      drafts.push({
        type: 'DamageDealt',
        version: 1,
        payload: {
          playerId: this.getPlayerId(combatBefore.defenderSessionId),
          amount: attackerCard.hasDoubleAttack ? 2 : 1,
        },
      });
    }

    for (const movedCard of this.findMovedCards(
      beforeLocations,
      this.captureCardLocations(),
    )) {
      if (
        movedCard.from.zone === 'characters' &&
        movedCard.to.zone === 'trash'
      ) {
        drafts.push({
          type: 'CharacterKOD',
          version: 1,
          payload: {
            playerId: this.getPlayerId(movedCard.to.ownerSessionId),
            cardInstanceId: movedCard.instanceId,
            cardDefinitionId: movedCard.to.cardId,
          },
        });
      }

      if (
        movedCard.from.zone === 'life' &&
        (movedCard.to.zone === 'hand' || movedCard.to.zone === 'trash')
      ) {
        drafts.push({
          type: 'LifeCardTaken',
          version: 1,
          payload: {
            playerId: this.getPlayerId(movedCard.to.ownerSessionId),
            count: 1,
            cardInstanceId: movedCard.instanceId,
            cardDefinitionId: movedCard.to.cardId,
            destinationZone: movedCard.to.zone === 'hand' ? 'HAND' : 'TRASH',
          },
        });
      }
    }

    await this.recordRoomEvents(client.sessionId, [
      ...drafts,
      ...this.buildTerminalEventDrafts(before),
    ]);
  }

  private knockOutCharacter(
    owner: DuelPlayer,
    card: DuelCard,
    reason: 'battle' | 'effect' = 'battle',
    skipReplacement = false,
  ) {
    if (reason === 'effect' && card.cannotBeKoedByEffects) {
      this.effectBoundary.reapplyContinuousEffects();
      return;
    }

    if (
      !skipReplacement &&
      this.effectBoundary.applyKoReplacement(
        owner.sessionId,
        card.instanceId,
        reason,
      )
    ) {
      this.effectBoundary.reapplyContinuousEffects();
      return;
    }

    const found = this.runtimeState.findCardInZone(
      owner,
      'characters',
      card.instanceId,
    );

    if (!found) {
      return;
    }

    owner.zones.characters.splice(found.index, 1);
    const attachedDon = card.attachedDon;
    card.attachedDon = 0;
    card.rested = false;
    this.unshiftIntoZone(owner.zones.trash, card);
    this.runtimeState.returnDonToCost(owner, owner.sessionId, attachedDon);
    this.addLog(`${card.name} est mis KO et rejoint la Defausse.`);
    this.effectBoundary.emitCardEvent('onKo', owner.sessionId, card);
    this.effectBoundary.reapplyContinuousEffects();
  }

  private isProtectedFromBattleKo(
    defendingCard: DuelCard,
    attackerCard: DuelCard,
  ): boolean {
    if (defendingCard.cannotBeKoedInBattle) {
      return true;
    }

    return (
      (defendingCard.cannotBeKoedBySlashInBattle &&
        attackerCard.attributes.includes('Slash')) ||
      (defendingCard.cannotBeKoedByStrikeInBattle &&
        attackerCard.attributes.includes('Strike'))
    );
  }

  private async handleResolveTrigger(
    client: Client,
    message: ResolveTriggerMessage,
  ) {
    const before = this.captureStateSnapshot();
    const pendingManualTrigger =
      this.effectBoundary.exportState().manualTrigger?.cardInstanceId ?? null;
    const result = this.effectBoundary.resolveManualTriggerDecision(
      client.sessionId,
      message.activate,
    );

    if (!result.ok) {
      this.notifier.sendActionError(client, result.error);
      return;
    }

    this.combatEngine.endCombat();
    const drafts: DomainEventDraft[] = [
      {
        type: 'ChoiceSubmitted',
        version: 1,
        payload: {
          playerId: this.getPlayerId(client.sessionId),
          decisionType: 'trigger',
          activate: message.activate,
        },
      },
    ];

    if (pendingManualTrigger) {
      const resolvedCard =
        this.cardQueryEngine.getCardByInstanceId(pendingManualTrigger);

      if (resolvedCard) {
        drafts.push({
          type: 'LifeCardTaken',
          version: 1,
          payload: {
            playerId: this.getPlayerId(client.sessionId),
            count: 1,
            cardInstanceId: resolvedCard.instanceId,
            cardDefinitionId: resolvedCard.cardId,
            destinationZone: message.activate ? 'TRASH' : 'HAND',
          },
        });
      }
    }

    await this.recordRoomEvents(client.sessionId, [
      ...drafts,
      ...this.buildTerminalEventDrafts(before),
    ]);
  }

  private async handlePlayCard(client: Client, message: PlayCardMessage) {
    this.notifier.bindMainPhaseClient(client);
    await this.executeIsolatedMainPhaseCommand(
      client,
      (runtime) => {
        const before = this.captureStateSnapshotFrom(runtime.state);
        const player = runtime.state.players.get(client.sessionId);
        const playedCard =
          player && message.instanceId
            ? runtime.runtimeState.findCardInZone(
                player,
                'hand',
                message.instanceId,
              )?.card
            : null;
        const discardedCharacter =
          player && message.discardCharacterInstanceId
            ? runtime.runtimeState.findCardInZone(
                player,
                'characters',
                message.discardCharacterInstanceId,
              )?.card
            : null;
        const replacedStage =
          player &&
          playedCard?.type === 'Stage' &&
          player.zones.stage.instanceId
            ? player.zones.stage
            : null;
        const paidCost = playedCard
          ? Math.max(
              playedCard.cost +
                runtime.gameplayRuntime.effectBoundary.getNextPlayCostModifier(
                  playedCard,
                ),
              0,
            )
          : 0;
        const handled = runtime.gameplayRuntime.mainPhaseEngine.handlePlayCard(
          client.sessionId,
          message,
        );

        if (!handled || !playedCard) {
          return { handled: false };
        }

        const drafts: DomainEventDraft[] = [
          {
            type: 'CostPaid',
            version: 1,
            payload: {
              playerId: this.getPlayerId(client.sessionId),
              amount: paidCost,
              sourceInstanceId: playedCard.instanceId,
              sourceCardId: playedCard.cardId,
            },
          },
          {
            type: 'CardPlayed',
            version: 1,
            payload: {
              playerId: this.getPlayerId(client.sessionId),
              cardInstanceId: playedCard.instanceId,
              cardDefinitionId: playedCard.cardId,
              fromZone: 'HAND',
              toZone:
                playedCard.type === 'Character'
                  ? 'CHARACTER_AREA'
                  : playedCard.type === 'Stage'
                    ? 'STAGE_AREA'
                    : 'TRASH',
              paidCost,
            },
          },
        ];

        if (discardedCharacter) {
          drafts.push({
            type: 'CardDiscarded',
            version: 1,
            payload: {
              playerId: this.getPlayerId(client.sessionId),
              cardInstanceId: discardedCharacter.instanceId,
              cardDefinitionId: discardedCharacter.cardId,
              fromZone: 'CHARACTER_AREA',
              toZone: 'TRASH',
            },
          });
        }

        if (replacedStage) {
          drafts.push({
            type: 'CardDiscarded',
            version: 1,
            payload: {
              playerId: this.getPlayerId(client.sessionId),
              cardInstanceId: replacedStage.instanceId,
              cardDefinitionId: replacedStage.cardId,
              fromZone: 'STAGE_AREA',
              toZone: 'TRASH',
            },
          });
        }

        return {
          handled: true,
          eventDrafts: [...drafts, ...this.buildTerminalEventDrafts(before)],
        };
      },
      'Impossible de jouer la carte pour le moment.',
    );
  }

  private async handleAttachDon(client: Client, message: AttachDonMessage) {
    this.notifier.bindMainPhaseClient(client);
    await this.executeIsolatedMainPhaseCommand(
      client,
      (runtime) => {
        const handled = runtime.gameplayRuntime.mainPhaseEngine.handleAttachDon(
          client.sessionId,
          message,
        );

        if (!handled) {
          return { handled: false };
        }

        const count = Number.isInteger(message.count)
          ? (message.count ?? 1)
          : 1;
        const targetInstanceId =
          message.target === 'leader'
            ? runtime.state.players.get(client.sessionId)?.zones.leader
                .instanceId
            : message.targetInstanceId;

        return {
          handled: true,
          eventDrafts: [
            {
              type: 'DonAttached',
              version: 1,
              payload: {
                playerId: this.getPlayerId(client.sessionId),
                targetInstanceId: targetInstanceId ?? null,
                count,
              },
            },
          ],
        };
      },
      "Impossible d'attacher le DON!! pour le moment.",
    );
  }

  private async handleResolveEffectDecision(
    client: Client,
    message: ResolveEffectDecisionMessage,
  ) {
    const before = this.captureStateSnapshot();
    const decision = this.effectBoundary.getPendingEffectDecision();

    if (!decision) {
      this.notifier.sendActionError(
        client,
        "Aucune decision d'effet n'est en attente.",
      );
      return;
    }

    if (decision.playerSessionId !== client.sessionId) {
      this.notifier.sendActionError(
        client,
        "Cette decision n'appartient pas a ce joueur.",
      );
      return;
    }

    const decisionSnapshot = {
      decisionId: decision.id,
      promptType: decision.prompt.type,
    };
    this.effectBoundary.answerEffectDecision(message);

    if (
      this.runtimeState.isCombatInProgress() &&
      this.state.combat.step === 'resolving' &&
      !this.effectBoundary.hasPendingPlayerInteraction()
    ) {
      this.combatEngine.endCombat();
    }

    await this.recordRoomEvents(client.sessionId, [
      {
        type: 'ChoiceSubmitted',
        version: 1,
        payload: {
          playerId: this.getPlayerId(client.sessionId),
          decisionId: decisionSnapshot.decisionId,
          promptType: decisionSnapshot.promptType,
          selectedCardInstanceIds: message.selectedCardInstanceIds ?? [],
          selectedChoiceIds: message.selectedChoiceIds ?? [],
          confirmed: message.confirmed ?? null,
        },
      },
      ...this.buildTerminalEventDrafts(before),
    ]);
  }

  private getPlayerId(sessionId: string): PlayerId | undefined {
    return this.lifecycle.getPlayerId(sessionId);
  }

  private captureStateSnapshot(): DuelStateSnapshot {
    return this.captureStateSnapshotFrom(this.state);
  }

  private captureStateSnapshotFrom(state: DuelState): DuelStateSnapshot {
    return {
      phase: state.phase,
      turn: state.turn,
      activePlayerSessionId: state.activePlayerSessionId,
      startedAt: state.startedAt,
      winnerSessionId: state.winnerSessionId,
      endReason: state.endReason,
    };
  }

  private captureCardLocations(): Map<string, CardLocation> {
    const locations = new Map<string, CardLocation>();

    for (const player of this.state.players.values()) {
      locations.set(player.zones.leader.instanceId, {
        ownerSessionId: player.sessionId,
        zone: 'leader',
        cardId: player.zones.leader.cardId,
      });

      if (player.zones.stage.instanceId) {
        locations.set(player.zones.stage.instanceId, {
          ownerSessionId: player.sessionId,
          zone: 'stage',
          cardId: player.zones.stage.cardId,
        });
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
        for (const card of player.zones[zone]) {
          locations.set(card.instanceId, {
            ownerSessionId: player.sessionId,
            zone,
            cardId: card.cardId,
          });
        }
      }
    }

    return locations;
  }

  private findMovedCards(
    before: Map<string, CardLocation>,
    after: Map<string, CardLocation>,
  ): Array<{
    instanceId: string;
    from: CardLocation;
    to: CardLocation;
  }> {
    const moved: Array<{
      instanceId: string;
      from: CardLocation;
      to: CardLocation;
    }> = [];

    for (const [instanceId, beforeLocation] of before.entries()) {
      const afterLocation = after.get(instanceId);

      if (
        afterLocation &&
        (afterLocation.zone !== beforeLocation.zone ||
          afterLocation.ownerSessionId !== beforeLocation.ownerSessionId)
      ) {
        moved.push({
          instanceId,
          from: beforeLocation,
          to: afterLocation,
        });
      }
    }

    return moved;
  }

  private buildTurnTransitionDrafts(
    before: DuelStateSnapshot,
  ): DomainEventDraft[] {
    const drafts: DomainEventDraft[] = [];

    if (before.phase === 'end' && this.state.turn > before.turn) {
      drafts.push(
        {
          type: 'TurnEnded',
          version: 1,
          payload: {
            turn: before.turn,
            playerId: this.getPlayerId(before.activePlayerSessionId),
          },
        },
        {
          type: 'TurnStarted',
          version: 1,
          payload: {
            turn: this.state.turn,
            playerId: this.getPlayerId(this.state.activePlayerSessionId),
          },
        },
      );
    }

    if (before.phase !== this.state.phase || before.turn !== this.state.turn) {
      drafts.push({
        type: 'PhaseChanged',
        version: 1,
        payload: {
          turn: this.state.turn,
          playerId: this.getPlayerId(this.state.activePlayerSessionId),
          fromPhase: before.phase,
          toPhase: this.state.phase,
        },
      });
    }

    return drafts;
  }

  private buildTerminalEventDrafts(
    before: DuelStateSnapshot,
  ): DomainEventDraft[] {
    if (before.phase === 'finished' || this.state.phase !== 'finished') {
      return [];
    }

    return [
      {
        type: 'MatchEnded',
        version: 1,
        payload: {
          winnerPlayerId: this.getPlayerId(this.state.winnerSessionId),
          endReason: this.state.endReason,
          finishedAt: this.state.finishedAt,
        },
      },
    ];
  }

  private async ensureEventStreamInitialized(): Promise<void> {
    if (this.eventStreamCreated || !services?.duelEventsService) {
      return;
    }

    await services.duelEventsService.createStream({
      matchId: this.roomId,
      actorPlayerId: undefined,
      engineVersion: 'duel-room-v1',
      rulesetVersion: '2026.07',
      matchCreatedPayload: {
        roomId: this.roomId,
        createdAt: new Date().toISOString(),
      },
    });

    this.eventStreamCreated = true;

    const drafts: DomainEventDraft[] = [];

    for (const player of this.state.players.values()) {
      const playerId = this.getPlayerId(player.sessionId);
      drafts.push(
        {
          type: 'PlayerJoined',
          version: 1,
          payload: {
            playerId,
            displayName: player.displayName,
          },
        },
        {
          type: 'DeckLocked',
          version: 1,
          payload: {
            playerId,
            deckId: player.deckId,
            leaderCardId: player.zones.leader.cardId,
          },
        },
        {
          type: 'OpeningHandDrawn',
          version: 1,
          payload: {
            playerId,
            count: player.zones.hand.length,
          },
        },
      );
    }

    await this.recordRoomEvents(undefined, drafts);
  }

  private async recordRoomEvents(
    actorSessionId: string | undefined,
    eventDrafts: DomainEventDraft[],
  ): Promise<void> {
    if (!services || eventDrafts.length === 0 || !this.eventStreamCreated) {
      return;
    }

    try {
      await this.persistRoomEventsOrThrow(actorSessionId, eventDrafts);
    } catch (error) {
      this.logger.error('Failed to persist duel domain events', error);
    }
  }

  private async persistRoomEventsOrThrow(
    actorSessionId: string | undefined,
    eventDrafts: DomainEventDraft[],
  ): Promise<void> {
    if (!services || eventDrafts.length === 0 || !this.eventStreamCreated) {
      return;
    }

    await services.duelEventsService.record({
      matchId: this.roomId,
      actorPlayerId: actorSessionId
        ? this.getPlayerId(actorSessionId)
        : undefined,
      commandId: crypto.randomUUID(),
      actionId: crypto.randomUUID(),
      eventDrafts,
      engineVersion: 'duel-room-v1',
      rulesetVersion: '2026.07',
    });
  }

  private createLifecycleForState(
    state: DuelState,
    options?: { isolated?: boolean },
  ): DuelRoomLifecycle {
    return new DuelRoomLifecycle({
      state,
      statsService: options?.isolated ? undefined : services?.statsService,
      addLog: (message) =>
        options?.isolated
          ? this.appendLogToState(state, message)
          : this.addLog(message),
      getOpponentSessionId: (sessionId) => {
        const runtimeState = new DuelRoomRuntimeState({ state });

        return runtimeState.getOpponentSessionId(sessionId);
      },
      disconnectRoom: () => {
        if (!options?.isolated) {
          return this.disconnect();
        }
      },
      reportStatsError: (error) => {
        if (!options?.isolated) {
          this.logger.error('Failed to record match result', error);
        }
      },
    });
  }

  private createIsolatedGameplayRuntime() {
    const state = cloneRoomDuelState(this.state);
    const lifecycle = this.createLifecycleForState(state, { isolated: true });
    lifecycle.importState(this.lifecycle.exportState());
    const mainPhaseErrors: string[] = [];
    const combatErrors: string[] = [];
    const gameplayRuntime = createDuelRoomGameplayRuntime({
      state,
      maxClients: this.maxClients,
      addLog: (message) => this.appendLogToState(state, message),
      reportMainPhaseError: (message) => {
        mainPhaseErrors.push(message);
      },
      reportCombatError: (message) => {
        combatErrors.push(message);
      },
      broadcastCardView: () => undefined,
      onPendingEffectDecisionChange: () => undefined,
      shuffleCards: (cards) => this.shuffle(cards),
      finalizeMatch: (endReason, winnerSessionId) =>
        lifecycle.finalizeMatch(endReason, winnerSessionId),
      recordMatchResult: () => lifecycle.recordMatchResult(),
      markMatchStarted: (startedAt) => lifecycle.markMatchStarted(startedAt),
      unshiftIntoTrash: (player, card) =>
        this.unshiftIntoZone(player.zones.trash, card),
      knockOutCharacter: (owner, card, reason, skipReplacement) =>
        this.knockOutCharacterInState(
          state,
          gameplayRuntime.effectBoundary,
          owner,
          card,
          reason,
          skipReplacement,
        ),
      knockOutCharacterById: (playerSessionId, instanceId, reason) =>
        this.knockOutCharacterByIdInState(
          state,
          gameplayRuntime.effectBoundary,
          playerSessionId,
          instanceId,
          reason,
        ),
      isProtectedFromBattleKo: (defendingCard, attackerCard) =>
        this.isProtectedFromBattleKo(defendingCard, attackerCard),
    });
    gameplayRuntime.effectBoundary.importState(
      this.effectBoundary.exportState(),
    );

    return {
      state,
      lifecycle,
      gameplayRuntime,
      runtimeState: new DuelRoomRuntimeState({ state }),
      mainPhaseErrors,
      combatErrors,
    };
  }

  private async executeIsolatedMainPhaseCommand(
    client: Client,
    executor: (
      runtime: IsolatedGameplayRuntime,
    ) =>
      { handled: false } | { handled: true; eventDrafts: DomainEventDraft[] },
    outboxFailureMessage: string,
  ): Promise<void> {
    const runtime = this.createIsolatedGameplayRuntime();
    const result = executor(runtime);

    if (!result.handled) {
      const errorMessage = runtime.mainPhaseErrors.at(-1);

      if (errorMessage) {
        this.notifier.sendActionError(client, errorMessage);
      }

      return;
    }

    try {
      await this.persistRoomEventsOrThrow(client.sessionId, result.eventDrafts);
    } catch (error) {
      this.logger.error('Failed to persist duel domain events', error);
      this.notifier.sendActionError(client, outboxFailureMessage);
      return;
    }

    this.adoptIsolatedRuntime(runtime);
  }

  private adoptIsolatedRuntime(runtime: IsolatedGameplayRuntime): void {
    adoptRoomDuelState(this.state, runtime.state);
    this.lifecycle.importState(runtime.lifecycle.exportState());
    this.effectBoundary.importState(
      runtime.gameplayRuntime.effectBoundary.exportState(),
    );
    this.rebuildAllClientViews();
    this.notifier.syncPendingEffectDecision(
      this.effectBoundary.getPendingEffectDecision(),
    );
  }

  private rebuildAllClientViews(): void {
    for (const client of this.clients) {
      if (!client.view) {
        continue;
      }

      client.view.clear();
      const ownerSessionId = client.sessionId;

      for (const player of this.state.players.values()) {
        this.addAlwaysPublicCardsToView(client, player);

        if (player.sessionId === ownerSessionId) {
          this.addPrivateCardsToView(client, player);
        }
      }
    }
  }

  private addAlwaysPublicCardsToView(client: Client, player: DuelPlayer): void {
    client.view?.add(player.zones.leader);

    if (player.zones.stage.instanceId) {
      client.view?.add(player.zones.stage);
    }

    for (const card of player.zones.donDeck) {
      client.view?.add(card);
    }

    for (const card of player.zones.characters) {
      client.view?.add(card);
    }

    for (const card of player.zones.cost) {
      client.view?.add(card);
    }

    for (const card of player.zones.trash) {
      client.view?.add(card);
    }
  }

  private addPrivateCardsToView(client: Client, player: DuelPlayer): void {
    for (const zone of [
      player.zones.deck,
      player.zones.hand,
      player.zones.life,
    ]) {
      for (const card of zone) {
        client.view?.add(card);
      }
    }
  }

  private appendLogToState(state: DuelState, message: string): void {
    const log = new DuelLog();
    log.id = `${Date.now()}:${state.logs.length}`;
    log.message = message;
    log.createdAt = new Date().toISOString();
    state.logs.push(log);
  }

  private knockOutCharacterInState(
    state: DuelState,
    effectBoundary: DuelRoomEffectBoundary,
    owner: DuelPlayer,
    card: DuelCard,
    reason: 'battle' | 'effect' = 'battle',
    skipReplacement = false,
  ): void {
    if (reason === 'effect' && card.cannotBeKoedByEffects) {
      effectBoundary.reapplyContinuousEffects();
      return;
    }

    if (
      !skipReplacement &&
      effectBoundary.applyKoReplacement(
        owner.sessionId,
        card.instanceId,
        reason,
      )
    ) {
      effectBoundary.reapplyContinuousEffects();
      return;
    }

    const runtimeState = new DuelRoomRuntimeState({ state });
    const found = runtimeState.findCardInZone(
      owner,
      'characters',
      card.instanceId,
    );

    if (!found) {
      return;
    }

    owner.zones.characters.splice(found.index, 1);
    const attachedDon = card.attachedDon;
    card.attachedDon = 0;
    card.rested = false;
    this.unshiftIntoZone(owner.zones.trash, card);
    runtimeState.returnDonToCost(owner, owner.sessionId, attachedDon);
    this.appendLogToState(
      state,
      `${card.name} est mis KO et rejoint la Defausse.`,
    );
    effectBoundary.emitCardEvent('onKo', owner.sessionId, card);
    effectBoundary.reapplyContinuousEffects();
  }

  private knockOutCharacterByIdInState(
    state: DuelState,
    effectBoundary: DuelRoomEffectBoundary,
    playerSessionId: string,
    instanceId: string,
    reason: 'battle' | 'effect',
  ): boolean {
    const player = state.players.get(playerSessionId);
    const runtimeState = new DuelRoomRuntimeState({ state });
    const found =
      player && runtimeState.findCardInZone(player, 'characters', instanceId);

    if (!player || !found) {
      return false;
    }

    this.knockOutCharacterInState(
      state,
      effectBoundary,
      player,
      found.card,
      reason,
    );

    return true;
  }

  private addLog(message: string) {
    const log = new DuelLog();
    log.id = `${Date.now()}:${this.state.logs.length}`;
    log.message = message;
    log.createdAt = new Date().toISOString();
    this.state.logs.push(log);
    this.logger.log(message);
  }

  private shuffle(cards: {
    length: number;
    [index: number]: DuelCard | undefined;
  }) {
    for (let index = cards.length - 1; index > 0; index -= 1) {
      const otherIndex = Math.floor(Math.random() * (index + 1));
      const current = cards[index];
      const other = cards[otherIndex];

      if (current && other) {
        cards[index] = other;
        cards[otherIndex] = current;
      }
    }
  }

  private knockOutCharacterById(
    playerSessionId: string,
    instanceId: string,
    reason: 'battle' | 'effect',
  ): boolean {
    const player = this.state.players.get(playerSessionId);
    const found = player
      ? this.runtimeState.findCardInZone(player, 'characters', instanceId)
      : null;

    if (!player || !found) {
      return false;
    }

    if (reason === 'effect' && found.card.cannotBeKoedByEffects) {
      this.effectBoundary.reapplyContinuousEffects();
      return false;
    }

    if (
      this.effectBoundary.applyKoReplacement(
        playerSessionId,
        instanceId,
        reason,
      )
    ) {
      this.effectBoundary.reapplyContinuousEffects();
      return false;
    }

    this.knockOutCharacter(player, found.card, reason, true);
    return true;
  }
}
