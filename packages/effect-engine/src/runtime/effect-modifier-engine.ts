import type { EffectKeyword } from '@onepiecetcg/shared';
import type { EffectCardFilter } from '@onepiecetcg/shared';
import type { EffectRegistry } from '../types/effect-registry';
import type {
  EffectModifierEngineState,
  EffectEngineHost,
  RuntimeDelayedMove,
  RuntimeNextPlayCostModifier,
  RuntimePlayerRestriction,
  RuntimeCostModifier,
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

  private readonly costModifiers: RuntimeCostModifier[] = [];

  private readonly keywordModifiers: RuntimeKeywordModifier[] = [];

  private readonly playerRestrictions: RuntimePlayerRestriction[] = [];

  private readonly nextPlayCostModifiers: RuntimeNextPlayCostModifier[] = [];

  private readonly delayedMovesAtEndOfBattle: RuntimeDelayedMove[] = [];

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
        this.patchCardStats(card, {
          baseCost,
          cost: baseCost,
          power: card.basePower,
        });
        this.patchCardStatus(card, {
          hasRush: false,
          hasDoubleAttack: false,
          hasBanish: false,
          canAttackActiveCharacters: false,
          mustBeAttackTarget: false,
          cannotAttack: false,
          cannotAttackLeaderOnTurnPlayed: false,
          cannotBlock: false,
          cannotBeKoedInBattle: false,
          cannotBeKoedByEffects: false,
          cannotBeKoedBySlashInBattle: false,
          cannotBeKoedByStrikeInBattle: false,
          winOnDeckOut: false,
          cannotBeRemovedByOpponentEffects: false,
          skipNextRefreshPhases: 0,
        });
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
            this.patchCardStats(target, {
              power: target.power + continuous.modifier.power,
            });
          }

          if (continuous.modifier.cost) {
            const currentCost = Number.isFinite(target.cost)
              ? target.cost
              : Number.isFinite(target.baseCost)
                ? target.baseCost
                : -1;
            this.patchCardStats(target, {
              cost: currentCost + continuous.modifier.cost,
            });
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
            this.patchCardStats(target, {
              power:
                target.power +
                Math.floor(count / divisor) *
                  continuous.modifier.powerPerCount.amount,
            });
          }

          if (continuous.modifier.keywords) {
            this.applyKeywords(target, continuous.modifier.keywords);
          }

          if (continuous.modifier.skipNextRefreshPhases) {
            this.patchCardStatus(target, {
              skipNextRefreshPhases: Math.max(
                target.skipNextRefreshPhases,
                continuous.modifier.skipNextRefreshPhases,
              ),
            });
          }
        }
      }
    }

    for (const modifier of this.modifiers) {
      const target = this.host.getCard(modifier.targetInstanceId);

      if (target) {
        this.patchCardStats(target, {
          power: target.power + modifier.amount,
        });
      }
    }

    for (const modifier of this.costModifiers) {
      const target = this.host.getCard(modifier.targetInstanceId);

      if (target) {
        this.patchCardStats(target, {
          cost: target.cost + modifier.amount,
        });
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
          this.patchCardStats(card, {
            cost: Math.max(card.cost, 0),
          });
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
    const keptCosts = this.costModifiers.filter(
      (modifier) => !modifier.expiresAtEndOfTurn,
    );
    this.costModifiers.splice(0, this.costModifiers.length, ...keptCosts);
    const keptKeywords = this.keywordModifiers.filter(
      (modifier) => !modifier.expiresAtEndOfTurn,
    );
    this.keywordModifiers.splice(
      0,
      this.keywordModifiers.length,
      ...keptKeywords,
    );
    const keptRestrictions = this.playerRestrictions.filter(
      (restriction) => !restriction.expiresAtEndOfTurn,
    );
    this.playerRestrictions.splice(
      0,
      this.playerRestrictions.length,
      ...keptRestrictions,
    );
    this.nextPlayCostModifiers.splice(0, this.nextPlayCostModifiers.length);
    this.reapplyContinuousEffects();
  }

  /** Removes modifiers that expire when the given player's turn starts. */
  public clearTurnStartModifiers(playerSessionId: string): void {
    this.modifiers.splice(
      0,
      this.modifiers.length,
      ...this.modifiers.filter(
        (modifier) =>
          modifier.expiresAtTurnStartOfPlayerSessionId !== playerSessionId,
      ),
    );
    this.costModifiers.splice(
      0,
      this.costModifiers.length,
      ...this.costModifiers.filter(
        (modifier) =>
          modifier.expiresAtTurnStartOfPlayerSessionId !== playerSessionId,
      ),
    );
    this.keywordModifiers.splice(
      0,
      this.keywordModifiers.length,
      ...this.keywordModifiers.filter(
        (modifier) =>
          modifier.expiresAtTurnStartOfPlayerSessionId !== playerSessionId,
      ),
    );
    this.playerRestrictions.splice(
      0,
      this.playerRestrictions.length,
      ...this.playerRestrictions.filter(
        (restriction) =>
          restriction.expiresAtTurnStartOfPlayerSessionId !== playerSessionId,
      ),
    );
    this.reapplyContinuousEffects();
  }

  /** Removes modifiers that expire at the end of the battle. */
  public clearCombatModifiers(): void {
    const kept = this.modifiers.filter(
      (modifier) => !modifier.expiresAtEndOfBattle,
    );
    this.modifiers.splice(0, this.modifiers.length, ...kept);
    const keptCosts = this.costModifiers.filter(
      (modifier) => !modifier.expiresAtEndOfBattle,
    );
    this.costModifiers.splice(0, this.costModifiers.length, ...keptCosts);
    const keptKeywords = this.keywordModifiers.filter(
      (modifier) => !modifier.expiresAtEndOfBattle,
    );
    this.keywordModifiers.splice(
      0,
      this.keywordModifiers.length,
      ...keptKeywords,
    );
    const delayedMoves = this.delayedMovesAtEndOfBattle.splice(
      0,
      this.delayedMovesAtEndOfBattle.length,
    );

    for (const delayedMove of delayedMoves) {
      const target = this.host.getCard(delayedMove.targetInstanceId);

      if (!target) {
        continue;
      }

      this.host.moveCard(
        target,
        delayedMove.destinationPlayerSessionId,
        delayedMove.destinationZone,
        {
          faceDown: delayedMove.faceDown,
          rested: delayedMove.rested,
          toBottom: delayedMove.toBottom,
        },
      );
    }

    this.reapplyContinuousEffects();
  }

  /** Adds a temporary or permanent power modifier to one resolved target. */
  public addPowerModifier(
    sourceInstanceId: string,
    controllerSessionId: string,
    targetInstanceId: string,
    amount: number,
    duration:
      | 'untilEndOfTurn'
      | 'untilEndOfBattle'
      | 'untilStartOfYourNextTurn'
      | 'whileSourceInPlay'
      | 'permanent',
  ): void {
    this.modifiers.push({
      sourceInstanceId,
      targetInstanceId,
      amount,
      expiresAtEndOfTurn: duration === 'untilEndOfTurn',
      expiresAtEndOfBattle: duration === 'untilEndOfBattle',
      expiresAtTurnStartOfPlayerSessionId:
        duration === 'untilStartOfYourNextTurn'
          ? controllerSessionId
          : undefined,
    });
  }

  /** Adds a temporary or permanent cost modifier to one resolved target. */
  public addCostModifier(
    sourceInstanceId: string,
    controllerSessionId: string,
    targetInstanceId: string,
    amount: number,
    duration:
      | 'untilEndOfTurn'
      | 'untilEndOfBattle'
      | 'untilStartOfYourNextTurn'
      | 'whileSourceInPlay'
      | 'permanent',
  ): void {
    this.costModifiers.push({
      sourceInstanceId,
      targetInstanceId,
      amount,
      expiresAtEndOfTurn: duration === 'untilEndOfTurn',
      expiresAtEndOfBattle: duration === 'untilEndOfBattle',
      expiresAtTurnStartOfPlayerSessionId:
        duration === 'untilStartOfYourNextTurn'
          ? controllerSessionId
          : undefined,
    });
  }

  /** Adds a temporary or permanent keyword modifier to one resolved target. */
  public addKeywordModifier(
    sourceInstanceId: string,
    controllerSessionId: string,
    targetInstanceId: string,
    keywords: EffectKeyword[],
    duration:
      | 'untilEndOfTurn'
      | 'untilEndOfBattle'
      | 'untilStartOfYourNextTurn'
      | 'whileSourceInPlay'
      | 'permanent',
  ): void {
    this.keywordModifiers.push({
      sourceInstanceId,
      targetInstanceId,
      keywords,
      expiresAtEndOfTurn: duration === 'untilEndOfTurn',
      expiresAtEndOfBattle: duration === 'untilEndOfBattle',
      expiresAtTurnStartOfPlayerSessionId:
        duration === 'untilStartOfYourNextTurn'
          ? controllerSessionId
          : undefined,
    });
  }

  public addPlayerRestriction(
    playerSessionId: string,
    type: RuntimePlayerRestriction['type'],
    duration: 'untilEndOfTurn' | 'untilStartOfYourNextTurn',
  ): void {
    this.playerRestrictions.push({
      playerSessionId,
      type,
      expiresAtEndOfTurn: duration === 'untilEndOfTurn',
      expiresAtTurnStartOfPlayerSessionId:
        duration === 'untilStartOfYourNextTurn' ? playerSessionId : undefined,
    });
  }

  public blocksOwnEffectLifeToHand(playerSessionId: string): boolean {
    return this.playerRestrictions.some(
      (restriction) =>
        restriction.playerSessionId === playerSessionId &&
        restriction.type === 'preventOwnEffectLifeToHand',
    );
  }

  public registerNextPlayCostModifier(
    playerSessionId: string,
    sourceInstanceId: string,
    filter: EffectCardFilter,
    sourceZone: 'hand',
    amount: number,
  ): void {
    this.nextPlayCostModifiers.push({
      playerSessionId,
      sourceInstanceId,
      filter,
      sourceZone,
      amount,
    });
  }

  public getNextPlayCostModifier(
    card: Parameters<typeof this.selectors.matchesFilter>[0],
    sourceZone: 'hand',
  ): number {
    let total = 0;

    for (const modifier of this.nextPlayCostModifiers) {
      if (
        modifier.playerSessionId !== card.ownerSessionId ||
        modifier.sourceZone !== sourceZone
      ) {
        continue;
      }

      const matches = this.selectors.matchesFilter(
        card,
        modifier.filter,
        card.ownerSessionId,
      );

      if (matches) {
        total += modifier.amount;
      }
    }

    return total;
  }

  public consumeNextPlayCostModifier(
    card: Parameters<typeof this.selectors.matchesFilter>[0],
    sourceZone: 'hand',
  ): void {
    const index = this.nextPlayCostModifiers.findIndex((modifier) => {
      if (
        modifier.playerSessionId !== card.ownerSessionId ||
        modifier.sourceZone !== sourceZone
      ) {
        return false;
      }

      return this.selectors.matchesFilter(
        card,
        modifier.filter,
        card.ownerSessionId,
      );
    });

    if (index >= 0) {
      this.nextPlayCostModifiers.splice(index, 1);
    }
  }

  public scheduleMoveAtEndOfBattle(
    targetInstanceId: string,
    destinationPlayerSessionId: string,
    destinationZone: string,
    options?: { faceDown?: boolean; rested?: boolean; toBottom?: boolean },
  ): void {
    this.delayedMovesAtEndOfBattle.push({
      targetInstanceId,
      destinationPlayerSessionId,
      destinationZone,
      faceDown: options?.faceDown,
      rested: options?.rested,
      toBottom: options?.toBottom,
    });
  }

  /** Exports the mutable modifier state so the engine can be recreated later. */
  public exportState(): EffectModifierEngineState {
    return {
      modifiers: this.modifiers.map((modifier) => ({ ...modifier })),
      costModifiers: this.costModifiers.map((modifier) => ({ ...modifier })),
      keywordModifiers: this.keywordModifiers.map((modifier) => ({
        ...modifier,
        keywords: [...modifier.keywords],
      })),
      playerRestrictions: this.playerRestrictions.map((restriction) => ({
        ...restriction,
      })),
      nextPlayCostModifiers: this.nextPlayCostModifiers.map((modifier) => ({
        ...modifier,
        filter: structuredClone(modifier.filter),
      })),
      delayedMovesAtEndOfBattle: this.delayedMovesAtEndOfBattle.map((move) => ({
        ...move,
      })),
    };
  }

  /** Restores the mutable modifier state from a previous snapshot. */
  public importState(state: EffectModifierEngineState): void {
    this.modifiers.splice(0, this.modifiers.length, ...state.modifiers);
    this.costModifiers.splice(
      0,
      this.costModifiers.length,
      ...state.costModifiers,
    );
    this.keywordModifiers.splice(
      0,
      this.keywordModifiers.length,
      ...state.keywordModifiers.map((modifier) => ({
        ...modifier,
        keywords: [...modifier.keywords],
      })),
    );
    this.playerRestrictions.splice(
      0,
      this.playerRestrictions.length,
      ...state.playerRestrictions,
    );
    this.nextPlayCostModifiers.splice(
      0,
      this.nextPlayCostModifiers.length,
      ...state.nextPlayCostModifiers.map((modifier) => ({
        ...modifier,
        filter: structuredClone(modifier.filter),
      })),
    );
    this.delayedMovesAtEndOfBattle.splice(
      0,
      this.delayedMovesAtEndOfBattle.length,
      ...state.delayedMovesAtEndOfBattle,
    );
    this.reapplyContinuousEffects();
  }

  private applyKeywords(
    card: { instanceId: string } & Pick<
      Parameters<typeof this.patchCardStatus>[1],
      | 'hasRush'
      | 'hasDoubleAttack'
      | 'hasBanish'
      | 'canAttackActiveCharacters'
      | 'mustBeAttackTarget'
      | 'cannotAttack'
      | 'cannotAttackLeaderOnTurnPlayed'
      | 'cannotBlock'
      | 'cannotBeKoedInBattle'
      | 'cannotBeKoedByEffects'
      | 'cannotBeKoedBySlashInBattle'
      | 'cannotBeKoedByStrikeInBattle'
      | 'winOnDeckOut'
      | 'cannotBeRemovedByOpponentEffects'
    >,
    keywords: EffectKeyword[],
  ): void {
    for (const keyword of keywords) {
      switch (keyword) {
        case 'rush':
          this.patchCardStatus(card, { hasRush: true });
          break;
        case 'doubleAttack':
          this.patchCardStatus(card, { hasDoubleAttack: true });
          break;
        case 'banish':
          this.patchCardStatus(card, { hasBanish: true });
          break;
        case 'canAttackActiveCharacters':
          this.patchCardStatus(card, { canAttackActiveCharacters: true });
          break;
        case 'mustBeAttackTarget':
          this.patchCardStatus(card, { mustBeAttackTarget: true });
          break;
        case 'cannotAttack':
          this.patchCardStatus(card, { cannotAttack: true });
          break;
        case 'cannotAttackLeaderOnTurnPlayed':
          this.patchCardStatus(card, {
            cannotAttackLeaderOnTurnPlayed: true,
          });
          break;
        case 'cannotBlock':
          this.patchCardStatus(card, { cannotBlock: true });
          break;
        case 'cannotBeKoedInBattle':
          this.patchCardStatus(card, { cannotBeKoedInBattle: true });
          break;
        case 'cannotBeKoedByEffects':
          this.patchCardStatus(card, { cannotBeKoedByEffects: true });
          break;
        case 'cannotBeKoedBySlashInBattle':
          this.patchCardStatus(card, {
            cannotBeKoedBySlashInBattle: true,
          });
          break;
        case 'cannotBeKoedByStrikeInBattle':
          this.patchCardStatus(card, {
            cannotBeKoedByStrikeInBattle: true,
          });
          break;
        case 'winOnDeckOut':
          this.patchCardStatus(card, { winOnDeckOut: true });
          break;
        case 'cannotBeRemovedByOpponentEffects':
          this.patchCardStatus(card, {
            cannotBeRemovedByOpponentEffects: true,
          });
          break;
      }
    }
  }

  private patchCardStatus(
    card: { instanceId: string },
    patch: Parameters<
      NonNullable<EffectEngineHost['patchCardStatus']>
    >[1],
  ): void {
    if (this.host.patchCardStatus) {
      this.host.patchCardStatus(card.instanceId, patch);
      return;
    }

    Object.assign(card as object, patch);
  }

  private patchCardStats(
    card: { instanceId: string },
    patch: Parameters<NonNullable<EffectEngineHost['patchCardStats']>>[1],
  ): void {
    if (this.host.patchCardStats) {
      this.host.patchCardStats(card.instanceId, patch);
      return;
    }

    Object.assign(card as object, patch);
  }
}
