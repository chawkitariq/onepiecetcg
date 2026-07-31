import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import type {
  EffectEvent,
  SpecialEffectHandlerEngine,
} from '@onepiecetcg/shared';

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
    const source = engine.getCard(event.sourceInstanceId);
    if (!source) return;

    const player = engine.getPlayer(source.ownerSessionId);
    if (!player) return;

    const sourceId = event.sourceInstanceId;

    // Remove old cost/keyword modifiers previously applied by this card to itself
    engine.removeModifier({
      sourceInstanceId: sourceId,
      targetInstanceId: sourceId,
      kind: 'cost',
    });
    engine.removeModifier({
      sourceInstanceId: sourceId,
      targetInstanceId: sourceId,
      kind: 'keyword',
    });

    // Only apply while this card is on the field
    const zone = engine.findZoneOfCard(source.instanceId)?.zone;
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
    engine.addKeywordModifier(
      sourceId,
      source.ownerSessionId,
      sourceId,
      ['mustBeAttackTarget'],
      'permanent',
    );

    // +1 cost for every 4 cards in the controller's trash
    const costBonus = Math.floor(player.zones.trash.length / 4);
    if (costBonus > 0) {
      engine.addCostModifier(
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
