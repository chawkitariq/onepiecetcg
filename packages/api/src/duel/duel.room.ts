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
  type DuelLogLevel,
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
import {
  createDuelRoomGameplayRuntime,
  type DuelRoomGameplayRuntime,
} from './room/duel-room-gameplay-runtime';
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

type CardKeywordSnapshot = {
  hasRush: boolean;
  hasDoubleAttack: boolean;
  hasBanish: boolean;
  canAttackActiveCharacters: boolean;
  mustBeAttackTarget: boolean;
  cannotAttack: boolean;
  cannotAttackLeaderOnTurnPlayed: boolean;
  cannotBlock: boolean;
  cannotBeKoedInBattle: boolean;
  cannotBeKoedByEffects: boolean;
  cannotBeKoedBySlashInBattle: boolean;
  cannotBeKoedByStrikeInBattle: boolean;
  winOnDeckOut: boolean;
  cannotBeRemovedByOpponentEffects: boolean;
  skipNextRefreshPhases: number;
};

type RefreshStepSnapshot = {
  attachedDonSources: Map<
    string,
    {
      ownerSessionId: string;
      cardDefinitionId: string;
      attachedDon: number;
    }
  >;
  restedCostCardIds: Set<string>;
};

type CostZoneRestSnapshot = Map<string, boolean>;

type OrderedZoneSnapshot = Map<string, string[]>;

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
      addLog: (message, actorSessionId) =>
        this.addLog(message, 'system', actorSessionId),
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
      addLog: (message, level, actorSessionId) =>
        this.addLog(message, level, actorSessionId),
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
    this.installGameplayRuntime(gameplayRuntime);

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

    this.addLog(
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
    if (consented) {
      const state = cloneRoomDuelState(this.state);
      const lifecycle = this.createLifecycleForState(state, { isolated: true });
      lifecycle.importState(this.lifecycle.exportState());
      const player = state.players.get(client.sessionId);

      if (!player) {
        return;
      }

      player.connected = false;
      this.appendLogToState(
        state,
        `${player.displayName} est deconnecte.`,
        'system',
        player.sessionId,
      );
      const snapshot = this.captureStateSnapshotFrom(state);
      lifecycle.declareForfeitIfMatchInProgress(player);
      const shouldPersistConcession =
        snapshot.phase !== 'finished' &&
        state.phase === 'finished' &&
        state.endReason === 'forfeit';

      if (shouldPersistConcession) {
        try {
          await this.persistRoomEventsOrThrow(client.sessionId, [
            {
              type: 'PlayerConceded',
              version: 1,
              payload: { playerId: this.getPlayerId(client.sessionId) },
            },
            ...this.buildTerminalEventDraftsFor(snapshot, state),
          ]);
        } catch (error) {
          this.logger.error('Failed to persist duel domain events', error);
          return;
        }
      }

      adoptRoomDuelState(this.state, state);
      this.lifecycle.importState(lifecycle.exportState());
      this.lifecycle.recordMatchResult();
      this.lifecycle.removePlayer(client.sessionId);
      this.rebuildAllClientViews();
      this.notifier.syncPendingEffectDecision(
        this.effectBoundary.getPendingEffectDecision(),
      );
      return;
    }

    const player = this.state.players.get(client.sessionId);

    if (!player) {
      return;
    }

    player.connected = false;
    this.addLog(
      `${player.displayName} est deconnecte.`,
      'system',
      player.sessionId,
    );

    try {
      await this.allowReconnection(client, RECONNECTION_SECONDS);
      player.connected = true;
      this.addLog(
        `${player.displayName} est reconnecte.`,
        'system',
        player.sessionId,
      );
      this.notifier.sendPendingEffectDecisionToClient(client);
    } catch {
      this.addLog(
        `${player.displayName} a perdu par forfait.`,
        'system',
        player.sessionId,
      );
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
    const runtime = this.createIsolatedGameplayRuntime();
    runtime.gameplayRuntime.turnEngine.initializeGame();
    await this.ensureEventStreamInitialized(runtime.state);
    this.adoptIsolatedRuntime(runtime);
    void this.lock();
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
      !this.eventStreamCreated
    ) {
      this.adoptIsolatedRuntime(runtime);
      return;
    }

    try {
      await this.persistRoomEventsOrThrow(client.sessionId, [
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

    this.adoptIsolatedRuntime(runtime);
  }

  private async handleMulligan(client: Client, message: MulliganMessage) {
    await this.executeIsolatedTurnCommand(
      client,
      (runtime) => {
        const before = this.captureStateSnapshotFrom(runtime.state);
        runtime.gameplayRuntime.turnEngine.handleMulligan(
          client.sessionId,
          message.mulligan,
        );

        return {
          handled: true,
          eventDrafts: this.buildMulliganEventDraftsFor(
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
        const before = this.captureStateSnapshotFrom(runtime.state);
        const beforeLocations = this.captureCardLocationsFrom(runtime.state);
        const beforeRefresh = this.captureRefreshStepSnapshotFrom(
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
            ...this.buildTurnStepDraftsFor(
              before,
              beforeLocations,
              beforeRefresh,
              runtime.state,
            ),
            ...this.buildTurnTransitionDraftsFor(before, runtime.state),
            ...this.buildTerminalEventDraftsFor(before, runtime.state),
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
        const before = this.captureStateSnapshotFrom(runtime.state);
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
            ...this.buildTerminalEventDraftsFor(before, runtime.state),
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
        const before = this.captureStateSnapshotFrom(runtime.state);
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
            ...this.buildTerminalEventDraftsFor(before, runtime.state),
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
        const before = this.captureStateSnapshotFrom(runtime.state);
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
            ...this.buildTerminalEventDraftsFor(before, runtime.state),
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
        const before = this.captureStateSnapshotFrom(runtime.state);
        const beforeLocations = this.captureCardLocationsFrom(runtime.state);
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
          this.captureCardLocationsFrom(runtime.state),
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
            ...this.buildTerminalEventDraftsFor(before, runtime.state),
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
    this.notifier.bindCombatClient(client);
    await this.executeIsolatedCombatCommand(
      client,
      (runtime) => {
        const before = this.captureStateSnapshotFrom(runtime.state);
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
            ...this.buildTerminalEventDraftsFor(before, runtime.state),
          ],
        };
      },
      'Impossible de resoudre le declenchement pour le moment.',
    );
  }

  private async handlePlayCard(client: Client, message: PlayCardMessage) {
    this.notifier.bindMainPhaseClient(client);
    await this.executeIsolatedMainPhaseCommand(
      client,
      (runtime) => {
        const before = this.captureStateSnapshotFrom(runtime.state);
        const beforeCostRest = this.captureCostZoneRestSnapshotFrom(
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

        const restedDonCount = this.countNewlyRestedCostDonCards(
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
          this.findCardByInstanceIdInState(runtime.state, targetInstanceId)
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
    const before = this.captureStateSnapshot();
    const beforeLocations = this.captureCardLocationsFrom(this.state);
    const beforeDeckOrder = this.captureOrderedZoneSnapshotFrom(
      this.state,
      'deck',
    );
    const beforeLifeOrder = this.captureOrderedZoneSnapshotFrom(
      this.state,
      'life',
    );
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
      ...this.buildCardMovementDraftsFor(
        beforeLocations,
        beforeDeckOrder,
        beforeLifeOrder,
        this.state,
      ),
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
    return this.captureCardLocationsFrom(this.state);
  }

  private captureCardLocationsFrom(
    state: DuelState,
  ): Map<string, CardLocation> {
    const locations = new Map<string, CardLocation>();

    for (const player of state.players.values()) {
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
    return this.buildTurnTransitionDraftsFor(before, this.state);
  }

  private buildMulliganEventDraftsFor(
    before: DuelStateSnapshot,
    state: DuelState,
    actorSessionId: string,
    tookMulligan: boolean,
  ): DomainEventDraft[] {
    const drafts: DomainEventDraft[] = [
      {
        type: 'MulliganRequested',
        version: 1,
        payload: {
          playerId: this.getPlayerId(actorSessionId),
          tookMulligan,
        },
      },
      ...(tookMulligan
        ? [
            {
              type: 'DeckShuffled',
              version: 1,
              payload: {
                playerId: this.getPlayerId(actorSessionId),
              },
            } satisfies DomainEventDraft,
          ]
        : []),
      {
        type: 'MulliganResolved',
        version: 1,
        payload: {
          playerId: this.getPlayerId(actorSessionId),
          tookMulligan,
        },
      },
    ];

    if (!before.startedAt && state.startedAt) {
      drafts.push(
        {
          type: 'MatchStarted',
          version: 1,
          payload: {
            startedAt: state.startedAt,
            firstPlayerId: this.getPlayerId(state.firstPlayerSessionId),
          },
        },
        {
          type: 'TurnStarted',
          version: 1,
          payload: {
            turn: state.turn,
            playerId: this.getPlayerId(state.activePlayerSessionId),
          },
        },
        {
          type: 'PhaseChanged',
          version: 1,
          payload: {
            turn: state.turn,
            playerId: this.getPlayerId(state.activePlayerSessionId),
            fromPhase: before.phase,
            toPhase: state.phase,
          },
        },
      );
    }

    return drafts;
  }

  private buildTurnTransitionDraftsFor(
    before: DuelStateSnapshot,
    state: DuelState,
  ): DomainEventDraft[] {
    const drafts: DomainEventDraft[] = [];

    if (before.phase === 'end' && state.turn > before.turn) {
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
            turn: state.turn,
            playerId: this.getPlayerId(state.activePlayerSessionId),
          },
        },
      );
    }

    if (before.phase !== state.phase || before.turn !== state.turn) {
      drafts.push({
        type: 'PhaseChanged',
        version: 1,
        payload: {
          turn: state.turn,
          playerId: this.getPlayerId(state.activePlayerSessionId),
          fromPhase: before.phase,
          toPhase: state.phase,
        },
      });
    }

    return drafts;
  }

  private buildTurnStepDraftsFor(
    before: DuelStateSnapshot,
    beforeLocations: Map<string, CardLocation>,
    beforeRefresh: RefreshStepSnapshot,
    state: DuelState,
  ): DomainEventDraft[] {
    const movedCards = this.findMovedCards(
      beforeLocations,
      this.captureCardLocationsFrom(state),
    );
    const drafts: DomainEventDraft[] = [];

    if (before.phase === 'refresh' && state.phase === 'draw') {
      for (const movedCard of movedCards) {
        if (movedCard.from.zone !== 'deck' || movedCard.to.zone !== 'hand') {
          continue;
        }

        drafts.push({
          type: 'CardDrawn',
          version: 1,
          payload: {
            playerId: this.getPlayerId(movedCard.to.ownerSessionId),
            count: 1,
            cardInstanceId: movedCard.instanceId,
            cardDefinitionId: movedCard.to.cardId,
          },
        });
      }
    }

    if (before.phase === 'draw' && state.phase === 'don') {
      const donAddedByPlayer = new Map<string, number>();

      for (const movedCard of movedCards) {
        if (movedCard.from.zone !== 'donDeck' || movedCard.to.zone !== 'cost') {
          continue;
        }

        donAddedByPlayer.set(
          movedCard.to.ownerSessionId,
          (donAddedByPlayer.get(movedCard.to.ownerSessionId) ?? 0) + 1,
        );
      }

      for (const [ownerSessionId, count] of donAddedByPlayer.entries()) {
        drafts.push({
          type: 'DonAdded',
          version: 1,
          payload: {
            playerId: this.getPlayerId(ownerSessionId),
            count,
          },
        });
      }
    }

    if (before.phase === 'end' && state.phase === 'refresh') {
      for (const [instanceId, source] of beforeRefresh.attachedDonSources) {
        const card = this.findCardByInstanceIdInState(state, instanceId);

        if (!card || card.attachedDon >= source.attachedDon) {
          continue;
        }

        drafts.push({
          type: 'DonDetached',
          version: 1,
          payload: {
            playerId: this.getPlayerId(source.ownerSessionId),
            sourceInstanceId: instanceId,
            sourceCardId: source.cardDefinitionId,
            count: source.attachedDon - card.attachedDon,
          },
        });
      }

      const refreshedByPlayer = new Map<string, number>();

      for (const player of state.players.values()) {
        for (const donCard of player.zones.cost) {
          if (
            beforeRefresh.restedCostCardIds.has(donCard.instanceId) &&
            !donCard.rested
          ) {
            refreshedByPlayer.set(
              player.sessionId,
              (refreshedByPlayer.get(player.sessionId) ?? 0) + 1,
            );
          }
        }
      }

      for (const [ownerSessionId, count] of refreshedByPlayer.entries()) {
        drafts.push({
          type: 'DonRefreshed',
          version: 1,
          payload: {
            playerId: this.getPlayerId(ownerSessionId),
            count,
          },
        });
      }
    }

    return drafts;
  }

  private buildCardMovementDraftsFor(
    beforeLocations: Map<string, CardLocation>,
    beforeDeckOrder: OrderedZoneSnapshot,
    beforeLifeOrder: OrderedZoneSnapshot,
    state: DuelState,
  ): DomainEventDraft[] {
    const drafts: DomainEventDraft[] = [];
    const shuffledPlayers = this.findShuffledDeckPlayers(
      beforeDeckOrder,
      state,
    );

    for (const movedCard of this.findMovedCards(
      beforeLocations,
      this.captureCardLocationsFrom(state),
    )) {
      const fromZone = this.toEventZoneName(movedCard.from.zone);
      const toZone = this.toEventZoneName(movedCard.to.zone);
      const playerId = this.getPlayerId(movedCard.to.ownerSessionId);

      drafts.push({
        type: 'CardMoved',
        version: 1,
        payload: {
          playerId,
          cardInstanceId: movedCard.instanceId,
          cardDefinitionId: movedCard.to.cardId,
          fromZone,
          toZone,
        },
      });

      if (movedCard.to.zone === 'hand' && movedCard.from.zone !== 'hand') {
        drafts.push({
          type: 'CardReturnedToHand',
          version: 1,
          payload: {
            playerId,
            cardInstanceId: movedCard.instanceId,
            cardDefinitionId: movedCard.to.cardId,
            fromZone,
          },
        });
      }

      if (movedCard.to.zone === 'deck') {
        drafts.push({
          type: 'CardPlacedOnDeck',
          version: 1,
          payload: {
            playerId,
            cardInstanceId: movedCard.instanceId,
            cardDefinitionId: movedCard.to.cardId,
            fromZone,
            placement: this.inferZonePlacement(
              movedCard.instanceId,
              state.players.get(movedCard.to.ownerSessionId)?.zones.deck,
              beforeDeckOrder.get(movedCard.to.ownerSessionId),
            ),
          },
        });
      }

      if (movedCard.to.zone === 'life') {
        drafts.push({
          type: 'CardAddedToLife',
          version: 1,
          payload: {
            playerId,
            cardInstanceId: movedCard.instanceId,
            cardDefinitionId: movedCard.to.cardId,
            fromZone,
            placement: this.inferZonePlacement(
              movedCard.instanceId,
              state.players.get(movedCard.to.ownerSessionId)?.zones.life,
              beforeLifeOrder.get(movedCard.to.ownerSessionId),
            ),
          },
        });
      }
    }

    for (const ownerSessionId of shuffledPlayers) {
      drafts.push({
        type: 'DeckShuffled',
        version: 1,
        payload: {
          playerId: this.getPlayerId(ownerSessionId),
        },
      });
    }

    return drafts;
  }

  private captureRefreshStepSnapshotFrom(
    state: DuelState,
  ): RefreshStepSnapshot {
    const attachedDonSources = new Map<
      string,
      {
        ownerSessionId: string;
        cardDefinitionId: string;
        attachedDon: number;
      }
    >();
    const restedCostCardIds = new Set<string>();

    for (const player of state.players.values()) {
      if (player.zones.leader.attachedDon > 0) {
        attachedDonSources.set(player.zones.leader.instanceId, {
          ownerSessionId: player.sessionId,
          cardDefinitionId: player.zones.leader.cardId,
          attachedDon: player.zones.leader.attachedDon,
        });
      }

      for (const character of player.zones.characters) {
        if (character.attachedDon > 0) {
          attachedDonSources.set(character.instanceId, {
            ownerSessionId: player.sessionId,
            cardDefinitionId: character.cardId,
            attachedDon: character.attachedDon,
          });
        }
      }

      for (const donCard of player.zones.cost) {
        if (donCard.rested) {
          restedCostCardIds.add(donCard.instanceId);
        }
      }
    }

    return {
      attachedDonSources,
      restedCostCardIds,
    };
  }

  private captureOrderedZoneSnapshotFrom(
    state: DuelState,
    zone: 'deck' | 'life',
  ): OrderedZoneSnapshot {
    const snapshot: OrderedZoneSnapshot = new Map();

    for (const player of state.players.values()) {
      snapshot.set(
        player.sessionId,
        Array.from(player.zones[zone], (card) => card.instanceId),
      );
    }

    return snapshot;
  }

  private inferZonePlacement(
    instanceId: string,
    cards: ArrayLike<DuelCard> | undefined,
    beforeOrder: string[] | undefined,
  ): 'top' | 'bottom' | 'unknown' {
    const afterOrder = cards
      ? Array.from(cards, (card) => card.instanceId)
      : [];

    if (afterOrder[0] === instanceId) {
      return 'top';
    }

    if (afterOrder.at(-1) === instanceId) {
      return 'bottom';
    }

    if (!beforeOrder) {
      return 'unknown';
    }

    const afterIndex = afterOrder.indexOf(instanceId);

    if (afterIndex === -1) {
      return 'unknown';
    }

    const firstSharedBefore = beforeOrder.find((existingId) =>
      afterOrder.includes(existingId),
    );

    if (firstSharedBefore) {
      const firstSharedAfterIndex = afterOrder.indexOf(firstSharedBefore);

      if (afterIndex < firstSharedAfterIndex) {
        return 'top';
      }
    }

    const lastSharedBefore = [...beforeOrder]
      .reverse()
      .find((existingId) => afterOrder.includes(existingId));

    if (lastSharedBefore) {
      const lastSharedAfterIndex = afterOrder.indexOf(lastSharedBefore);

      if (afterIndex > lastSharedAfterIndex) {
        return 'bottom';
      }
    }

    return 'unknown';
  }

  private findShuffledDeckPlayers(
    beforeDeckOrder: OrderedZoneSnapshot,
    state: DuelState,
  ): string[] {
    const shuffledPlayers: string[] = [];

    for (const player of state.players.values()) {
      const beforeOrder = beforeDeckOrder.get(player.sessionId) ?? [];
      const afterOrder = Array.from(
        player.zones.deck,
        (card) => card.instanceId,
      );
      const sharedCardIds = beforeOrder.filter((cardId) =>
        afterOrder.includes(cardId),
      );

      if (sharedCardIds.length < 2) {
        continue;
      }

      const afterSharedOrder = afterOrder.filter((cardId) =>
        sharedCardIds.includes(cardId),
      );

      if (
        !sharedCardIds.every(
          (cardId, index) => afterSharedOrder[index] === cardId,
        )
      ) {
        shuffledPlayers.push(player.sessionId);
      }
    }

    return shuffledPlayers;
  }

  private toEventZoneName(
    zone: CardLocation['zone'],
  ):
    | 'LEADER'
    | 'STAGE_AREA'
    | 'DECK'
    | 'DON_DECK'
    | 'HAND'
    | 'LIFE'
    | 'CHARACTER_AREA'
    | 'COST_AREA'
    | 'TRASH' {
    switch (zone) {
      case 'leader':
        return 'LEADER';
      case 'stage':
        return 'STAGE_AREA';
      case 'deck':
        return 'DECK';
      case 'donDeck':
        return 'DON_DECK';
      case 'hand':
        return 'HAND';
      case 'life':
        return 'LIFE';
      case 'characters':
        return 'CHARACTER_AREA';
      case 'cost':
        return 'COST_AREA';
      case 'trash':
        return 'TRASH';
    }
  }

  private captureCostZoneRestSnapshotFrom(
    state: DuelState,
  ): CostZoneRestSnapshot {
    const snapshot: CostZoneRestSnapshot = new Map();

    for (const player of state.players.values()) {
      for (const donCard of player.zones.cost) {
        snapshot.set(donCard.instanceId, donCard.rested);
      }
    }

    return snapshot;
  }

  private countNewlyRestedCostDonCards(
    before: CostZoneRestSnapshot,
    state: DuelState,
    ownerSessionId: string,
  ): number {
    let count = 0;
    const player = state.players.get(ownerSessionId);

    if (!player) {
      return 0;
    }

    for (const donCard of player.zones.cost) {
      if (before.get(donCard.instanceId) === false && donCard.rested) {
        count += 1;
      }
    }

    return count;
  }

  private findCardByInstanceIdInState(
    state: DuelState,
    instanceId: string,
  ): DuelCard | null {
    for (const player of state.players.values()) {
      if (player.zones.leader.instanceId === instanceId) {
        return player.zones.leader;
      }

      if (player.zones.stage.instanceId === instanceId) {
        return player.zones.stage;
      }

      for (const zone of [
        player.zones.deck,
        player.zones.donDeck,
        player.zones.hand,
        player.zones.life,
        player.zones.characters,
        player.zones.cost,
        player.zones.trash,
      ]) {
        const match = zone.find((card) => card.instanceId === instanceId);

        if (match) {
          return match;
        }
      }
    }

    return null;
  }

  private buildTerminalEventDrafts(
    before: DuelStateSnapshot,
  ): DomainEventDraft[] {
    return this.buildTerminalEventDraftsFor(before, this.state);
  }

  private buildTerminalEventDraftsFor(
    before: DuelStateSnapshot,
    state: DuelState,
  ): DomainEventDraft[] {
    if (before.phase === 'finished' || state.phase !== 'finished') {
      return [];
    }

    return [
      {
        type: 'MatchEnded',
        version: 1,
        payload: {
          winnerPlayerId: this.getPlayerId(state.winnerSessionId),
          endReason: state.endReason,
          finishedAt: state.finishedAt,
        },
      },
    ];
  }

  private async ensureEventStreamInitialized(
    state = this.state,
  ): Promise<void> {
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
      participants: this.lifecycle.listParticipants(),
    });

    this.eventStreamCreated = true;

    const drafts: DomainEventDraft[] = [];

    for (const player of state.players.values()) {
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

    await this.persistRoomEventsOrThrow(undefined, drafts);
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
      addLog: (message, actorSessionId) =>
        options?.isolated
          ? this.appendLogToState(state, message, 'system', actorSessionId)
          : this.addLog(message, 'system', actorSessionId),
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

  private installGameplayRuntime(gameplayRuntime: DuelRoomGameplayRuntime): void {
    this.effectBoundary = gameplayRuntime.effectBoundary;
    this.turnEngine = gameplayRuntime.turnEngine;
    this.cardQueryEngine = gameplayRuntime.cardQueryEngine;
    this.zoneEngine = gameplayRuntime.zoneEngine;
    this.mainPhaseEngine = gameplayRuntime.mainPhaseEngine;
    this.combatEngine = gameplayRuntime.combatEngine;
    this.runtimeState = gameplayRuntime.runtimeState;
  }

  private createIsolatedGameplayRuntime() {
    const state = cloneRoomDuelState(this.state);
    const keywordSnapshot = this.captureCardKeywordSnapshot(state);
    const lifecycle = this.createLifecycleForState(state, { isolated: true });
    lifecycle.importState(this.lifecycle.exportState());
    const mainPhaseErrors: string[] = [];
    const combatErrors: string[] = [];
    const gameplayRuntime = createDuelRoomGameplayRuntime({
      state,
      maxClients: this.maxClients,
      addLog: (message, level, actorSessionId) =>
        this.appendLogToState(state, message, level, actorSessionId),
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
    this.restoreCardKeywordSnapshot(state, keywordSnapshot);

    return {
      state,
      lifecycle,
      gameplayRuntime,
      runtimeState: new DuelRoomRuntimeState({ state }),
      mainPhaseErrors,
      combatErrors,
    };
  }

  private captureCardKeywordSnapshot(
    state: DuelState,
  ): Map<string, CardKeywordSnapshot> {
    const snapshot = new Map<string, CardKeywordSnapshot>();

    for (const player of state.players.values()) {
      for (const card of this.iteratePlayerCards(player)) {
        snapshot.set(card.instanceId, {
          hasRush: card.hasRush,
          hasDoubleAttack: card.hasDoubleAttack,
          hasBanish: card.hasBanish,
          canAttackActiveCharacters: card.canAttackActiveCharacters,
          mustBeAttackTarget: card.mustBeAttackTarget,
          cannotAttack: card.cannotAttack,
          cannotAttackLeaderOnTurnPlayed: card.cannotAttackLeaderOnTurnPlayed,
          cannotBlock: card.cannotBlock,
          cannotBeKoedInBattle: card.cannotBeKoedInBattle,
          cannotBeKoedByEffects: card.cannotBeKoedByEffects,
          cannotBeKoedBySlashInBattle: card.cannotBeKoedBySlashInBattle,
          cannotBeKoedByStrikeInBattle: card.cannotBeKoedByStrikeInBattle,
          winOnDeckOut: card.winOnDeckOut,
          cannotBeRemovedByOpponentEffects:
            card.cannotBeRemovedByOpponentEffects,
          skipNextRefreshPhases: card.skipNextRefreshPhases,
        });
      }
    }

    return snapshot;
  }

  private restoreCardKeywordSnapshot(
    state: DuelState,
    snapshot: Map<string, CardKeywordSnapshot>,
  ): void {
    for (const player of state.players.values()) {
      for (const card of this.iteratePlayerCards(player)) {
        const cardSnapshot = snapshot.get(card.instanceId);

        if (!cardSnapshot) {
          continue;
        }

        card.hasRush ||= cardSnapshot.hasRush;
        card.hasDoubleAttack ||= cardSnapshot.hasDoubleAttack;
        card.hasBanish ||= cardSnapshot.hasBanish;
        card.canAttackActiveCharacters ||=
          cardSnapshot.canAttackActiveCharacters;
        card.mustBeAttackTarget ||= cardSnapshot.mustBeAttackTarget;
        card.cannotAttack ||= cardSnapshot.cannotAttack;
        card.cannotAttackLeaderOnTurnPlayed ||=
          cardSnapshot.cannotAttackLeaderOnTurnPlayed;
        card.cannotBlock ||= cardSnapshot.cannotBlock;
        card.cannotBeKoedInBattle ||= cardSnapshot.cannotBeKoedInBattle;
        card.cannotBeKoedByEffects ||= cardSnapshot.cannotBeKoedByEffects;
        card.cannotBeKoedBySlashInBattle ||=
          cardSnapshot.cannotBeKoedBySlashInBattle;
        card.cannotBeKoedByStrikeInBattle ||=
          cardSnapshot.cannotBeKoedByStrikeInBattle;
        card.winOnDeckOut ||= cardSnapshot.winOnDeckOut;
        card.cannotBeRemovedByOpponentEffects ||=
          cardSnapshot.cannotBeRemovedByOpponentEffects;
        card.skipNextRefreshPhases = Math.max(
          card.skipNextRefreshPhases,
          cardSnapshot.skipNextRefreshPhases,
        );
      }
    }
  }

  private *iteratePlayerCards(player: DuelPlayer): Iterable<DuelCard> {
    yield player.zones.leader;

    if (player.zones.stage.instanceId) {
      yield player.zones.stage;
    }

    for (const zone of [
      player.zones.deck,
      player.zones.donDeck,
      player.zones.hand,
      player.zones.life,
      player.zones.characters,
      player.zones.cost,
      player.zones.trash,
    ]) {
      for (const card of zone) {
        yield card;
      }
    }
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

  private async executeIsolatedTurnCommand(
    client: Client,
    executor: (
      runtime: IsolatedGameplayRuntime,
    ) =>
      | { handled: false; errorMessage?: string }
      | { handled: true; eventDrafts: DomainEventDraft[] },
    outboxFailureMessage: string,
  ): Promise<void> {
    if (this.effectBoundary.hasPendingPlayerInteraction()) {
      this.notifier.sendActionError(client, "Une decision d'effet est en attente.");
      return;
    }

    const runtime = this.createIsolatedGameplayRuntime();
    const result = executor(runtime);

    if (!result.handled) {
      if (result.errorMessage) {
        this.notifier.sendActionError(client, result.errorMessage);
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

  private async executeIsolatedCombatCommand(
    client: Client,
    executor: (
      runtime: IsolatedGameplayRuntime,
    ) =>
      | { handled: false; errorMessage?: string }
      | { handled: true; eventDrafts: DomainEventDraft[] },
    outboxFailureMessage: string,
  ): Promise<void> {
    if (this.effectBoundary.hasPendingPlayerInteraction()) {
      this.notifier.sendActionError(client, "Une decision d'effet est en attente.");
      return;
    }

    const runtime = this.createIsolatedGameplayRuntime();
    const result = executor(runtime);

    if (!result.handled) {
      if (result.errorMessage) {
        this.notifier.sendActionError(client, result.errorMessage);
        return;
      }

      const errorMessage = runtime.combatErrors.at(-1);

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
    const lifecycleState = runtime.lifecycle.exportState();
    this.setState(runtime.state);
    this.installGameplayRuntime(runtime.gameplayRuntime);
    this.lifecycle = this.createLifecycleForState(this.state);
    this.lifecycle.importState(lifecycleState);
    this.lifecycle.recordMatchResult();
    this.rebuildAllClientViews();
    this.notifier.syncPendingEffectDecision(
      this.effectBoundary.getPendingEffectDecision(),
    );
  }

  private rebuildAllClientViews(): void {
    for (const client of this.clients) {
      client.view = new StateView();
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

  private appendLogToState(
    state: DuelState,
    message: string,
    level: DuelLogLevel = 'info',
    actorSessionId = '',
  ): void {
    const log = new DuelLog();
    log.id = `${Date.now()}:${state.logs.length}`;
    log.message = message;
    log.level = level;
    log.actorSessionId = actorSessionId;
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
      reason === 'effect' ? 'effect' : 'action',
      owner.sessionId,
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

  private addLog(
    message: string,
    level: DuelLogLevel = 'info',
    actorSessionId = '',
  ) {
    const log = new DuelLog();
    log.id = `${Date.now()}:${this.state.logs.length}`;
    log.message = message;
    log.level = level;
    log.actorSessionId = actorSessionId;
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
