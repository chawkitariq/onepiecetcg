import { createServer } from 'node:http';
import { Encoder } from '@colyseus/schema';

jest.mock('../auth', () => ({
  createAuth: () => ({
    api: {
      getSession: jest.fn(),
    },
  }),
}));

jest.mock('../duel/duel.room', () => ({
  DuelRoom: class {},
  configureDuelRoomAuth: jest.fn(),
  configureDuelRoomServices: jest.fn(),
}));

import { ColyseusService } from './colyseus.service';

describe('ColyseusService', () => {
  afterEach(() => {
    Encoder.BUFFER_SIZE = 8 * 1024;
  });

  it('raises the schema encoder buffer to the runtime-recommended size', async () => {
    Encoder.BUFFER_SIZE = 8 * 1024;

    const service = new ColyseusService({} as never, {} as never);
    const httpServer = createServer();

    try {
      service.attach(httpServer);

      expect(Encoder.BUFFER_SIZE).toBe(128 * 1024);
    } finally {
      await service.onModuleDestroy();
    }
  });
});
