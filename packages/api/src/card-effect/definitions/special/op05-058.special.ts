import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * Handles It's a Waste of Human Life!! because the main effect needs to move
 * every small Character, then make both players choose hand cards down to five.
 */
export const op05058SpecialHandler: SpecialHandlerDefinition = {
  id: 'op05-058-special',
  cardId: 'OP05-058',
  resolve(event, engine) {
    if (event.type !== 'activateMain' && event.type !== 'trigger') {
      return;
    }

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    const opponentId = host.getOpponentSessionId(event.playerSessionId);
    const opponent = opponentId ? host.getPlayer(opponentId) : undefined;

    if (!player || !opponent) {
      return;
    }

    const maxCost = event.type === 'trigger' ? 2 : 3;
    const targets = host.getCards(
      {
        player: 'either',
        zones: ['characters'],
        filter: { cardCategory: ['Character'], costMax: maxCost },
      },
      event.playerSessionId,
    );

    for (const target of targets) {
      host.moveCard(target, target.ownerSessionId, 'deck', { toBottom: true });
    }

    if (event.type === 'trigger') {
      return;
    }

    const promptTrashDownToFive = (
      sessionId: string,
      onComplete?: () => void,
    ) => {
      const targetPlayer = host.getPlayer(sessionId);

      if (!targetPlayer) {
        onComplete?.();
        return;
      }

      const trashCount = Math.max(0, targetPlayer.zones.hand.length - 5);

      if (trashCount === 0) {
        onComplete?.();
        return;
      }

      anyEngine.decisions.chooseCards(
        `${event.sourceInstanceId}:op05-058:trash-hand:${sessionId}`,
        sessionId,
        {
          sourceInstanceId: event.sourceInstanceId,
          storedSelections: {},
        },
        sessionId,
        '[It\'s a Waste of Human Life!!] Choisissez des cartes de votre main a defausser jusqu\'a 5 cartes en main.',
        {
          player: 'self',
          zones: ['hand'],
          count: { kind: 'exact', value: trashCount },
        },
        undefined,
        (cards) => {
          for (const card of cards) {
            host.moveCard(card, sessionId, 'trash');
          }

          onComplete?.();
        },
      );
    };

    promptTrashDownToFive(event.playerSessionId, () =>
      promptTrashDownToFive(opponent.sessionId),
    );
  },
};
