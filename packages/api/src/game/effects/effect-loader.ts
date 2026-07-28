import type { CardEffectDefinition } from '@onepiecetcg/shared';
import { generatedEffectDefinitions } from './definitions/generated';
import { manualEffectDefinitions } from './definitions/manual';
import { buildEffectIndexes } from './effect-indexes';
import { specialHandlerDefinitions } from './special';
import type {
  CardId,
  EffectRegistry,
  EffectSourceBundle,
  SpecialHandlerDefinition,
} from './types/effect-registry';

function normalizeCardId(cardId: string): CardId {
  return cardId.trim().toUpperCase();
}

function cloneDefinition(
  definition: CardEffectDefinition,
): CardEffectDefinition {
  return {
    ...definition,
    cardId: normalizeCardId(definition.cardId),
    standard: definition.standard ? [...definition.standard] : undefined,
    continuous: definition.continuous ? [...definition.continuous] : undefined,
    replacements: definition.replacements ? [...definition.replacements] : undefined,
  };
}

function mergeCardDefinitions(
  base: CardEffectDefinition | undefined,
  override: CardEffectDefinition,
): CardEffectDefinition {
  if (!base) {
    return cloneDefinition(override);
  }

  return {
    ...base,
    ...override,
    cardId: normalizeCardId(override.cardId),
    standard:
      override.standard !== undefined ? [...override.standard] : base.standard,
    continuous:
      override.continuous !== undefined
        ? [...override.continuous]
        : base.continuous,
    replacements:
      override.replacements !== undefined
        ? [...override.replacements]
        : base.replacements,
  };
}

export function loadEffectSources(): EffectSourceBundle {
  return {
    generated: generatedEffectDefinitions,
    manual: manualEffectDefinitions,
    specialHandlers: specialHandlerDefinitions,
  };
}

export function buildEffectRegistry(
  sourceBundle = loadEffectSources(),
): EffectRegistry {
  const effectsByCardId = Object.create(
    null,
  ) as Record<CardId, CardEffectDefinition>;
  const specialHandlersByCardId = Object.create(
    null,
  ) as Record<CardId, SpecialHandlerDefinition>;

  for (const definition of sourceBundle.generated) {
    const cardId = normalizeCardId(definition.cardId);
    effectsByCardId[cardId] = cloneDefinition({ ...definition, cardId });
  }

  for (const override of sourceBundle.manual) {
    const cardId = normalizeCardId(override.cardId);
    effectsByCardId[cardId] = mergeCardDefinitions(
      effectsByCardId[cardId],
      { ...override, cardId },
    );
  }

  for (const specialHandler of sourceBundle.specialHandlers) {
    const cardId = normalizeCardId(specialHandler.cardId);
    specialHandlersByCardId[cardId] = {
      ...specialHandler,
      cardId,
    };

    const existing = effectsByCardId[cardId];
    if (existing && !existing.specialHandlerId) {
      effectsByCardId[cardId] = {
        ...existing,
        specialHandlerId: specialHandler.id,
      };
    }
  }

  const frozenEffectsByCardId = Object.freeze(effectsByCardId);
  const frozenSpecialHandlersByCardId = Object.freeze(specialHandlersByCardId);
  const indexes = buildEffectIndexes(
    frozenEffectsByCardId,
    frozenSpecialHandlersByCardId,
  );

  return Object.freeze({
    effectsByCardId: frozenEffectsByCardId,
    triggeredEffectsByTrigger: indexes.triggeredEffectsByTrigger,
    replacementEffectsByEventType: indexes.replacementEffectsByEventType,
    specialHandlersByCardId: frozenSpecialHandlersByCardId,
  });
}
