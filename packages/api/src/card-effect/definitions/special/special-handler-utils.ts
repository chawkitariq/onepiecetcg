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
