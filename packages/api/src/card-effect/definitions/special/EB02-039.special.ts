/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * EB02-039 GERMA 66
 * [Main] You may trash 1 "GERMA 66" type Character card with 4000 power or less
 * from your hand: If the number of DON!! cards on your field is equal to or less
 * than the number on your opponent's field, play up to 1 Character card with
 * 5000 to 7000 power and the same card name as the trashed card from your trash.
 *
 * This effect requires a dynamic name match between the trashed card and the
 * played card, which the declarative DSL cannot express.
 */
export const eb02039SpecialHandler: SpecialHandlerDefinition = {
  id: 'germa-66-main-trash-germa-play-same-name',
  cardId: 'EB02-039',
  resolve(event, engine) {
    if (event.type !== 'activateMain') {
      return;
    }

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const decisions = anyEngine.decisions;
    const selectors = anyEngine.selectors;

    const player = host.getPlayer(event.playerSessionId);
    if (!player) {
      return;
    }

    const opponentSessionId = host.getOpponentSessionId(event.playerSessionId);
    if (!opponentSessionId) {
      return;
    }

    // Pre-check: player must have at least one valid GERMA 66 hand target
    const hasValidHandTarget = player.zones.hand.some(
      (card: any) =>
        card.type === 'Character' &&
        card.families?.includes('GERMA 66') &&
        (card.power ?? 0) <= 4000,
    );
    if (!hasValidHandTarget) {
      return;
    }

    // Step 1: Prompt player to choose 0–1 GERMA 66 Character (≤4000 power) from hand
    decisions.chooseCards(
      `${event.sourceInstanceId}:eb02-039:select-hand`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      'Choisissez jusqu\'a 1 carte "GERMA 66" avec une puissance de 4000 ou moins a defausser.',
      {
        player: 'self',
        zones: ['hand'],
        filter: {
          cardCategory: ['Character'],
          trait: ['GERMA 66'],
          powerMax: 4000,
        },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (cards) => {
        if (cards.length === 0) {
          return;
        }

        const trashedCard = cards[0];

        // Trash the selected card (cost)
        host.moveCard(trashedCard, trashedCard.ownerSessionId, 'trash');
        host.syncPlayer(event.playerSessionId);

        // Check DON!! condition: player's field DON!! ≤ opponent's field DON!!
        const playerDon = selectors.countTotalDonOnField(event.playerSessionId);
        const opponentDon = selectors.countTotalDonOnField(opponentSessionId);

        if (playerDon > opponentDon) {
          return;
        }

        // Search the player's trash for characters with the same name and power 5000–7000
        const matchingCards = player.zones.trash.filter(
          (card: any) =>
            card.type === 'Character' &&
            card.name === trashedCard.name &&
            (card.power ?? 0) >= 5000 &&
            (card.power ?? 0) <= 7000,
        );

        if (matchingCards.length === 0) {
          return;
        }

        if (matchingCards.length === 1) {
          host.moveCard(matchingCards[0], event.playerSessionId, 'characters');
          host.syncPlayer(event.playerSessionId);
          engine.reapplyContinuousEffects();
          return;
        }

        // Let player choose up to 1 to play from multiple matching candidates
        decisions.chooseCards(
          `${event.sourceInstanceId}:eb02-039:play-trash`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          "Choisissez jusqu'a 1 carte a mettre en jeu depuis votre defausse.",
          {
            player: 'self',
            zones: ['trash'],
            filter: {
              cardCategory: ['Character'],
              name: [trashedCard.name],
              powerMin: 5000,
              powerMax: 7000,
            },
            count: { kind: 'upTo', value: 1 },
          },
          undefined,
          (playCards) => {
            for (const card of playCards) {
              host.moveCard(card, event.playerSessionId, 'characters');
            }
            host.syncPlayer(event.playerSessionId);
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
