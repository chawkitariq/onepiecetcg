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
  life: 2,
  counter: null,
  attributes: [],
  families: [],
  text: '',
  trigger: null,
  imageUrl: null,
  set: { id: 'TEST', name: 'Test' },
  rarity: null,
};

const weakCharacter: Card = {
  ...leader,
  id: 'C-001',
  number: 'C-001',
  name: 'Weak Character',
  type: 'Character',
  cost: 1,
  power: 1000,
  life: null,
  counter: 1000,
};

const strongCharacter: Card = {
  ...leader,
  id: 'C-002',
  number: 'C-002',
  name: 'Strong Character',
  type: 'Character',
  cost: 5,
  power: 8000,
  life: null,
  counter: 1000,
};

const counterEvent: Card = {
  ...leader,
  id: 'E-001',
  number: 'E-001',
  name: 'Counter Helper',
  type: 'Character',
  cost: 1,
  power: 0,
  life: null,
  counter: 2000,
};

const triggerCharacter: Card = {
  ...leader,
  id: 'C-003',
  number: 'C-003',
  name: 'Trigger Character',
  type: 'Character',
  cost: 1,
  power: 1000,
  life: null,
  counter: 1000,
  trigger: 'Draw a card.',
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
  handleDeclareAttack: (
    client: { sessionId: string; send: jest.Mock },
    message: {
      attackerInstanceId: string;
      targetType: 'leader' | 'character';
      targetInstanceId?: string;
    },
  ) => void;
  handleDeclareBlock: (
    client: { sessionId: string; send: jest.Mock },
    message: { blockerInstanceId?: string | null },
  ) => void;
  handleDeclareCounter: (
    client: { sessionId: string; send: jest.Mock },
    message: { discardInstanceId: string; counterPowerBonus: number },
  ) => void;
  handleFinishCounterStep: (client: {
    sessionId: string;
    send: jest.Mock;
  }) => void;
  handleResolveTrigger: (
    client: { sessionId: string; send: jest.Mock },
    message: { activate: boolean },
  ) => void;
};

function asPrivateRoom(room: DuelRoom): PrivateRoomAccess {
  return room as unknown as PrivateRoomAccess;
}

function fakeClient(sessionId: string) {
  return { sessionId, send: jest.fn() };
}

function expectErrorMessage(client: { send: jest.Mock }, contains?: string) {
  expect(client.send).toHaveBeenCalledTimes(1);
  const [event, payload] = client.send.mock.calls[0] as [
    string,
    { message: string },
  ];
  expect(event).toBe('actionError');

  if (contains) {
    expect(payload.message).toContain(contains);
  }
}

type RoomAccessPlayer = DuelPlayer | undefined;

function ensureHandContains(player: RoomAccessPlayer, cardId: string): string {
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

/**
 * Combat setup needs Personnage already sitting on either side's board
 * (often the defender's, who cannot act via `handlePlayCard` outside their
 * own turn) -- moves a card straight from hand/deck into the characters
 * zone, bypassing `playCard`'s cost/turn checks entirely.
 */
function putCharacterInPlay(
  player: RoomAccessPlayer,
  cardId: string,
  rested: boolean,
) {
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
            weakCharacter,
            ...Array.from({ length: 4 }, (_, index) => ({
              ...strongCharacter,
              copyIndex: index + 1,
            })),
            ...Array.from({ length: 4 }, (_, index) => ({
              ...counterEvent,
              copyIndex: index + 1,
            })),
            ...Array.from({ length: 4 }, (_, index) => ({
              ...triggerCharacter,
              copyIndex: index + 1,
            })),
            ...Array.from({ length: 37 }, (_, index) => ({
              ...weakCharacter,
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

/** Advances the active player through refresh/draw/don into the main phase. */
function advanceToMain(room: DuelRoom, sessionId: string): void {
  const access = asPrivateRoom(room);
  const client = fakeClient(sessionId);

  access.handleEndPhase(client); // draw
  access.handleEndPhase(client); // don
  access.handleEndPhase(client); // main
}

/**
 * Combat requires an attacker that hasn't just entered play, so this drives
 * a full extra turn cycle for `sessionId` (its second turn) before landing
 * back in the main phase with `hasTakenFirstTurn` set and characters
 * un-rested from the intervening refresh.
 */
function advanceToSecondMainTurn(
  room: DuelRoom,
  firstSessionId: string,
  secondSessionId: string,
): void {
  advanceToMain(room, firstSessionId);
  const access = asPrivateRoom(room);
  access.handleEndPhase(fakeClient(firstSessionId)); // main -> end
  access.handleEndPhase(fakeClient(firstSessionId)); // end -> ends turn 1, opponent becomes active
  advanceToMain(room, secondSessionId);
  access.handleEndPhase(fakeClient(secondSessionId)); // main -> end
  access.handleEndPhase(fakeClient(secondSessionId)); // end -> back to firstSessionId, turn 3 (its second turn)
  advanceToMain(room, firstSessionId);
}

async function disposeRoom(room: DuelRoom): Promise<void> {
  const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
  await disposableRoom._dispose();
}

describe('DuelRoom structural combat (stage 8)', () => {
  it('declares an attack with a Leader against the opposing Leader and moves to the Blocking step', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    const defender = room.state.players.get(secondSessionId);

    access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId: attacker!.zones.leader.instanceId,
      targetType: 'leader',
    });

    expect(room.state.combat.attackerSessionId).toBe(firstSessionId);
    expect(room.state.combat.defenderSessionId).toBe(secondSessionId);
    expect(room.state.combat.targetInstanceId).toBe(
      defender!.zones.leader.instanceId,
    );
    expect(room.state.combat.step).toBe('blocked');
    expect(attacker!.zones.leader.rested).toBe(true);

    await disposeRoom(room);
  });

  it('rejects declaring an attack during the attacker own first turn', async () => {
    const { room, firstSessionId } = await createRoomAtFirstTurn();
    advanceToMain(room, firstSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    const client = fakeClient(firstSessionId);

    access.handleDeclareAttack(client, {
      attackerInstanceId: attacker!.zones.leader.instanceId,
      targetType: 'leader',
    });

    expectErrorMessage(client, 'premier tour');
    expect(room.state.combat.attackerInstanceId).toBe('');

    await disposeRoom(room);
  });

  it('rejects attacking with a Personnage played this turn', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    placeUntappedDon(attacker, 1);
    const characterInstanceId = ensureHandContains(attacker, 'C-001');
    access.handlePlayCard(fakeClient(firstSessionId), {
      instanceId: characterInstanceId,
    });

    const client = fakeClient(firstSessionId);
    access.handleDeclareAttack(client, {
      attackerInstanceId: characterInstanceId,
      targetType: 'leader',
    });

    expectErrorMessage(client, 'joue ce tour-ci');
    expect(room.state.combat.attackerInstanceId).toBe('');

    await disposeRoom(room);
  });

  it('rejects targeting an untapped opposing Personnage', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    const defender = room.state.players.get(secondSessionId);
    const defenderCharacterInstanceId = putCharacterInPlay(
      defender,
      'C-001',
      false,
    );

    const client = fakeClient(firstSessionId);
    access.handleDeclareAttack(client, {
      attackerInstanceId: attacker!.zones.leader.instanceId,
      targetType: 'character',
      targetInstanceId: defenderCharacterInstanceId,
    });

    expectErrorMessage(client, 'epuise');
    expect(room.state.combat.attackerInstanceId).toBe('');

    await disposeRoom(room);
  });

  it('allows targeting a rested opposing Personnage', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    const defender = room.state.players.get(secondSessionId);
    const defenderCharacterInstanceId = putCharacterInPlay(
      defender,
      'C-001',
      true,
    );

    const client = fakeClient(firstSessionId);
    access.handleDeclareAttack(client, {
      attackerInstanceId: attacker!.zones.leader.instanceId,
      targetType: 'character',
      targetInstanceId: defenderCharacterInstanceId,
    });

    expect(client.send).not.toHaveBeenCalled();
    expect(room.state.combat.targetInstanceId).toBe(
      defenderCharacterInstanceId,
    );

    await disposeRoom(room);
  });

  it('lets the defender declare a Blocker who takes the target place for the power comparison', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    const defender = room.state.players.get(secondSessionId);
    const blockerInstanceId = putCharacterInPlay(defender, 'C-002', false);
    const blocker = defender!.zones.characters.find(
      (card) => card.instanceId === blockerInstanceId,
    )!;

    access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId: attacker!.zones.leader.instanceId,
      targetType: 'leader',
    });

    access.handleDeclareBlock(fakeClient(secondSessionId), {
      blockerInstanceId,
    });

    expect(room.state.combat.blockerInstanceId).toBe(blockerInstanceId);
    expect(room.state.combat.step).toBe('countering');
    expect(blocker.rested).toBe(true);

    await disposeRoom(room);
  });

  it('rejects a Blocker declaration from anyone but the defender', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId: attacker!.zones.leader.instanceId,
      targetType: 'leader',
    });

    const client = fakeClient(firstSessionId);
    access.handleDeclareBlock(client, { blockerInstanceId: null });

    expectErrorMessage(client, 'defenseur');

    await disposeRoom(room);
  });

  it('lets the defender discard a Contre card to boost defending power and win the combat', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    const defender = room.state.players.get(secondSessionId);
    placeUntappedDon(attacker, 1);
    const attackerCharacterInstanceId = ensureHandContains(attacker, 'C-001');
    access.handlePlayCard(fakeClient(firstSessionId), {
      instanceId: attackerCharacterInstanceId,
    });
    const attackerCharacter = attacker!.zones.characters.find(
      (card) => card.instanceId === attackerCharacterInstanceId,
    )!;
    attackerCharacter.rested = false;
    attackerCharacter.playedThisTurn = false;

    const counterInstanceId = ensureHandContains(defender, 'E-001');

    access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId: attackerCharacterInstanceId,
      targetType: 'leader',
    });
    access.handleDeclareBlock(fakeClient(secondSessionId), {
      blockerInstanceId: null,
    });
    access.handleDeclareCounter(fakeClient(secondSessionId), {
      discardInstanceId: counterInstanceId,
      counterPowerBonus: 2000,
    });

    expect(room.state.combat.counterPowerBonus).toBe(2000);
    expect(
      defender!.zones.trash.some(
        (card) => card.instanceId === counterInstanceId,
      ),
    ).toBe(true);

    access.handleFinishCounterStep(fakeClient(secondSessionId));

    // attacker power 1000 vs defender leader 5000 + 2000 counter -> attacker loses, no life lost
    expect(defender!.zones.life.length).toBe(2);
    expect(room.state.combat.attackerInstanceId).toBe('');

    await disposeRoom(room);
  });

  it('resolves a won combat against a Personnage target as a KO', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    const defender = room.state.players.get(secondSessionId);
    const targetInstanceId = putCharacterInPlay(defender, 'C-001', true);

    access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId: attacker!.zones.leader.instanceId,
      targetType: 'character',
      targetInstanceId,
    });
    access.handleDeclareBlock(fakeClient(secondSessionId), {
      blockerInstanceId: null,
    });
    access.handleFinishCounterStep(fakeClient(secondSessionId));

    expect(
      defender!.zones.characters.some(
        (card) => card.instanceId === targetInstanceId,
      ),
    ).toBe(false);
    expect(
      defender!.zones.trash.some(
        (card) => card.instanceId === targetInstanceId,
      ),
    ).toBe(true);
    expect(room.state.combat.attackerInstanceId).toBe('');

    await disposeRoom(room);
  });

  it('deals 1 damage to Leader life on a won combat and reveals the top life card only via the defender own zone', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    const defender = room.state.players.get(secondSessionId);
    const lifeCountBefore = defender!.zones.life.length;
    const topLifeCard = defender!.zones.life[0];
    topLifeCard.trigger = '';
    expect(topLifeCard.trigger).toBeFalsy();

    access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId: attacker!.zones.leader.instanceId,
      targetType: 'leader',
    });
    access.handleDeclareBlock(fakeClient(secondSessionId), {
      blockerInstanceId: null,
    });
    access.handleFinishCounterStep(fakeClient(secondSessionId));

    expect(defender!.zones.life.length).toBe(lifeCountBefore - 1);
    expect(
      defender!.zones.hand.some(
        (card) => card.instanceId === topLifeCard.instanceId,
      ),
    ).toBe(true);
    expect(topLifeCard.faceDown).toBe(false);
    expect(room.state.combat.attackerInstanceId).toBe('');

    await disposeRoom(room);
  });

  it('holds combat resolution for a manual Declenchement decision when the revealed life card has a trigger', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    const defender = room.state.players.get(secondSessionId);

    // force the top life card to be the trigger card for a deterministic assertion,
    // wherever it currently sits (deck, hand, or life -- shuffle order is random)
    const [displacedTopLifeCard] = defender!.zones.life.splice(0, 1);

    const deckTriggerIndex = Array.from(defender!.zones.deck).findIndex(
      (card) => card.cardId === 'C-003',
    );
    const handTriggerIndex = Array.from(defender!.zones.hand).findIndex(
      (card) => card.cardId === 'C-003',
    );

    const triggerCard =
      deckTriggerIndex !== -1
        ? defender!.zones.deck.splice(deckTriggerIndex, 1)[0]
        : handTriggerIndex !== -1
          ? defender!.zones.hand.splice(handTriggerIndex, 1)[0]
          : undefined;

    if (!triggerCard) {
      throw new Error('trigger card not found in deck or hand');
    }

    defender!.zones.life.unshift(triggerCard);

    if (displacedTopLifeCard) {
      defender!.zones.deck.push(displacedTopLifeCard);
    }

    access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId: attacker!.zones.leader.instanceId,
      targetType: 'leader',
    });
    access.handleDeclareBlock(fakeClient(secondSessionId), {
      blockerInstanceId: null,
    });
    access.handleFinishCounterStep(fakeClient(secondSessionId));

    expect(room.state.combat.awaitingTriggerDecision).toBe(true);
    expect(room.state.combat.attackerInstanceId).not.toBe('');

    const client = fakeClient(secondSessionId);
    access.handleResolveTrigger(client, { activate: true });

    expect(room.state.combat.awaitingTriggerDecision).toBe(false);
    expect(room.state.combat.attackerInstanceId).toBe('');
    expect(
      defender!.zones.trash.some(
        (card) => card.instanceId === triggerCard.instanceId,
      ),
    ).toBe(true);

    await disposeRoom(room);
  });

  it('ends the game immediately when a Leader with empty life takes damage', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    const defender = room.state.players.get(secondSessionId);
    defender!.zones.life.splice(0);
    defender!.lifeCount = 0;

    access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId: attacker!.zones.leader.instanceId,
      targetType: 'leader',
    });
    access.handleDeclareBlock(fakeClient(secondSessionId), {
      blockerInstanceId: null,
    });
    access.handleFinishCounterStep(fakeClient(secondSessionId));

    expect(room.state.phase).toBe('finished');

    await disposeRoom(room);
  });

  it('excludes a defending Personnage DON!! bonus carried over from a previous turn (6-5-5-2, "during your turn" only)', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    const defender = room.state.players.get(secondSessionId);
    const targetInstanceId = putCharacterInPlay(defender, 'C-001', true);
    const targetCharacter = defender!.zones.characters.find(
      (card) => card.instanceId === targetInstanceId,
    )!;
    // Simulate DON!! given to this Personnage on a prior turn of its owner
    // (defender) that hasn't been cleared yet because it's now the
    // attacker's turn -- attachedDon only clears at the owner's own next
    // Refresh Phase, so it must not grant +1000 power while defending here.
    targetCharacter.attachedDon = 1;
    // weakCharacter has 1000 base power; without the (incorrect) DON!!
    // bonus it stays at 1000, so the attacking Leader (5000) still wins.

    access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId: attacker!.zones.leader.instanceId,
      targetType: 'character',
      targetInstanceId,
    });
    access.handleDeclareBlock(fakeClient(secondSessionId), {
      blockerInstanceId: null,
    });
    access.handleFinishCounterStep(fakeClient(secondSessionId));

    expect(
      defender!.zones.trash.some(
        (card) => card.instanceId === targetInstanceId,
      ),
    ).toBe(true);
    expect(
      defender!.zones.characters.some(
        (card) => card.instanceId === targetInstanceId,
      ),
    ).toBe(false);

    await disposeRoom(room);
  });

  it('rejects a target-less combat action for a non-attacker/defender session', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId: attacker!.zones.leader.instanceId,
      targetType: 'leader',
    });

    const client = fakeClient(firstSessionId);
    access.handleDeclareBlock(client, { blockerInstanceId: null });

    expectErrorMessage(client, 'defenseur');

    await disposeRoom(room);
  });

  it('rejects a second attack declaration while a combat is already in progress', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId: attacker!.zones.leader.instanceId,
      targetType: 'leader',
    });

    const client = fakeClient(firstSessionId);
    access.handleDeclareAttack(client, {
      attackerInstanceId: attacker!.zones.leader.instanceId,
      targetType: 'leader',
    });

    expectErrorMessage(client, 'deja en cours');

    await disposeRoom(room);
  });

  it('rejects ending the phase while combat is in progress', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId: attacker!.zones.leader.instanceId,
      targetType: 'leader',
    });

    const client = fakeClient(firstSessionId);
    access.handleEndPhase(client);

    expectErrorMessage(client, 'combat est en cours');
    expect(room.state.phase).toBe('main');

    await disposeRoom(room);
  });

  it('allows a Character with Rush to attack on the turn it entered play', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    placeUntappedDon(attacker, 1);
    const attackerCharacterInstanceId = ensureHandContains(attacker, 'C-001');
    access.handlePlayCard(fakeClient(firstSessionId), {
      instanceId: attackerCharacterInstanceId,
    });
    const attackerCharacter = attacker!.zones.characters.find(
      (card) => card.instanceId === attackerCharacterInstanceId,
    )!;
    attackerCharacter.hasRush = true;

    access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId: attackerCharacterInstanceId,
      targetType: 'leader',
    });

    expect(room.state.combat.attackerInstanceId).toBe(attackerCharacterInstanceId);

    await disposeRoom(room);
  });

  it('allows a Character that can attack active Characters to target one', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    placeUntappedDon(attacker, 1);
    const attackerCharacterInstanceId = ensureHandContains(attacker, 'C-001');
    access.handlePlayCard(fakeClient(firstSessionId), {
      instanceId: attackerCharacterInstanceId,
    });
    const attackerCharacter = attacker!.zones.characters.find(
      (card) => card.instanceId === attackerCharacterInstanceId,
    )!;
    attackerCharacter.rested = false;
    attackerCharacter.playedThisTurn = false;
    attackerCharacter.canAttackActiveCharacters = true;

    const defender = room.state.players.get(secondSessionId);
    const targetInstanceId = putCharacterInPlay(defender, 'C-001', false);

    access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId: attackerCharacterInstanceId,
      targetType: 'character',
      targetInstanceId,
    });

    expect(room.state.combat.targetInstanceId).toBe(targetInstanceId);

    await disposeRoom(room);
  });

  it('deals 2 life damage when the attacker has Double Attack', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    attacker!.zones.leader.hasDoubleAttack = true;
    const defender = room.state.players.get(secondSessionId);
    defender!.zones.life[0]!.trigger = '';
    defender!.zones.life[1]!.trigger = '';
    const lifeBefore = defender!.zones.life.length;

    access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId: attacker!.zones.leader.instanceId,
      targetType: 'leader',
    });
    access.handleDeclareBlock(fakeClient(secondSessionId), {
      blockerInstanceId: null,
    });
    access.handleFinishCounterStep(fakeClient(secondSessionId));

    expect(defender!.zones.life.length).toBe(lifeBefore - 2);

    await disposeRoom(room);
  });

  it('trashes the life card instead of adding it to hand when the attacker has Banish', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    attacker!.zones.leader.hasBanish = true;
    const defender = room.state.players.get(secondSessionId);
    const lifeBefore = defender!.zones.life.length;
    const handBefore = defender!.zones.hand.length;
    const topLifeCard = defender!.zones.life[0];

    access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId: attacker!.zones.leader.instanceId,
      targetType: 'leader',
    });
    access.handleDeclareBlock(fakeClient(secondSessionId), {
      blockerInstanceId: null,
    });
    access.handleFinishCounterStep(fakeClient(secondSessionId));

    expect(defender!.zones.life.length).toBe(lifeBefore - 1);
    expect(defender!.zones.hand.length).toBe(handBefore);
    expect(defender!.zones.trash.some((card) => card.instanceId === topLifeCard.instanceId)).toBe(true);

    await disposeRoom(room);
  });

  it('forces attacks to target a character marked as the mandatory target', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    const defender = room.state.players.get(secondSessionId);
    const forcedTargetId = putCharacterInPlay(defender, 'C-001', true);
    const forcedTarget = defender!.zones.characters.find(
      (card) => card.instanceId === forcedTargetId,
    )!;
    forcedTarget.mustBeAttackTarget = true;

    const client = fakeClient(firstSessionId);
    access.handleDeclareAttack(client, {
      attackerInstanceId: attacker!.zones.leader.instanceId,
      targetType: 'leader',
    });

    expectErrorMessage(client, 'autre carte doit etre choisie');

    await disposeRoom(room);
  });

  it('rejects attacking with a character restricted until the current turn', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    placeUntappedDon(attacker, 1);
    const attackerCharacterInstanceId = ensureHandContains(attacker, 'C-001');
    access.handlePlayCard(fakeClient(firstSessionId), {
      instanceId: attackerCharacterInstanceId,
    });
    const attackerCharacter = attacker!.zones.characters.find(
      (card) => card.instanceId === attackerCharacterInstanceId,
    )!;
    attackerCharacter.rested = false;
    attackerCharacter.playedThisTurn = false;
    attackerCharacter.cannotAttackUntilTurn = room.state.turn;

    const client = fakeClient(firstSessionId);
    access.handleDeclareAttack(client, {
      attackerInstanceId: attackerCharacterInstanceId,
      targetType: 'leader',
    });

    expectErrorMessage(client, 'ne peut pas attaquer');

    await disposeRoom(room);
  });

  it('rejects declaring a blocker that cannot block during this combat', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const defender = room.state.players.get(secondSessionId);
    const blockerInstanceId = putCharacterInPlay(defender, 'C-001', false);
    const blocker = defender!.zones.characters.find(
      (card) => card.instanceId === blockerInstanceId,
    )!;
    blocker.cannotBlock = true;

    access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId: room.state.players.get(firstSessionId)!.zones.leader.instanceId,
      targetType: 'leader',
    });

    const client = fakeClient(secondSessionId);
    access.handleDeclareBlock(client, { blockerInstanceId });

    expectErrorMessage(client, 'ne peut pas bloquer');

    await disposeRoom(room);
  });

  it('prevents a Strike attacker from K.O.ing a character protected from Strike battle K.O.', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    const attackerCharacterInstanceId = putCharacterInPlay(attacker, 'C-002', false);
    const attackerCharacter = attacker!.zones.characters.find(
      (card) => card.instanceId === attackerCharacterInstanceId,
    )!;
    attackerCharacter.rested = false;
    attackerCharacter.playedThisTurn = false;
    attackerCharacter.attributes.push('Strike');

    const defender = room.state.players.get(secondSessionId);
    const targetInstanceId = putCharacterInPlay(defender, 'C-001', true);
    const targetCharacter = defender!.zones.characters.find(
      (card) => card.instanceId === targetInstanceId,
    )!;
    targetCharacter.cannotBeKoedByStrikeInBattle = true;

    access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId: attackerCharacterInstanceId,
      targetType: 'character',
      targetInstanceId,
    });
    access.handleDeclareBlock(fakeClient(secondSessionId), {
      blockerInstanceId: null,
    });
    access.handleFinishCounterStep(fakeClient(secondSessionId));

    expect(defender!.zones.characters.some((card) => card.instanceId === targetInstanceId)).toBe(
      true,
    );
    expect(defender!.zones.trash.some((card) => card.instanceId === targetInstanceId)).toBe(
      false,
    );

    await disposeRoom(room);
  });

  it('prevents battle K.O. on a character protected from all battle K.O.s', async () => {
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn();
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    const attackerCharacterInstanceId = putCharacterInPlay(attacker, 'C-002', false);
    const attackerCharacter = attacker!.zones.characters.find(
      (card) => card.instanceId === attackerCharacterInstanceId,
    )!;
    attackerCharacter.rested = false;
    attackerCharacter.playedThisTurn = false;

    const defender = room.state.players.get(secondSessionId);
    const targetInstanceId = putCharacterInPlay(defender, 'C-001', true);
    const targetCharacter = defender!.zones.characters.find(
      (card) => card.instanceId === targetInstanceId,
    )!;
    targetCharacter.cannotBeKoedInBattle = true;

    access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId: attackerCharacterInstanceId,
      targetType: 'character',
      targetInstanceId,
    });
    access.handleDeclareBlock(fakeClient(secondSessionId), {
      blockerInstanceId: null,
    });
    access.handleFinishCounterStep(fakeClient(secondSessionId));

    expect(defender!.zones.characters.some((card) => card.instanceId === targetInstanceId)).toBe(
      true,
    );

    await disposeRoom(room);
  });
});
