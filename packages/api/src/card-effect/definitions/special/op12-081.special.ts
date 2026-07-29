/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP12-081
 * [Once Per Turn] When opponent plays Character with base cost 8+, or when
 * opponent plays Character with trigger, +2000 power.
 *
 * NOTE: The effect engine broadcasts `onCharacterPlayed` to all in-play cards
 * for standard triggered effects but does NOT invoke special handlers on
 * non-source cards. For this handler to fire when the opponent plays a
 * character, the infrastructure in EffectEngine.handleEvent() must be
 * extended to also route the event to special handlers of broadcast
 * recipients, or this card's effect should be modelled as a standard
 * triggered effect in the edition definitions instead.
 */
export const op12081SpecialHandler: SpecialHandlerDefinition = {
  id: 'op12-081-special',
  cardId: 'OP12-081',
  resolve(event, engine) {
    if (event.type !== 'onCharacterPlayed') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;

    const playedCard = host.getCard(event.sourceInstanceId);
    if (!playedCard) return;

    /* The event fires for the played character; host.getOpponentSessionId
     * of the player who played the card gives us the leader controller. */
    const leaderSessionId = host.getOpponentSessionId(event.playerSessionId);
    if (!leaderSessionId) return;

    /* Verify the event's player is actually an opponent. */
    const isOpponent =
      host.getOpponentSessionId(leaderSessionId) === event.playerSessionId;
    if (!isOpponent) return;

    const matchesCondition =
      (playedCard.baseCost ?? playedCard.cost ?? 0) >= 8 ||
      (playedCard.trigger !== undefined && playedCard.trigger !== null);

    if (!matchesCondition) return;

    const definition: StandardEffectDefinition = {
      id: 'op12-081-power-boost',
      text: '[Once Per Turn] When opponent plays Character with base cost 8+, or when opponent plays Character with trigger, +2000 power.',
      trigger: { type: 'onCharacterPlayed', oncePerTurn: true },
      actions: [
        {
          type: 'modifyPower',
          selector: {
            player: 'self',
            zones: ['leader', 'characters'],
            source: 'effectSource',
            count: { kind: 'exact', value: 1 },
          },
          amount: 2000,
          duration: { type: 'untilEndOfTurn' },
        },
      ],
    };

    engine.queueEffect(
      leaderSessionId,
      event.sourceInstanceId,
      event.sourceCardId,
      definition,
    );
  },
};
