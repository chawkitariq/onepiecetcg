import type { EffectCondition } from '@onepiecetcg/shared';
import type { DuelCard } from '@onepiecetcg/shared';
import type { EffectEvent } from './effect-engine-types';
import { EffectSelectorResolver } from './effect-selector-resolver';
import type { EffectEngineHost } from './effect-engine-types';

/**
 * Evaluates authored effect conditions against the current duel state.
 */
export class EffectConditionEvaluator {
  public constructor(
    private readonly host: EffectEngineHost,
    private readonly selectors: EffectSelectorResolver,
  ) {}

  /** Returns true when every authored condition is currently satisfied. */
  public conditionsPass(
    conditions: EffectCondition[],
    controllerSessionId: string,
    source: DuelCard,
    event?: EffectEvent,
  ): boolean {
    return conditions.every((condition) => {
      switch (condition.type) {
        case 'controllerTurn':
          return (
            (this.host.state.activePlayerSessionId === controllerSessionId) ===
            condition.value
          );
        case 'sourceHasAttachedDonAtLeast':
          return source.attachedDon >= condition.value;
        case 'playerHasLifeAtMost': {
          const playerId = this.selectors.resolvePlayer(
            condition.player,
            controllerSessionId,
          );
          const player = playerId ? this.host.getPlayer(playerId) : undefined;
          return (player?.zones.life.length ?? 0) <= condition.value;
        }
        case 'playerHasLeaderName': {
          const playerId = this.selectors.resolvePlayer(
            condition.player,
            controllerSessionId,
          );
          const player = playerId ? this.host.getPlayer(playerId) : undefined;
          return player?.zones.leader.name === condition.value;
        }
        case 'playerHasLeaderTrait': {
          const playerId = this.selectors.resolvePlayer(
            condition.player,
            controllerSessionId,
          );
          const player = playerId ? this.host.getPlayer(playerId) : undefined;
          return (
            player?.zones.leader.families.includes(condition.value) ?? false
          );
        }
        case 'playerHasTotalDonAtLeast': {
          const playerId = this.selectors.resolvePlayer(
            condition.player,
            controllerSessionId,
          );
          return (
            this.selectors.countTotalDonOnField(playerId) >= condition.value
          );
        }
        case 'eventPlayerIs': {
          if (!event) {
            return false;
          }

          const playerId = this.selectors.resolvePlayer(
            condition.player,
            controllerSessionId,
          );
          return playerId === event.playerSessionId;
        }
        case 'targetExists':
          return (
            this.host.getCards(condition.selector, controllerSessionId).length >
            0
          );
        case 'targetCountAtLeast':
          return (
            this.host.getCards(condition.selector, controllerSessionId)
              .length >= condition.value
          );
        case 'targetCountAtMost':
          return (
            this.host.getCards(condition.selector, controllerSessionId)
              .length <= condition.value
          );
        case 'cardInZone':
          return this.selectors.findZoneOfCard(source)?.zone === condition.zone;
        case 'sourceIsRested':
          return source.rested === condition.value;
      }
    });
  }
}
