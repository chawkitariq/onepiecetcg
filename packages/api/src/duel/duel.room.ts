import {
  BadRequestException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { IncomingHttpHeaders } from 'http';
import { Room, type Client } from 'colyseus';
import { ArraySchema, StateView } from '@colyseus/schema';
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
} from '@onepiecetcg/shared';
import { DuelRoomEffectBoundary } from './effects/duel-room-effect-boundary';
import { DuelRoomClientNotifier } from './room/duel-room-client-notifier';
import {
  captureDuelRoomCardKeywordSnapshot,
  restoreDuelRoomCardKeywordSnapshot,
  type DuelRoomCardKeywordSnapshot,
} from './room/duel-room-card-keyword-snapshot';
import {
  shuffleArrayLike,
  unshiftIntoArraySchema,
} from './room/duel-room-array-utils';
import {
  isProtectedFromBattleKo,
  knockOutCharacterByIdInState,
  knockOutCharacterInState,
} from './room/duel-room-character-ko';
import {
  createIsolatedDuelRoomKoRuntime,
  createLiveDuelRoomKoRuntime,
} from './room/duel-room-ko-runtime';
import {
  buildCardMovementDrafts,
  buildInitialEventStreamDrafts,
  buildMulliganEventDrafts,
  buildTerminalEventDrafts,
  buildTurnStepDrafts,
  buildTurnTransitionDrafts,
} from './room/duel-room-event-drafts';
import { DuelRoomEventOutbox } from './room/duel-room-event-outbox';
import { DuelRoomEventDraftFacade } from './room/duel-room-event-draft-facade';
import { DuelRoomEventStream } from './room/duel-room-event-stream';
import { DuelRoomGameInitializer } from './room/duel-room-game-initializer';
import { DuelRoomIsolatedCommandDispatcher } from './room/duel-room-isolated-command-dispatcher';
import type { DuelRoomGameplayRuntime } from './room/duel-room-gameplay-runtime';
import { DuelRoomIsolatedCommandRunner } from './room/duel-room-isolated-command-runner';
import { DuelRoomLifecycle } from './room/duel-room-lifecycle';
import { rebuildDuelRoomClientViews } from './room/duel-room-client-view-builder';
import { DuelRoomInteractionRuntimeCoordinator } from './room/duel-room-interaction-runtime';
import { DuelRoomLeaveHandler } from './room/duel-room-leave-handler';
import {
  createIsolatedDuelRoomGameplayRuntime,
  createLiveDuelRoomGameplayRuntime,
} from './room/duel-room-runtime-assembly';
import {
  registerDuelRoomMessages,
  type AttachDonMessage,
  type ChooseFirstOrSecondMessage,
  type DeclareAttackMessage,
  type DeclareBlockMessage,
  type DeclareCounterMessage,
  type MulliganMessage,
  type PlayCardMessage,
  type ResolveEffectDecisionMessage,
  type ResolveTriggerMessage,
} from './room/duel-room-message-registrar';
import { createDuelRoomRuntimeBootstrap } from './room/duel-room-runtime-bootstrap';
import { DuelRoomRuntimeController } from './room/duel-room-runtime-controller';
import {
  captureCardLocations,
  captureCostZoneRestSnapshot,
  captureDuelStateSnapshot,
  captureOrderedZoneSnapshot,
  captureRefreshStepSnapshot,
  countNewlyRestedCostDonCards,
  findCardByInstanceId,
  findMovedCards,
  findShuffledDeckPlayers,
  inferZonePlacement,
  toEventZoneName,
  type CardLocation,
  type CostZoneRestSnapshot,
  type DuelStateSnapshot,
  type OrderedZoneSnapshot,
  type RefreshStepSnapshot,
} from './room/duel-room-state-snapshot';
import {
  adoptRoomDuelState,
  cloneRoomDuelState,
} from './room/duel-room-state-copy';
import { DuelRoomSeatBootstrap } from './room/duel-room-seat-bootstrap';
import { DuelRoomStateServices } from './room/duel-room-state-services';

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

type DuelSessionResolver = (
  headers: IncomingHttpHeaders,
) => Promise<{ user: { id: string } } | null>;

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

  private effectBoundary!: DuelRoomEffectBoundary;

  private lifecycle!: DuelRoomLifecycle;

  private runtimeController!: DuelRoomRuntimeController;

  private pendingInteractionRuntime: IsolatedGameplayRuntime | null = null;

  private interactionRuntimeCoordinator!: DuelRoomInteractionRuntimeCoordinator;

  private seatBootstrap!: DuelRoomSeatBootstrap;

  private notifier!: DuelRoomClientNotifier;

  private stateServices!: DuelRoomStateServices;

  private eventOutbox!: DuelRoomEventOutbox;

  private eventDraftFacade!: DuelRoomEventDraftFacade;

  private eventStream!: DuelRoomEventStream;

  private isolatedCommandRunner!: DuelRoomIsolatedCommandRunner;

  private isolatedCommandDispatcher!: DuelRoomIsolatedCommandDispatcher;

  private leaveHandler!: DuelRoomLeaveHandler;

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
    this.stateServices = new DuelRoomStateServices({
      liveState: this.state,
      statsService: services?.statsService,
      disconnectRoom: () => this.disconnect(),
      logLiveMessage: (message) => this.logger.log(message),
      reportMatchResultError: (error) =>
        this.logger.error('Failed to record match result', error),
      unshiftIntoTrash: (player, card) =>
        this.unshiftIntoZone(player.zones.trash, card),
    });
    this.runtimeController = new DuelRoomRuntimeController({
      liveState: this.state,
      getPendingRuntime: () => this.pendingInteractionRuntime,
    });
    const bootstrap = createDuelRoomRuntimeBootstrap({
      state: this.state,
      roomId: this.roomId,
      statsService: services?.statsService,
      duelEventsService: services?.duelEventsService,
      getClients: () => this.clients,
      broadcast: (type, message) => this.broadcast(type, message),
      getPendingRuntime: () => this.pendingInteractionRuntime,
      setPendingRuntime: (runtime) => {
        this.pendingInteractionRuntime = runtime as IsolatedGameplayRuntime | null;
      },
      getActiveEffectDecision: () =>
        this.runtimeController.getActiveEffectBoundary().getPendingEffectDecision(),
      createLifecycleForState: (state, runtimeOptions) =>
        this.stateServices.createLifecycleForState(state, runtimeOptions),
      createLiveGameplayRuntime: (state) => this.createLiveGameplayRuntime(state),
      createIsolatedGameplayRuntime: () => this.createIsolatedGameplayRuntime(),
      installLifecycle: (lifecycle) => {
        this.lifecycle = lifecycle;
      },
      installGameplayRuntime: (runtime) => {
        this.effectBoundary = runtime.effectBoundary;
        this.runtimeController.installGameplayRuntime(runtime);
      },
      adoptRuntime: (runtime) =>
        this.interactionRuntimeCoordinator.adoptRuntime(runtime),
      hasPendingPlayerInteraction: () =>
        this.runtimeController.hasPendingPlayerInteraction(),
      persistRoomEventsOrThrow: (actorSessionId, eventDrafts) =>
        this.eventStream.recordOrThrow(actorSessionId, eventDrafts),
      requirePlayerId: (sessionId) => this.requirePlayerId(sessionId),
      listParticipants: () => this.lifecycle.listParticipants(),
      rebuildAllClientViews: () => this.rebuildAllClientViews(),
      syncZoneCounts: (player) =>
        this.runtimeController.getRuntimeState().syncZoneCounts(player),
      broadcastCardView: (card) => this.notifier.broadcastCardView(card),
      sendActionError: (client, message) =>
        this.notifier.sendActionError(client, message),
      logSystemMessage: (message, actorSessionId) =>
        this.stateServices.addLiveLog(message, 'system', actorSessionId),
      reportMatchResultError: (error) =>
        this.logger.error('Failed to record match result', error),
      reportPersistError: (error) =>
        this.logger.error('Failed to persist duel domain events', error),
      disconnectRoom: () => this.disconnect(),
      createCommandId: () => crypto.randomUUID(),
      createActionId: () => crypto.randomUUID(),
    });
    this.lifecycle = bootstrap.lifecycle;
    this.notifier = bootstrap.notifier;
    this.eventOutbox = bootstrap.eventOutbox;
    this.eventStream = new DuelRoomEventStream(this.eventOutbox);
    this.eventDraftFacade = new DuelRoomEventDraftFacade((sessionId) =>
      this.requirePlayerId(sessionId),
    );
    this.isolatedCommandRunner = bootstrap.isolatedCommandRunner;
    this.isolatedCommandDispatcher = new DuelRoomIsolatedCommandDispatcher(
      this.isolatedCommandRunner,
    );
    this.interactionRuntimeCoordinator = bootstrap.interactionRuntimeCoordinator;
    this.seatBootstrap = bootstrap.seatBootstrap;
    this.leaveHandler = new DuelRoomLeaveHandler({
      state: this.state,
      getLifecycle: () => this.lifecycle,
      allowReconnection: (client, seconds) =>
        this.allowReconnection(client, seconds),
      createLifecycleForState: (state, runtimeOptions) =>
        this.stateServices.createLifecycleForState(state, runtimeOptions),
      appendLogToState: (state, message, level, actorSessionId) =>
        this.stateServices.appendLogToState(
          state,
          message,
          level,
          actorSessionId,
        ),
      addLog: (message, level, actorSessionId) =>
        this.stateServices.addLiveLog(message, level, actorSessionId),
      captureStateSnapshotFrom: (state) =>
        this.eventDraftFacade.captureStateSnapshot(state),
      buildTerminalEventDraftsFor: (before, state) =>
        this.eventDraftFacade.buildTerminalEventDrafts(before, state),
      persistRoomEventsOrThrow: (actorSessionId, eventDrafts) =>
        this.eventStream.recordOrThrow(actorSessionId, eventDrafts),
      getPlayerId: (sessionId) => this.getPlayerId(sessionId),
      rebuildAllClientViews: () => this.rebuildAllClientViews(),
      syncPendingEffectDecision: () =>
        this.notifier.syncPendingEffectDecision(
          this.runtimeController.getActiveEffectBoundary().getPendingEffectDecision(),
        ),
      reportPersistError: (error) =>
        this.logger.error('Failed to persist duel domain events', error),
    });
    const gameplayRuntime = this.createLiveGameplayRuntime(this.state);
    this.effectBoundary = gameplayRuntime.effectBoundary;
    this.runtimeController.installGameplayRuntime(gameplayRuntime);

    const description = options.description
      ?.trim()
      .slice(0, MAX_DESCRIPTION_LENGTH);

    if (description) {
      await this.setMetadata({ description });
    }

    registerDuelRoomMessages({
      room: this,
      handleChooseFirstOrSecond: (client, message) =>
        this.handleChooseFirstOrSecond(client, message),
      handleMulligan: (client, message) => this.handleMulligan(client, message),
      handleEndPhase: (client) => this.handleEndPhase(client),
      handlePlayCard: (client, message) => this.handlePlayCard(client, message),
      handleAttachDon: (client, message) =>
        this.handleAttachDon(client, message),
      handleDeclareAttack: (client, message) =>
        this.handleDeclareAttack(client, message),
      handleDeclareBlock: (client, message) =>
        this.handleDeclareBlock(client, message),
      handleDeclareCounter: (client, message) =>
        this.handleDeclareCounter(client, message),
      handleFinishCounterStep: (client) => this.handleFinishCounterStep(client),
      handleResolveTrigger: (client, message) =>
        this.handleResolveTrigger(client, message),
      handleResolveEffectDecision: (client, message) =>
        this.handleResolveEffectDecision(client, message),
    });
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

    this.stateServices.addLiveLog(
      `${player.displayName} a rejoint la room avec un deck valide.`,
      'system',
      player.sessionId,
    );
    this.notifier.sendPendingEffectDecisionToClient(client);

    if (this.state.players.size === this.maxClients) {
      await this.initializeGame();
    }
  }

  async onLeave(client: Client, consented: boolean) {
    await this.leaveHandler.handleLeave(
      client,
      consented,
      RECONNECTION_SECONDS,
    );

    if (!consented && this.state.players.has(client.sessionId)) {
      this.notifier.sendPendingEffectDecisionToClient(client);
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
    unshiftIntoArraySchema(zone, card);
  }

  private async initializeGame() {
    const initializer = new DuelRoomGameInitializer({
      state: this.state,
      createRuntime: () => this.createIsolatedGameplayRuntime(),
      initializeRuntimeGame: (runtime) =>
        runtime.gameplayRuntime.turnEngine.initializeGame(),
      ensureEventStreamInitialized: (state) =>
        this.eventStream.ensureInitialized(state),
      adoptRuntime: (runtime) =>
        this.interactionRuntimeCoordinator.adoptRuntime(runtime),
      lockRoom: () => this.lock(),
    });

    await initializer.initialize();
  }

  private async handleChooseFirstOrSecond(
    client: Client,
    message: ChooseFirstOrSecondMessage,
  ) {
    const runtime = this.createIsolatedGameplayRuntime();
    const beforeFirstPlayerSessionId = runtime.state.firstPlayerSessionId;
    runtime.gameplayRuntime.turnEngine.handleChooseFirstOrSecond(
      client.sessionId,
      message.choice,
    );

    if (
      beforeFirstPlayerSessionId ||
      !runtime.state.firstPlayerSessionId ||
      !this.eventOutbox.hasStream()
    ) {
      this.interactionRuntimeCoordinator.adoptRuntime(runtime);
      return;
    }

    try {
      await this.eventStream.recordOrThrow(client.sessionId, [
        {
          type: 'StartingPlayerDetermined',
          version: 1,
          payload: {
            chooserPlayerId: this.getPlayerId(client.sessionId),
            firstPlayerId: this.getPlayerId(runtime.state.firstPlayerSessionId),
            choice: message.choice,
          },
        },
      ]);
    } catch (error) {
      this.logger.error('Failed to persist duel domain events', error);
      return;
    }

    this.interactionRuntimeCoordinator.adoptRuntime(runtime);
  }

  private async handleMulligan(client: Client, message: MulliganMessage) {
    await this.executeIsolatedTurnCommand(
      client,
      (runtime) => {
        const before = this.eventDraftFacade.captureStateSnapshot(runtime.state);
        runtime.gameplayRuntime.turnEngine.handleMulligan(
          client.sessionId,
          message.mulligan,
        );

        return {
          handled: true,
          eventDrafts: this.eventDraftFacade.buildMulliganEventDrafts(
            before,
            runtime.state,
            client.sessionId,
            message.mulligan,
          ),
        };
      },
      'Impossible de resoudre le mulligan pour le moment.',
    );
  }

  private async handleEndPhase(client: Client) {
    await this.executeIsolatedTurnCommand(
      client,
      (runtime) => {
        const before = this.eventDraftFacade.captureStateSnapshot(runtime.state);
        const beforeLocations =
          this.eventDraftFacade.captureCardLocations(runtime.state);
        const beforeRefresh =
          this.eventDraftFacade.captureRefreshStepSnapshot(
          runtime.state,
        );
        const error = runtime.gameplayRuntime.turnEngine.handleEndPhase(
          client.sessionId,
        );

        if (error) {
          return { handled: false, errorMessage: error };
        }

        return {
          handled: true,
          eventDrafts: [
            ...this.eventDraftFacade.buildTurnStepDrafts(
              before,
              beforeLocations,
              beforeRefresh,
              runtime.state,
            ),
            ...this.eventDraftFacade.buildTurnTransitionDrafts(
              before,
              runtime.state,
            ),
            ...this.eventDraftFacade.buildTerminalEventDrafts(
              before,
              runtime.state,
            ),
          ],
        };
      },
      'Impossible de terminer la phase pour le moment.',
    );
  }

  private async handleDeclareAttack(
    client: Client,
    message: DeclareAttackMessage,
  ) {
    this.notifier.bindCombatClient(client);
    await this.executeIsolatedCombatCommand(
      client,
      (runtime) => {
        const before = this.eventDraftFacade.captureStateSnapshot(runtime.state);
        const handled =
          runtime.gameplayRuntime.combatEngine.handleDeclareAttack(
            client.sessionId,
            message,
          );

        if (!handled) {
          return { handled: false };
        }

        return {
          handled: true,
          eventDrafts: [
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
                targetInstanceId: runtime.state.combat.targetInstanceId,
              },
            },
            ...this.eventDraftFacade.buildTerminalEventDrafts(
              before,
              runtime.state,
            ),
          ],
        };
      },
      "Impossible de declarer l'attaque pour le moment.",
    );
  }

  private async handleDeclareBlock(
    client: Client,
    message: DeclareBlockMessage,
  ) {
    this.notifier.bindCombatClient(client);
    await this.executeIsolatedCombatCommand(
      client,
      (runtime) => {
        const before = this.eventDraftFacade.captureStateSnapshot(runtime.state);
        const handled = runtime.gameplayRuntime.combatEngine.handleDeclareBlock(
          client.sessionId,
          message,
        );

        if (!handled) {
          return { handled: false };
        }

        return {
          handled: true,
          eventDrafts: [
            {
              type: 'BlockerDeclared',
              version: 1,
              payload: {
                playerId: this.getPlayerId(client.sessionId),
                blockerInstanceId: message.blockerInstanceId ?? null,
              },
            },
            ...this.eventDraftFacade.buildTerminalEventDrafts(
              before,
              runtime.state,
            ),
          ],
        };
      },
      'Impossible de declarer le blocage pour le moment.',
    );
  }

  private async handleDeclareCounter(
    client: Client,
    message: DeclareCounterMessage,
  ) {
    this.notifier.bindCombatClient(client);
    await this.executeIsolatedCombatCommand(
      client,
      (runtime) => {
        const before = this.eventDraftFacade.captureStateSnapshot(runtime.state);
        const defender = runtime.state.players.get(client.sessionId);
        const discardedCard =
          defender && message.discardInstanceId
            ? runtime.runtimeState.findCardInZone(
                defender,
                'hand',
                message.discardInstanceId,
              )?.card
            : null;
        const handled =
          runtime.gameplayRuntime.combatEngine.handleDeclareCounter(
            client.sessionId,
            message,
          );

        if (!handled) {
          return { handled: false };
        }

        return {
          handled: true,
          eventDrafts: [
            {
              type: 'CounterUsed',
              version: 1,
              payload: {
                playerId: this.getPlayerId(client.sessionId),
                discardInstanceId: message.discardInstanceId,
                counterPowerBonus: Math.max(
                  0,
                  Math.trunc(message.counterPowerBonus),
                ),
              },
            },
            ...(discardedCard
              ? [
                  {
                    type: 'CardMoved',
                    version: 1,
                    payload: {
                      playerId: this.getPlayerId(client.sessionId),
                      cardInstanceId: discardedCard.instanceId,
                      cardDefinitionId: discardedCard.cardId,
                      fromZone: 'HAND',
                      toZone: 'TRASH',
                    },
                  } satisfies DomainEventDraft,
                  {
                    type: 'CardDiscarded',
                    version: 1,
                    payload: {
                      playerId: this.getPlayerId(client.sessionId),
                      cardInstanceId: discardedCard.instanceId,
                      cardDefinitionId: discardedCard.cardId,
                      fromZone: 'HAND',
                      toZone: 'TRASH',
                    },
                  } satisfies DomainEventDraft,
                ]
              : []),
            ...this.eventDraftFacade.buildTerminalEventDrafts(
              before,
              runtime.state,
            ),
          ],
        };
      },
      'Impossible de declarer le contre pour le moment.',
    );
  }

  private async handleFinishCounterStep(client: Client) {
    this.notifier.bindCombatClient(client);
    await this.executeIsolatedCombatCommand(
      client,
      (runtime) => {
        const before = this.eventDraftFacade.captureStateSnapshot(runtime.state);
        const beforeLocations =
          this.eventDraftFacade.captureCardLocations(runtime.state);
        const combatBefore = {
          attackerSessionId: runtime.state.combat.attackerSessionId,
          attackerInstanceId: runtime.state.combat.attackerInstanceId,
          defenderSessionId: runtime.state.combat.defenderSessionId,
          targetType: runtime.state.combat.targetType,
          targetInstanceId: runtime.state.combat.targetInstanceId,
          blockerInstanceId: runtime.state.combat.blockerInstanceId,
          counterPowerBonus: runtime.state.combat.counterPowerBonus,
        };
        const attackerCard =
          runtime.gameplayRuntime.cardQueryEngine.getCardByInstanceId(
            combatBefore.attackerInstanceId,
          );
        const defendingInstanceId =
          combatBefore.blockerInstanceId || combatBefore.targetInstanceId;
        const defendingCard =
          runtime.gameplayRuntime.cardQueryEngine.getCardByInstanceId(
            defendingInstanceId,
          );
        const attackerPower = attackerCard
          ? runtime.runtimeState.cardPower(attackerCard)
          : null;
        const defenderPower = defendingCard
          ? runtime.runtimeState.cardPower(defendingCard) +
            combatBefore.counterPowerBonus
          : null;
        const handled =
          runtime.gameplayRuntime.combatEngine.handleFinishCounterStep(
            client.sessionId,
          );

        if (!handled) {
          return { handled: false };
        }

        const drafts: DomainEventDraft[] = [];
        const pendingManualTrigger =
          runtime.gameplayRuntime.effectBoundary.getPendingManualTriggerState();
        const attackWasCancelled =
          attackerPower === null || defenderPower === null;

        if (!attackWasCancelled) {
          drafts.push({
            type: 'BattleResolved',
            version: 1,
            payload: {
              attackerPlayerId: this.getPlayerId(
                combatBefore.attackerSessionId,
              ),
              attackerInstanceId: combatBefore.attackerInstanceId,
              defenderPlayerId: this.getPlayerId(
                combatBefore.defenderSessionId,
              ),
              defendingInstanceId,
              targetType: combatBefore.targetType,
              attackerPower,
              defenderPower,
              outcome:
                attackerPower >= defenderPower ? 'attackerWon' : 'attackerLost',
            },
          });
        }

        if (attackWasCancelled) {
          drafts.push({
            type: 'AttackCancelled',
            version: 1,
            payload: {
              attackerPlayerId: this.getPlayerId(
                combatBefore.attackerSessionId,
              ),
              attackerInstanceId: combatBefore.attackerInstanceId,
              defenderPlayerId: this.getPlayerId(
                combatBefore.defenderSessionId,
              ),
              targetType: combatBefore.targetType,
              targetInstanceId: combatBefore.targetInstanceId,
              blockerInstanceId: combatBefore.blockerInstanceId || null,
              reason:
                attackerPower === null ? 'attackerMissing' : 'targetMissing',
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
          this.eventDraftFacade.captureCardLocations(runtime.state),
        )) {
          if (
            movedCard.from.zone === 'life' &&
            (movedCard.to.zone === 'hand' || movedCard.to.zone === 'trash')
          ) {
            drafts.push({
              type: 'CardRevealed',
              version: 1,
              payload: {
                playerId: this.getPlayerId(movedCard.to.ownerSessionId),
                cardInstanceId: movedCard.instanceId,
                cardDefinitionId: movedCard.to.cardId,
                fromZone: 'LIFE',
              },
            });
          }

          if (
            movedCard.from.zone === 'characters' &&
            movedCard.to.zone === 'trash'
          ) {
            drafts.push({
              type: 'CardMoved',
              version: 1,
              payload: {
                playerId: this.getPlayerId(movedCard.to.ownerSessionId),
                cardInstanceId: movedCard.instanceId,
                cardDefinitionId: movedCard.to.cardId,
                fromZone: 'CHARACTER_AREA',
                toZone: 'TRASH',
              },
            });
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
              type: 'CardMoved',
              version: 1,
              payload: {
                playerId: this.getPlayerId(movedCard.to.ownerSessionId),
                cardInstanceId: movedCard.instanceId,
                cardDefinitionId: movedCard.to.cardId,
                fromZone: 'LIFE',
                toZone: movedCard.to.zone === 'hand' ? 'HAND' : 'TRASH',
              },
            });
            drafts.push({
              type: 'LifeCardTaken',
              version: 1,
              payload: {
                playerId: this.getPlayerId(movedCard.to.ownerSessionId),
                count: 1,
                cardInstanceId: movedCard.instanceId,
                cardDefinitionId: movedCard.to.cardId,
                destinationZone:
                  movedCard.to.zone === 'hand' ? 'HAND' : 'TRASH',
              },
            });
          }
        }

        if (pendingManualTrigger) {
          drafts.unshift({
            type: 'CardRevealed',
            version: 1,
            payload: {
              playerId: this.getPlayerId(pendingManualTrigger.ownerSessionId),
              cardInstanceId: pendingManualTrigger.card.instanceId,
              cardDefinitionId: pendingManualTrigger.card.cardId,
              fromZone: 'LIFE',
            },
          });
        }

        return {
          handled: true,
          eventDrafts: [
            ...drafts,
            ...this.eventDraftFacade.buildTerminalEventDrafts(
              before,
              runtime.state,
            ),
          ],
        };
      },
      'Impossible de resoudre le combat pour le moment.',
    );
  }

  private knockOutCharacter(
    owner: DuelPlayer,
    card: DuelCard,
    reason: 'battle' | 'effect' = 'battle',
    skipReplacement = false,
  ) {
    knockOutCharacterInState(
      this.stateServices.createCharacterKoDeps(this.state, this.effectBoundary, {
        isolated: false,
      }),
      owner,
      card,
      reason,
      skipReplacement,
    );
  }

  private isProtectedFromBattleKo(
    defendingCard: DuelCard,
    attackerCard: DuelCard,
  ): boolean {
    return isProtectedFromBattleKo(defendingCard, attackerCard);
  }

  private async handleResolveTrigger(
    client: Client,
    message: ResolveTriggerMessage,
  ) {
    this.notifier.bindCombatClient(client);
    await this.executeIsolatedCombatCommand(
      client,
      (runtime) => {
        const before = this.eventDraftFacade.captureStateSnapshot(runtime.state);
        const pendingManualTrigger =
          runtime.gameplayRuntime.effectBoundary.getPendingManualTriggerState();
        const result =
          runtime.gameplayRuntime.effectBoundary.resolveManualTriggerDecision(
            client.sessionId,
            message.activate,
          );

        if (!result.ok) {
          return { handled: false, errorMessage: result.error };
        }

        runtime.gameplayRuntime.combatEngine.endCombat();

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
          drafts.push({
            type: 'CardMoved',
            version: 1,
            payload: {
              playerId: this.getPlayerId(client.sessionId),
              cardInstanceId: pendingManualTrigger.card.instanceId,
              cardDefinitionId: pendingManualTrigger.card.cardId,
              fromZone: 'LIFE',
              toZone: message.activate ? 'TRASH' : 'HAND',
            },
          });
          drafts.push({
            type: 'LifeCardTaken',
            version: 1,
            payload: {
              playerId: this.getPlayerId(client.sessionId),
              count: 1,
              cardInstanceId: pendingManualTrigger.card.instanceId,
              cardDefinitionId: pendingManualTrigger.card.cardId,
              destinationZone: message.activate ? 'TRASH' : 'HAND',
            },
          });
        }

        return {
          handled: true,
          eventDrafts: [
            ...drafts,
            ...this.eventDraftFacade.buildTerminalEventDrafts(
              before,
              runtime.state,
            ),
          ],
        };
      },
      'Impossible de resoudre le declenchement pour le moment.',
      { allowPendingInteraction: true },
    );
  }

  private async handlePlayCard(client: Client, message: PlayCardMessage) {
    this.notifier.bindMainPhaseClient(client);
    await this.executeIsolatedMainPhaseCommand(
      client,
      (runtime) => {
        const before = this.eventDraftFacade.captureStateSnapshot(runtime.state);
        const beforeCostRest = this.eventDraftFacade.captureCostZoneRestSnapshot(
          runtime.state,
        );
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

        const restedDonCount = this.eventDraftFacade.countNewlyRestedCostDonCards(
          beforeCostRest,
          runtime.state,
          client.sessionId,
        );
        const drafts: DomainEventDraft[] = [
          ...(restedDonCount > 0
            ? [
                {
                  type: 'DonRested',
                  version: 1,
                  payload: {
                    playerId: this.getPlayerId(client.sessionId),
                    count: restedDonCount,
                  },
                } satisfies DomainEventDraft,
              ]
            : []),
          {
            type: 'CardMoved',
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
            },
          },
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
            type: 'CardMoved',
            version: 1,
            payload: {
              playerId: this.getPlayerId(client.sessionId),
              cardInstanceId: discardedCharacter.instanceId,
              cardDefinitionId: discardedCharacter.cardId,
              fromZone: 'CHARACTER_AREA',
              toZone: 'TRASH',
            },
          });
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
            type: 'CardMoved',
            version: 1,
            payload: {
              playerId: this.getPlayerId(client.sessionId),
              cardInstanceId: replacedStage.instanceId,
              cardDefinitionId: replacedStage.cardId,
              fromZone: 'STAGE_AREA',
              toZone: 'TRASH',
            },
          });
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
          eventDrafts: [
            ...drafts,
            ...this.eventDraftFacade.buildTerminalEventDrafts(
              before,
              this.state,
            ),
          ],
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
        const beforeCostDonCards = Array.from(
          runtime.state.players.get(client.sessionId)?.zones.cost ?? [],
          (card) => ({
            instanceId: card.instanceId,
            cardId: card.cardId,
          }),
        );
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
        const targetCardId =
          targetInstanceId &&
          this.eventDraftFacade.findCardByInstanceId(runtime.state, targetInstanceId)
            ?.cardId;
        const remainingCostIds = new Set(
          Array.from(
            runtime.state.players.get(client.sessionId)?.zones.cost ?? [],
            (card) => card.instanceId,
          ),
        );
        const attachedDonCards = beforeCostDonCards
          .filter((card) => !remainingCostIds.has(card.instanceId))
          .slice(0, count);

        return {
          handled: true,
          eventDrafts: [
            ...attachedDonCards.map(
              (donCard) =>
                ({
                  type: 'CardPlacedUnderCard',
                  version: 1,
                  payload: {
                    playerId: this.getPlayerId(client.sessionId),
                    cardInstanceId: donCard.instanceId,
                    cardDefinitionId: donCard.cardId,
                    parentInstanceId: targetInstanceId ?? null,
                    parentCardId: targetCardId ?? null,
                  },
                }) satisfies DomainEventDraft,
            ),
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
    const pendingRuntime = this.pendingInteractionRuntime;
    const activeRuntime = this.runtimeController.getActiveRuntimeContext();
    const activeState = activeRuntime.state;
    const activeRuntimeState = activeRuntime.runtimeState;
    const activeEffectBoundary = activeRuntime.effectBoundary;
    const activeCombatEngine = activeRuntime.combatEngine;
    const decision = activeEffectBoundary.getPendingEffectDecision();

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
    const before = this.eventDraftFacade.captureStateSnapshot(activeState);
    const beforeLocations = this.eventDraftFacade.captureCardLocations(activeState);
    const beforeDeckOrder = this.eventDraftFacade.captureOrderedZoneSnapshot(
      activeState,
      'deck',
    );
    const beforeLifeOrder = this.eventDraftFacade.captureOrderedZoneSnapshot(
      activeState,
      'life',
    );
    activeEffectBoundary.answerEffectDecision(message);

    if (
      activeRuntimeState.isCombatInProgress() &&
      activeState.combat.step === 'resolving' &&
      !activeEffectBoundary.hasPendingPlayerInteraction()
    ) {
      activeCombatEngine.endCombat();
    }

    if (pendingRuntime) {
      this.interactionRuntimeCoordinator.syncPendingRuntime();
    }

    await this.eventStream.record(client.sessionId, [
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
      ...this.eventDraftFacade.buildCardMovementDrafts(
        beforeLocations,
        beforeDeckOrder,
        beforeLifeOrder,
        pendingRuntime?.state ?? this.state,
      ),
      ...this.eventDraftFacade.buildTerminalEventDrafts(
        before,
        this.state,
      ),
    ]);
  }

  private getPlayerId(sessionId: string): PlayerId | undefined {
    return this.lifecycle.getPlayerId(sessionId);
  }

  private requirePlayerId(sessionId: string): PlayerId {
    const playerId = this.getPlayerId(sessionId);

    if (!playerId) {
      throw new Error(`Unknown player session: ${sessionId}`);
    }

    return playerId;
  }

  private findMovedCards(
    before: Map<string, CardLocation>,
    after: Map<string, CardLocation>,
  ): Array<{
    instanceId: string;
    from: CardLocation;
    to: CardLocation;
  }> {
    return findMovedCards(before, after);
  }

  private getActiveEffectBoundary(): DuelRoomEffectBoundary {
    return this.runtimeController.getActiveEffectBoundary();
  }

  private hasPendingPlayerInteraction(): boolean {
    return this.runtimeController.hasPendingPlayerInteraction();
  }

  private createLiveGameplayRuntime(state: DuelState): DuelRoomGameplayRuntime {
    const koRuntime = createLiveDuelRoomKoRuntime({
      stateServices: this.stateServices,
      state: this.state,
      effectBoundary: this.effectBoundary,
    });

    return createLiveDuelRoomGameplayRuntime({
      state,
      maxClients: this.maxClients,
      addLog: (message, level, actorSessionId) =>
        this.stateServices.addLiveLog(message, level, actorSessionId),
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
      knockOutCharacter: koRuntime.knockOutCharacter,
      knockOutCharacterById: koRuntime.knockOutCharacterById,
      isProtectedFromBattleKo: (defendingCard, attackerCard) =>
        this.isProtectedFromBattleKo(defendingCard, attackerCard),
    });
  }

  private createIsolatedGameplayRuntime() {
    const koRuntime = createIsolatedDuelRoomKoRuntime({
      stateServices: this.stateServices,
    });

    return createIsolatedDuelRoomGameplayRuntime({
      liveState: this.state,
      liveLifecycleState: this.lifecycle.exportState(),
      liveEffectBoundaryState: this.effectBoundary.exportState(),
      maxClients: this.maxClients,
      createLifecycleForState: (state) =>
        this.stateServices.createLifecycleForState(state, { isolated: true }),
      appendLogToState: (state, message, level, actorSessionId) =>
        this.stateServices.appendLogToState(
          state,
          message,
          level,
          actorSessionId,
        ),
      shuffleCards: (cards) => this.shuffle(cards),
      unshiftIntoTrash: (player, card) =>
        this.unshiftIntoZone(player.zones.trash, card),
      knockOutCharacter: (
        state,
        effectBoundary,
        owner,
        card,
        reason,
        skipReplacement,
      ) =>
        koRuntime.knockOutCharacter(
          state,
          effectBoundary,
          owner,
          card,
          reason,
          skipReplacement,
        ),
      knockOutCharacterById: (
        state,
        effectBoundary,
        playerSessionId,
        instanceId,
        reason,
      ) =>
        koRuntime.knockOutCharacterById(
          state,
          effectBoundary,
          playerSessionId,
          instanceId,
          reason,
        ),
      isProtectedFromBattleKo: (defendingCard, attackerCard) =>
        this.isProtectedFromBattleKo(defendingCard, attackerCard),
    });
  }

  private async executeIsolatedMainPhaseCommand(
    client: Client,
    executor: (
      runtime: IsolatedGameplayRuntime,
    ) =>
      { handled: false } | { handled: true; eventDrafts: DomainEventDraft[] },
    outboxFailureMessage: string,
  ): Promise<void> {
    await this.isolatedCommandDispatcher.runMainPhaseCommand(
      client,
      executor,
      outboxFailureMessage,
    );
  }

  private async executeIsolatedTurnCommand(
    client: Client,
    executor: (
      runtime: IsolatedGameplayRuntime,
    ) =>
      | { handled: false; errorMessage?: string }
      | { handled: true; eventDrafts: DomainEventDraft[] },
    outboxFailureMessage: string,
  ): Promise<void> {
    await this.isolatedCommandDispatcher.runTurnCommand(
      client,
      executor,
      outboxFailureMessage,
    );
  }

  private async executeIsolatedCombatCommand(
    client: Client,
    executor: (
      runtime: IsolatedGameplayRuntime,
    ) =>
      | { handled: false; errorMessage?: string }
      | { handled: true; eventDrafts: DomainEventDraft[] },
    outboxFailureMessage: string,
    options?: { allowPendingInteraction?: boolean },
  ): Promise<void> {
    await this.isolatedCommandDispatcher.runCombatCommand(
      client,
      executor,
      outboxFailureMessage,
      options,
    );
  }

  private rebuildAllClientViews(): void {
    rebuildDuelRoomClientViews(this.clients, this.state);
  }

  private shuffle(cards: {
    length: number;
    [index: number]: DuelCard | undefined;
  }) {
    shuffleArrayLike(cards);
  }
}
