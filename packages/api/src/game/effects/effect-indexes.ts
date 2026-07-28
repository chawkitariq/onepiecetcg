import type { CardEffectDefinition, EffectTriggerType } from '@onepiecetcg/shared';
import type {
  EffectRegistry,
  EventType,
  ReplacementEffectReference,
  SpecialHandlerDefinition,
  TriggerType,
  TriggeredEffectReference,
} from './types/effect-registry';

const triggerTypes = [
  'onPlay',
  'activateMain',
  'whenAttacking',
  'onKo',
  'trigger',
  'onBlock',
  'onTurnStart',
  'onTurnEnd',
] as const satisfies readonly EffectTriggerType[];

const replacementEventTypes = [
  'wouldKoCharacter',
  'wouldMoveCard',
] as const satisfies readonly EventType[];

export function buildEffectIndexes(
  effectsByCardId: Readonly<Record<string, CardEffectDefinition>>,
  specialHandlersByCardId: Readonly<Record<string, SpecialHandlerDefinition>>,
): Pick<
  EffectRegistry,
  'triggeredEffectsByTrigger' | 'replacementEffectsByEventType'
> {
  const triggeredEffectsByTrigger = Object.create(
    null,
  ) as Record<TriggerType, TriggeredEffectReference[]>;
  const replacementEffectsByEventType = Object.create(
    null,
  ) as Record<EventType, ReplacementEffectReference[]>;

  for (const trigger of triggerTypes) {
    triggeredEffectsByTrigger[trigger] = [];
  }

  for (const eventType of replacementEventTypes) {
    replacementEffectsByEventType[eventType] = [];
  }

  for (const [cardId, definition] of Object.entries(effectsByCardId)) {
    for (const effect of definition.standard ?? []) {
      triggeredEffectsByTrigger[effect.trigger.type].push({ cardId, effect });
    }

    for (const effect of definition.replacements ?? []) {
      replacementEffectsByEventType[effect.event].push({ cardId, effect });
    }
  }

  for (const trigger of triggerTypes) {
    Object.freeze(triggeredEffectsByTrigger[trigger]);
  }

  for (const eventType of replacementEventTypes) {
    replacementEffectsByEventType[eventType].sort(
      (left, right) =>
        (left.effect.priority ?? 0) - (right.effect.priority ?? 0) ||
        left.cardId.localeCompare(right.cardId),
    );
    Object.freeze(replacementEffectsByEventType[eventType]);
  }

  Object.freeze(specialHandlersByCardId);

  return {
    triggeredEffectsByTrigger: Object.freeze(triggeredEffectsByTrigger),
    replacementEffectsByEventType: Object.freeze(replacementEffectsByEventType),
  };
}
