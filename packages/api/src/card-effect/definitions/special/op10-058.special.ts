/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP10-058
 * [Your Turn] When your Supernovas Character is played, give it +2000 power.
 *
 * NOTE: This handler expects the `onCharacterPlayed` event. The effect engine
 * broadcasts `onCharacterPlayed` to all in-play cards for standard triggered
 * effects but NOT for special handlers. For this handler to fire when any
 * Supernovas character is played, the duel room or engine must be extended
 * to route broadcast events to relevant special handlers.
 */
export const op10058SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-058-special',
  cardId: 'OP10-058',
  resolve(event, engine) {
    if (event.type !== 'onCharacterPlayed') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const playedCard = host.getCard(event.sourceInstanceId);
    if (!playedCard) return;
    if (!playedCard.families?.includes('Supernovas')) return;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;
    if (host.state.currentPlayerSessionId !== event.playerSessionId) return;
    anyEngine.modifiers.addPowerModifier(
      event.sourceInstanceId,
      event.playerSessionId,
      playedCard.instanceId,
      2000,
      'untilEndOfTurn',
    );
    engine.reapplyContinuousEffects();
  },
};
