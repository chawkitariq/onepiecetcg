/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';
import type {
  EffectEvent,
  SpecialEffectHandlerEngine,
} from '../../../effect-engine';

/**
 * Sanjuan.Wolf (ST27-004) special handler.
 *
 * If your Leader has the "Blackbeard Pirates" type, this Character gains
 * [Blocker] and +1 cost for every 4 cards in your trash.
 */
export const st27004SpecialHandler: SpecialHandlerDefinition = {
  id: 'st27-004-special',
  cardId: 'ST27-004',
  resolve(event: EffectEvent, engine: SpecialEffectHandlerEngine): void {
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const modifiers = anyEngine.modifiers;
    const selectors = anyEngine.selectors;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;

    const player = host.getPlayer(source.ownerSessionId);
    if (!player) return;

    const sourceId = event.sourceInstanceId;

    // Remove old cost/keyword modifiers previously applied by this card to itself
    const costArr = modifiers.costModifiers;
    for (let i = costArr.length - 1; i >= 0; i--) {
      if (
        costArr[i].sourceInstanceId === sourceId &&
        costArr[i].targetInstanceId === sourceId
      ) {
        costArr.splice(i, 1);
      }
    }
    const kwArr = modifiers.keywordModifiers;
    for (let i = kwArr.length - 1; i >= 0; i--) {
      if (
        kwArr[i].sourceInstanceId === sourceId &&
        kwArr[i].targetInstanceId === sourceId
      ) {
        kwArr.splice(i, 1);
      }
    }

    // Only apply while this card is on the field
    const zone = selectors.findZoneOfCard(source)?.zone;
    if (zone !== 'characters') {
      engine.reapplyContinuousEffects();
      return;
    }

    // Check leader trait
    if (!player.zones.leader.families.includes('Blackbeard Pirates')) {
      engine.reapplyContinuousEffects();
      return;
    }

    // Grant [Blocker] keyword
    modifiers.addKeywordModifier(
      sourceId,
      source.ownerSessionId,
      sourceId,
      ['mustBeAttackTarget'],
      'permanent',
    );

    // +1 cost for every 4 cards in the controller's trash
    const costBonus = Math.floor(player.zones.trash.length / 4);
    if (costBonus > 0) {
      modifiers.addCostModifier(
        sourceId,
        source.ownerSessionId,
        sourceId,
        costBonus,
        'permanent',
      );
    }

    engine.reapplyContinuousEffects();
  },
};
