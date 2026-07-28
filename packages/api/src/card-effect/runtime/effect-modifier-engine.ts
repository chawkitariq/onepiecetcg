import type { EffectKeyword } from '@onepiecetcg/shared';
import type { EffectRegistry } from '../types/effect-registry';
import type {
  EffectEngineHost,
  RuntimeKeywordModifier,
  RuntimeModifier,
} from './effect-engine-types';
import { EffectConditionEvaluator } from './effect-condition-evaluator';
import { EffectSelectorResolver } from './effect-selector-resolver';

/**
 * Owns continuous and temporary runtime modifiers applied by card effects.
 */
export class EffectModifierEngine {
  private readonly modifiers: RuntimeModifier[] = [];

  private readonly keywordModifiers: RuntimeKeywordModifier[] = [];

  public constructor(
    private readonly registry: EffectRegistry,
    private readonly host: EffectEngineHost,
    private readonly selectors: EffectSelectorResolver,
    private readonly conditions: EffectConditionEvaluator,
  ) {}

  /** Recomputes derived power, cost, and keywords from active effects. */
  public reapplyContinuousEffects(): void {
    const players = Array.from(this.host.state.players.values());

    for (const player of players) {
      for (const card of this.selectors.collectPlayerCards(player)) {
        const baseCost = Number.isFinite(card.baseCost)
          ? card.baseCost
          : Number.isFinite(card.cost)
            ? card.cost
            : -1;
        card.baseCost = baseCost;
        card.cost = baseCost;
        card.power = card.basePower;
        card.hasRush = false;
        card.hasDoubleAttack = false;
        card.hasBanish = false;
        card.canAttackActiveCharacters = false;
        card.mustBeAttackTarget = false;
        card.cannotBlock = false;
        card.cannotBeKoedInBattle = false;
        card.cannotBeKoedByStrikeInBattle = false;
      }
    }

    for (const card of this.selectors.collectInPlayCards()) {
      const definition = this.registry.effectsByCardId[card.cardId];

      for (const continuous of definition?.continuous ?? []) {
        if (
          !this.conditions.conditionsPass(
            continuous.conditions ?? [],
            card.ownerSessionId,
            card,
          )
        ) {
          continue;
        }

        for (const target of this.host.getCards(
          continuous.modifier.selector,
          card.ownerSessionId,
        )) {
          if (continuous.modifier.power) {
            target.power += continuous.modifier.power;
          }

          if (continuous.modifier.cost) {
            target.cost = Number.isFinite(target.cost)
              ? target.cost
              : Number.isFinite(target.baseCost)
                ? target.baseCost
                : -1;
            target.cost += continuous.modifier.cost;
          }

          if (continuous.modifier.powerPerCount) {
            const count = this.host.getCards(
              continuous.modifier.powerPerCount.selector,
              card.ownerSessionId,
            ).length;
            const divisor = Math.max(
              1,
              continuous.modifier.powerPerCount.divisor ?? 1,
            );
            target.power +=
              Math.floor(count / divisor) *
              continuous.modifier.powerPerCount.amount;
          }

          if (continuous.modifier.keywords) {
            this.applyKeywords(target, continuous.modifier.keywords);
          }
        }
      }
    }

    for (const modifier of this.modifiers) {
      const target = this.host.getCard(modifier.targetInstanceId);

      if (target) {
        target.power += modifier.amount;
      }
    }

    for (const modifier of this.keywordModifiers) {
      const target = this.host.getCard(modifier.targetInstanceId);

      if (target) {
        this.applyKeywords(target, modifier.keywords);
      }
    }

    for (const player of players) {
      for (const card of this.selectors.collectPlayerCards(player)) {
        if (card.cost >= 0) {
          card.cost = Math.max(card.cost, 0);
        }
      }
    }
  }

  /** Removes modifiers that expire at the end of the turn. */
  public clearTurnModifiers(): void {
    const kept = this.modifiers.filter(
      (modifier) => !modifier.expiresAtEndOfTurn,
    );
    this.modifiers.splice(0, this.modifiers.length, ...kept);
    const keptKeywords = this.keywordModifiers.filter(
      (modifier) => !modifier.expiresAtEndOfTurn,
    );
    this.keywordModifiers.splice(
      0,
      this.keywordModifiers.length,
      ...keptKeywords,
    );
    this.reapplyContinuousEffects();
  }

  /** Removes modifiers that expire at the end of the battle. */
  public clearCombatModifiers(): void {
    const kept = this.modifiers.filter(
      (modifier) => !modifier.expiresAtEndOfBattle,
    );
    this.modifiers.splice(0, this.modifiers.length, ...kept);
    const keptKeywords = this.keywordModifiers.filter(
      (modifier) => !modifier.expiresAtEndOfBattle,
    );
    this.keywordModifiers.splice(
      0,
      this.keywordModifiers.length,
      ...keptKeywords,
    );
    this.reapplyContinuousEffects();
  }

  /** Adds a temporary or permanent power modifier to one resolved target. */
  public addPowerModifier(
    sourceInstanceId: string,
    targetInstanceId: string,
    amount: number,
    duration:
      'untilEndOfTurn' | 'untilEndOfBattle' | 'whileSourceInPlay' | 'permanent',
  ): void {
    this.modifiers.push({
      sourceInstanceId,
      targetInstanceId,
      amount,
      expiresAtEndOfTurn: duration === 'untilEndOfTurn',
      expiresAtEndOfBattle: duration === 'untilEndOfBattle',
    });
  }

  /** Adds a temporary or permanent keyword modifier to one resolved target. */
  public addKeywordModifier(
    sourceInstanceId: string,
    targetInstanceId: string,
    keywords: EffectKeyword[],
    duration:
      'untilEndOfTurn' | 'untilEndOfBattle' | 'whileSourceInPlay' | 'permanent',
  ): void {
    this.keywordModifiers.push({
      sourceInstanceId,
      targetInstanceId,
      keywords,
      expiresAtEndOfTurn: duration === 'untilEndOfTurn',
      expiresAtEndOfBattle: duration === 'untilEndOfBattle',
    });
  }

  private applyKeywords(
    card: {
      hasRush: boolean;
      hasDoubleAttack: boolean;
      hasBanish: boolean;
      canAttackActiveCharacters: boolean;
      mustBeAttackTarget: boolean;
      cannotBlock: boolean;
      cannotBeKoedInBattle: boolean;
      cannotBeKoedByStrikeInBattle: boolean;
    },
    keywords: EffectKeyword[],
  ): void {
    for (const keyword of keywords) {
      switch (keyword) {
        case 'rush':
          card.hasRush = true;
          break;
        case 'doubleAttack':
          card.hasDoubleAttack = true;
          break;
        case 'banish':
          card.hasBanish = true;
          break;
        case 'canAttackActiveCharacters':
          card.canAttackActiveCharacters = true;
          break;
        case 'mustBeAttackTarget':
          card.mustBeAttackTarget = true;
          break;
        case 'cannotBlock':
          card.cannotBlock = true;
          break;
        case 'cannotBeKoedInBattle':
          card.cannotBeKoedInBattle = true;
          break;
        case 'cannotBeKoedByStrikeInBattle':
          card.cannotBeKoedByStrikeInBattle = true;
          break;
      }
    }
  }
}
