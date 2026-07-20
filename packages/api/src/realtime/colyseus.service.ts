import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import type { Server as HttpServer } from 'node:http';
import { DuelSpikeRoom } from './duel-spike.room';

@Injectable()
export class ColyseusService implements OnModuleDestroy {
  private gameServer?: Server;

  attach(server: HttpServer): Server {
    if (this.gameServer) {
      return this.gameServer;
    }

    this.gameServer = new Server({
      transport: new WebSocketTransport({ server }),
    });
    this.gameServer.define('duel_spike', DuelSpikeRoom);

    return this.gameServer;
  }

  async onModuleDestroy() {
    await this.gameServer?.gracefullyShutdown(false);
  }
}
