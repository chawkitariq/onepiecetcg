import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Encoder } from '@colyseus/schema';
import type { Server as HttpServer } from 'node:http';
import { createAuth } from '../auth';
import { DecksService } from '../decks/decks.service';
import { StatsService } from '../stats/stats.service';
import {
  DuelRoom,
  configureDuelRoomAuth,
  configureDuelRoomServices,
} from './duel.room';
import { DuelSpikeRoom } from './duel-spike.room';

@Injectable()
export class ColyseusService implements OnModuleDestroy {
  private gameServer?: Server;

  constructor(
    private readonly decksService: DecksService,
    private readonly statsService: StatsService,
  ) {}

  attach(server: HttpServer): Server {
    if (this.gameServer) {
      return this.gameServer;
    }

    // A 50-card deck's encoded state comfortably exceeds the 8KB default;
    // grow it once so real duels don't hit the (auto-recovered but noisy)
    // buffer overflow warning on every patch.
    Encoder.BUFFER_SIZE = 32 * 1024;

    const auth = createAuth();

    configureDuelRoomServices({
      decksService: this.decksService,
      statsService: this.statsService,
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
    this.gameServer.define('duel_spike', DuelSpikeRoom);

    return this.gameServer;
  }

  async onModuleDestroy() {
    await this.gameServer?.gracefullyShutdown(false);
  }
}
