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
import {
  DuelCard,
  DuelLog,
  DuelPlayer,
  DuelState,
  type EffectDecisionResponse,
  type FirstOrSecondChoice,
} from '@onepiecetcg/shared';
import { DuelRoomEffectBoundary } from './duel-room-effect-boundary';
import { DuelCombatEngine } from './duel-combat-engine';
import { DuelCardQueryEngine } from './duel-card-query-engine';
import { DuelMainPhaseEngine } from './duel-main-phase-engine';
import { DuelRoomClientNotifier } from './duel-room-client-notifier';
import { DuelRoomLifecycle } from './duel-room-lifecycle';
import { DuelRoomRuntimeState } from './duel-room-runtime-state';
import { DuelRoomSeatBootstrap } from './duel-room-seat-bootstrap';
import { DuelTurnEngine } from './duel-turn-engine';
import { DuelZoneEngine } from './duel-zone-engine';

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
    this.effectBoundary = new DuelRoomEffectBoundary({
      state: this.state,
      addLog: (message) => this.addLog(message),
      onPendingEffectDecisionChange: (decision) =>
        this.notifier.syncPendingEffectDecision(decision),
      getPlayer: (sessionId) => this.state.players.get(sessionId),
      getOpponentSessionId: (sessionId) =>
        this.runtimeState.getOpponentSessionId(sessionId),
      getCard: (instanceId) =>
        this.cardQueryEngine.getCardByInstanceId(instanceId),
      getCards: (selector, controllerSessionId) =>
        this.cardQueryEngine.getCardsForSelector(selector, controllerSessionId),
      moveCard: (card, destinationPlayerSessionId, destinationZone, options) =>
        this.zoneEngine.moveCardToZone(
          card,
          destinationPlayerSessionId,
          destinationZone,
          options,
        ),
      shuffleDeck: (playerSessionId) => {
        const player = this.state.players.get(playerSessionId);

        if (player) {
          this.shuffle(player.zones.deck);
        }
      },
      drawCard: (playerSessionId) =>
        this.zoneEngine.drawCardForEffect(playerSessionId),
      trashTopDeckCards: (playerSessionId, amount) =>
        this.zoneEngine.trashTopDeckCards(playerSessionId, amount),
      addDonToCost: (playerSessionId, amount, rested) =>
        this.zoneEngine.addDonToCost(playerSessionId, amount, rested),
      attachDon: (playerSessionId, targetInstanceId, amount, options) =>
        this.zoneEngine.attachDonFromCost(
          playerSessionId,
          targetInstanceId,
          amount,
          options,
        ),
      returnDonToDonDeck: (playerSessionId, amount) =>
        this.zoneEngine.returnEffectDonToDeck(playerSessionId, amount),
      koCharacter: (playerSessionId, instanceId, reason) =>
        this.knockOutCharacterById(playerSessionId, instanceId, reason),
      syncPlayer: (playerSessionId) => {
        const player = this.state.players.get(playerSessionId);

        if (player) {
          this.runtimeState.syncZoneCounts(player);
        }
      },
      broadcastCardView: (card) => this.notifier.broadcastCardView(card),
    });
    this.turnEngine = new DuelTurnEngine({
      state: this.state,
      maxClients: this.maxClients,
      effectBoundary: this.effectBoundary,
      addLog: (message) => this.addLog(message),
      shuffle: (cards) => this.shuffle(cards),
      syncZoneCounts: (player) => this.runtimeState.syncZoneCounts(player),
      returnDonToCost: (player, sessionId, count) =>
        this.runtimeState.returnDonToCost(player, sessionId, count),
      getOpponentSessionId: (sessionId) =>
        this.runtimeState.getOpponentSessionId(sessionId),
      isCombatInProgress: () => this.runtimeState.isCombatInProgress(),
      finalizeMatch: (endReason, winnerSessionId) =>
        this.lifecycle.finalizeMatch(endReason, winnerSessionId),
      recordMatchResult: () => this.lifecycle.recordMatchResult(),
      onMatchStarted: (startedAt) => this.lifecycle.markMatchStarted(startedAt),
    });
    this.cardQueryEngine = new DuelCardQueryEngine({
      state: this.state,
      getOpponentSessionId: (sessionId) =>
        this.runtimeState.getOpponentSessionId(sessionId),
      cardPower: (card) => this.runtimeState.cardPower(card),
    });
    this.zoneEngine = new DuelZoneEngine({
      state: this.state,
      effectBoundary: this.effectBoundary,
      broadcastCardView: (card) => this.notifier.broadcastCardView(card),
      syncZoneCounts: (player) => this.runtimeState.syncZoneCounts(player),
      findCardInZone: (player, zone, instanceId) =>
        this.runtimeState.findCardInZone(player, zone, instanceId),
      takeAttachableDonCards: (player, amount, rested) =>
        this.runtimeState.takeAttachableDonCards(player, amount, rested),
    });
    this.mainPhaseEngine = new DuelMainPhaseEngine({
      state: this.state,
      effectBoundary: this.effectBoundary,
      addLog: (message) => this.addLog(message),
      sendError: (message) => this.notifier.sendMainPhaseError(message),
      broadcastCardView: (card) => this.notifier.broadcastCardView(card),
      syncZoneCounts: (player) => this.runtimeState.syncZoneCounts(player),
      unshiftIntoTrash: (player, card) =>
        this.unshiftIntoZone(player.zones.trash, card),
      returnDonToCost: (player, sessionId, count) =>
        this.runtimeState.returnDonToCost(player, sessionId, count),
      findCardInZone: (player, zone, instanceId) =>
        this.runtimeState.findCardInZone(player, zone, instanceId),
      takeUntappedDonCards: (player, amount) =>
        this.runtimeState.takeUntappedDonCards(player, amount),
    });
    this.combatEngine = new DuelCombatEngine({
      state: this.state,
      effectBoundary: this.effectBoundary,
      addLog: (message) => this.addLog(message),
      sendError: (message) => this.notifier.sendCombatError(message),
      broadcastCardView: (card) => this.notifier.broadcastCardView(card),
      syncZoneCounts: (player) => this.runtimeState.syncZoneCounts(player),
      unshiftIntoTrash: (player, card) =>
        this.unshiftIntoZone(player.zones.trash, card),
      isCombatInProgress: () => this.runtimeState.isCombatInProgress(),
      getOpponentSessionId: (sessionId) =>
        this.runtimeState.getOpponentSessionId(sessionId),
      findCardInZone: (player, zone, instanceId) =>
        this.runtimeState.findCardInZone(player, zone, instanceId),
      cardPower: (card) => this.runtimeState.cardPower(card),
      knockOutCharacter: (owner, card) => this.knockOutCharacter(owner, card),
      isProtectedFromBattleKo: (defendingCard, attackerCard) =>
        this.isProtectedFromBattleKo(defendingCard, attackerCard),
      finalizeMatch: (endReason, winnerSessionId) =>
        this.lifecycle.finalizeMatch(endReason, winnerSessionId),
      recordMatchResult: () => this.lifecycle.recordMatchResult(),
    });

    const description = options.description
      ?.trim()
      .slice(0, MAX_DESCRIPTION_LENGTH);

    if (description) {
      await this.setMetadata({ description });
    }

    this.onMessage(
      'chooseFirstOrSecond',
      (client: Client, message: ChooseFirstOrSecondMessage) => {
        this.handleChooseFirstOrSecond(client, message);
      },
    );

    this.onMessage('mulligan', (client: Client, message: MulliganMessage) => {
      this.handleMulligan(client, message);
    });

    this.onMessage('endPhase', (client: Client) => {
      this.handleEndPhase(client);
    });

    this.onMessage('playCard', (client: Client, message: PlayCardMessage) => {
      this.handlePlayCard(client, message);
    });

    this.onMessage('attachDon', (client: Client, message: AttachDonMessage) => {
      this.handleAttachDon(client, message);
    });

    this.onMessage(
      'declareAttack',
      (client: Client, message: DeclareAttackMessage) => {
        this.handleDeclareAttack(client, message);
      },
    );

    this.onMessage(
      'declareBlock',
      (client: Client, message: DeclareBlockMessage) => {
        this.handleDeclareBlock(client, message);
      },
    );

    this.onMessage(
      'declareCounter',
      (client: Client, message: DeclareCounterMessage) => {
        this.handleDeclareCounter(client, message);
      },
    );

    this.onMessage('finishCounterStep', (client: Client) => {
      this.handleFinishCounterStep(client);
    });

    this.onMessage(
      'resolveTrigger',
      (client: Client, message: ResolveTriggerMessage) => {
        this.handleResolveTrigger(client, message);
      },
    );

    this.onMessage(
      'resolveEffectDecision',
      (client: Client, message: ResolveEffectDecisionMessage) => {
        this.handleResolveEffectDecision(client, message);
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
      this.initializeGame();
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
      this.lifecycle.declareForfeitIfMatchInProgress(player);
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

  private initializeGame() {
    this.turnEngine.initializeGame();
    void this.lock();
  }

  private handleChooseFirstOrSecond(
    client: Client,
    message: ChooseFirstOrSecondMessage,
  ) {
    this.turnEngine.handleChooseFirstOrSecond(client.sessionId, message.choice);
  }

  private handleMulligan(client: Client, message: MulliganMessage) {
    this.turnEngine.handleMulligan(client.sessionId, message.mulligan);
  }

  private handleEndPhase(client: Client) {
    const error = this.turnEngine.handleEndPhase(client.sessionId);

    if (error) {
      this.notifier.sendActionError(client, error);
    }
  }

  private handleDeclareAttack(client: Client, message: DeclareAttackMessage) {
    this.notifier.bindCombatClient(client);
    this.combatEngine.handleDeclareAttack(client.sessionId, message);
  }

  private handleDeclareBlock(client: Client, message: DeclareBlockMessage) {
    this.notifier.bindCombatClient(client);
    this.combatEngine.handleDeclareBlock(client.sessionId, message);
  }

  private handleDeclareCounter(client: Client, message: DeclareCounterMessage) {
    this.notifier.bindCombatClient(client);
    this.combatEngine.handleDeclareCounter(client.sessionId, message);
  }

  private handleFinishCounterStep(client: Client) {
    this.notifier.bindCombatClient(client);
    this.combatEngine.handleFinishCounterStep(client.sessionId);
  }

  private knockOutCharacter(
    owner: DuelPlayer,
    card: DuelCard,
    reason: 'battle' | 'effect' = 'battle',
    skipReplacement = false,
  ) {
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
      defendingCard.cannotBeKoedByStrikeInBattle &&
      attackerCard.attributes.includes('Strike')
    );
  }

  private handleResolveTrigger(client: Client, message: ResolveTriggerMessage) {
    const result = this.effectBoundary.resolveManualTriggerDecision(
      client.sessionId,
      message.activate,
    );

    if (!result.ok) {
      this.notifier.sendActionError(client, result.error);
      return;
    }

    this.combatEngine.endCombat();
  }

  private handlePlayCard(client: Client, message: PlayCardMessage) {
    this.notifier.bindMainPhaseClient(client);
    this.mainPhaseEngine.handlePlayCard(client.sessionId, message);
  }

  private handleAttachDon(client: Client, message: AttachDonMessage) {
    this.notifier.bindMainPhaseClient(client);
    this.mainPhaseEngine.handleAttachDon(client.sessionId, message);
  }

  private handleResolveEffectDecision(
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

    this.effectBoundary.answerEffectDecision(message);

    if (
      this.runtimeState.isCombatInProgress() &&
      this.state.combat.step === 'resolving' &&
      !this.effectBoundary.hasPendingPlayerInteraction()
    ) {
      this.combatEngine.endCombat();
    }
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
