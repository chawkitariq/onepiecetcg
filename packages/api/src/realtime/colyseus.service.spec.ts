import { createServer } from 'node:http';
import { boot, type ColyseusTestServer } from '@colyseus/testing';
import { ColyseusService } from './colyseus.service';

jest.mock('@onepiecetcg/shared', () => {
  const sharedMock: typeof import('../decks/shared-test.mock') =
    jest.requireActual('../decks/shared-test.mock');

  return sharedMock;
});

describe('ColyseusService spike', () => {
  let colyseus: ColyseusTestServer | undefined;

  afterEach(async () => {
    await colyseus?.shutdown();
    colyseus = undefined;
  });

  it('attaches Colyseus to an HTTP server and lets two clients join a room', async () => {
    const service = new ColyseusService({} as never);
    const httpServer = createServer();
    const gameServer = service.attach(httpServer);

    colyseus = await boot(gameServer);

    const firstClient = await colyseus.sdk.joinOrCreate('duel_spike');
    const secondClient = await colyseus.sdk.joinOrCreate('duel_spike');

    expect(firstClient.roomId).toBe(secondClient.roomId);
    expect(firstClient.sessionId).not.toBe(secondClient.sessionId);
    const room = colyseus.getRoomById(firstClient.roomId);
    expect(room.clients).toHaveLength(2);

    await firstClient.leave();
    await secondClient.leave();

    expect(room.clients).toHaveLength(0);
  });
});
