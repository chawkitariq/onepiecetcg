import { DuelCard, DuelPlayer, DuelState } from '@onepiecetcg/shared';
import {
  isProtectedFromBattleKo,
  knockOutCharacterByIdInState,
  knockOutCharacterInState,
} from './duel-room-character-ko';

function createCard(instanceId: string, name = instanceId): DuelCard {
  const card = new DuelCard();
  card.instanceId = instanceId;
  card.cardId = `card-${instanceId}`;
  card.name = name;
  card.ownerSessionId = 'session-a';

  return card;
}

function createPlayer(): DuelPlayer {
  const player = new DuelPlayer();
  player.sessionId = 'session-a';
  player.displayName = 'Alice';
  player.zones.leader = createCard('leader-1');

  return player;
}

function createEffectBoundary() {
  const emitted: unknown[] = [];
  const reapplyCalls: number[] = [];

  return {
    emitted,
    reapplyCalls,
    boundary: {
      applyKoReplacement: () => false,
      reapplyContinuousEffects: () => {
        reapplyCalls.push(1);
      },
      emitCardEvent: (...args: unknown[]) => {
        emitted.push(args);
      },
    },
  };
}

describe('duel-room-character-ko', () => {
  it('detects battle KO protection by intrinsic and attribute rules', () => {
    const defender = createCard('defender');
    const attacker = createCard('attacker');

    defender.cannotBeKoedInBattle = true;
    expect(isProtectedFromBattleKo(defender, attacker)).toBe(true);

    defender.cannotBeKoedInBattle = false;
    defender.cannotBeKoedBySlashInBattle = true;
    attacker.attributes.push('Slash');
    expect(isProtectedFromBattleKo(defender, attacker)).toBe(true);
  });

  it('moves a character to trash, returns DON, logs, and emits KO', () => {
    const state = new DuelState();
    const player = createPlayer();
    const card = createCard('char-1', 'Luffy');
    const don = createCard('don-1');
    card.attachedDon = 1;
    player.zones.characters.push(card);
    player.zones.cost.push(don);
    don.rested = true;
    state.players.set(player.sessionId, player);
    const logs: unknown[] = [];
    const boundary = createEffectBoundary();

    const moved = knockOutCharacterInState(
      {
        state,
        effectBoundary: boundary.boundary as never,
        addLog: (message, level, actorSessionId) => {
          logs.push({ message, level, actorSessionId });
        },
        unshiftIntoTrash: (owner, trashCard) => {
          owner.zones.trash.unshift(trashCard);
        },
      },
      player,
      card,
    );

    expect(moved).toBe(true);
    expect(player.zones.characters).toHaveLength(0);
    expect(player.zones.trash[0]).toBe(card);
    expect(player.zones.cost).toHaveLength(2);
    expect(card.attachedDon).toBe(0);
    expect(boundary.reapplyCalls).toHaveLength(1);
    expect(boundary.emitted).toHaveLength(1);
    expect(logs).toEqual([
      {
        message: 'Luffy est mis KO et rejoint la Defausse.',
        level: 'action',
        actorSessionId: 'session-a',
      },
    ]);
  });

  it('refuses effect KO when the card is protected from effects', () => {
    const state = new DuelState();
    const player = createPlayer();
    const card = createCard('char-1');
    card.cannotBeKoedByEffects = true;
    player.zones.characters.push(card);
    state.players.set(player.sessionId, player);
    const boundary = createEffectBoundary();

    const moved = knockOutCharacterByIdInState(
      {
        state,
        effectBoundary: boundary.boundary as never,
        addLog: () => undefined,
        unshiftIntoTrash: () => undefined,
      },
      player.sessionId,
      card.instanceId,
      'effect',
    );

    expect(moved).toBe(false);
    expect(player.zones.characters).toHaveLength(1);
    expect(boundary.reapplyCalls).toHaveLength(1);
    expect(boundary.emitted).toHaveLength(0);
  });
});
