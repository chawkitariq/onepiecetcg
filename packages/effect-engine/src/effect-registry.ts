import type { CardEffectDefinition } from '@onepiecetcg/shared';
import { buildEffectRegistry } from './effect-loader';
import type { EffectRegistry, EffectSourceBundle } from './types/effect-registry';

/** Builds one registry snapshot from an explicit source bundle. */
export function createEffectRegistry(sourceBundle: EffectSourceBundle): EffectRegistry {
  return buildEffectRegistry(sourceBundle);
}

/** Direct normalized lookup for one card definition. */
export function getEffectDefinition(
  registry: EffectRegistry,
  cardId: string,
): CardEffectDefinition | undefined {
  return registry.effectsByCardId[cardId.trim().toUpperCase()];
}
