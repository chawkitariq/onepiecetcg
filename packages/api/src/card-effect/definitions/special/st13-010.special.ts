/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * Portgas.D.Ace (ST13-010) special handler.
 *
 * [Activate: Main] You may trash this Character: Reveal 1 card from the top
 * of your Life cards. If that card is a [Portgas.D.Ace] with a cost of 5,
 * you may play that card. If you do, up to 1 of your Leader gains +2000
 * power until the end of your opponent's next turn.
 */
export const st13010SpecialHandler: SpecialHandlerDefinition = {
  id: 'st13-010-special',
  cardId: 'ST13-010',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;

    const player = host.getPlayer(event.playerSessionId);
    if (!player || player.zones.life.length < 1) return;

    anyEngine.decisions.pause(
      {
        id: `${event.sourceInstanceId}:st13-010:confirm`,
        effectId: 'st13-010-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message:
            '[Portgas.D.Ace 010] Trash this Character to reveal top Life card?',
          optional: true,
        },
      },
      (response: { confirmed?: boolean }) => {
        if (!response.confirmed) return;

        if (host.getCard(event.sourceInstanceId)) {
          host.moveCard(source, event.playerSessionId, 'trash');
        }

        const topLife = player.zones.life[0];
        if (!topLife) return;

        host.addLog(
          `[Portgas.D.Ace 010] Revealed top Life card: ${topLife.name} (cost ${topLife.cost}).`,
        );

        if (topLife.name === 'Portgas.D.Ace' && topLife.cost === 5) {
          anyEngine.decisions.pause(
            {
              id: `${event.sourceInstanceId}:st13-010:play`,
              effectId: 'st13-010-special',
              effectCardId: event.sourceCardId,
              sourceInstanceId: event.sourceInstanceId,
              playerSessionId: event.playerSessionId,
              createdAt: new Date().toISOString(),
              prompt: {
                type: 'confirm',
                message: `[Portgas.D.Ace 010] Play ${topLife.name} from Life?`,
                optional: true,
              },
            },
            (playResponse: { confirmed?: boolean }) => {
              if (!playResponse.confirmed) return;

              host.moveCard(topLife, event.playerSessionId, 'characters');
              host.addLog(
                `[Portgas.D.Ace 010] Played ${topLife.name} from Life.`,
              );

              const leader = player.zones.leader;
              if (leader && leader.instanceId) {
                anyEngine.modifiers.addPowerModifier(
                  event.sourceInstanceId,
                  event.playerSessionId,
                  leader.instanceId,
                  2000,
                  'untilStartOfYourNextTurn',
                );
              }
              engine.reapplyContinuousEffects();
            },
          );
        }
      },
    );
  },
};
