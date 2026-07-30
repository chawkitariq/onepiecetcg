import type { Card, DuelPlayer } from '@onepiecetcg/shared';
import { DuelRoom, configureDuelRoomServices } from './duel.room';

jest.mock('@onepiecetcg/shared', () => {
  const sharedMock: typeof import('../deck/shared-test.mock') =
    jest.requireActual('../deck/shared-test.mock');

  return sharedMock;
});

const leader: Card = {
  id: 'L-001',
  number: 'L-001',
  name: 'Leader',
  type: 'Leader',
  colors: ['Red'],
  cost: null,
  power: 5000,
  life: 4,
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

type PrivateRoomAccess = {
  handleChooseFirstOrSecond: (
    client: { sessionId: string },
    message: { choice: 'first' | 'second' },
  ) => Promise<void>;
  handleMulligan: (
    client: { sessionId: string },
    message: { mulligan: boolean },
  ) => Promise<void>;
  handleEndPhase: (client: {
    sessionId: string;
    send: jest.Mock;
  }) => Promise<void>;
  handlePlayCard: (
    client: { sessionId: string; send: jest.Mock },
    message: { instanceId: string; discardCharacterInstanceId?: string },
  ) => Promise<void>;
  handleAttachDon: (
    client: { sessionId: string; send: jest.Mock },
    message: {
      target: 'leader' | 'character';
      targetInstanceId?: string;
      count?: number;
    },
  ) => Promise<void>;
  handleDeclareAttack: (
    client: { sessionId: string; send: jest.Mock },
    message: {
      attackerInstanceId: string;
      targetType: 'leader' | 'character';
      targetInstanceId?: string;
    },
  ) => Promise<void>;
  handleDeclareBlock: (
    client: { sessionId: string; send: jest.Mock },
    message: { blockerInstanceId?: string | null },
  ) => Promise<void>;
  handleDeclareCounter: (
    client: { sessionId: string; send: jest.Mock },
    message: { discardInstanceId: string; counterPowerBonus: number },
  ) => Promise<void>;
  handleFinishCounterStep: (client: {
    sessionId: string;
    send: jest.Mock;
  }) => Promise<void>;
  handleResolveTrigger: (
    client: { sessionId: string; send: jest.Mock },
    message: { activate: boolean },
  ) => Promise<void>;
  handleResolveEffectDecision: (
    client: { sessionId: string; send: jest.Mock },
    message: {
      decisionId: string;
      selectedCardInstanceIds?: string[];
      selectedChoiceIds?: string[];
      confirmed?: boolean;
    },
  ) => Promise<void>;
};

function asPrivateRoom(room: DuelRoom): PrivateRoomAccess {
  return room as unknown as PrivateRoomAccess;
}

function fakeClient(sessionId: string) {
  return { sessionId, send: jest.fn() };
}

function ensureHandContains(
  player: DuelPlayer | undefined,
  cardId: string,
): string {
  if (!player) {
    throw new Error('player missing');
  }

  const existing = Array.from(player.zones.hand).find(
    (card) => card.cardId === cardId,
  );

  if (existing) {
    return existing.instanceId;
  }

  const deckIndex = Array.from(player.zones.deck).findIndex(
    (card) => card.cardId === cardId,
  );

  if (deckIndex === -1) {
    throw new Error(`no ${cardId} card available in deck`);
  }

  const [card] = player.zones.deck.splice(deckIndex, 1);

  if (!card) {
    throw new Error(`no ${cardId} card available in deck`);
  }

  card.faceDown = false;
  player.zones.hand.push(card);
  player.handCount = player.zones.hand.length;
  player.deckCount = player.zones.deck.length;

  return card.instanceId;
}

function putCharacterInPlay(
  player: DuelPlayer | undefined,
  cardId: string,
  rested: boolean,
): string {
  const instanceId = ensureHandContains(player, cardId);

  if (!player) {
    throw new Error('player missing');
  }

  const index = player.zones.hand.findIndex(
    (card) => card.instanceId === instanceId,
  );
  const [card] = player.zones.hand.splice(index, 1);

  if (!card) {
    throw new Error(`failed to move ${cardId} into play`);
  }

  card.rested = rested;
  card.playedThisTurn = false;
  player.zones.characters.push(card);
  player.handCount = player.zones.hand.length;

  return instanceId;
}

function retuneAsPicaEndTurnEffectCard(
  player: DuelPlayer | undefined,
  instanceId: string,
): void {
  if (!player) {
    throw new Error('player missing');
  }

  const card = Array.from(player.zones.characters).find(
    (candidate) => candidate.instanceId === instanceId,
  );

  if (!card) {
    throw new Error(`character ${instanceId} missing`);
  }

  card.cardId = 'OP05-032';
  card.number = 'OP05-032';
  card.name = 'Pica';
  card.type = 'Character';
  card.cost = 1;
  card.baseCost = 1;
  card.basePower = 5000;
  card.power = 5000;
  card.counter = 1000;
  card.text =
    '[End of Your Turn] (1): Set this Character as active.';
}

async function createRoomFixture(options?: {
  createStream?: jest.Mock;
  record?: jest.Mock;
  autoJoin?: boolean;
}) {
  const createStream =
    options?.createStream ??
    jest.fn().mockResolvedValue({
      eventId: 'evt-created',
      eventType: 'MatchCreated',
      eventVersion: 1,
      matchId: 'match-1',
      sequenceNumber: 1,
      occurredAt: '2026-07-30T10:00:00.000Z',
      recordedAt: '2026-07-30T10:00:00.010Z',
      correlationId: 'match-1',
      causationId: 'cmd-1',
      transactionId: 'act-1',
      engineVersion: 'duel-room-v1',
      rulesetVersion: '2026.07',
      payload: {},
    });
  const record =
    options?.record ??
    jest.fn().mockResolvedValue({
      events: [],
      lastSequenceNumber: 0,
    });

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
    duelEventsService: {
      createStream,
      record,
      listPublishedEvents: jest.fn(),
    } as never,
  });

  const room = new DuelRoom();
  (
    room as DuelRoom & { listing: { remove: jest.Mock; metadata: object } }
  ).listing = {
    remove: jest.fn(),
    metadata: {},
  };
  await room.onCreate();
  jest.spyOn(room, 'lock').mockImplementation(() => undefined);

  if (options?.autoJoin !== false) {
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
  }

  return { room, createStream, record };
}

async function disposeRoom(room: DuelRoom): Promise<void> {
  const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
  await disposableRoom._dispose();
}

async function advanceToMain(room: DuelRoom, sessionId: string): Promise<void> {
  const access = asPrivateRoom(room);
  const client = fakeClient(sessionId);

  await access.handleEndPhase(client);
  await access.handleEndPhase(client);
  await access.handleEndPhase(client);
}

async function advanceToSecondMainTurn(
  room: DuelRoom,
  firstSessionId: string,
  secondSessionId: string,
): Promise<void> {
  await advanceToMain(room, firstSessionId);
  const access = asPrivateRoom(room);
  await access.handleEndPhase(fakeClient(firstSessionId));
  await access.handleEndPhase(fakeClient(firstSessionId));
  await advanceToMain(room, secondSessionId);
  await access.handleEndPhase(fakeClient(secondSessionId));
  await access.handleEndPhase(fakeClient(secondSessionId));
  await advanceToMain(room, firstSessionId);
}

describe('DuelRoom event integration', () => {
  it('opens the event stream and records stable player-facing setup events', async () => {
    const { room, createStream, record } = await createRoomFixture();

    expect(createStream).toHaveBeenCalledTimes(1);
    expect(createStream).toHaveBeenCalledWith(
      expect.objectContaining({
        matchId: room.roomId,
        engineVersion: 'duel-room-v1',
        rulesetVersion: '2026.07',
        participants: [
          {
            authUserId: 'user-a',
            playerId: 'player-1',
          },
          {
            authUserId: 'user-b',
            playerId: 'player-2',
          },
        ],
      }),
    );
    expect(record).toHaveBeenCalledTimes(1);
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        actorPlayerId: undefined,
        eventDrafts: [
          {
            type: 'PlayerJoined',
            version: 1,
            payload: {
              playerId: 'player-1',
              displayName: 'Alice',
            },
          },
          {
            type: 'DeckLocked',
            version: 1,
            payload: {
              playerId: 'player-1',
              deckId: 'deck-a',
              leaderCardId: 'L-001',
            },
          },
          {
            type: 'OpeningHandDrawn',
            version: 1,
            payload: {
              playerId: 'player-1',
              count: 5,
            },
          },
          {
            type: 'PlayerJoined',
            version: 1,
            payload: {
              playerId: 'player-2',
              displayName: 'Bob',
            },
          },
          {
            type: 'DeckLocked',
            version: 1,
            payload: {
              playerId: 'player-2',
              deckId: 'deck-b',
              leaderCardId: 'L-001',
            },
          },
          {
            type: 'OpeningHandDrawn',
            version: 1,
            payload: {
              playerId: 'player-2',
              count: 5,
            },
          },
        ],
      }),
    );

    await disposeRoom(room);
  });

  it('keeps the live room state uninitialized when initial setup persistence fails', async () => {
    const record = jest.fn().mockRejectedValueOnce(new Error('outbox down'));
    const { room, createStream } = await createRoomFixture({
      autoJoin: false,
      record,
    });

    await room.onJoin(
      { sessionId: 'session-a' } as never,
      { displayName: 'Alice', deckId: 'deck-a' },
      { userId: 'user-a' },
    );

    const phaseBefore = room.state.phase;
    const firstPlayerBefore = room.state.players.get('session-a');

    expect(firstPlayerBefore?.zones.hand).toHaveLength(0);
    expect(firstPlayerBefore?.zones.life).toHaveLength(0);
    expect(room.state.startingPlayerSessionId).toBe('');
    expect(room.state.firstPlayerSessionId).toBe('');
    expect(room.state.activePlayerSessionId).toBe('');

    await expect(
      room.onJoin(
        { sessionId: 'session-b' } as never,
        { displayName: 'Bob', deckId: 'deck-b' },
        { userId: 'user-b' },
      ),
    ).rejects.toThrow('outbox down');

    const firstPlayerAfter = room.state.players.get('session-a');
    const secondPlayerAfter = room.state.players.get('session-b');

    expect(createStream).toHaveBeenCalledTimes(1);
    expect(record).toHaveBeenCalledTimes(1);
    expect(room.state.phase).toBe(phaseBefore);
    expect(room.state.startingPlayerSessionId).toBe('');
    expect(room.state.firstPlayerSessionId).toBe('');
    expect(room.state.activePlayerSessionId).toBe('');
    expect(firstPlayerAfter?.zones.hand).toHaveLength(0);
    expect(firstPlayerAfter?.zones.life).toHaveLength(0);
    expect(secondPlayerAfter?.zones.hand).toHaveLength(0);
    expect(secondPlayerAfter?.zones.life).toHaveLength(0);

    await disposeRoom(room);
  });

  it('records deck shuffling when a player takes a mulligan', async () => {
    const { room, record } = await createRoomFixture();
    const access = asPrivateRoom(room);
    const firstSessionId = room.state.startingPlayerSessionId;
    const firstPlayerId =
      firstSessionId === 'session-a' ? 'player-1' : 'player-2';

    await access.handleChooseFirstOrSecond(
      { sessionId: firstSessionId },
      { choice: 'first' },
    );
    await access.handleMulligan(
      { sessionId: firstSessionId },
      { mulligan: true },
    );

    expect(record).toHaveBeenLastCalledWith(
      expect.objectContaining({
        actorPlayerId: firstPlayerId,
        eventDrafts: [
          {
            type: 'MulliganRequested',
            version: 1,
            payload: {
              playerId: firstPlayerId,
              tookMulligan: true,
            },
          },
          {
            type: 'DeckShuffled',
            version: 1,
            payload: {
              playerId: firstPlayerId,
            },
          },
          {
            type: 'MulliganResolved',
            version: 1,
            payload: {
              playerId: firstPlayerId,
              tookMulligan: true,
            },
          },
        ],
      }),
    );

    await disposeRoom(room);
  });

  it('records gameplay events when a card is played from hand', async () => {
    const { room, record } = await createRoomFixture();
    const access = asPrivateRoom(room);
    const firstSessionId = room.state.startingPlayerSessionId;
    const secondSessionId =
      firstSessionId === 'session-a' ? 'session-b' : 'session-a';
    const firstPlayerId =
      firstSessionId === 'session-a' ? 'player-1' : 'player-2';

    await access.handleChooseFirstOrSecond(
      { sessionId: firstSessionId },
      { choice: 'first' },
    );
    await access.handleMulligan(
      { sessionId: firstSessionId },
      { mulligan: false },
    );
    await access.handleMulligan(
      { sessionId: secondSessionId },
      { mulligan: false },
    );

    const activeClient = fakeClient(firstSessionId);
    await access.handleEndPhase(activeClient);
    await access.handleEndPhase(activeClient);
    await access.handleEndPhase(activeClient);

    const player = room.state.players.get(firstSessionId);
    const characterInstanceId = ensureHandContains(player, 'C-001');

    await access.handlePlayCard(fakeClient(firstSessionId), {
      instanceId: characterInstanceId,
    });

    expect(record).toHaveBeenLastCalledWith(
      expect.objectContaining({
        actorPlayerId: firstPlayerId,
        eventDrafts: [
          {
            type: 'DonRested',
            version: 1,
            payload: {
              playerId: firstPlayerId,
              count: 1,
            },
          },
          {
            type: 'CardMoved',
            version: 1,
            payload: {
              playerId: firstPlayerId,
              cardInstanceId: characterInstanceId,
              cardDefinitionId: 'C-001',
              fromZone: 'HAND',
              toZone: 'CHARACTER_AREA',
            },
          },
          {
            type: 'CostPaid',
            version: 1,
            payload: {
              playerId: firstPlayerId,
              amount: 1,
              sourceInstanceId: characterInstanceId,
              sourceCardId: 'C-001',
            },
          },
          {
            type: 'CardPlayed',
            version: 1,
            payload: {
              playerId: firstPlayerId,
              cardInstanceId: characterInstanceId,
              cardDefinitionId: 'C-001',
              fromZone: 'HAND',
              toZone: 'CHARACTER_AREA',
              paidCost: 1,
            },
          },
        ],
      }),
    );

    await disposeRoom(room);
  });

  it('records don attachment events during the main phase', async () => {
    const { room, record } = await createRoomFixture();
    const access = asPrivateRoom(room);
    const firstSessionId = room.state.startingPlayerSessionId;
    const secondSessionId =
      firstSessionId === 'session-a' ? 'session-b' : 'session-a';
    const firstPlayerId =
      firstSessionId === 'session-a' ? 'player-1' : 'player-2';

    await access.handleChooseFirstOrSecond(
      { sessionId: firstSessionId },
      { choice: 'first' },
    );
    await access.handleMulligan(
      { sessionId: firstSessionId },
      { mulligan: false },
    );
    await access.handleMulligan(
      { sessionId: secondSessionId },
      { mulligan: false },
    );

    const activeClient = fakeClient(firstSessionId);
    await access.handleEndPhase(activeClient);
    await access.handleEndPhase(activeClient);
    await access.handleEndPhase(activeClient);

    const leaderInstanceId =
      room.state.players.get(firstSessionId)?.zones.leader.instanceId ?? null;

    await access.handleAttachDon(fakeClient(firstSessionId), {
      target: 'leader',
      count: 1,
    });

    expect(record).toHaveBeenLastCalledWith(
      expect.objectContaining({
        actorPlayerId: firstPlayerId,
        eventDrafts: [
          {
            type: 'CardPlacedUnderCard',
            version: 1,
            payload: {
              playerId: firstPlayerId,
              cardInstanceId: expect.any(String) as unknown as string,
              cardDefinitionId: 'DON!!',
              parentInstanceId: leaderInstanceId,
              parentCardId: 'L-001',
            },
          },
          {
            type: 'DonAttached',
            version: 1,
            payload: {
              playerId: firstPlayerId,
              targetInstanceId: leaderInstanceId,
              count: 1,
            },
          },
        ],
      }),
    );

    await disposeRoom(room);
  });

  it('records draw and don-step events during turn progression', async () => {
    const { room, record } = await createRoomFixture();
    const access = asPrivateRoom(room);
    const firstSessionId = room.state.startingPlayerSessionId;
    const secondSessionId =
      firstSessionId === 'session-a' ? 'session-b' : 'session-a';
    const secondPlayerId =
      secondSessionId === 'session-a' ? 'player-1' : 'player-2';

    await access.handleChooseFirstOrSecond(
      { sessionId: firstSessionId },
      { choice: 'first' },
    );
    await access.handleMulligan(
      { sessionId: firstSessionId },
      { mulligan: false },
    );
    await access.handleMulligan(
      { sessionId: secondSessionId },
      { mulligan: false },
    );

    const firstClient = fakeClient(firstSessionId);
    await access.handleEndPhase(firstClient);
    await access.handleEndPhase(firstClient);
    await access.handleEndPhase(firstClient);
    await access.handleEndPhase(firstClient);
    await access.handleEndPhase(firstClient);

    const secondPlayer = room.state.players.get(secondSessionId);
    const drawnCardIdBeforeDraw = secondPlayer?.zones.deck[0]?.cardId;
    const drawnInstanceIdBeforeDraw = secondPlayer?.zones.deck[0]?.instanceId;
    const donDeckBeforeDonStep = secondPlayer?.zones.donDeck.length ?? 0;
    const costBeforeDonStep = secondPlayer?.zones.cost.length ?? 0;

    await access.handleEndPhase(fakeClient(secondSessionId));

    expect(record).toHaveBeenLastCalledWith(
      expect.objectContaining({
        actorPlayerId: secondPlayerId,
        eventDrafts: [
          {
            type: 'CardDrawn',
            version: 1,
            payload: {
              playerId: secondPlayerId,
              count: 1,
              cardInstanceId: drawnInstanceIdBeforeDraw,
              cardDefinitionId: drawnCardIdBeforeDraw,
            },
          },
          {
            type: 'PhaseChanged',
            version: 1,
            payload: {
              turn: room.state.turn,
              playerId: secondPlayerId,
              fromPhase: 'refresh',
              toPhase: 'draw',
            },
          },
        ],
      }),
    );

    await access.handleEndPhase(fakeClient(secondSessionId));

    expect(record).toHaveBeenLastCalledWith(
      expect.objectContaining({
        actorPlayerId: secondPlayerId,
        eventDrafts: [
          {
            type: 'DonAdded',
            version: 1,
            payload: {
              playerId: secondPlayerId,
              count: Math.min(2, donDeckBeforeDonStep),
            },
          },
          {
            type: 'PhaseChanged',
            version: 1,
            payload: {
              turn: room.state.turn,
              playerId: secondPlayerId,
              fromPhase: 'draw',
              toPhase: 'don',
            },
          },
        ],
      }),
    );

    expect(room.state.players.get(secondSessionId)?.zones.cost.length).toBe(
      costBeforeDonStep + Math.min(2, donDeckBeforeDonStep),
    );

    await disposeRoom(room);
  });

  it('records refresh-step don events when a turn passes to the next player', async () => {
    const { room, record } = await createRoomFixture();
    const access = asPrivateRoom(room);
    const firstSessionId = room.state.startingPlayerSessionId;
    const secondSessionId =
      firstSessionId === 'session-a' ? 'session-b' : 'session-a';
    const secondPlayerId =
      secondSessionId === 'session-a' ? 'player-1' : 'player-2';

    await access.handleChooseFirstOrSecond(
      { sessionId: firstSessionId },
      { choice: 'first' },
    );
    await access.handleMulligan(
      { sessionId: firstSessionId },
      { mulligan: false },
    );
    await access.handleMulligan(
      { sessionId: secondSessionId },
      { mulligan: false },
    );
    await advanceToMain(room, firstSessionId);

    const secondPlayer = room.state.players.get(secondSessionId);
    const costDon = secondPlayer?.zones.donDeck.shift();

    if (!secondPlayer || !costDon) {
      throw new Error('second player setup missing');
    }

    costDon.rested = true;
    secondPlayer.zones.cost.push(costDon);
    secondPlayer.zones.leader.attachedDon = 1;

    const secondLeaderInstanceId = secondPlayer.zones.leader.instanceId;
    const restedCostCountBefore = secondPlayer.zones.cost.filter(
      (card) => card.rested,
    ).length;

    const firstClient = fakeClient(firstSessionId);
    await access.handleEndPhase(firstClient);
    await access.handleEndPhase(firstClient);

    const lastRecordCall = record.mock.calls.at(-1) as
      [{ actorPlayerId?: string; eventDrafts?: unknown[] }] | undefined;
    const recordInput = lastRecordCall?.[0];

    expect(recordInput?.actorPlayerId).toBe(
      firstSessionId === 'session-a' ? 'player-1' : 'player-2',
    );
    expect(recordInput?.eventDrafts).toEqual(
      expect.arrayContaining([
        {
          type: 'DonDetached',
          version: 1,
          payload: {
            playerId: secondPlayerId,
            sourceInstanceId: secondLeaderInstanceId,
            sourceCardId: 'L-001',
            count: 1,
          },
        },
        {
          type: 'DonRefreshed',
          version: 1,
          payload: {
            playerId: secondPlayerId,
            count: restedCostCountBefore,
          },
        },
        {
          type: 'TurnEnded',
          version: 1,
          payload: {
            turn: 1,
            playerId: firstSessionId === 'session-a' ? 'player-1' : 'player-2',
          },
        },
        {
          type: 'TurnStarted',
          version: 1,
          payload: {
            turn: 2,
            playerId: secondPlayerId,
          },
        },
        {
          type: 'PhaseChanged',
          version: 1,
          payload: {
            turn: 2,
            playerId: secondPlayerId,
            fromPhase: 'end',
            toPhase: 'refresh',
          },
        },
      ]),
    );

    expect(
      room.state.players.get(secondSessionId)?.zones.leader.attachedDon,
    ).toBe(0);
    expect(
      room.state.players
        .get(secondSessionId)
        ?.zones.cost.some((card) => card.instanceId.includes('don-returned')),
    ).toBe(true);
    expect(
      room.state.players
        .get(secondSessionId)
        ?.zones.cost.filter((card) => !card.rested).length,
    ).toBe(restedCostCountBefore);

    await disposeRoom(room);
  });

  it('records combat declaration events for attack, block and counter', async () => {
    const { room, record } = await createRoomFixture();
    const access = asPrivateRoom(room);
    const firstSessionId = room.state.startingPlayerSessionId;
    const secondSessionId =
      firstSessionId === 'session-a' ? 'session-b' : 'session-a';
    const firstPlayerId =
      firstSessionId === 'session-a' ? 'player-1' : 'player-2';
    const secondPlayerId =
      secondSessionId === 'session-a' ? 'player-1' : 'player-2';

    await access.handleChooseFirstOrSecond(
      { sessionId: firstSessionId },
      { choice: 'first' },
    );
    await access.handleMulligan(
      { sessionId: firstSessionId },
      { mulligan: false },
    );
    await access.handleMulligan(
      { sessionId: secondSessionId },
      { mulligan: false },
    );
    await advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const defender = room.state.players.get(secondSessionId);
    const blockerInstanceId = putCharacterInPlay(defender, 'C-001', false);
    const counterInstanceId = ensureHandContains(defender, 'C-001');
    const attackerInstanceId =
      room.state.players.get(firstSessionId)?.zones.leader.instanceId ?? '';

    await access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId,
      targetType: 'leader',
    });

    expect(record).toHaveBeenLastCalledWith(
      expect.objectContaining({
        actorPlayerId: firstPlayerId,
        eventDrafts: [
          {
            type: 'AttackDeclared',
            version: 1,
            payload: {
              playerId: firstPlayerId,
              attackerInstanceId,
            },
          },
          {
            type: 'AttackTargetSelected',
            version: 1,
            payload: {
              playerId: firstPlayerId,
              targetType: 'leader',
              targetInstanceId: room.state.combat.targetInstanceId,
            },
          },
        ],
      }),
    );

    await access.handleDeclareBlock(fakeClient(secondSessionId), {
      blockerInstanceId,
    });

    expect(record).toHaveBeenLastCalledWith(
      expect.objectContaining({
        actorPlayerId: secondPlayerId,
        eventDrafts: [
          {
            type: 'BlockerDeclared',
            version: 1,
            payload: {
              playerId: secondPlayerId,
              blockerInstanceId,
            },
          },
        ],
      }),
    );

    await access.handleDeclareCounter(fakeClient(secondSessionId), {
      discardInstanceId: counterInstanceId,
      counterPowerBonus: 1000,
    });

    expect(record).toHaveBeenLastCalledWith(
      expect.objectContaining({
        actorPlayerId: secondPlayerId,
        eventDrafts: [
          {
            type: 'CounterUsed',
            version: 1,
            payload: {
              playerId: secondPlayerId,
              discardInstanceId: counterInstanceId,
              counterPowerBonus: 1000,
            },
          },
          {
            type: 'CardMoved',
            version: 1,
            payload: {
              playerId: secondPlayerId,
              cardInstanceId: counterInstanceId,
              cardDefinitionId: 'C-001',
              fromZone: 'HAND',
              toZone: 'TRASH',
            },
          },
          {
            type: 'CardDiscarded',
            version: 1,
            payload: {
              playerId: secondPlayerId,
              cardInstanceId: counterInstanceId,
              cardDefinitionId: 'C-001',
              fromZone: 'HAND',
              toZone: 'TRASH',
            },
          },
        ],
      }),
    );

    await disposeRoom(room);
  });

  it('records attack cancellation when the effective defender leaves combat before damage resolution', async () => {
    const { room, record } = await createRoomFixture();
    const access = asPrivateRoom(room);
    const firstSessionId = room.state.startingPlayerSessionId;
    const secondSessionId =
      firstSessionId === 'session-a' ? 'session-b' : 'session-a';
    const firstPlayerId =
      firstSessionId === 'session-a' ? 'player-1' : 'player-2';
    const secondPlayerId =
      secondSessionId === 'session-a' ? 'player-1' : 'player-2';

    await access.handleChooseFirstOrSecond(
      { sessionId: firstSessionId },
      { choice: 'first' },
    );
    await access.handleMulligan(
      { sessionId: firstSessionId },
      { mulligan: false },
    );
    await access.handleMulligan(
      { sessionId: secondSessionId },
      { mulligan: false },
    );
    await advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const defender = room.state.players.get(secondSessionId);
    const blockerInstanceId = putCharacterInPlay(defender, 'C-001', false);
    const attackerInstanceId =
      room.state.players.get(firstSessionId)?.zones.leader.instanceId ?? '';
    const defendingLeaderInstanceId =
      room.state.players.get(secondSessionId)?.zones.leader.instanceId ?? '';

    await access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId,
      targetType: 'leader',
    });
    await access.handleDeclareBlock(fakeClient(secondSessionId), {
      blockerInstanceId,
    });

    const updatedDefender = room.state.players.get(secondSessionId);
    const targetIndex =
      updatedDefender?.zones.characters.findIndex(
        (card) => card.instanceId === blockerInstanceId,
      ) ?? -1;

    if (targetIndex < 0) {
      throw new Error('blocker missing before cancellation setup');
    }

    updatedDefender!.zones.characters.splice(targetIndex, 1);

    await access.handleFinishCounterStep(fakeClient(secondSessionId));

    expect(record).toHaveBeenLastCalledWith(
      expect.objectContaining({
        actorPlayerId: secondPlayerId,
        eventDrafts: [
          {
            type: 'AttackCancelled',
            version: 1,
            payload: {
              attackerPlayerId: firstPlayerId,
              attackerInstanceId,
              defenderPlayerId: secondPlayerId,
              targetType: 'leader',
              targetInstanceId: defendingLeaderInstanceId,
              blockerInstanceId,
              reason: 'targetMissing',
            },
          },
        ],
      }),
    );
    expect(room.state.combat.attackerInstanceId).toBe('');
    expect(room.state.combat.targetInstanceId).toBe('');
    expect(room.state.combat.step).toBe('declared');

    await disposeRoom(room);
  });

  it('records battle resolution, life loss and trigger choice events', async () => {
    const { room, record } = await createRoomFixture();
    const access = asPrivateRoom(room);
    const firstSessionId = room.state.startingPlayerSessionId;
    const secondSessionId =
      firstSessionId === 'session-a' ? 'session-b' : 'session-a';
    const firstPlayerId =
      firstSessionId === 'session-a' ? 'player-1' : 'player-2';
    const secondPlayerId =
      secondSessionId === 'session-a' ? 'player-1' : 'player-2';

    await access.handleChooseFirstOrSecond(
      { sessionId: firstSessionId },
      { choice: 'first' },
    );
    await access.handleMulligan(
      { sessionId: firstSessionId },
      { mulligan: false },
    );
    await access.handleMulligan(
      { sessionId: secondSessionId },
      { mulligan: false },
    );
    await advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const defender = room.state.players.get(secondSessionId);
    const [triggerCard] = defender!.zones.life.splice(0, 1);

    if (!triggerCard) {
      throw new Error('top life card missing');
    }

    triggerCard.trigger = 'Draw a card.';
    defender!.zones.life.unshift(triggerCard);

    const attackerInstanceId =
      room.state.players.get(firstSessionId)?.zones.leader.instanceId ?? '';

    await access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId,
      targetType: 'leader',
    });
    await access.handleDeclareBlock(fakeClient(secondSessionId), {
      blockerInstanceId: null,
    });
    await access.handleFinishCounterStep(fakeClient(secondSessionId));
    const defendingLeaderInstanceId =
      room.state.players.get(secondSessionId)?.zones.leader.instanceId;

    expect(record).toHaveBeenLastCalledWith(
      expect.objectContaining({
        actorPlayerId: secondPlayerId,
        eventDrafts: [
          {
            type: 'CardRevealed',
            version: 1,
            payload: {
              playerId: secondPlayerId,
              cardInstanceId: triggerCard.instanceId,
              cardDefinitionId: triggerCard.cardId,
              fromZone: 'LIFE',
            },
          },
          {
            type: 'BattleResolved',
            version: 1,
            payload: {
              attackerPlayerId: firstPlayerId,
              attackerInstanceId,
              defenderPlayerId: secondPlayerId,
              defendingInstanceId: defendingLeaderInstanceId,
              targetType: 'leader',
              attackerPower: 5000,
              defenderPower: 5000,
              outcome: 'attackerWon',
            },
          },
          {
            type: 'DamageDealt',
            version: 1,
            payload: {
              playerId: secondPlayerId,
              amount: 1,
            },
          },
        ],
      }),
    );

    await access.handleResolveTrigger(fakeClient(secondSessionId), {
      activate: true,
    });

    expect(record).toHaveBeenLastCalledWith(
      expect.objectContaining({
        actorPlayerId: secondPlayerId,
        eventDrafts: [
          {
            type: 'ChoiceSubmitted',
            version: 1,
            payload: {
              playerId: secondPlayerId,
              decisionType: 'trigger',
              activate: true,
            },
          },
          {
            type: 'CardMoved',
            version: 1,
            payload: {
              playerId: secondPlayerId,
              cardInstanceId: triggerCard.instanceId,
              cardDefinitionId: triggerCard.cardId,
              fromZone: 'LIFE',
              toZone: 'TRASH',
            },
          },
          {
            type: 'LifeCardTaken',
            version: 1,
            payload: {
              playerId: secondPlayerId,
              count: 1,
              cardInstanceId: triggerCard.instanceId,
              cardDefinitionId: triggerCard.cardId,
              destinationZone: 'TRASH',
            },
          },
        ],
      }),
    );

    await disposeRoom(room);
  });

  it('adopts an isolated end-phase runtime that pauses on an effect decision', async () => {
    const { room } = await createRoomFixture();
    const access = asPrivateRoom(room);
    const firstSessionId = room.state.startingPlayerSessionId;
    const secondSessionId =
      firstSessionId === 'session-a' ? 'session-b' : 'session-a';

    await access.handleChooseFirstOrSecond(
      { sessionId: firstSessionId },
      { choice: 'first' },
    );
    await access.handleMulligan(
      { sessionId: firstSessionId },
      { mulligan: false },
    );
    await access.handleMulligan(
      { sessionId: secondSessionId },
      { mulligan: false },
    );
    await advanceToMain(room, firstSessionId);

    const player = room.state.players.get(firstSessionId);
    const characterInstanceId = putCharacterInPlay(player, 'C-001', true);
    retuneAsPicaEndTurnEffectCard(player, characterInstanceId);

    await access.handleEndPhase(fakeClient(firstSessionId));
    await access.handleEndPhase(fakeClient(firstSessionId));

    const pendingDecision = (
      room as unknown as {
        effectBoundary: {
          getPendingEffectDecision: () => {
            id: string;
            playerSessionId: string;
            prompt: { type: string };
          } | null;
        };
      }
    ).effectBoundary.getPendingEffectDecision();

    expect(room.state.activePlayerSessionId).toBe(secondSessionId);
    expect(room.state.phase).toBe('refresh');
    expect(pendingDecision).toEqual(
      expect.objectContaining({
        playerSessionId: firstSessionId,
        prompt: expect.objectContaining({ type: 'confirm' }),
      }),
    );

    await disposeRoom(room);
  });

  it('rejects isolated end-phase commands while an effect decision is pending on the live room', async () => {
    const { room, record } = await createRoomFixture();
    const access = asPrivateRoom(room);
    const requester = fakeClient('session-a');
    const boundary = (
      room as unknown as {
        effectBoundary: {
          hasPendingPlayerInteraction: () => boolean;
        };
      }
    ).effectBoundary;
    const phaseBefore = room.state.phase;
    const turnBefore = room.state.turn;

    jest
      .spyOn(boundary, 'hasPendingPlayerInteraction')
      .mockReturnValue(true);

    await access.handleEndPhase(requester);

    expect(requester.send).toHaveBeenCalledWith('actionError', {
      message: "Une decision d'effet est en attente.",
    });
    expect(room.state.phase).toBe(phaseBefore);
    expect(room.state.turn).toBe(turnBefore);
    expect(record).toHaveBeenCalledTimes(1);

    await disposeRoom(room);
  });

  it('records specialized card movement events when an effect decision mutates zones', async () => {
    const { room, record } = await createRoomFixture();
    const access = asPrivateRoom(room);
    const playerSessionId = 'session-a';
    const playerId = 'player-1';
    const player = room.state.players.get(playerSessionId);
    const boundary = (
      room as unknown as {
        effectBoundary: {
          getPendingEffectDecision: () => unknown;
          answerEffectDecision: (message: unknown) => void;
        };
      }
    ).effectBoundary;

    const returnedCharacterInstanceId = putCharacterInPlay(
      player,
      'C-001',
      false,
    );
    const toDeckInstanceId = ensureHandContains(player, 'C-001');
    const toLifeCard = player?.zones.deck[0];

    if (!player || !toLifeCard) {
      throw new Error('effect decision fixture setup failed');
    }

    const pendingDecision = {
      id: 'decision-1',
      playerSessionId,
      prompt: { type: 'selectCards' },
    };

    jest
      .spyOn(boundary, 'getPendingEffectDecision')
      .mockReturnValue(pendingDecision);
    jest.spyOn(boundary, 'answerEffectDecision').mockImplementation(() => {
      const returnedIndex = player.zones.characters.findIndex(
        (card) => card.instanceId === returnedCharacterInstanceId,
      );
      const [returnedCard] = player.zones.characters.splice(returnedIndex, 1);

      if (returnedCard) {
        player.zones.hand.push(returnedCard);
      }

      const handIndex = player.zones.hand.findIndex(
        (card) => card.instanceId === toDeckInstanceId,
      );
      const [toDeckCard] = player.zones.hand.splice(handIndex, 1);

      if (toDeckCard) {
        player.zones.deck.push(toDeckCard);
      }

      const [lifeCard] = player.zones.deck.splice(0, 1);

      if (lifeCard) {
        player.zones.life.unshift(lifeCard);
      }

      player.handCount = player.zones.hand.length;
      player.deckCount = player.zones.deck.length;
      player.lifeCount = player.zones.life.length;
    });

    await access.handleResolveEffectDecision(fakeClient(playerSessionId), {
      decisionId: 'decision-1',
      selectedCardInstanceIds: [returnedCharacterInstanceId, toDeckInstanceId],
    });

    const lastRecordCall = record.mock.calls.at(-1) as
      [{ actorPlayerId?: string; eventDrafts?: unknown[] }] | undefined;
    const recordInput = lastRecordCall?.[0];

    expect(recordInput?.actorPlayerId).toBe(playerId);
    expect(recordInput?.eventDrafts).toEqual(
      expect.arrayContaining([
        {
          type: 'ChoiceSubmitted',
          version: 1,
          payload: {
            playerId,
            decisionId: 'decision-1',
            promptType: 'selectCards',
            selectedCardInstanceIds: [
              returnedCharacterInstanceId,
              toDeckInstanceId,
            ],
            selectedChoiceIds: [],
            confirmed: null,
          },
        },
        {
          type: 'CardReturnedToHand',
          version: 1,
          payload: {
            playerId,
            cardInstanceId: returnedCharacterInstanceId,
            cardDefinitionId: 'C-001',
            fromZone: 'CHARACTER_AREA',
          },
        },
        {
          type: 'CardPlacedOnDeck',
          version: 1,
          payload: {
            playerId,
            cardInstanceId: toDeckInstanceId,
            cardDefinitionId: 'C-001',
            fromZone: 'HAND',
            placement: 'bottom',
          },
        },
        {
          type: 'CardAddedToLife',
          version: 1,
          payload: {
            playerId,
            cardInstanceId: toLifeCard.instanceId,
            cardDefinitionId: toLifeCard.cardId,
            fromZone: 'DECK',
            placement: 'top',
          },
        },
      ]),
    );

    await disposeRoom(room);
  });

  it('records deck shuffling when an effect decision changes deck order', async () => {
    const { room, record } = await createRoomFixture();
    const access = asPrivateRoom(room);
    const playerSessionId = 'session-a';
    const playerId = 'player-1';
    const player = room.state.players.get(playerSessionId);
    const boundary = (
      room as unknown as {
        effectBoundary: {
          getPendingEffectDecision: () => unknown;
          answerEffectDecision: (message: unknown) => void;
        };
      }
    ).effectBoundary;

    if (!player) {
      throw new Error('player missing');
    }

    const pendingDecision = {
      id: 'decision-shuffle',
      playerSessionId,
      prompt: { type: 'selectCards' },
    };

    jest
      .spyOn(boundary, 'getPendingEffectDecision')
      .mockReturnValue(pendingDecision);
    jest.spyOn(boundary, 'answerEffectDecision').mockImplementation(() => {
      const reordered = Array.from(player.zones.deck).reverse();
      player.zones.deck.splice(0, player.zones.deck.length, ...reordered);
      player.deckCount = player.zones.deck.length;
    });

    await access.handleResolveEffectDecision(fakeClient(playerSessionId), {
      decisionId: 'decision-shuffle',
      selectedChoiceIds: ['shuffle'],
    });

    const lastRecordCall = record.mock.calls.at(-1) as
      [{ actorPlayerId?: string; eventDrafts?: unknown[] }] | undefined;
    const recordInput = lastRecordCall?.[0];

    expect(recordInput?.actorPlayerId).toBe(playerId);
    expect(recordInput?.eventDrafts).toEqual(
      expect.arrayContaining([
        {
          type: 'ChoiceSubmitted',
          version: 1,
          payload: {
            playerId,
            decisionId: 'decision-shuffle',
            promptType: 'selectCards',
            selectedCardInstanceIds: [],
            selectedChoiceIds: ['shuffle'],
            confirmed: null,
          },
        },
        {
          type: 'DeckShuffled',
          version: 1,
          payload: {
            playerId,
          },
        },
      ]),
    );

    await disposeRoom(room);
  });

  it('keeps the live room state unchanged when event persistence fails', async () => {
    const { room, record } = await createRoomFixture();
    const access = asPrivateRoom(room);
    const firstSessionId = room.state.startingPlayerSessionId;
    const secondSessionId =
      firstSessionId === 'session-a' ? 'session-b' : 'session-a';

    await access.handleChooseFirstOrSecond(
      { sessionId: firstSessionId },
      { choice: 'first' },
    );
    await access.handleMulligan(
      { sessionId: firstSessionId },
      { mulligan: false },
    );
    await access.handleMulligan(
      { sessionId: secondSessionId },
      { mulligan: false },
    );

    const activeClient = fakeClient(firstSessionId);
    await access.handleEndPhase(activeClient);
    await access.handleEndPhase(activeClient);
    await access.handleEndPhase(activeClient);

    const player = room.state.players.get(firstSessionId);
    const characterInstanceId = ensureHandContains(player, 'C-001');
    const handCountBeforePlay = player?.zones.hand.length ?? 0;
    const charactersBeforePlay = player?.zones.characters.length ?? 0;
    const restedCostBeforePlay =
      player?.zones.cost.filter((card) => card.rested).length ?? 0;
    const logsBeforePlay = room.state.logs.length;

    record.mockRejectedValueOnce(new Error('outbox down'));

    const requester = fakeClient(firstSessionId);
    await access.handlePlayCard(requester, {
      instanceId: characterInstanceId,
    });

    expect(
      player?.zones.hand.some(
        (card) => card.instanceId === characterInstanceId,
      ),
    ).toBe(true);
    expect(player?.zones.hand.length).toBe(handCountBeforePlay);
    expect(player?.zones.characters).toHaveLength(charactersBeforePlay);
    expect(player?.zones.cost.filter((card) => card.rested)).toHaveLength(
      restedCostBeforePlay,
    );
    expect(room.state.logs).toHaveLength(logsBeforePlay);
    expect(requester.send).toHaveBeenCalledWith('actionError', {
      message: 'Impossible de jouer la carte pour le moment.',
    });

    await disposeRoom(room);
  });

  it('keeps the live setup state unchanged when first-player persistence fails', async () => {
    const { room, record } = await createRoomFixture();
    const access = asPrivateRoom(room);
    const firstSessionId = room.state.startingPlayerSessionId;

    const firstPlayerBefore = room.state.firstPlayerSessionId;
    const logsBefore = room.state.logs.length;

    record.mockRejectedValueOnce(new Error('outbox down'));

    await access.handleChooseFirstOrSecond(
      { sessionId: firstSessionId },
      { choice: 'first' },
    );

    expect(room.state.firstPlayerSessionId).toBe(firstPlayerBefore);
    expect(room.state.logs).toHaveLength(logsBefore);

    await disposeRoom(room);
  });
  it('keeps the live turn state unchanged when end-phase persistence fails', async () => {
    const { room, record } = await createRoomFixture();
    const access = asPrivateRoom(room);
    const firstSessionId = room.state.startingPlayerSessionId;
    const secondSessionId =
      firstSessionId === 'session-a' ? 'session-b' : 'session-a';

    await access.handleChooseFirstOrSecond(
      { sessionId: firstSessionId },
      { choice: 'first' },
    );
    await access.handleMulligan(
      { sessionId: firstSessionId },
      { mulligan: false },
    );
    await access.handleMulligan(
      { sessionId: secondSessionId },
      { mulligan: false },
    );

    const phaseBefore = room.state.phase;
    const turnBefore = room.state.turn;
    const activePlayerBefore = room.state.activePlayerSessionId;
    const logsBefore = room.state.logs.length;

    record.mockRejectedValueOnce(new Error('outbox down'));

    const requester = fakeClient(firstSessionId);
    await access.handleEndPhase(requester);

    expect(room.state.phase).toBe(phaseBefore);
    expect(room.state.turn).toBe(turnBefore);
    expect(room.state.activePlayerSessionId).toBe(activePlayerBefore);
    expect(room.state.logs).toHaveLength(logsBefore);
    expect(requester.send).toHaveBeenCalledWith('actionError', {
      message: 'Impossible de terminer la phase pour le moment.',
    });

    await disposeRoom(room);
  });

  it('keeps the live setup state unchanged when mulligan persistence fails', async () => {
    const { room, record } = await createRoomFixture();
    const access = asPrivateRoom(room);
    const firstSessionId = room.state.startingPlayerSessionId;

    await access.handleChooseFirstOrSecond(
      { sessionId: firstSessionId },
      { choice: 'first' },
    );

    const playerBefore = room.state.players.get(firstSessionId);
    const handBefore = Array.from(playerBefore?.zones.hand ?? []).map(
      (card) => card.instanceId,
    );
    const deckCountBefore = playerBefore?.deckCount ?? 0;
    const mulliganDecidedBefore = playerBefore?.mulliganDecided ?? false;
    const phaseBefore = room.state.phase;
    const logsBefore = room.state.logs.length;

    record.mockRejectedValueOnce(new Error('outbox down'));

    const requester = fakeClient(firstSessionId);
    await access.handleMulligan(requester, { mulligan: true });

    const playerAfter = room.state.players.get(firstSessionId);

    expect(room.state.phase).toBe(phaseBefore);
    expect(room.state.logs).toHaveLength(logsBefore);
    expect(playerAfter?.mulliganDecided).toBe(mulliganDecidedBefore);
    expect(playerAfter?.deckCount).toBe(deckCountBefore);
    expect(
      Array.from(playerAfter?.zones.hand ?? []).map((card) => card.instanceId),
    ).toEqual(handBefore);
    expect(requester.send).toHaveBeenCalledWith('actionError', {
      message: 'Impossible de resoudre le mulligan pour le moment.',
    });

    await disposeRoom(room);
  });

  it('keeps the live combat state unchanged when attack persistence fails', async () => {
    const { room, record } = await createRoomFixture();
    const access = asPrivateRoom(room);
    const firstSessionId = room.state.startingPlayerSessionId;
    const secondSessionId =
      firstSessionId === 'session-a' ? 'session-b' : 'session-a';

    await access.handleChooseFirstOrSecond(
      { sessionId: firstSessionId },
      { choice: 'first' },
    );
    await access.handleMulligan(
      { sessionId: firstSessionId },
      { mulligan: false },
    );
    await access.handleMulligan(
      { sessionId: secondSessionId },
      { mulligan: false },
    );
    await advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const attacker = room.state.players.get(firstSessionId);
    const attackerRestedBefore = attacker?.zones.leader.rested ?? false;
    const logsBefore = room.state.logs.length;

    record.mockRejectedValueOnce(new Error('outbox down'));

    const requester = fakeClient(firstSessionId);
    await access.handleDeclareAttack(requester, {
      attackerInstanceId: attacker!.zones.leader.instanceId,
      targetType: 'leader',
    });

    const updatedAttacker = room.state.players.get(firstSessionId);

    expect(room.state.combat.attackerInstanceId).toBe('');
    expect(room.state.combat.defenderSessionId).toBe('');
    expect(updatedAttacker?.zones.leader.rested).toBe(attackerRestedBefore);
    expect(room.state.logs).toHaveLength(logsBefore);
    expect(requester.send).toHaveBeenCalledWith('actionError', {
      message: "Impossible de declarer l'attaque pour le moment.",
    });

    await disposeRoom(room);
  });

  it('keeps the live combat state unchanged when block persistence fails', async () => {
    const { room, record } = await createRoomFixture();
    const access = asPrivateRoom(room);
    const firstSessionId = room.state.startingPlayerSessionId;
    const secondSessionId =
      firstSessionId === 'session-a' ? 'session-b' : 'session-a';

    await access.handleChooseFirstOrSecond(
      { sessionId: firstSessionId },
      { choice: 'first' },
    );
    await access.handleMulligan(
      { sessionId: firstSessionId },
      { mulligan: false },
    );
    await access.handleMulligan(
      { sessionId: secondSessionId },
      { mulligan: false },
    );
    await advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const defender = room.state.players.get(secondSessionId);
    const blockerInstanceId = putCharacterInPlay(defender, 'C-001', false);

    await access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId:
        room.state.players.get(firstSessionId)!.zones.leader.instanceId,
      targetType: 'leader',
    });

    const logsBefore = room.state.logs.length;

    record.mockRejectedValueOnce(new Error('outbox down'));

    const requester = fakeClient(secondSessionId);
    await access.handleDeclareBlock(requester, { blockerInstanceId });

    expect(room.state.combat.blockerInstanceId).toBe('');
    expect(room.state.combat.step).toBe('blocked');
    expect(
      room.state.players
        .get(secondSessionId)
        ?.zones.characters.find((card) => card.instanceId === blockerInstanceId)
        ?.rested,
    ).toBe(false);
    expect(room.state.logs).toHaveLength(logsBefore);
    expect(requester.send).toHaveBeenCalledWith('actionError', {
      message: 'Impossible de declarer le blocage pour le moment.',
    });

    await disposeRoom(room);
  });

  it('keeps the live combat state unchanged when counter persistence fails', async () => {
    const { room, record } = await createRoomFixture();
    const access = asPrivateRoom(room);
    const firstSessionId = room.state.startingPlayerSessionId;
    const secondSessionId =
      firstSessionId === 'session-a' ? 'session-b' : 'session-a';

    await access.handleChooseFirstOrSecond(
      { sessionId: firstSessionId },
      { choice: 'first' },
    );
    await access.handleMulligan(
      { sessionId: firstSessionId },
      { mulligan: false },
    );
    await access.handleMulligan(
      { sessionId: secondSessionId },
      { mulligan: false },
    );
    await advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    await access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId:
        room.state.players.get(firstSessionId)!.zones.leader.instanceId,
      targetType: 'leader',
    });
    await access.handleDeclareBlock(fakeClient(secondSessionId), {
      blockerInstanceId: null,
    });

    const defender = room.state.players.get(secondSessionId);
    const counterInstanceId = ensureHandContains(defender, 'C-001');
    const handBefore = defender?.zones.hand.length ?? 0;
    const trashBefore = defender?.zones.trash.length ?? 0;
    const logsBefore = room.state.logs.length;

    record.mockRejectedValueOnce(new Error('outbox down'));

    const requester = fakeClient(secondSessionId);
    await access.handleDeclareCounter(requester, {
      discardInstanceId: counterInstanceId,
      counterPowerBonus: 1000,
    });

    const updatedDefender = room.state.players.get(secondSessionId);

    expect(room.state.combat.counterPowerBonus).toBe(0);
    expect(updatedDefender?.zones.hand.length).toBe(handBefore);
    expect(updatedDefender?.zones.trash.length).toBe(trashBefore);
    expect(
      updatedDefender?.zones.hand.some(
        (card) => card.instanceId === counterInstanceId,
      ),
    ).toBe(true);
    expect(room.state.logs).toHaveLength(logsBefore);
    expect(requester.send).toHaveBeenCalledWith('actionError', {
      message: 'Impossible de declarer le contre pour le moment.',
    });

    await disposeRoom(room);
  });

  it('keeps the live combat resolution unchanged when finish-counter persistence fails', async () => {
    const { room, record } = await createRoomFixture();
    const access = asPrivateRoom(room);
    const firstSessionId = room.state.startingPlayerSessionId;
    const secondSessionId =
      firstSessionId === 'session-a' ? 'session-b' : 'session-a';

    await access.handleChooseFirstOrSecond(
      { sessionId: firstSessionId },
      { choice: 'first' },
    );
    await access.handleMulligan(
      { sessionId: firstSessionId },
      { mulligan: false },
    );
    await access.handleMulligan(
      { sessionId: secondSessionId },
      { mulligan: false },
    );
    await advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    await access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId:
        room.state.players.get(firstSessionId)!.zones.leader.instanceId,
      targetType: 'leader',
    });
    await access.handleDeclareBlock(fakeClient(secondSessionId), {
      blockerInstanceId: null,
    });

    const lifeBefore =
      room.state.players.get(secondSessionId)!.zones.life.length;
    const combatBefore = room.state.combat.attackerInstanceId;
    const logsBefore = room.state.logs.length;

    record.mockRejectedValueOnce(new Error('outbox down'));

    const requester = fakeClient(secondSessionId);
    await access.handleFinishCounterStep(requester);

    expect(room.state.players.get(secondSessionId)!.zones.life.length).toBe(
      lifeBefore,
    );
    expect(room.state.combat.attackerInstanceId).toBe(combatBefore);
    expect(room.state.logs).toHaveLength(logsBefore);
    expect(requester.send).toHaveBeenCalledWith('actionError', {
      message: 'Impossible de resoudre le combat pour le moment.',
    });

    await disposeRoom(room);
  });

  it('keeps the live trigger decision state unchanged when trigger persistence fails', async () => {
    const { room, record } = await createRoomFixture();
    const access = asPrivateRoom(room);
    const firstSessionId = room.state.startingPlayerSessionId;
    const secondSessionId =
      firstSessionId === 'session-a' ? 'session-b' : 'session-a';

    await access.handleChooseFirstOrSecond(
      { sessionId: firstSessionId },
      { choice: 'first' },
    );
    await access.handleMulligan(
      { sessionId: firstSessionId },
      { mulligan: false },
    );
    await access.handleMulligan(
      { sessionId: secondSessionId },
      { mulligan: false },
    );
    await advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const defender = room.state.players.get(secondSessionId);
    const [triggerCard] = defender!.zones.life.splice(0, 1);

    if (!triggerCard) {
      throw new Error('top life card missing');
    }

    triggerCard.trigger = 'Draw a card.';
    defender!.zones.life.unshift(triggerCard);

    await access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId:
        room.state.players.get(firstSessionId)!.zones.leader.instanceId,
      targetType: 'leader',
    });
    await access.handleDeclareBlock(fakeClient(secondSessionId), {
      blockerInstanceId: null,
    });
    await access.handleFinishCounterStep(fakeClient(secondSessionId));

    const attackerInstanceBefore = room.state.combat.attackerInstanceId;
    const logsBefore = room.state.logs.length;
    const handBefore = defender!.zones.hand.length;
    const trashBefore = defender!.zones.trash.length;

    record.mockRejectedValueOnce(new Error('outbox down'));

    const requester = fakeClient(secondSessionId);
    await access.handleResolveTrigger(requester, { activate: true });

    expect(room.state.combat.awaitingTriggerDecision).toBe(true);
    expect(room.state.combat.attackerInstanceId).toBe(attackerInstanceBefore);
    expect(room.state.players.get(secondSessionId)!.zones.hand.length).toBe(
      handBefore,
    );
    expect(room.state.players.get(secondSessionId)!.zones.trash.length).toBe(
      trashBefore,
    );
    expect(room.state.logs).toHaveLength(logsBefore);
    expect(requester.send).toHaveBeenCalledWith('actionError', {
      message: 'Impossible de resoudre le declenchement pour le moment.',
    });

    await disposeRoom(room);
  });

  it('keeps the live room state unchanged when consented leave persistence fails', async () => {
    const { room, record } = await createRoomFixture();
    const access = asPrivateRoom(room);
    const firstSessionId = room.state.startingPlayerSessionId;
    const secondSessionId =
      firstSessionId === 'session-a' ? 'session-b' : 'session-a';

    await access.handleChooseFirstOrSecond(
      { sessionId: firstSessionId },
      { choice: 'first' },
    );
    await access.handleMulligan(
      { sessionId: firstSessionId },
      { mulligan: false },
    );
    await access.handleMulligan(
      { sessionId: secondSessionId },
      { mulligan: false },
    );
    await advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const playerCountBefore = room.state.players.size;
    const phaseBefore = room.state.phase;
    const endReasonBefore = room.state.endReason;
    const winnerBefore = room.state.winnerSessionId;
    const logsBefore = room.state.logs.length;

    record.mockRejectedValueOnce(new Error('outbox down'));

    await room.onLeave(fakeClient(firstSessionId) as never, true);

    expect(room.state.players.size).toBe(playerCountBefore);
    expect(room.state.phase).toBe(phaseBefore);
    expect(room.state.endReason).toBe(endReasonBefore);
    expect(room.state.winnerSessionId).toBe(winnerBefore);
    expect(room.state.logs).toHaveLength(logsBefore);

    await disposeRoom(room);
  });

  it('does not append concession events when a player leaves after the match is already finished', async () => {
    const { room, record } = await createRoomFixture();
    const firstSessionId = room.state.startingPlayerSessionId;
    const playerCountBefore = room.state.players.size;
    const recordCallsBefore = record.mock.calls.length;

    room.state.phase = 'finished';
    room.state.endReason = 'life';
    room.state.winnerSessionId =
      firstSessionId === 'session-a' ? 'session-b' : 'session-a';

    await room.onLeave(fakeClient(firstSessionId) as never, true);

    expect(room.state.players.size).toBe(playerCountBefore - 1);
    expect(record).toHaveBeenCalledTimes(recordCallsBefore);

    await disposeRoom(room);
  });
});
