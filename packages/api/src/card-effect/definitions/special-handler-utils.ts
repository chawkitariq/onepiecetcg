type OncePerTurnEngine = {
  resolvedOncePerTurnKeys?: Set<string>;
};

type DelayedEffectEngine = {
  delayedEffects?: Array<{
    trigger: { type: 'onTurnEnd' };
    sourceInstanceId: string;
    resolve: () => void;
  }>;
};

type CardPatchHost = {
  patchCardStatus?: (
    instanceId: string,
    patch: Record<string, unknown>,
  ) => unknown;
  patchCardStats?: (
    instanceId: string,
    patch: Record<string, unknown>,
  ) => unknown;
  patchPlayerStatus?: (
    playerSessionId: string,
    patch: Record<string, unknown>,
  ) => unknown;
};

type PatchableCard = {
  instanceId: string;
  [key: string]: unknown;
};

type PatchablePlayer = {
  sessionId: string;
  [key: string]: unknown;
};

/**
 * Builds a stable once-per-turn cache key for a special handler resolution.
 */
export function createOncePerTurnKey(
  sourceInstanceId: string,
  cardId: string,
  turn: number,
): string {
  return `${sourceInstanceId}:${cardId}:${turn}`;
}

/**
 * Returns true when the handler already resolved once during the current turn.
 */
export function hasResolvedOncePerTurn(
  engine: OncePerTurnEngine,
  sourceInstanceId: string,
  cardId: string,
  turn: number,
): boolean {
  return engine.resolvedOncePerTurnKeys?.has(
    createOncePerTurnKey(sourceInstanceId, cardId, turn),
  )
    ? true
    : false;
}

/**
 * Marks a special handler as resolved for the current turn.
 */
export function markResolvedOncePerTurn(
  engine: OncePerTurnEngine,
  sourceInstanceId: string,
  cardId: string,
  turn: number,
): void {
  engine.resolvedOncePerTurnKeys?.add(
    createOncePerTurnKey(sourceInstanceId, cardId, turn),
  );
}

/**
 * Schedules a follow-up effect to resolve at the end of the current turn.
 */
export function scheduleTurnEndEffect(
  engine: DelayedEffectEngine,
  sourceInstanceId: string,
  resolve: () => void,
): void {
  engine.delayedEffects ??= [];
  engine.delayedEffects.push({
    trigger: { type: 'onTurnEnd' },
    sourceInstanceId,
    resolve,
  });
}

/**
 * Applies a gameplay status patch through the host when available, or falls
 * back to a local object patch for lightweight test doubles.
 */
export function patchSpecialHandlerCardStatus(
  host: CardPatchHost,
  card: PatchableCard,
  patch: Record<string, unknown>,
): void {
  if (host.patchCardStatus) {
    host.patchCardStatus(card.instanceId, patch);
    return;
  }

  Object.assign(card, patch);
}

/**
 * Applies a gameplay stat patch through the host when available, or falls back
 * to a local object patch for lightweight test doubles.
 */
export function patchSpecialHandlerCardStats(
  host: CardPatchHost,
  card: PatchableCard,
  patch: Record<string, unknown>,
): void {
  if (host.patchCardStats) {
    host.patchCardStats(card.instanceId, patch);
    return;
  }

  Object.assign(card, patch);
}

/**
 * Applies a player-level gameplay status patch through the host when
 * available, or falls back to a local object patch for lightweight test
 * doubles.
 */
export function patchSpecialHandlerPlayerStatus(
  host: CardPatchHost,
  player: PatchablePlayer,
  patch: Record<string, unknown>,
): void {
  if (host.patchPlayerStatus) {
    host.patchPlayerStatus(player.sessionId, patch);
    return;
  }

  Object.assign(player, patch);
}
