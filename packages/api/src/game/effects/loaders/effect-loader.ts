import type {
  CardEffectDefinition,
  ContinuousEffectDefinition,
  ReplacementEffectDefinition,
  StandardEffectDefinition,
} from '@onepiecetcg/shared';
import { effectDefinitionEditions } from '../definitions';
import { buildEffectIndexes } from '../effect-indexes';
import { specialHandlerDefinitions } from '../definitions/special';
import type {
  CardEffectEntry,
  CardEffectSource,
  EditionEffectDefinitions,
} from '../types/effect-definition-source';
import type {
  CardId,
  EffectRegistry,
  EffectSourceBundle,
  SpecialHandlerDefinition,
} from '../types/effect-registry';

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

function pushStandardEffect(
  bucket: StandardEffectDefinition[],
  entry: Extract<CardEffectEntry, { kind: 'standard' }>,
): void {
  bucket.push(entry.effect);
}

function pushContinuousEffect(
  bucket: ContinuousEffectDefinition[],
  entry: Extract<CardEffectEntry, { kind: 'continuous' }>,
): void {
  bucket.push(entry.effect);
}

function pushReplacementEffect(
  bucket: ReplacementEffectDefinition[],
  entry: Extract<CardEffectEntry, { kind: 'replacement' }>,
): void {
  bucket.push(entry.effect);
}

function resolveCardDefinition(definition: CardEffectSource): CardEffectDefinition {
  const standard: StandardEffectDefinition[] = [];
  const continuous: ContinuousEffectDefinition[] = [];
  const replacements: ReplacementEffectDefinition[] = [];
  let specialHandlerId: string | undefined;

  for (const entry of definition.effects ?? []) {
    switch (entry.kind) {
      case 'standard':
        pushStandardEffect(standard, entry);
        break;
      case 'continuous':
        pushContinuousEffect(continuous, entry);
        break;
      case 'replacement':
        pushReplacementEffect(replacements, entry);
        break;
      case 'special-ref':
        if (specialHandlerId && specialHandlerId !== entry.specialHandlerId) {
          throw new Error(
            `Card ${definition.cardId} declares multiple special handlers.`,
          );
        }

        specialHandlerId = entry.specialHandlerId;
        break;
    }
  }

  return {
    cardId: normalizeCardId(definition.cardId),
    standard: standard.length > 0 ? standard : undefined,
    continuous: continuous.length > 0 ? continuous : undefined,
    replacements: replacements.length > 0 ? replacements : undefined,
    specialHandlerId,
  };
}

function flattenEditionDefinitions(
  editions: readonly EditionEffectDefinitions[],
): readonly CardEffectSource[] {
  const definitions: CardEffectSource[] = [];

  for (const edition of editions) {
    definitions.push(...edition.cards);
  }

  return definitions;
}

function indexSpecialHandlersById(
  specialHandlers: readonly SpecialHandlerDefinition[],
): Readonly<Record<string, SpecialHandlerDefinition>> {
  const indexed = Object.create(null) as Record<string, SpecialHandlerDefinition>;

  for (const handler of specialHandlers) {
    if (indexed[handler.id]) {
      throw new Error(`Duplicate special handler id "${handler.id}" during effect bootstrap.`);
    }

    indexed[handler.id] = {
      ...handler,
      cardId: normalizeCardId(handler.cardId),
    };
  }

  return Object.freeze(indexed);
}

/**
 * Loads the authored edition files and special handlers exactly once for
 * bootstrap-time registry construction.
 */
export function loadEffectSources(): EffectSourceBundle {
  return {
    definitions: effectDefinitionEditions,
    specialHandlers: specialHandlerDefinitions,
  };
}

/**
 * Builds the immutable in-memory effect registry used by every match.
 */
export function buildEffectRegistry(
  sourceBundle = loadEffectSources(),
): EffectRegistry {
  const effectsByCardId = Object.create(
    null,
  ) as Record<CardId, CardEffectDefinition>;
  const specialHandlersByCardId = Object.create(
    null,
  ) as Record<CardId, SpecialHandlerDefinition>;
  const specialHandlersById = indexSpecialHandlersById(sourceBundle.specialHandlers);

  for (const definition of flattenEditionDefinitions(sourceBundle.definitions)) {
    const resolved = resolveCardDefinition(definition);

    if (effectsByCardId[resolved.cardId]) {
      throw new Error(
        `Duplicate effect definition for card "${resolved.cardId}" during effect bootstrap.`,
      );
    }

    if (resolved.specialHandlerId) {
      const specialHandler = specialHandlersById[resolved.specialHandlerId];

      if (!specialHandler) {
        throw new Error(
          `Unknown special handler "${resolved.specialHandlerId}" for card "${resolved.cardId}".`,
        );
      }

      if (specialHandler.cardId !== resolved.cardId) {
        throw new Error(
          `Special handler "${specialHandler.id}" is registered for ${specialHandler.cardId} but referenced by ${resolved.cardId}.`,
        );
      }

      specialHandlersByCardId[resolved.cardId] = specialHandler;
    }

    effectsByCardId[resolved.cardId] = cloneRuntimeDefinition(resolved);
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
