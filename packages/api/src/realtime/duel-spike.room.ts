import { Room, type Client } from 'colyseus';
import { Schema, type, MapSchema } from '@colyseus/schema';

export class SpikePlayer extends Schema {
  @type('string')
  sessionId = '';
}

export class DuelSpikeState extends Schema {
  @type({ map: SpikePlayer })
  players = new MapSchema<SpikePlayer>();
}

export class DuelSpikeRoom extends Room<DuelSpikeState> {
  maxClients = 2;

  onCreate() {
    this.setState(new DuelSpikeState());
  }

  onJoin(client: Client) {
    const player = new SpikePlayer();
    player.sessionId = client.sessionId;
    this.state.players.set(client.sessionId, player);
    this.broadcast('spike:joined', {
      sessionId: client.sessionId,
      playerCount: this.clients.length,
    });
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);

    if (this.clients.length === 0) {
      this.disconnect();
    }
  }
}
