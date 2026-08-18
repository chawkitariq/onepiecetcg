import {
  BadRequestException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { IncomingHttpHeaders } from 'http';
import { Room, type Client } from 'colyseus';
import { ArraySchema } from '@colyseus/schema';
import type { DeckService } from '../deck/deck.service';
import type { StatsService } from '../stats/stats.service';
import { DuelCard, DuelPlayer, DuelState } from '@onepiecetcg/shared';
import { DuelRoomClientNotifier } from './room/duel-room-client-notifier';
import {
  DuelEffectBoundary,
  isProtectedFromBattleKo,
  knockOutCharacterInState,
} from '@onepiecetcg/duel-engine';
import {
  shuffleArrayLike,
  unshiftIntoArraySchema,
} from './room/duel-room-array-utils';
import {
  createIsolatedDuelRoomKoRuntime,
  createLiveDuelRoomKoRuntime,
} from './room/duel-room-ko-runtime';
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
  type DebugDrawFromDeckMessage,
  type DebugTriggerCardEffectMessage,
  type MulliganMessage,
  type PlayCardMessage,
  type ResolveEffectDecisionMessage,
  type ResolveTriggerMessage,
} from './room/duel-room-message-registrar';
import { createDuelRoomRuntimeBootstrap } from './room/duel-room-runtime-bootstrap';
import { DuelRoomRuntimeController } from './room/duel-room-runtime-controller';
import { DuelRoomSeatBootstrap } from './room/duel-room-seat-bootstrap';
import { DuelRoomStateServices } from './room/duel-room-state-services';

const RECONNECTION_SECONDS = 120;

type DuelRoomServices = {
  decksService: DeckService;
  statsService?: StatsService;
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

  private effectBoundary!: DuelEffectBoundary;

  private lifecycle!: DuelRoomLifecycle;

  private runtimeController!: DuelRoomRuntimeController;

  private pendingInteractionRuntime: IsolatedGameplayRuntime | null = null;

  private interactionRuntimeCoordinator!: DuelRoomInteractionRuntimeCoordinator;

  private seatBootstrap!: DuelRoomSeatBootstrap;

  private notifier!: DuelRoomClientNotifier;

  private stateServices!: DuelRoomStateServices;

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
    this.initializeStateServices();
    this.initializeRuntimeServices();
    this.installLiveGameplayRuntime();
    await this.setDescriptionMetadata(options.description);
    this.registerMessageHandlers();
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
      adoptRuntime: (runtime) =>
        this.interactionRuntimeCoordinator.adoptRuntime(runtime),
      lockRoom: () => this.lock(),
    });

    await initializer.initialize();
  }

  private handleChooseFirstOrSecond(
    client: Client,
    message: ChooseFirstOrSecondMessage,
  ) {
    const runtime = this.createIsolatedGameplayRuntime();
    runtime.gameplayRuntime.turnEngine.handleChooseFirstOrSecond(
      client.sessionId,
      message.choice,
    );
    this.interactionRuntimeCoordinator.adoptRuntime(runtime);
  }

  private async handleMulligan(client: Client, message: MulliganMessage) {
    await this.executeIsolatedTurnCommand(client, (runtime) => {
      runtime.gameplayRuntime.turnEngine.handleMulligan(
        client.sessionId,
        message.mulligan,
      );

      return { handled: true };
    });
  }

  private async handleEndPhase(client: Client) {
    await this.executeIsolatedTurnCommand(client, (runtime) => {
      const error = runtime.gameplayRuntime.turnEngine.handleEndPhase(
        client.sessionId,
      );

      if (error) {
        return { handled: false, errorMessage: error };
      }

      return { handled: true };
    });
  }

  private async handleDeclareAttack(
    client: Client,
    message: DeclareAttackMessage,
  ) {
    this.notifier.bindCombatClient(client);
    await this.executeIsolatedCombatCommand(client, (runtime) =>
      this.toHandledCommandResult(
        runtime.gameplayRuntime.combatEngine.handleDeclareAttack(
          client.sessionId,
          message,
        ),
      ),
    );
  }

  private async handleDeclareBlock(
    client: Client,
    message: DeclareBlockMessage,
  ) {
    this.notifier.bindCombatClient(client);
    await this.executeIsolatedCombatCommand(client, (runtime) =>
      this.toHandledCommandResult(
        runtime.gameplayRuntime.combatEngine.handleDeclareBlock(
          client.sessionId,
          message,
        ),
      ),
    );
  }

  private async handleDeclareCounter(
    client: Client,
    message: DeclareCounterMessage,
  ) {
    this.notifier.bindCombatClient(client);
    await this.executeIsolatedCombatCommand(client, (runtime) =>
      this.toHandledCommandResult(
        runtime.gameplayRuntime.combatEngine.handleDeclareCounter(
          client.sessionId,
          message,
        ),
      ),
    );
  }

  private async handleFinishCounterStep(client: Client) {
    this.notifier.bindCombatClient(client);
    await this.executeIsolatedCombatCommand(client, (runtime) =>
      this.toHandledCommandResult(
        runtime.gameplayRuntime.combatEngine.handleFinishCounterStep(
          client.sessionId,
        ),
      ),
    );
  }

  private async handleDebugDrawFromDeck(
    client: Client,
    message: DebugDrawFromDeckMessage,
  ) {
    if (process.env.NODE_ENV !== 'development') {
      this.notifier.sendActionError(
        client,
        "L'outil de debug est uniquement disponible en mode developpement.",
      );
      return;
    }

    const player = this.state.players.get(client.sessionId);

    if (!player) {
      this.notifier.sendActionError(client, 'Joueur introuvable.');
      return;
    }

    const deckIndex = Array.from(player.zones.deck).findIndex(
      (card) => card.instanceId === message.instanceId,
    );

    if (deckIndex < 0) {
      this.notifier.sendActionError(
        client,
        'Carte introuvable dans le deck.',
      );
      return;
    }

    const [card] = player.zones.deck.splice(deckIndex, 1);

    if (!card) {
      this.notifier.sendActionError(client, 'Carte introuvable dans le deck.');
      return;
    }

    card.faceDown = false;
    player.zones.hand.push(card);
    player.handCount = player.zones.hand.length;
    player.deckCount = player.zones.deck.length;
    this.stateServices.addLiveLog(
      `${player.displayName} pioche ${card.name} via l'outil de debug.`,
      'system',
      player.sessionId,
    );
    this.rebuildAllClientViews();
  }

  private async handleDebugTriggerCardEffect(
    client: Client,
    message: DebugTriggerCardEffectMessage,
  ) {
    if (process.env.NODE_ENV !== 'development') {
      this.notifier.sendActionError(
        client,
        "L'outil de debug est uniquement disponible en mode developpement.",
      );
      return;
    }

    const player = this.state.players.get(client.sessionId);

    if (!player) {
      this.notifier.sendActionError(client, 'Joueur introuvable.');
      return;
    }

    if (!Number.isFinite(message.repeatCount)) {
      this.notifier.sendActionError(client, 'Le nombre de repetitions est invalide.');
      return;
    }

    const repeatCount = Math.max(1, Math.trunc(message.repeatCount));

    if (repeatCount < 1) {
      this.notifier.sendActionError(client, 'Le nombre de repetitions est invalide.');
      return;
    }

    const card =
      player.zones.leader.instanceId === message.instanceId
        ? player.zones.leader
        : player.zones.stage.instanceId === message.instanceId
          ? player.zones.stage
          : [
              ...player.zones.characters,
              ...player.zones.cost,
              ...player.zones.hand,
              ...player.zones.life,
              ...player.zones.trash,
              ...player.zones.deck,
              ...player.zones.donDeck,
            ].find((candidate) => candidate.instanceId === message.instanceId) ??
            null;

    if (!card || card.ownerSessionId !== client.sessionId) {
      this.notifier.sendActionError(client, 'Carte introuvable.');
      return;
    }

    for (let index = 0; index < repeatCount; index += 1) {
      this.effectBoundary.clearResolvedOncePerTurnKeysForSource(card.instanceId);
      this.effectBoundary.emitCardEvent(message.triggerType, client.sessionId, card);

      if (this.effectBoundary.hasPendingPlayerInteraction()) {
        break;
      }
    }

    this.stateServices.addLiveLog(
      `${player.displayName} rejoue ${card.name} via l'outil de debug (${repeatCount}x).`,
      'system',
      player.sessionId,
    );
    this.rebuildAllClientViews();
  }

  private knockOutCharacter(
    owner: DuelPlayer,
    card: DuelCard,
    reason: 'battle' | 'effect' = 'battle',
    skipReplacement = false,
  ) {
    knockOutCharacterInState(
      this.stateServices.createCharacterKoDeps(
        this.state,
        this.effectBoundary,
        {
          isolated: false,
        },
      ),
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
        const result =
          runtime.gameplayRuntime.effectBoundary.resolveManualTriggerDecision(
            client.sessionId,
            message.activate,
          );

        if (!result.ok) {
          return { handled: false, errorMessage: result.error };
        }

        runtime.gameplayRuntime.combatEngine.endCombat();

        return { handled: true };
      },
      { allowPendingInteraction: true },
    );
  }

  private async handlePlayCard(client: Client, message: PlayCardMessage) {
    this.notifier.bindMainPhaseClient(client);
    await this.executeIsolatedMainPhaseCommand(client, (runtime) =>
      this.toHandledCommandResult(
        runtime.gameplayRuntime.mainPhaseEngine.handlePlayCard(
          client.sessionId,
          message,
        ),
      ),
    );
  }

  private async handleAttachDon(client: Client, message: AttachDonMessage) {
    this.notifier.bindMainPhaseClient(client);
    await this.executeIsolatedMainPhaseCommand(client, (runtime) =>
      this.toHandledCommandResult(
        runtime.gameplayRuntime.mainPhaseEngine.handleAttachDon(
          client.sessionId,
          message,
        ),
      ),
    );
  }

  private handleResolveEffectDecision(
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
  }

  private getActiveEffectBoundary(): DuelEffectBoundary {
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
    ) => { handled: false } | { handled: true },
  ): Promise<void> {
    await this.isolatedCommandDispatcher.runMainPhaseCommand(client, executor);
  }

  private async executeIsolatedTurnCommand(
    client: Client,
    executor: (
      runtime: IsolatedGameplayRuntime,
    ) => { handled: false; errorMessage?: string } | { handled: true },
  ): Promise<void> {
    await this.isolatedCommandDispatcher.runTurnCommand(client, executor);
  }

  private async executeIsolatedCombatCommand(
    client: Client,
    executor: (
      runtime: IsolatedGameplayRuntime,
    ) => { handled: false; errorMessage?: string } | { handled: true },
    options?: { allowPendingInteraction?: boolean },
  ): Promise<void> {
    await this.isolatedCommandDispatcher.runCombatCommand(
      client,
      executor,
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

  private initializeStateServices(): void {
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
  }

  private initializeRuntimeServices(): void {
    this.runtimeController = new DuelRoomRuntimeController({
      liveState: this.state,
      getPendingRuntime: () => this.pendingInteractionRuntime,
    });
    const bootstrap = createDuelRoomRuntimeBootstrap({
      state: this.state,
      statsService: services?.statsService,
      getClients: () => this.clients,
      broadcast: (type, message) => this.broadcast(type, message),
      getPendingRuntime: () => this.pendingInteractionRuntime,
      setPendingRuntime: (runtime) => {
        this.pendingInteractionRuntime =
          runtime as IsolatedGameplayRuntime | null;
      },
      getActiveEffectDecision: () =>
        this.getActiveEffectBoundary().getPendingEffectDecision(),
      createLifecycleForState: (state, runtimeOptions) =>
        this.stateServices.createLifecycleForState(state, runtimeOptions),
      createLiveGameplayRuntime: (state) =>
        this.createLiveGameplayRuntime(state),
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
      hasPendingPlayerInteraction: () => this.hasPendingPlayerInteraction(),
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
      disconnectRoom: () => this.disconnect(),
    });

    this.lifecycle = bootstrap.lifecycle;
    this.notifier = bootstrap.notifier;
    this.isolatedCommandRunner = bootstrap.isolatedCommandRunner;
    this.isolatedCommandDispatcher = new DuelRoomIsolatedCommandDispatcher(
      this.isolatedCommandRunner,
    );
    this.interactionRuntimeCoordinator =
      bootstrap.interactionRuntimeCoordinator;
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
      rebuildAllClientViews: () => this.rebuildAllClientViews(),
      syncPendingEffectDecision: () =>
        this.notifier.syncPendingEffectDecision(
          this.getActiveEffectBoundary().getPendingEffectDecision(),
        ),
    });
  }

  private installLiveGameplayRuntime(): void {
    const gameplayRuntime = this.createLiveGameplayRuntime(this.state);

    this.effectBoundary = gameplayRuntime.effectBoundary;
    this.runtimeController.installGameplayRuntime(gameplayRuntime);
  }

  private async setDescriptionMetadata(rawDescription?: string): Promise<void> {
    const description = rawDescription?.trim().slice(0, MAX_DESCRIPTION_LENGTH);

    if (description) {
      await this.setMetadata({ description });
    }
  }

  private registerMessageHandlers(): void {
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
      handleDebugDrawFromDeck: (client, message) =>
        this.handleDebugDrawFromDeck(client, message),
      handleDebugTriggerCardEffect: (client, message) =>
        this.handleDebugTriggerCardEffect(client, message),
      handleFinishCounterStep: (client) => this.handleFinishCounterStep(client),
      handleResolveTrigger: (client, message) =>
        this.handleResolveTrigger(client, message),
      handleResolveEffectDecision: (client, message) =>
        this.handleResolveEffectDecision(client, message),
    });
  }

  private toHandledCommandResult(
    handled: boolean,
  ): { handled: false } | { handled: true } {
    return handled ? { handled: true } : { handled: false };
  }
}
