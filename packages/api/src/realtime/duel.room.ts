import {
  BadRequestException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { IncomingHttpHeaders } from 'http';
import { Room, type Client } from 'colyseus';
import { StateView } from '@colyseus/schema';
import type { DecksService, ValidatedGameDeck } from '../decks/decks.service';
import {
  DuelCard,
  DuelLog,
  DuelPlayer,
  DuelState,
  createDuelCard,
  type FirstOrSecondChoice,
  type GamePhase,
} from '@onepiecetcg/shared';

const RECONNECTION_SECONDS = 120;

const MAX_CHARACTERS = 5;
const DON_PER_TURN = 2;
const FIRST_TURN_DON_COUNT = 1;

const PHASE_ORDER: GamePhase[] = ['refresh', 'draw', 'don', 'main', 'end'];

type DuelRoomServices = {
  decksService: DecksService;
};

type DuelJoinOptions = {
  displayName?: string;
  deckId?: string;
};

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
};

type DuelSessionResolver = (
  headers: IncomingHttpHeaders,
) => Promise<{ user: { id: string } } | null>;

let services: DuelRoomServices | null = null;
let resolveSession: DuelSessionResolver | null = null;

/** Injects `DecksService` into `DuelRoom`, which Colyseus instantiates outside Nest's DI container. */
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

  private readonly authUserIdBySession = new Map<string, string>();

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

  onCreate() {
    this.setState(new DuelState());

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

    if (this.hasJoined(authUserId)) {
      throw new BadRequestException('Ce joueur est deja dans la room');
    }

    const gameDeck = await services.decksService.getValidatedGameDeck(
      authUserId,
      deckId,
    );
    client.view = new StateView();
    const player = this.createPlayer(client, options, gameDeck);
    this.authUserIdBySession.set(client.sessionId, gameDeck.ownerAuthUserId);
    this.state.players.set(client.sessionId, player);

    for (const card of player.zones.deck) {
      client.view.add(card);
    }

    this.addLog(`${player.displayName} a rejoint la room avec un deck valide.`);

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
      this.removePlayer(client.sessionId);
      return;
    }

    try {
      await this.allowReconnection(client, RECONNECTION_SECONDS);
      player.connected = true;
      this.addLog(`${player.displayName} est reconnecte.`);
    } catch {
      this.addLog(`${player.displayName} a perdu par forfait.`);
      this.removePlayer(client.sessionId);
    }
  }

  private createPlayer(
    client: Client,
    options: DuelJoinOptions,
    gameDeck: ValidatedGameDeck,
  ): DuelPlayer {
    const player = new DuelPlayer();
    player.sessionId = client.sessionId;
    player.displayName =
      options.displayName?.trim().slice(0, 40) ||
      `Player ${gameDeck.ownerAuthUserId.slice(0, 8)}`;
    player.deckId = gameDeck.id;
    player.ready = true;
    player.zones.leader = createDuelCard(
      gameDeck.leader,
      `${client.sessionId}:leader:${gameDeck.leader.id}`,
      client.sessionId,
    );
    player.zones.deck.push(
      ...gameDeck.cards.map((card, index) =>
        createDuelCard(
          card,
          `${client.sessionId}:deck:${index + 1}`,
          client.sessionId,
          true,
        ),
      ),
    );
    player.zones.donDeck.push(
      ...Array.from({ length: 10 }, (_, index) =>
        this.createDonCard(client, index),
      ),
    );
    this.syncZoneCounts(player);

    return player;
  }

  private syncZoneCounts(player: DuelPlayer) {
    player.handCount = player.zones.hand.length;
    player.deckCount = player.zones.deck.length;
    player.lifeCount = player.zones.life.length;
  }

  private initializeGame() {
    for (const player of this.state.players.values()) {
      if (player.zones.hand.length > 0) {
        continue;
      }

      this.shuffle(player.zones.deck);
      this.dealHand(player);
    }

    const sessionIds = Array.from(this.state.players.keys());
    const startingPlayerSessionId =
      sessionIds[Math.floor(Math.random() * sessionIds.length)];
    this.state.startingPlayerSessionId = startingPlayerSessionId ?? '';
    this.state.phase = 'mulligan';

    const startingPlayer = startingPlayerSessionId
      ? this.state.players.get(startingPlayerSessionId)
      : undefined;
    this.addLog(
      `${startingPlayer?.displayName ?? 'Un joueur'} a ete designe pour choisir de jouer en premier ou en second.`,
    );
    void this.lock();
  }

  private dealHand(player: DuelPlayer) {
    for (let index = 0; index < 5; index += 1) {
      const card = player.zones.deck.shift();

      if (card) {
        card.faceDown = false;
        player.zones.hand.push(card);
      }
    }

    this.syncZoneCounts(player);
  }

  private dealLife(player: DuelPlayer) {
    const lifeCount = Math.max(player.zones.leader.life, 0);

    for (let index = 0; index < lifeCount; index += 1) {
      const card = player.zones.deck.shift();

      if (card) {
        card.faceDown = true;
        player.zones.life.push(card);
      }
    }

    this.syncZoneCounts(player);
  }

  private handleChooseFirstOrSecond(
    client: Client,
    message: ChooseFirstOrSecondMessage,
  ) {
    if (this.state.phase !== 'mulligan' || this.state.firstPlayerSessionId) {
      return;
    }

    if (client.sessionId !== this.state.startingPlayerSessionId) {
      return;
    }

    if (message.choice !== 'first' && message.choice !== 'second') {
      return;
    }

    if (this.state.players.size !== this.maxClients) {
      return;
    }

    const sessionIds = Array.from(this.state.players.keys());
    const otherSessionId = sessionIds.find(
      (sessionId) => sessionId !== client.sessionId,
    );

    if (!otherSessionId) {
      return;
    }

    const firstPlayerSessionId =
      message.choice === 'first' ? client.sessionId : otherSessionId;

    this.state.firstPlayerSessionId = firstPlayerSessionId;

    const firstPlayer = this.state.players.get(firstPlayerSessionId);
    const choosingPlayer = this.state.players.get(client.sessionId);
    this.addLog(
      `${choosingPlayer?.displayName ?? 'Le joueur designe'} choisit de jouer en ${message.choice === 'first' ? 'premier' : 'second'}. ${firstPlayer?.displayName ?? ''} commencera.`.trim(),
    );
  }

  private handleMulligan(client: Client, message: MulliganMessage) {
    if (this.state.phase !== 'mulligan' || !this.state.firstPlayerSessionId) {
      return;
    }

    const player = this.state.players.get(client.sessionId);

    if (!player || player.mulliganDecided) {
      return;
    }

    const isFirstPlayer = client.sessionId === this.state.firstPlayerSessionId;

    if (!isFirstPlayer) {
      const firstPlayer = this.state.players.get(
        this.state.firstPlayerSessionId,
      );

      if (!firstPlayer?.mulliganDecided) {
        return;
      }
    }

    if (message.mulligan) {
      player.zones.deck.push(...player.zones.hand.splice(0));
      this.shuffle(player.zones.deck);
      this.dealHand(player);
      this.addLog(`${player.displayName} fait un mulligan.`);
    } else {
      this.addLog(`${player.displayName} garde sa main de depart.`);
    }

    player.mulliganDecided = true;

    const allDecided =
      this.state.players.size === this.maxClients &&
      Array.from(this.state.players.values()).every(
        (candidate) => candidate.mulliganDecided,
      );

    if (allDecided) {
      this.startFirstTurn();
    }
  }

  private startFirstTurn() {
    for (const player of this.state.players.values()) {
      this.dealLife(player);
    }

    this.state.turn = 1;
    this.state.activePlayerSessionId = this.state.firstPlayerSessionId;
    this.state.phase = 'refresh';

    const firstPlayer = this.state.players.get(this.state.firstPlayerSessionId);
    this.addLog(
      `Mise en place terminee. ${firstPlayer?.displayName ?? 'Le premier joueur'} commence le premier tour.`,
    );

    this.runRefreshPhase(this.state.firstPlayerSessionId);
  }

  private sendError(client: Client, message: string) {
    client.send('actionError', { message });
  }

  private getActivePlayer(): DuelPlayer | undefined {
    return this.state.players.get(this.state.activePlayerSessionId);
  }

  private handleEndPhase(client: Client) {
    if (this.state.phase === 'finished') {
      this.sendError(client, 'La partie est terminee.');
      return;
    }

    if (client.sessionId !== this.state.activePlayerSessionId) {
      this.sendError(client, "Ce n'est pas votre tour.");
      return;
    }

    if (this.state.phase === 'end') {
      this.endTurn();
      return;
    }

    const currentIndex = PHASE_ORDER.indexOf(this.state.phase);
    const nextPhase = PHASE_ORDER[currentIndex + 1] ?? 'end';
    this.state.phase = nextPhase;

    if (nextPhase === 'draw') {
      this.runDrawPhase(client.sessionId);
    } else if (nextPhase === 'don') {
      this.runDonPhase(client.sessionId);
    }
  }

  private runRefreshPhase(sessionId: string) {
    const player = this.state.players.get(sessionId);

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

    this.returnDonToCost(player, sessionId, returnedDonCount);

    this.addLog(
      `${player.displayName} redresse ses cartes en phase de Recharge.`,
    );
  }

  /**
   * A DON!! card loses all attachments and becomes a brand-new tapped card
   * in the Cost zone whenever the card it was attached to changes zone
   * (docs/optcg-rules.md §3, "Règle importante sur le changement de zone").
   */
  private returnDonToCost(
    player: DuelPlayer,
    sessionId: string,
    count: number,
  ) {
    for (let index = 0; index < count; index += 1) {
      const returnedCard = new DuelCard();
      returnedCard.instanceId = `${sessionId}:don-returned:${Date.now()}:${index}:${Math.random()}`;
      returnedCard.ownerSessionId = sessionId;
      returnedCard.cardId = 'DON!!';
      returnedCard.number = 'DON!!';
      returnedCard.name = 'DON!!';
      returnedCard.type = 'DON!!';
      returnedCard.rested = true;
      player.zones.cost.push(returnedCard);
    }
  }

  private runDrawPhase(sessionId: string) {
    const player = this.state.players.get(sessionId);

    if (!player) {
      return;
    }

    if (!player.hasTakenFirstTurn) {
      this.addLog(
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
    this.syncZoneCounts(player);
    this.addLog(`${player.displayName} pioche 1 carte.`);
  }

  private declareDefeatByDeckOut(player: DuelPlayer) {
    this.state.phase = 'finished';
    this.addLog(
      `${player.displayName} ne peut plus piocher : deck-out, defaite.`,
    );
  }

  private runDonPhase(sessionId: string) {
    const player = this.state.players.get(sessionId);

    if (!player) {
      return;
    }

    const desired = player.hasTakenFirstTurn
      ? DON_PER_TURN
      : FIRST_TURN_DON_COUNT;
    const count = Math.min(desired, player.zones.donDeck.length);

    for (let index = 0; index < count; index += 1) {
      const card = player.zones.donDeck.shift();

      if (card) {
        card.rested = false;
        player.zones.cost.push(card);
      }
    }

    this.addLog(
      `${player.displayName} place ${count} carte(s) DON!! en zone de Cout.`,
    );
  }

  private endTurn() {
    const endingPlayer = this.getActivePlayer();

    if (endingPlayer) {
      endingPlayer.hasTakenFirstTurn = true;
      this.addLog(`${endingPlayer.displayName} termine son tour.`);
    }

    const sessionIds = Array.from(this.state.players.keys());
    const nextSessionId = sessionIds.find(
      (sessionId) => sessionId !== this.state.activePlayerSessionId,
    );

    if (!nextSessionId) {
      return;
    }

    this.state.activePlayerSessionId = nextSessionId;
    this.state.turn += 1;
    this.state.phase = 'refresh';
    this.runRefreshPhase(nextSessionId);
  }

  private findCardInZone(
    player: DuelPlayer,
    zone: 'characters' | 'cost' | 'hand',
    instanceId: string,
  ): { card: DuelCard; index: number } | null {
    const cards = player.zones[zone];

    for (let index = 0; index < cards.length; index += 1) {
      const card = cards[index];

      if (card?.instanceId === instanceId) {
        return { card, index };
      }
    }

    return null;
  }

  private takeUntappedDonCards(
    player: DuelPlayer,
    amount: number,
  ): DuelCard[] | null {
    const untapped: Array<{ card: DuelCard; index: number }> = [];

    for (let index = 0; index < player.zones.cost.length; index += 1) {
      const card = player.zones.cost[index];

      if (card && !card.rested) {
        untapped.push({ card, index });
      }

      if (untapped.length === amount) {
        break;
      }
    }

    if (untapped.length < amount) {
      return null;
    }

    for (const entry of untapped) {
      entry.card.rested = true;
    }

    return untapped.map((entry) => entry.card);
  }

  private assertMainPhaseAction(client: Client): DuelPlayer | null {
    if (this.state.phase !== 'main') {
      this.sendError(client, 'Action impossible hors de la phase Principale.');
      return null;
    }

    if (client.sessionId !== this.state.activePlayerSessionId) {
      this.sendError(client, "Ce n'est pas votre tour.");
      return null;
    }

    const player = this.state.players.get(client.sessionId);

    if (!player) {
      return null;
    }

    return player;
  }

  private handlePlayCard(client: Client, message: PlayCardMessage) {
    const player = this.assertMainPhaseAction(client);

    if (!player) {
      return;
    }

    const found = this.findCardInZone(player, 'hand', message.instanceId);

    if (!found) {
      this.sendError(client, 'Carte introuvable en main.');
      return;
    }

    const { card, index } = found;

    if (
      card.type !== 'Character' &&
      card.type !== 'Event' &&
      card.type !== 'Stage'
    ) {
      this.sendError(
        client,
        'Cette carte ne peut pas etre jouee depuis la main.',
      );
      return;
    }

    let characterToDiscard: { card: DuelCard; index: number } | null = null;

    if (
      card.type === 'Character' &&
      player.zones.characters.length >= MAX_CHARACTERS
    ) {
      const discardTarget = message.discardCharacterInstanceId
        ? this.findCardInZone(
            player,
            'characters',
            message.discardCharacterInstanceId,
          )
        : null;

      if (!discardTarget) {
        this.sendError(
          client,
          `Zone Personnage pleine (${MAX_CHARACTERS} max) : choisissez un Personnage a defausser pour jouer ${card.name}.`,
        );
        return;
      }

      characterToDiscard = discardTarget;
    }

    const cost = Math.max(card.cost, 0);
    const paidDonCards = this.takeUntappedDonCards(player, cost);

    if (!paidDonCards) {
      this.sendError(
        client,
        `DON!! insuffisant pour jouer ${card.name} (cout ${cost}).`,
      );
      return;
    }

    player.zones.hand.splice(index, 1);

    if (card.type === 'Character') {
      if (characterToDiscard) {
        const [discarded] = player.zones.characters.splice(
          characterToDiscard.index,
          1,
        );

        if (discarded) {
          const attachedDon = discarded.attachedDon;
          discarded.attachedDon = 0;
          player.zones.trash.unshift(discarded);
          this.returnDonToCost(player, client.sessionId, attachedDon);
          this.addLog(
            `${player.displayName} defausse ${discarded.name} pour liberer la zone Personnage.`,
          );
        }
      }

      card.playedThisTurn = true;
      card.rested = false;
      player.zones.characters.push(card);
      this.addLog(
        `${player.displayName} joue ${card.name} en zone Personnage.`,
      );
    } else if (card.type === 'Stage') {
      if (player.zones.stage.instanceId) {
        player.zones.trash.unshift(player.zones.stage);
      }

      card.rested = false;
      player.zones.stage = card;
      this.addLog(`${player.displayName} joue ${card.name} en zone Lieu.`);
    } else {
      player.zones.trash.unshift(card);
      this.addLog(
        `${player.displayName} active ${card.name} (effet a appliquer manuellement) puis la defausse.`,
      );
    }

    this.syncZoneCounts(player);
  }

  private handleAttachDon(client: Client, message: AttachDonMessage) {
    const player = this.assertMainPhaseAction(client);

    if (!player) {
      return;
    }

    const donCards = this.takeUntappedDonCards(player, 1);

    if (!donCards) {
      this.sendError(
        client,
        'Aucun DON!! redresse disponible en zone de Cout.',
      );
      return;
    }

    const [donCard] = donCards;

    if (!donCard) {
      return;
    }

    if (message.target === 'leader') {
      const removed = player.zones.cost.splice(
        player.zones.cost.indexOf(donCard),
        1,
      )[0];

      if (removed) {
        player.zones.leader.attachedDon += 1;
      }

      this.addLog(
        `${player.displayName} donne 1 DON!! a son Leader (+1000 de puissance).`,
      );
      return;
    }

    const found = message.targetInstanceId
      ? this.findCardInZone(player, 'characters', message.targetInstanceId)
      : null;

    if (!found) {
      donCard.rested = false;
      this.sendError(client, 'Cible invalide pour attacher un DON!!.');
      return;
    }

    player.zones.cost.splice(player.zones.cost.indexOf(donCard), 1);
    found.card.attachedDon += 1;
    this.addLog(
      `${player.displayName} donne 1 DON!! a ${found.card.name} (+1000 de puissance).`,
    );
  }

  private createDonCard(client: Client, index: number): DuelCard {
    const card = new DuelCard();
    card.instanceId = `${client.sessionId}:don:${index + 1}`;
    card.ownerSessionId = client.sessionId;
    card.cardId = 'DON!!';
    card.number = 'DON!!';
    card.name = 'DON!!';
    card.type = 'DON!!';

    return card;
  }

  private hasJoined(authUserId: string): boolean {
    return Array.from(this.authUserIdBySession.values()).includes(authUserId);
  }

  private addLog(message: string) {
    const log = new DuelLog();
    log.id = `${Date.now()}:${this.state.logs.length}`;
    log.message = message;
    log.createdAt = new Date().toISOString();
    this.state.logs.push(log);
    this.logger.log(message);
  }

  private removePlayer(sessionId: string) {
    this.state.players.delete(sessionId);
    this.authUserIdBySession.delete(sessionId);

    if (this.state.players.size === 0) {
      void this.disconnect();
    }
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
}
