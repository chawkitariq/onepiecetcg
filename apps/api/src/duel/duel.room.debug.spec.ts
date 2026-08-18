import type { Card } from '@onepiecetcg/shared';
import { DuelRoom, configureDuelRoomServices } from './duel.room';

jest.mock('@onepiecetcg/shared', () => {
  const sharedMock: typeof import('../deck/shared-test.mock') =
    jest.requireActual('../deck/shared-test.mock');

  return sharedMock;
});

jest.mock('@onepiecetcg/cards/effects', () => ({
  loadEffectSources: () => ({ definitions: [], specialHandlers: [] }),
}));

const leader: Card = {
  id: 'L-001',
  number: 'L-001',
  name: 'Leader',
  type: 'Leader',
  colors: ['Red'],
  cost: null,
  power: 5000,
  life: 5,
  counter: null,
  attributes: [],
  families: [],
  text: '',
  trigger: null,
  imageUrl: null,
  set: { id: 'TEST', name: 'Test' },
  rarity: null,
};

const mainCard: Card = {
  ...leader,
  id: 'C-001',
  number: 'C-001',
  name: 'Character',
  type: 'Character',
  cost: 1,
  power: 1000,
  life: null,
  counter: 1000,
};

async function createInitializedRoom() {
  configureDuelRoomServices({
    decksService: {
      getValidatedGameDeck: jest.fn((authUserId: string, deckId: string) =>
        Promise.resolve({
          id: deckId,
          name: 'Valid deck',
          ownerAuthUserId: authUserId,
          leader,
          cards: Array.from({ length: 50 }, (_, index) => ({
            ...mainCard,
            copyIndex: index + 1,
          })),
        }),
      ),
    } as never,
  });

  const room = new DuelRoom();
  (
    room as DuelRoom & { listing: { remove: jest.Mock; metadata: object } }
  ).listing = {
    remove: jest.fn(),
    metadata: {},
  };
  room.onCreate();
  jest.spyOn(room, 'lock').mockImplementation(() => undefined);

  await room.onJoin(
    { sessionId: 'session-a' } as never,
    { displayName: 'Alice', deckId: 'deck-a' },
    { userId: 'user-a' },
  );

  await room.onJoin(
    { sessionId: 'session-b' } as never,
    { displayName: 'Bob', deckId: 'deck-b' },
    { userId: 'user-b' },
  );

  return room;
}

describe('DuelRoom debug draw', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('moves a selected deck card into the hand in development mode', async () => {
    process.env.NODE_ENV = 'development';
    const room = await createInitializedRoom();
    const player = room.state.players.get('session-a');
    const drawnCardInstanceId = player?.zones.deck[0]?.instanceId;

    expect(drawnCardInstanceId).toBeDefined();

    await (
      room as unknown as {
        handleDebugDrawFromDeck: (
          client: { sessionId: string },
          message: { instanceId: string },
        ) => Promise<void>;
      }
    ).handleDebugDrawFromDeck(
      { sessionId: 'session-a' },
      { instanceId: drawnCardInstanceId ?? '' },
    );

    const updatedPlayer = room.state.players.get('session-a');

    expect(updatedPlayer?.zones.deck).toHaveLength(44);
    expect(updatedPlayer?.zones.hand).toHaveLength(6);
    expect(
      updatedPlayer?.zones.hand.some(
        card => card.instanceId === drawnCardInstanceId,
      ),
    ).toBe(true);
    expect(
      updatedPlayer?.zones.hand.find(
        card => card.instanceId === drawnCardInstanceId,
      )?.faceDown,
    ).toBe(false);
  });

  it('keeps the deck untouched outside development mode', async () => {
    process.env.NODE_ENV = 'production';
    const room = await createInitializedRoom();
    const player = room.state.players.get('session-a');
    const drawnCardInstanceId = player?.zones.deck[0]?.instanceId;
    const client = {
      sessionId: 'session-a',
      send: jest.fn(),
    };

    await (
      room as unknown as {
        handleDebugDrawFromDeck: (
          client: { sessionId: string; send: jest.Mock },
          message: { instanceId: string },
        ) => Promise<void>;
      }
    ).handleDebugDrawFromDeck(
      client,
      { instanceId: drawnCardInstanceId ?? '' },
    );

    const updatedPlayer = room.state.players.get('session-a');

    expect(updatedPlayer?.zones.deck).toHaveLength(45);
    expect(updatedPlayer?.zones.hand).toHaveLength(5);
    expect(client.send).toHaveBeenCalledWith(
      'actionError',
      expect.objectContaining({
        message: "L'outil de debug est uniquement disponible en mode developpement.",
      }),
    );
  });
});
