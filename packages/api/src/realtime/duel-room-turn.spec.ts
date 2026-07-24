import type { Card, DuelPlayer } from '@onepiecetcg/shared';
import { DuelRoom, configureDuelRoomServices } from './duel.room';

jest.mock('@onepiecetcg/shared', () => {
  const sharedMock: typeof import('../decks/shared-test.mock') =
    jest.requireActual('../decks/shared-test.mock');

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

const eventCard: Card = {
  ...leader,
  id: 'E-001',
  number: 'E-001',
  name: 'Event',
  type: 'Event',
  cost: 1,
  power: null,
  life: null,
  counter: null,
};

const stageCard: Card = {
  ...leader,
  id: 'S-001',
  number: 'S-001',
  name: 'Stage',
  type: 'Stage',
  cost: 1,
  power: null,
  life: null,
  counter: null,
};

type PrivateRoomAccess = {
  handleChooseFirstOrSecond: (
    client: { sessionId: string },
    message: { choice: 'first' | 'second' },
  ) => void;
  handleMulligan: (
    client: { sessionId: string },
    message: { mulligan: boolean },
  ) => void;
  handleEndPhase: (client: { sessionId: string; send: jest.Mock }) => void;
  handlePlayCard: (
    client: { sessionId: string; send: jest.Mock },
    message: { instanceId: string; discardCharacterInstanceId?: string },
  ) => void;
  handleAttachDon: (
    client: { sessionId: string; send: jest.Mock },
    message: { target: 'leader' | 'character'; targetInstanceId?: string },
  ) => void;
};

function asPrivateRoom(room: DuelRoom): PrivateRoomAccess {
  return room as unknown as PrivateRoomAccess;
}

function fakeClient(sessionId: string) {
  return { sessionId, send: jest.fn() };
}

function expectErrorMessage(
  client: { send: jest.Mock },
  contains?: string,
): void {
  expect(client.send).toHaveBeenCalledTimes(1);
  const [event, payload] = client.send.mock.calls[0] as [
    string,
    { message: string },
  ];
  expect(event).toBe('actionError');
  expect(typeof payload.message).toBe('string');

  if (contains) {
    expect(payload.message).toContain(contains);
  }
}

type RoomAccessPlayer = DuelPlayer | undefined;

/**
 * The deck is shuffled on join, so a card's type is not guaranteed to land in
 * the starting 5-card hand. Deterministically pulls one card of the given
 * type from the deck into the hand for tests that need to play a specific
 * card type without depending on shuffle order.
 */
function ensureHandContains(
  player: RoomAccessPlayer,
  type: 'Character' | 'Event' | 'Stage',
): string {
  if (!player) {
    throw new Error('player missing');
  }

  const existing = Array.from(player.zones.hand).find(
    (card) => card.type === type,
  );

  if (existing) {
    return existing.instanceId;
  }

  const deckIndex = Array.from(player.zones.deck).findIndex(
    (card) => card.type === type,
  );

  if (deckIndex === -1) {
    throw new Error(`no ${type} card available in deck`);
  }

  const [card] = player.zones.deck.splice(deckIndex, 1);

  if (!card) {
    throw new Error(`no ${type} card available in deck`);
  }

  card.faceDown = false;
  player.zones.hand.push(card);
  player.handCount = player.zones.hand.length;
  player.deckCount = player.zones.deck.length;

  return card.instanceId;
}

/** Moves `amount` DON!! cards from the DON!! deck into the Cost zone, untapped, for tests that bypass the DON!! phase by mutating `room.state.phase` directly. */
function placeUntappedDon(player: RoomAccessPlayer, amount: number): void {
  if (!player) {
    throw new Error('player missing');
  }

  for (let index = 0; index < amount; index += 1) {
    const donCard = player.zones.donDeck.shift();

    if (donCard) {
      donCard.rested = false;
      player.zones.cost.push(donCard);
    }
  }
}

async function createRoomAtFirstTurn(): Promise<{
  room: DuelRoom;
  firstSessionId: string;
  secondSessionId: string;
}> {
  configureDuelRoomServices({
    decksService: {
      getValidatedGameDeck: jest.fn((authUserId: string, deckId: string) =>
        Promise.resolve({
          id: deckId,
          name: 'Valid deck',
          ownerAuthUserId: authUserId,
          leader,
          cards: [
            stageCard,
            eventCard,
            ...Array.from({ length: 48 }, (_, index) => ({
              ...mainCard,
              copyIndex: index + 1,
            })),
          ],
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

  const access = asPrivateRoom(room);
  const firstSessionId = room.state.startingPlayerSessionId;
  const secondSessionId =
    firstSessionId === 'session-a' ? 'session-b' : 'session-a';

  access.handleChooseFirstOrSecond(
    { sessionId: firstSessionId },
    { choice: 'first' },
  );
  access.handleMulligan({ sessionId: firstSessionId }, { mulligan: false });
  access.handleMulligan({ sessionId: secondSessionId }, { mulligan: false });

  return { room, firstSessionId, secondSessionId };
}

describe('DuelRoom turn/phase engine (stage 7)', () => {
  it('starts turn 1 in the refresh phase for the first player', async () => {
    const { room, firstSessionId } = await createRoomAtFirstTurn();

    expect(room.state.phase).toBe('refresh');
    expect(room.state.turn).toBe(1);
    expect(room.state.activePlayerSessionId).toBe(firstSessionId);

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('skips the draw phase on the first player first turn', async () => {
    const { room, firstSessionId } = await createRoomAtFirstTurn();
    const access = asPrivateRoom(room);
    const player = room.state.players.get(firstSessionId);
    const handCountBeforeDraw = player?.handCount;

    access.handleEndPhase(fakeClient(firstSessionId));

    expect(room.state.phase).toBe('draw');
    expect(player?.handCount).toBe(handCountBeforeDraw);
    expect(room.state.logs.at(-1)?.message).toContain('ne pioche pas');

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('places only 1 DON!! during the first turn DON!! phase', async () => {
    const { room, firstSessionId } = await createRoomAtFirstTurn();
    const access = asPrivateRoom(room);
    const client = fakeClient(firstSessionId);

    access.handleEndPhase(client); // -> draw
    access.handleEndPhase(client); // -> don

    const player = room.state.players.get(firstSessionId);
    expect(room.state.phase).toBe('don');
    expect(player?.zones.cost).toHaveLength(1);
    expect(player?.zones.donDeck).toHaveLength(9);

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('draws a card and places 2 DON!! on the second player turn (only the game turn 1 is special)', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    const access = asPrivateRoom(room);
    const firstClient = fakeClient(firstSessionId);
    const secondClient = fakeClient(secondSessionId);

    access.handleEndPhase(firstClient); // draw (skipped, game turn 1)
    access.handleEndPhase(firstClient); // don (1 only)
    access.handleEndPhase(firstClient); // main
    access.handleEndPhase(firstClient); // end
    access.handleEndPhase(firstClient); // ends turn -> second player's refresh

    expect(room.state.activePlayerSessionId).toBe(secondSessionId);
    expect(room.state.phase).toBe('refresh');

    access.handleEndPhase(secondClient); // draw, turn 2: second player draws normally
    const secondPlayer = room.state.players.get(secondSessionId);
    expect(secondPlayer?.handCount).toBe(5 + 1);

    access.handleEndPhase(secondClient); // don, 2 this time
    expect(
      secondPlayer?.zones.cost.filter((card) => !card.rested),
    ).toHaveLength(2);

    access.handleEndPhase(secondClient); // main
    access.handleEndPhase(secondClient); // end
    access.handleEndPhase(secondClient); // ends turn -> first player's refresh (turn 3)

    access.handleEndPhase(firstClient); // draw, now past first turn
    const firstPlayer = room.state.players.get(firstSessionId);
    expect(firstPlayer?.handCount).toBe(5 + 1);

    access.handleEndPhase(firstClient); // don, 2 this time
    // 1 DON!! placed on turn 1 (untapped after refresh) + 2 placed this turn.
    expect(firstPlayer?.zones.cost.filter((card) => !card.rested)).toHaveLength(
      3,
    );

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('declares defeat by deck-out when a player cannot draw', async () => {
    const { room, firstSessionId } = await createRoomAtFirstTurn();
    const access = asPrivateRoom(room);
    const player = room.state.players.get(firstSessionId);

    if (player) {
      player.zones.deck.splice(0, player.zones.deck.length);
    }

    // Game turn 1 does not draw; force the turn counter forward manually to
    // exercise the draw-phase deck-out path directly.
    room.state.turn = 2;

    access.handleEndPhase(fakeClient(firstSessionId)); // draw phase now runs

    expect(room.state.phase).toBe('finished');
    expect(room.state.logs.at(-1)?.message).toContain('deck-out');

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('rejects phase actions from a non-active player', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    const access = asPrivateRoom(room);
    const client = fakeClient(secondSessionId);

    access.handleEndPhase(client);

    expect(room.state.phase).toBe('refresh');
    expectErrorMessage(client);
    expect(room.state.activePlayerSessionId).toBe(firstSessionId);

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  function advanceToMain(room: DuelRoom, sessionId: string): void {
    const access = asPrivateRoom(room);
    const client = fakeClient(sessionId);

    access.handleEndPhase(client); // draw
    access.handleEndPhase(client); // don
    access.handleEndPhase(client); // main
  }

  it('plays a Character card from hand, paying its cost with untapped DON!!', async () => {
    const { room, firstSessionId } = await createRoomAtFirstTurn();
    advanceToMain(room, firstSessionId);

    const access = asPrivateRoom(room);
    const player = room.state.players.get(firstSessionId);
    const characterInstanceId = ensureHandContains(player, 'Character');

    access.handlePlayCard(fakeClient(firstSessionId), {
      instanceId: characterInstanceId,
    });

    expect(
      player?.zones.characters.some(
        (card) => card.instanceId === characterInstanceId,
      ),
    ).toBe(true);
    expect(
      player?.zones.characters.find(
        (card) => card.instanceId === characterInstanceId,
      )?.playedThisTurn,
    ).toBe(true);
    expect(player?.zones.cost.filter((card) => card.rested)).toHaveLength(1);

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('rejects playing a card without enough untapped DON!!', async () => {
    const { room, firstSessionId } = await createRoomAtFirstTurn();
    const access = asPrivateRoom(room);
    const player = room.state.players.get(firstSessionId);
    const characterInstanceId = ensureHandContains(player, 'Character');

    // Force main phase directly, with 0 DON!! placed, to isolate the cost
    // check from the phase-progression flow.
    room.state.phase = 'main';

    const client = fakeClient(firstSessionId);
    access.handlePlayCard(client, { instanceId: characterInstanceId });

    expect(
      player?.zones.characters.some(
        (card) => card.instanceId === characterInstanceId,
      ),
    ).toBe(false);
    expectErrorMessage(client, 'DON!!');

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('enforces the 5-Character zone limit', async () => {
    const { room, firstSessionId } = await createRoomAtFirstTurn();
    const player = room.state.players.get(firstSessionId);

    if (!player) {
      throw new Error('player missing');
    }

    for (let index = 0; index < 5; index += 1) {
      const filler = player.zones.deck.shift();

      if (filler) {
        filler.faceDown = false;
        player.zones.characters.push(filler);
      }
    }

    const characterInstanceId = ensureHandContains(player, 'Character');
    placeUntappedDon(player, 1);
    room.state.phase = 'main';
    const access = asPrivateRoom(room);
    const client = fakeClient(firstSessionId);

    access.handlePlayCard(client, { instanceId: characterInstanceId });

    expect(player.zones.characters).toHaveLength(5);
    expectErrorMessage(client, 'pleine');

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('discards a chosen Character to make room for a new one at the 5-Character limit', async () => {
    const { room, firstSessionId } = await createRoomAtFirstTurn();
    const player = room.state.players.get(firstSessionId);

    if (!player) {
      throw new Error('player missing');
    }

    for (let index = 0; index < 5; index += 1) {
      const filler = player.zones.deck.shift();

      if (filler) {
        filler.faceDown = false;
        player.zones.characters.push(filler);
      }
    }

    const toDiscard = player.zones.characters[0];

    if (!toDiscard) {
      throw new Error('no filler character to discard');
    }

    toDiscard.attachedDon = 2;

    const characterInstanceId = ensureHandContains(player, 'Character');
    placeUntappedDon(player, 1);
    room.state.phase = 'main';
    const access = asPrivateRoom(room);

    access.handlePlayCard(fakeClient(firstSessionId), {
      instanceId: characterInstanceId,
      discardCharacterInstanceId: toDiscard.instanceId,
    });

    expect(player.zones.characters).toHaveLength(5);
    expect(
      player.zones.characters.some(
        (card) => card.instanceId === characterInstanceId,
      ),
    ).toBe(true);
    expect(
      player.zones.characters.some(
        (card) => card.instanceId === toDiscard.instanceId,
      ),
    ).toBe(false);
    expect(player.zones.trash[0]?.instanceId).toBe(toDiscard.instanceId);
    expect(player.zones.trash[0]?.attachedDon).toBe(0);
    expect(
      player.zones.cost.filter(
        (card) => card.instanceId.includes('don-returned') && card.rested,
      ),
    ).toHaveLength(2);

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('rejects the discard target if it does not reference an owned Character', async () => {
    const { room, firstSessionId } = await createRoomAtFirstTurn();
    const player = room.state.players.get(firstSessionId);

    if (!player) {
      throw new Error('player missing');
    }

    for (let index = 0; index < 5; index += 1) {
      const filler = player.zones.deck.shift();

      if (filler) {
        filler.faceDown = false;
        player.zones.characters.push(filler);
      }
    }

    const characterInstanceId = ensureHandContains(player, 'Character');
    placeUntappedDon(player, 1);
    room.state.phase = 'main';
    const access = asPrivateRoom(room);
    const client = fakeClient(firstSessionId);

    access.handlePlayCard(client, {
      instanceId: characterInstanceId,
      discardCharacterInstanceId: 'not-a-real-instance-id',
    });

    expect(player.zones.characters).toHaveLength(5);
    expectErrorMessage(client, 'pleine');

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('trashes an Event card on play instead of putting it into a zone', async () => {
    const { room, firstSessionId } = await createRoomAtFirstTurn();
    const player = room.state.players.get(firstSessionId);
    const eventInstanceId = ensureHandContains(player, 'Event');

    placeUntappedDon(player, 1);
    room.state.phase = 'main';
    const access = asPrivateRoom(room);
    access.handlePlayCard(fakeClient(firstSessionId), {
      instanceId: eventInstanceId,
    });

    expect(player?.zones.trash[0]?.instanceId).toBe(eventInstanceId);
    expect(
      player?.zones.hand.some((card) => card.instanceId === eventInstanceId),
    ).toBe(false);

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('replaces the Stage card and trashes the old one when a new Stage is played', async () => {
    const { room, firstSessionId } = await createRoomAtFirstTurn();
    const player = room.state.players.get(firstSessionId);
    const stageInstanceId = ensureHandContains(player, 'Stage');
    placeUntappedDon(player, 1);

    room.state.phase = 'main';
    const access = asPrivateRoom(room);
    access.handlePlayCard(fakeClient(firstSessionId), {
      instanceId: stageInstanceId,
    });

    expect(player?.zones.stage.instanceId).toBe(stageInstanceId);

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('attaches an untapped DON!! to the Leader and increases displayed power', async () => {
    const { room, firstSessionId } = await createRoomAtFirstTurn();
    const player = room.state.players.get(firstSessionId);

    if (player) {
      const donCard = player.zones.donDeck.shift();

      if (donCard) {
        donCard.rested = false;
        player.zones.cost.push(donCard);
      }
    }

    room.state.phase = 'main';
    const access = asPrivateRoom(room);
    access.handleAttachDon(fakeClient(firstSessionId), { target: 'leader' });

    expect(player?.zones.leader.attachedDon).toBe(1);
    expect(player?.zones.cost.every((card) => card.rested)).toBe(true);

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('rejects attaching DON!! when none are untapped', async () => {
    const { room, firstSessionId } = await createRoomAtFirstTurn();
    room.state.phase = 'main';
    const access = asPrivateRoom(room);
    const client = fakeClient(firstSessionId);

    access.handleAttachDon(client, { target: 'leader' });

    const player = room.state.players.get(firstSessionId);
    expect(player?.zones.leader.attachedDon).toBe(0);
    expectErrorMessage(client);

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('returns attached DON!! tapped to the Cost zone during the next Refresh phase', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    const player = room.state.players.get(firstSessionId);

    if (player) {
      const donCard = player.zones.donDeck.shift();

      if (donCard) {
        donCard.rested = false;
        player.zones.cost.push(donCard);
      }
    }

    room.state.phase = 'main';
    const access = asPrivateRoom(room);
    const firstClient = fakeClient(firstSessionId);
    access.handleAttachDon(firstClient, { target: 'leader' });

    access.handleEndPhase(firstClient); // -> end
    access.handleEndPhase(firstClient); // ends turn -> second player refresh
    access.handleEndPhase(fakeClient(secondSessionId)); // draw
    access.handleEndPhase(fakeClient(secondSessionId)); // don
    access.handleEndPhase(fakeClient(secondSessionId)); // main
    access.handleEndPhase(fakeClient(secondSessionId)); // end
    access.handleEndPhase(fakeClient(secondSessionId)); // ends turn -> first player refresh

    expect(room.state.activePlayerSessionId).toBe(firstSessionId);
    expect(player?.zones.leader.attachedDon).toBe(0);
    expect(
      player?.zones.cost.some(
        (card) => card.instanceId.includes('don-returned') && card.rested,
      ),
    ).toBe(true);

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('clears playedThisTurn on Characters during the next Refresh phase', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    advanceToMain(room, firstSessionId);

    const access = asPrivateRoom(room);
    const player = room.state.players.get(firstSessionId);
    const characterInstanceId = ensureHandContains(player, 'Character');

    access.handlePlayCard(fakeClient(firstSessionId), {
      instanceId: characterInstanceId,
    });

    const playedCharacter = player?.zones.characters.find(
      (card) => card.instanceId === characterInstanceId,
    );
    expect(playedCharacter?.playedThisTurn).toBe(true);

    const firstClient = fakeClient(firstSessionId);
    access.handleEndPhase(firstClient); // end
    access.handleEndPhase(firstClient); // ends turn -> second player refresh
    access.handleEndPhase(fakeClient(secondSessionId)); // draw
    access.handleEndPhase(fakeClient(secondSessionId)); // don
    access.handleEndPhase(fakeClient(secondSessionId)); // main
    access.handleEndPhase(fakeClient(secondSessionId)); // end
    access.handleEndPhase(fakeClient(secondSessionId)); // ends turn -> first player refresh

    expect(playedCharacter?.playedThisTurn).toBe(false);
    expect(playedCharacter?.rested).toBe(false);

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });
});
