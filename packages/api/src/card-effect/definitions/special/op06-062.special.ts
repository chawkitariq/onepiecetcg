import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op06062SpecialHandler: SpecialHandlerDefinition = {
  id: 'op06-062-special',
  cardId: 'OP06-062',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;

    const leaderHasGerma = player.leader?.families?.includes('GERMA 66');
    if (!leaderHasGerma) return;

    const don = host.getCards(
      { player: 'self', zones: ['cost'] },
      event.playerSessionId,
    );
    if (don.length < 1) return;
    host.returnDonToDonDeck(event.playerSessionId, 1);

    const handCards = host.getCards(
      { player: 'self', zones: ['hand'] },
      event.playerSessionId,
    );
    if (handCards.length < 2) return;

    anyEngine.decisions.chooseCards(
      `${event.sourceInstanceId}:op06-062:trash-2`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Vinsmoke Judge] Choisissez 2 cartes de votre main a defausser.',
      { player: 'self', zones: ['hand'], count: { kind: 'exact', value: 2 } },
      undefined,
      (trashed) => {
        for (const card of trashed)
          host.moveCard(card, event.playerSessionId, 'trash');

        const germaTrash = host.getCards(
          {
            player: 'self',
            zones: ['trash'],
            filter: {
              trait: ['GERMA 66'],
              cardCategory: ['Character'],
              powerMax: 4000,
            },
          },
          event.playerSessionId,
        );

        anyEngine.decisions.chooseCards(
          `${event.sourceInstanceId}:op06-062:play-germa`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          "[Vinsmoke Judge] Choisissez jusqu'a 4 cartes GERMA 66 avec des noms differents (4000 puissance ou moins).",
          {
            player: 'self',
            zones: ['trash'],
            filter: {
              trait: ['GERMA 66'],
              cardCategory: ['Character'],
              powerMax: 4000,
            },
          },
          { kind: 'upTo', value: 4 },
          (selected) => {
            const usedNames = new Set<string>();
            for (const card of selected) {
              if (usedNames.has(card.name)) continue;
              usedNames.add(card.name);
              host.playCard(card, event.playerSessionId, 'characters');
            }
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
