import type {
  CardEffectDefinition,
  ContinuousEffectDefinition,
  ReplacementEffectDefinition,
  StandardEffectDefinition,
} from '@onepiecetcg/shared';
import { generatedEffectDefinitions } from './definitions/generated';
import { overrideEffectDefinitions } from './definitions/overrides';
import { continuousPrimitiveDefinitions } from './continuous';
import { buildEffectIndexes } from './effect-indexes';
import { replacementPrimitiveDefinitions } from './replacements';
import { specialHandlerDefinitions } from './special';
import type {
  CardId,
  EffectRegistry,
  EffectSourceBundle,
  SpecialHandlerDefinition,
} from './types/effect-registry';
import type {
  ContinuousEffectSource,
  ContinuousPrimitiveDefinition,
  GeneratedCardEffectDefinition,
  OverrideCardEffectDefinition,
  ReplacementEffectSource,
  ReplacementPrimitiveDefinition,
  StandardEffectSource,
} from './types/effect-definition-source';

function normalizeCardId(cardId: string): CardId {
  return cardId.trim().toUpperCase();
}

function cloneRuntimeDefinition(definition: CardEffectDefinition): CardEffectDefinition {
  return {
    ...definition,
    cardId: normalizeCardId(definition.cardId),
    standard: definition.standard ? [...definition.standard] : undefined,
    continuous: definition.continuous ? [...definition.continuous] : undefined,
    replacements: definition.replacements
      ? [...definition.replacements]
      : undefined,
  };
}

function indexReplacementPrimitives(
  primitives: readonly ReplacementPrimitiveDefinition[],
) {
  const indexed = Object.create(null) as Record<
    string,
    ReplacementPrimitiveDefinition
  >;

  for (const primitive of primitives) {
    indexed[primitive.id] = primitive;
  }

  return Object.freeze(indexed);
}

function indexContinuousPrimitives(
  primitives: readonly ContinuousPrimitiveDefinition[],
) {
  const indexed = Object.create(null) as Record<
    string,
    ContinuousPrimitiveDefinition
  >;

  for (const primitive of primitives) {
    indexed[primitive.id] = primitive;
  }

  return Object.freeze(indexed);
}

function resolveStandardSources(
  sources: readonly StandardEffectSource[] | undefined,
): StandardEffectDefinition[] | undefined {
  if (!sources || sources.length === 0) {
    return undefined;
  }

  return sources.map((source) => source.effect);
}

function resolveContinuousSources(
  sources: readonly ContinuousEffectSource[] | undefined,
  primitiveRegistry: Readonly<Record<string, ContinuousPrimitiveDefinition>>,
): ContinuousEffectDefinition[] | undefined {
  if (!sources || sources.length === 0) {
    return undefined;
  }

  return sources.map((source) => {
    if (source.kind === 'continuous') {
      return source.effect;
    }

    const primitive = primitiveRegistry[source.primitiveId];

    if (!primitive) {
      throw new Error(
        `Unknown continuous primitive "${source.primitiveId}" during effect bootstrap.`,
      );
    }

    return primitive.effect;
  });
}

function resolveReplacementSources(
  sources: readonly ReplacementEffectSource[] | undefined,
  primitiveRegistry: Readonly<Record<string, ReplacementPrimitiveDefinition>>,
): ReplacementEffectDefinition[] | undefined {
  if (!sources || sources.length === 0) {
    return undefined;
  }

  return sources.map((source) => {
    if (source.kind === 'replacement') {
      return source.effect;
    }

    const primitive = primitiveRegistry[source.primitiveId];

    if (!primitive) {
      throw new Error(
        `Unknown replacement primitive "${source.primitiveId}" during effect bootstrap.`,
      );
    }

    return primitive.effect;
  });
}

function resolveCardDefinition(
  definition: GeneratedCardEffectDefinition | OverrideCardEffectDefinition,
  replacementPrimitiveRegistry: Readonly<
    Record<string, ReplacementPrimitiveDefinition>
  >,
  continuousPrimitiveRegistry: Readonly<
    Record<string, ContinuousPrimitiveDefinition>
  >,
): CardEffectDefinition {
  return {
    cardId: normalizeCardId(definition.cardId),
    standard: resolveStandardSources(definition.standards),
    continuous: resolveContinuousSources(
      definition.continuous,
      continuousPrimitiveRegistry,
    ),
    replacements: resolveReplacementSources(
      definition.replacements,
      replacementPrimitiveRegistry,
    ),
    specialHandlerId: definition.special?.specialHandlerId,
  };
}

export function loadEffectSources(): EffectSourceBundle {
  return {
    generated: generatedEffectDefinitions,
    overrides: overrideEffectDefinitions,
    replacementPrimitives: replacementPrimitiveDefinitions,
    continuousPrimitives: continuousPrimitiveDefinitions,
    specialHandlers: specialHandlerDefinitions,
  };
}

export function buildEffectRegistry(
  sourceBundle = loadEffectSources(),
): EffectRegistry {
  const effectsByCardId = Object.create(
    null,
  ) as Record<CardId, CardEffectDefinition>;
  const replacementPrimitivesById = indexReplacementPrimitives(
    sourceBundle.replacementPrimitives,
  );
  const continuousPrimitivesById = indexContinuousPrimitives(
    sourceBundle.continuousPrimitives,
  );
  const specialHandlersByCardId = Object.create(
    null,
  ) as Record<CardId, SpecialHandlerDefinition>;

  for (const definition of sourceBundle.generated) {
    const resolved = resolveCardDefinition(
      definition,
      replacementPrimitivesById,
      continuousPrimitivesById,
    );
    effectsByCardId[resolved.cardId] = cloneRuntimeDefinition(resolved);
  }

  for (const override of sourceBundle.overrides) {
    const resolved = resolveCardDefinition(
      override,
      replacementPrimitivesById,
      continuousPrimitivesById,
    );
    effectsByCardId[resolved.cardId] = cloneRuntimeDefinition(resolved);
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
    replacementPrimitivesById,
    continuousPrimitivesById,
  });
}
