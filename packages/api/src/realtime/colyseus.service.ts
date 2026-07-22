import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import type { Server as HttpServer } from 'node:http';
import { createAuth } from '../auth';
import { DecksService } from '../decks/decks.service';
import {
  DuelRoom,
  configureDuelRoomAuth,
  configureDuelRoomServices,
} from './duel.room';
import { DuelSpikeRoom } from './duel-spike.room';

@Injectable()
export class ColyseusService implements OnModuleDestroy {
  private gameServer?: Server;

  constructor(private readonly decksService: DecksService) {}

  attach(server: HttpServer): Server {
    if (this.gameServer) {
      return this.gameServer;
    }

    const auth = createAuth();

    configureDuelRoomServices({ decksService: this.decksService });
    configureDuelRoomAuth(async (req) => {
      const headers = new Headers();

      if (req.headers.cookie) {
        headers.set('cookie', req.headers.cookie);
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
