import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Encoder } from '@colyseus/schema';
import type { Server as HttpServer } from 'node:http';
import { createAuth } from '../auth';
import { DeckService } from '../deck/deck.service';
import { DuelDomainEventsService } from '../duel-events/duel-domain-events.service';
import { StatsService } from '../stats/stats.service';
import {
  DuelRoom,
  configureDuelRoomAuth,
  configureDuelRoomServices,
} from '../duel/duel.room';

@Injectable()
export class ColyseusService implements OnModuleDestroy {
  private gameServer?: Server;

  constructor(
    private readonly decksService: DeckService,
    private readonly statsService: StatsService,
    private readonly duelEventsService: DuelDomainEventsService,
  ) {}

  attach(server: HttpServer): Server {
    if (this.gameServer) {
      return this.gameServer;
    }

    // Real duel state can exceed the default 8KB encoder buffer once both
    // players, hidden-zone counts, logs, and patch views are populated.
    // Set the startup buffer to the size currently recommended by runtime
    // overflow warnings so normal matches avoid repeated reallocation noise.
    Encoder.BUFFER_SIZE = 64 * 1024;

    const auth = createAuth();

    configureDuelRoomServices({
      decksService: this.decksService,
      statsService: this.statsService,
      duelEventsService: this.duelEventsService,
    });
    configureDuelRoomAuth(async (requestHeaders) => {
      const headers = new Headers();

      if (requestHeaders.cookie) {
        headers.set('cookie', requestHeaders.cookie);
      }

      return auth.api.getSession({ headers });
    });
    this.gameServer = new Server({
      transport: new WebSocketTransport({ server }),
    });
    this.gameServer.define('duel', DuelRoom);

    return this.gameServer;
  }

  async onModuleDestroy() {
    await this.gameServer?.gracefullyShutdown(false);
  }
}
