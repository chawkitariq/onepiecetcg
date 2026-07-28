import type {
  CardEffectDefinition,
  ContinuousEffectDefinition,
  ReplacementEffectDefinition,
  StandardEffectDefinition,
} from '@onepiecetcg/shared';

/**
 * Example dispatch helpers for consumers that want to inspect which runtime
 * effect modes a resolved card definition uses.
 */
export function getStandardEffects(
  definition: CardEffectDefinition | undefined,
): readonly StandardEffectDefinition[] {
  return definition?.standard ?? [];
}

export function getContinuousEffects(
  definition: CardEffectDefinition | undefined,
): readonly ContinuousEffectDefinition[] {
  return definition?.continuous ?? [];
}

export function getReplacementEffects(
  definition: CardEffectDefinition | undefined,
): readonly ReplacementEffectDefinition[] {
  return definition?.replacements ?? [];
}

export function getSpecialHandlerId(
  definition: CardEffectDefinition | undefined,
): string | null {
  return definition?.specialHandlerId ?? null;
}
