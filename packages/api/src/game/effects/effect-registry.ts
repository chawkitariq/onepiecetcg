import type { CardEffectDefinition } from '@onepiecetcg/shared';

/** Local card-effect source of truth keyed by card id. */
export const effectRegistry = new Map<string, CardEffectDefinition>();

/** Registers card effect definitions into the local registry. */
export function registerCardEffects(definitions: CardEffectDefinition[]): void {
  for (const definition of definitions) {
    effectRegistry.set(definition.cardId, definition);
  }
}
