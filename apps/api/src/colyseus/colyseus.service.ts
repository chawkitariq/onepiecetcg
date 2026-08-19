import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Encoder } from '@colyseus/schema';
import type { Server as HttpServer } from 'node:http';
import { createAuth } from '../auth';
import { DeckService } from '../deck/deck.service';
import {
  DuelRoom,
  configureDuelRoomAuth,
  configureDuelRoomServices,
} from '../duel/duel.room';

@Injectable()
export class ColyseusService implements OnModuleDestroy {
  private gameServer?: Server;

  constructor(private readonly decksService: DeckService) {}

  attach(server: HttpServer): Server {
    if (this.gameServer) {
      return this.gameServer;
    }

    // Real duel state can exceed the default 8KB encoder buffer once both
    // players, hidden-zone counts, logs, and patch views are populated.
    // Align startup with the runtime overflow guidance so reconnect/full-state
    // syncs avoid repeated buffer growth and warning spam.
    Encoder.BUFFER_SIZE = 128 * 1024;

    const auth = createAuth();

    configureDuelRoomServices({
      decksService: this.decksService,
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
