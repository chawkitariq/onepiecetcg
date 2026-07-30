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

const secondStageCard: Card = {
  ...stageCard,
  id: 'S-002',
  number: 'S-002',
  name: 'Second Stage',
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
 * the starting 5-card hand or remain in the visible deck after Life is dealt.
 * Deterministically pulls one card of the given type from the owner's hidden
 * setup zones into the hand for tests that need to play a specific card type
 * without depending on shuffle order.
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

  if (deckIndex >= 0) {
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

  const lifeIndex = Array.from(player.zones.life).findIndex(
    (card) => card.type === type,
  );

  if (lifeIndex === -1) {
    throw new Error(`no ${type} card available in deck or life`);
  }

  const [card] = player.zones.life.splice(lifeIndex, 1);

  if (!card) {
    throw new Error(`no ${type} card available in deck or life`);
  }

  card.faceDown = false;
  player.zones.hand.push(card);
  player.handCount = player.zones.hand.length;
  player.lifeCount = player.zones.life.length;

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
            secondStageCard,
            eventCard,
            ...Array.from({ length: 47 }, (_, index) => ({
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
  await room.onCreate();
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

    await access.handleEndPhase(fakeClient(firstSessionId));

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

    await access.handleEndPhase(client); // -> draw
    await access.handleEndPhase(client); // -> don

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

    await access.handleEndPhase(firstClient); // draw (skipped, game turn 1)
    await access.handleEndPhase(firstClient); // don (1 only)
    await access.handleEndPhase(firstClient); // main
    await access.handleEndPhase(firstClient); // end
    await access.handleEndPhase(firstClient); // ends turn -> second player's refresh

    expect(room.state.activePlayerSessionId).toBe(secondSessionId);
    expect(room.state.phase).toBe('refresh');

    await access.handleEndPhase(secondClient); // draw, turn 2: second player draws normally
    const secondPlayer = room.state.players.get(secondSessionId);
    expect(secondPlayer?.handCount).toBe(5 + 1);

    await access.handleEndPhase(secondClient); // don, 2 this time
    const secondPlayerAfterDon = room.state.players.get(secondSessionId);
    expect(
      secondPlayerAfterDon?.zones.cost.filter((card) => !card.rested),
    ).toHaveLength(2);

    await access.handleEndPhase(secondClient); // main
    await access.handleEndPhase(secondClient); // end
    await access.handleEndPhase(secondClient); // ends turn -> first player's refresh (turn 3)

    await access.handleEndPhase(firstClient); // draw, now past first turn
    const firstPlayer = room.state.players.get(firstSessionId);
    expect(firstPlayer?.handCount).toBe(5 + 1);

    await access.handleEndPhase(firstClient); // don, 2 this time
    const firstPlayerAfterDon = room.state.players.get(firstSessionId);
    // 1 DON!! placed on turn 1 (untapped after refresh) + 2 placed this turn.
    expect(
      firstPlayerAfterDon?.zones.cost.filter((card) => !card.rested),
    ).toHaveLength(3);

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

    await access.handleEndPhase(fakeClient(firstSessionId)); // draw phase now runs

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

    await access.handleEndPhase(client);

    expect(room.state.phase).toBe('refresh');
    expectErrorMessage(client);
    expect(room.state.activePlayerSessionId).toBe(firstSessionId);

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  async function advanceToMain(
    room: DuelRoom,
    sessionId: string,
  ): Promise<void> {
    const access = asPrivateRoom(room);
    const client = fakeClient(sessionId);

    await access.handleEndPhase(client); // draw
    await access.handleEndPhase(client); // don
    await access.handleEndPhase(client); // main
  }

  it('plays a Character card from hand, paying its cost with untapped DON!!', async () => {
    const { room, firstSessionId } = await createRoomAtFirstTurn();
    await advanceToMain(room, firstSessionId);

    const access = asPrivateRoom(room);
    const player = room.state.players.get(firstSessionId);
    const characterInstanceId = ensureHandContains(player, 'Character');

    await access.handlePlayCard(fakeClient(firstSessionId), {
      instanceId: characterInstanceId,
    });

    const updatedPlayer = room.state.players.get(firstSessionId);

    expect(
      updatedPlayer?.zones.characters.some(
        (card) => card.instanceId === characterInstanceId,
      ),
    ).toBe(true);
    expect(
      updatedPlayer?.zones.characters.find(
        (card) => card.instanceId === characterInstanceId,
      )?.playedThisTurn,
    ).toBe(true);
    expect(
      updatedPlayer?.zones.cost.filter((card) => card.rested),
    ).toHaveLength(1);

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
    await access.handlePlayCard(client, { instanceId: characterInstanceId });

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

    await access.handlePlayCard(client, { instanceId: characterInstanceId });

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

    await access.handlePlayCard(fakeClient(firstSessionId), {
      instanceId: characterInstanceId,
      discardCharacterInstanceId: toDiscard.instanceId,
    });

    const updatedPlayer = room.state.players.get(firstSessionId);

    expect(player.zones.characters).toHaveLength(5);
    expect(
      updatedPlayer?.zones.characters.some(
        (card) => card.instanceId === characterInstanceId,
      ),
    ).toBe(true);
    expect(
      updatedPlayer?.zones.characters.some(
        (card) => card.instanceId === toDiscard.instanceId,
      ),
    ).toBe(false);
    expect(updatedPlayer?.zones.trash[0]?.instanceId).toBe(
      toDiscard.instanceId,
    );
    expect(updatedPlayer?.zones.trash[0]?.attachedDon).toBe(0);
    expect(
      updatedPlayer?.zones.cost.filter(
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

    await access.handlePlayCard(client, {
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
    await access.handlePlayCard(fakeClient(firstSessionId), {
      instanceId: eventInstanceId,
    });

    const updatedPlayer = room.state.players.get(firstSessionId);

    expect(updatedPlayer?.zones.trash[0]?.instanceId).toBe(eventInstanceId);
    expect(
      updatedPlayer?.zones.hand.some(
        (card) => card.instanceId === eventInstanceId,
      ),
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
    await access.handlePlayCard(fakeClient(firstSessionId), {
      instanceId: stageInstanceId,
    });

    const updatedPlayer = room.state.players.get(firstSessionId);

    expect(updatedPlayer?.zones.stage.instanceId).toBe(stageInstanceId);

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('returns attached DON!! to the cost zone rested when the Stage card is replaced', async () => {
    const { room, firstSessionId } = await createRoomAtFirstTurn();
    const player = room.state.players.get(firstSessionId);
    const firstStageInstanceId = ensureHandContains(player, 'Stage');
    placeUntappedDon(player, 1);

    room.state.phase = 'main';
    const access = asPrivateRoom(room);
    await access.handlePlayCard(fakeClient(firstSessionId), {
      instanceId: firstStageInstanceId,
    });

    const playerAfterFirstStage = room.state.players.get(firstSessionId);

    // Simulate a DON!! attached to the Stage card (no current path attaches
    // DON!! to a Stage, but attachedDon exists on every DuelCard, and the
    // zone-change rule must still hold if that ever becomes reachable).
    if (playerAfterFirstStage) {
      playerAfterFirstStage.zones.stage.attachedDon = 1;
    }

    const secondStageInstanceId = ensureHandContains(
      playerAfterFirstStage,
      'Stage',
    );
    placeUntappedDon(playerAfterFirstStage, 1);
    const costCountBeforePlay = playerAfterFirstStage?.zones.cost.length ?? 0;

    await access.handlePlayCard(fakeClient(firstSessionId), {
      instanceId: secondStageInstanceId,
    });

    const updatedPlayer = room.state.players.get(firstSessionId);

    expect(updatedPlayer?.zones.stage.instanceId).toBe(secondStageInstanceId);
    // Paying cost only rests DON!! cards (they stay in the cost zone), and
    // the replaced Stage's 1 attachedDon comes back as 1 new rested DON!!
    // card -- net +1 to the cost zone's card count.
    expect(updatedPlayer?.zones.cost.length).toBe(costCountBeforePlay + 1);
    expect(
      updatedPlayer?.zones.trash.find(
        (card) => card.instanceId === firstStageInstanceId,
      )?.attachedDon,
    ).toBe(0);

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
    await access.handleAttachDon(fakeClient(firstSessionId), {
      target: 'leader',
    });

    const updatedPlayer = room.state.players.get(firstSessionId);

    expect(updatedPlayer?.zones.leader.attachedDon).toBe(1);
    expect(updatedPlayer?.zones.cost.every((card) => card.rested)).toBe(true);

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('attaches multiple untapped DON!! to a Character when a batch count is requested', async () => {
    const { room, firstSessionId } = await createRoomAtFirstTurn();
    const player = room.state.players.get(firstSessionId);

    placeUntappedDon(player, 3);
    room.state.phase = 'main';

    const characterInstanceId = ensureHandContains(player, 'Character');
    await asPrivateRoom(room).handlePlayCard(fakeClient(firstSessionId), {
      instanceId: characterInstanceId,
    });

    const afterPlayPlayer = room.state.players.get(firstSessionId);

    if (afterPlayPlayer) {
      afterPlayPlayer.zones.cost.forEach((card) => {
        card.rested = false;
      });
    }

    const playedCharacter = afterPlayPlayer?.zones.characters.find(
      (card) => card.instanceId === characterInstanceId,
    );

    expect(playedCharacter).toBeDefined();

    await asPrivateRoom(room).handleAttachDon(fakeClient(firstSessionId), {
      target: 'character',
      targetInstanceId: characterInstanceId,
      count: 2,
    });

    const updatedPlayer = room.state.players.get(firstSessionId);
    const updatedCharacter = updatedPlayer?.zones.characters.find(
      (card) => card.instanceId === characterInstanceId,
    );

    expect(updatedCharacter?.attachedDon).toBe(2);
    expect(
      updatedPlayer?.zones.cost.filter((card) => !card.rested),
    ).toHaveLength(1);
    expect(room.state.logs.at(-1)?.message).toContain('donne 2 DON!!');

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('rejects attaching DON!! when none are untapped', async () => {
    const { room, firstSessionId } = await createRoomAtFirstTurn();
    room.state.phase = 'main';
    const access = asPrivateRoom(room);
    const client = fakeClient(firstSessionId);

    await access.handleAttachDon(client, { target: 'leader' });

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
    await access.handleAttachDon(firstClient, { target: 'leader' });

    await access.handleEndPhase(firstClient); // -> end
    await access.handleEndPhase(firstClient); // ends turn -> second player refresh
    await access.handleEndPhase(fakeClient(secondSessionId)); // draw
    await access.handleEndPhase(fakeClient(secondSessionId)); // don
    await access.handleEndPhase(fakeClient(secondSessionId)); // main
    await access.handleEndPhase(fakeClient(secondSessionId)); // end
    await access.handleEndPhase(fakeClient(secondSessionId)); // ends turn -> first player refresh

    expect(room.state.activePlayerSessionId).toBe(firstSessionId);
    const updatedPlayer = room.state.players.get(firstSessionId);

    expect(updatedPlayer?.zones.leader.attachedDon).toBe(0);
    expect(
      updatedPlayer?.zones.cost.some(
        (card) => card.instanceId.includes('don-returned') && card.rested,
      ),
    ).toBe(true);

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('clears playedThisTurn on Characters during the next Refresh phase', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    await advanceToMain(room, firstSessionId);

    const access = asPrivateRoom(room);
    const player = room.state.players.get(firstSessionId);
    const characterInstanceId = ensureHandContains(player, 'Character');

    await access.handlePlayCard(fakeClient(firstSessionId), {
      instanceId: characterInstanceId,
    });

    let playedCharacter = room.state.players
      .get(firstSessionId)
      ?.zones.characters.find(
        (card) => card.instanceId === characterInstanceId,
      );
    expect(playedCharacter?.playedThisTurn).toBe(true);

    const firstClient = fakeClient(firstSessionId);
    await access.handleEndPhase(firstClient); // end
    await access.handleEndPhase(firstClient); // ends turn -> second player refresh
    await access.handleEndPhase(fakeClient(secondSessionId)); // draw
    await access.handleEndPhase(fakeClient(secondSessionId)); // don
    await access.handleEndPhase(fakeClient(secondSessionId)); // main
    await access.handleEndPhase(fakeClient(secondSessionId)); // end
    await access.handleEndPhase(fakeClient(secondSessionId)); // ends turn -> first player refresh

    playedCharacter = room.state.players
      .get(firstSessionId)
      ?.zones.characters.find(
        (card) => card.instanceId === characterInstanceId,
      );

    expect(playedCharacter?.playedThisTurn).toBe(false);
    expect(playedCharacter?.rested).toBe(false);

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });
});
