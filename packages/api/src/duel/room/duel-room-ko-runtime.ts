import type { DuelCard, DuelPlayer, DuelState } from '@onepiecetcg/shared';
import type { DuelRoomEffectBoundary } from '../effects/duel-room-effect-boundary';
import {
  knockOutCharacterByIdInState,
  knockOutCharacterInState,
} from './duel-room-character-ko';
import type { DuelRoomStateServices } from './duel-room-state-services';

/**
 * Shared inputs required to assemble live KO callbacks.
 */
type DuelRoomLiveKoRuntimeInput = {
  stateServices: DuelRoomStateServices;
  state: DuelState;
  effectBoundary: DuelRoomEffectBoundary;
};

/**
 * Creates live room KO callbacks backed by the authoritative duel state.
 */
export function createLiveDuelRoomKoRuntime(
  input: DuelRoomLiveKoRuntimeInput,
): {
  knockOutCharacter: (
    owner: DuelPlayer,
    card: DuelCard,
    reason?: 'battle' | 'effect',
    skipReplacement?: boolean,
  ) => void;
  knockOutCharacterById: (
    playerSessionId: string,
    instanceId: string,
    reason: 'battle' | 'effect',
  ) => boolean;
} {
  return {
    knockOutCharacter: (owner, card, reason, skipReplacement) =>
      knockOutCharacterInState(
        input.stateServices.createCharacterKoDeps(
          input.state,
          input.effectBoundary,
          {
            isolated: false,
          },
        ),
        owner,
        card,
        reason,
        skipReplacement,
      ),
    knockOutCharacterById: (playerSessionId, instanceId, reason) =>
      knockOutCharacterByIdInState(
        input.stateServices.createCharacterKoDeps(
          input.state,
          input.effectBoundary,
          {
            isolated: false,
          },
        ),
        playerSessionId,
        instanceId,
        reason,
      ),
  };
}

/**
 * Creates isolated-state KO callbacks used while simulating a command.
 */
export function createIsolatedDuelRoomKoRuntime(
  input: Pick<DuelRoomLiveKoRuntimeInput, 'stateServices'>,
): {
  knockOutCharacter: (
    state: DuelState,
    effectBoundary: DuelRoomEffectBoundary,
    owner: DuelPlayer,
    card: DuelCard,
    reason?: 'battle' | 'effect',
    skipReplacement?: boolean,
  ) => void;
  knockOutCharacterById: (
    state: DuelState,
    effectBoundary: DuelRoomEffectBoundary,
    playerSessionId: string,
    instanceId: string,
    reason: 'battle' | 'effect',
  ) => boolean;
} {
  return {
    knockOutCharacter: (
      state,
      effectBoundary,
      owner,
      card,
      reason,
      skipReplacement,
    ) =>
      knockOutCharacterInState(
        input.stateServices.createCharacterKoDeps(state, effectBoundary, {
          isolated: true,
        }),
        owner,
        card,
        reason,
        skipReplacement,
      ),
    knockOutCharacterById: (
      state,
      effectBoundary,
      playerSessionId,
      instanceId,
      reason,
    ) =>
      knockOutCharacterByIdInState(
        input.stateServices.createCharacterKoDeps(state, effectBoundary, {
          isolated: true,
        }),
        playerSessionId,
        instanceId,
        reason,
      ),
  };
}
