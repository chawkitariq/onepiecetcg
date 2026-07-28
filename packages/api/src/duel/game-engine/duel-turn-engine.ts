import {
  DuelCard,
  type DuelEndReason,
  type DuelPlayer,
  type DuelState,
  type FirstOrSecondChoice,
  type GamePhase,
} from '@onepiecetcg/shared';

const DON_PER_TURN = 2;
const FIRST_TURN_DON_COUNT = 1;
const PHASE_ORDER: GamePhase[] = ['refresh', 'draw', 'don', 'main', 'end'];

type DuelTurnEngineEffectBoundary = {
  emitWindowEffects(type: 'onTurnStart' | 'onTurnEnd'): void;
  clearTurnModifiers(): void;
  clearTurnStartModifiers(playerSessionId: string): void;
  reapplyContinuousEffects(): void;
  hasPendingPlayerInteraction(): boolean;
};

/**
 * Dependency contract for the structural setup/turn engine extracted from
 * `DuelRoom`. The realtime room remains the network boundary while this
 * engine owns deterministic phase progression and setup sequencing.
 */
export type DuelTurnEngineDeps = {
  state: DuelState;
  maxClients: number;
  effectBoundary: DuelTurnEngineEffectBoundary;
  addLog: (message: string) => void;
  shuffle: (cards: {
    length: number;
    [index: number]: DuelCard | undefined;
  }) => void;
  syncZoneCounts: (player: DuelPlayer) => void;
  returnDonToCost: (
    player: DuelPlayer,
    sessionId: string,
    count: number,
  ) => void;
  getOpponentSessionId: (sessionId: string) => string | null;
  isCombatInProgress: () => boolean;
  finalizeMatch: (endReason: DuelEndReason, winnerSessionId: string) => void;
  recordMatchResult: () => void;
  onMatchStarted: (startedAt: Date) => void;
};

/**
 * Owns the structural game lifecycle: setup, mulligan, phase advancement,
 * draw/DON!! steps, and end-of-turn transitions.
 */
export class DuelTurnEngine {
  public constructor(private readonly deps: DuelTurnEngineDeps) {}

  /** Deals opening hands, chooses the designated chooser, and enters mulligan setup. */
  public initializeGame(): void {
    for (const player of this.deps.state.players.values()) {
      if (player.zones.hand.length > 0) {
        continue;
      }

      this.deps.shuffle(player.zones.deck);
      this.dealHand(player);
    }

    const sessionIds = Array.from(this.deps.state.players.keys());
    const startingPlayerSessionId =
      sessionIds[Math.floor(Math.random() * sessionIds.length)];
    this.deps.state.startingPlayerSessionId = startingPlayerSessionId ?? '';
    this.deps.state.phase = 'mulligan';

    const startingPlayer = startingPlayerSessionId
      ? this.deps.state.players.get(startingPlayerSessionId)
      : undefined;
    this.deps.addLog(
      `${startingPlayer?.displayName ?? 'Un joueur'} a ete designe pour choisir de jouer en premier ou en second.`,
    );
  }

  /** Applies the designated player's first/second choice during mulligan setup. */
  public handleChooseFirstOrSecond(
    clientSessionId: string,
    choice: FirstOrSecondChoice,
  ): void {
    if (
      this.deps.state.phase !== 'mulligan' ||
      this.deps.state.firstPlayerSessionId
    ) {
      return;
    }

    if (clientSessionId !== this.deps.state.startingPlayerSessionId) {
      return;
    }

    if (choice !== 'first' && choice !== 'second') {
      return;
    }

    if (this.deps.state.players.size !== this.deps.maxClients) {
      return;
    }

    const sessionIds = Array.from(this.deps.state.players.keys());
    const otherSessionId = sessionIds.find(
      (sessionId) => sessionId !== clientSessionId,
    );

    if (!otherSessionId) {
      return;
    }

    const firstPlayerSessionId =
      choice === 'first' ? clientSessionId : otherSessionId;

    this.deps.state.firstPlayerSessionId = firstPlayerSessionId;

    const firstPlayer = this.deps.state.players.get(firstPlayerSessionId);
    const choosingPlayer = this.deps.state.players.get(clientSessionId);
    this.deps.addLog(
      `${choosingPlayer?.displayName ?? 'Le joueur designe'} choisit de jouer en ${choice === 'first' ? 'premier' : 'second'}. ${firstPlayer?.displayName ?? ''} commencera.`.trim(),
    );
  }

  /** Resolves one player's mulligan decision, respecting first-player order. */
  public handleMulligan(clientSessionId: string, mulligan: boolean): void {
    if (
      this.deps.state.phase !== 'mulligan' ||
      !this.deps.state.firstPlayerSessionId
    ) {
      return;
    }

    const player = this.deps.state.players.get(clientSessionId);

    if (!player || player.mulliganDecided) {
      return;
    }

    const isFirstPlayer =
      clientSessionId === this.deps.state.firstPlayerSessionId;

    if (!isFirstPlayer) {
      const firstPlayer = this.deps.state.players.get(
        this.deps.state.firstPlayerSessionId,
      );

      if (!firstPlayer?.mulliganDecided) {
        return;
      }
    }

    if (mulligan) {
      player.zones.deck.push(...player.zones.hand.splice(0));
      this.deps.shuffle(player.zones.deck);
      this.dealHand(player);
      this.deps.addLog(`${player.displayName} fait un mulligan.`);
    } else {
      this.deps.addLog(`${player.displayName} garde sa main de depart.`);
    }

    player.mulliganDecided = true;

    const allDecided =
      this.deps.state.players.size === this.deps.maxClients &&
      Array.from(this.deps.state.players.values()).every(
        (candidate) => candidate.mulliganDecided,
      );

    if (allDecided) {
      this.startFirstTurn();
    }
  }

  /**
   * Advances the active player's phase or turn, returning an error message
   * when the request is structurally illegal for the current state.
   */
  public handleEndPhase(clientSessionId: string): string | null {
    if (this.deps.state.phase === 'finished') {
      return 'La partie est terminee.';
    }

    if (this.deps.effectBoundary.hasPendingPlayerInteraction()) {
      return "Une decision d'effet est en attente.";
    }

    if (this.deps.isCombatInProgress()) {
      return 'Un combat est en cours.';
    }

    if (clientSessionId !== this.deps.state.activePlayerSessionId) {
      return "Ce n'est pas votre tour.";
    }

    if (this.deps.state.phase === 'end') {
      this.endTurn();
      return null;
    }

    const currentIndex = PHASE_ORDER.indexOf(this.deps.state.phase);
    const nextPhase = PHASE_ORDER[currentIndex + 1] ?? 'end';
    this.deps.state.phase = nextPhase;

    if (nextPhase === 'draw') {
      this.runDrawPhase(clientSessionId);
    } else if (nextPhase === 'don') {
      this.runDonPhase(clientSessionId);
    }

    return null;
  }

  /** Executes the start-of-turn refresh step for one player. */
  public runRefreshPhase(sessionId: string): void {
    const player = this.deps.state.players.get(sessionId);

    if (!player) {
      return;
    }

    let returnedDonCount = 0;

    if (player.zones.leader.attachedDon > 0) {
      returnedDonCount += player.zones.leader.attachedDon;
      player.zones.leader.attachedDon = 0;
    }
    player.zones.leader.rested = false;

    for (const character of player.zones.characters) {
      returnedDonCount += character.attachedDon;
      character.attachedDon = 0;
      character.rested = false;
      character.playedThisTurn = false;
    }

    if (player.zones.stage.instanceId) {
      player.zones.stage.rested = false;
    }

    for (const donCard of player.zones.cost) {
      donCard.rested = false;
    }

    this.deps.returnDonToCost(player, sessionId, returnedDonCount);

    this.deps.addLog(
      `${player.displayName} redresse ses cartes en phase de Recharge.`,
    );
  }

  private dealHand(player: DuelPlayer): void {
    for (let index = 0; index < 5; index += 1) {
      const card = player.zones.deck.shift();

      if (card) {
        card.faceDown = false;
        player.zones.hand.push(card);
      }
    }

    this.deps.syncZoneCounts(player);
  }

  private dealLife(player: DuelPlayer): void {
    const lifeCount = Math.max(player.zones.leader.life, 0);

    for (let index = 0; index < lifeCount; index += 1) {
      const card = player.zones.deck.shift();

      if (card) {
        card.faceDown = true;
        player.zones.life.push(card);
      }
    }

    this.deps.syncZoneCounts(player);
  }

  private startFirstTurn(): void {
    for (const player of this.deps.state.players.values()) {
      this.dealLife(player);
    }

    const matchStartedAt = new Date();
    this.deps.onMatchStarted(matchStartedAt);
    this.deps.state.turn = 1;
    this.deps.state.startedAt = matchStartedAt.toISOString();
    this.deps.state.finishedAt = '';
    this.deps.state.activePlayerSessionId =
      this.deps.state.firstPlayerSessionId;
    this.deps.state.phase = 'refresh';

    const firstPlayer = this.deps.state.players.get(
      this.deps.state.firstPlayerSessionId,
    );
    this.deps.addLog(
      `Mise en place terminee. ${firstPlayer?.displayName ?? 'Le premier joueur'} commence le premier tour.`,
    );

    this.runRefreshPhase(this.deps.state.firstPlayerSessionId);
    this.deps.effectBoundary.emitWindowEffects('onTurnStart');
  }

  private runDrawPhase(sessionId: string): void {
    const player = this.deps.state.players.get(sessionId);

    if (!player) {
      return;
    }

    if (this.deps.state.turn === 1) {
      this.deps.addLog(
        `${player.displayName} ne pioche pas lors de son premier tour.`,
      );
      return;
    }

    const card = player.zones.deck.shift();

    if (!card) {
      this.declareDefeatByDeckOut(player);
      return;
    }

    card.faceDown = false;
    player.zones.hand.push(card);
    this.deps.syncZoneCounts(player);
    this.deps.addLog(`${player.displayName} pioche 1 carte.`);
  }

  private declareDefeatByDeckOut(player: DuelPlayer): void {
    this.deps.finalizeMatch(
      'deckOut',
      this.deps.getOpponentSessionId(player.sessionId) ?? '',
    );
    this.deps.addLog(
      `${player.displayName} ne peut plus piocher : deck-out, defaite.`,
    );
    this.deps.recordMatchResult();
  }

  private runDonPhase(sessionId: string): void {
    const player = this.deps.state.players.get(sessionId);

    if (!player) {
      return;
    }

    const desired =
      this.deps.state.turn === 1 ? FIRST_TURN_DON_COUNT : DON_PER_TURN;
    const count = Math.min(desired, player.zones.donDeck.length);

    for (let index = 0; index < count; index += 1) {
      const card = player.zones.donDeck.shift();

      if (card) {
        card.rested = false;
        player.zones.cost.push(card);
      }
    }

    this.deps.addLog(
      `${player.displayName} place ${count} carte(s) DON!! en zone de Cout.`,
    );
  }

  private endTurn(): void {
    const endingPlayer = this.getActivePlayer();

    if (endingPlayer) {
      endingPlayer.hasTakenFirstTurn = true;
      this.deps.addLog(`${endingPlayer.displayName} termine son tour.`);
    }

    this.deps.effectBoundary.emitWindowEffects('onTurnEnd');
    this.deps.effectBoundary.clearTurnModifiers();

    const sessionIds = Array.from(this.deps.state.players.keys());
    const nextSessionId = sessionIds.find(
      (sessionId) => sessionId !== this.deps.state.activePlayerSessionId,
    );

    if (!nextSessionId) {
      return;
    }

    this.deps.state.activePlayerSessionId = nextSessionId;
    this.deps.state.turn += 1;
    this.deps.state.phase = 'refresh';
    this.deps.effectBoundary.reapplyContinuousEffects();
    this.runRefreshPhase(nextSessionId);
    this.deps.effectBoundary.clearTurnStartModifiers(nextSessionId);
    this.deps.effectBoundary.emitWindowEffects('onTurnStart');
  }

  private getActivePlayer(): DuelPlayer | undefined {
    return this.deps.state.players.get(this.deps.state.activePlayerSessionId);
  }
}
