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
} from '@onepiecetcg/shared';

const RECONNECTION_SECONDS = 120;

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

type DuelSessionResolver = (
  headers: IncomingHttpHeaders,
) => Promise<{ user: { id: string } } | null>;

let services: DuelRoomServices | null = null;
let resolveSession: DuelSessionResolver | null = null;

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
