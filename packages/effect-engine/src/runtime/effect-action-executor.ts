import type { EffectAction, EffectTargetSelector } from '@onepiecetcg/shared';
import type { DuelCard } from '@onepiecetcg/shared';
import type { EffectRegistry } from '../types/effect-registry';
import { EffectConditionEvaluator } from './effect-condition-evaluator';
import { EffectDecisionManager } from './effect-decision-manager';
import { EffectModifierEngine } from './effect-modifier-engine';
import { EffectSelectorResolver } from './effect-selector-resolver';
import type {
  EffectEngineHost,
  EffectResolutionContext,
} from './effect-engine-types';

type QueueEffectFn = (
  controllerSessionId: string,
  sourceInstanceId: string,
  sourceCardId: string,
  effectId: string,
) => void;

type ScheduleTurnEndActionsFn = (
  controllerSessionId: string,
  source: DuelCard,
  actions: EffectAction[],
) => void;

type EmitEffectEventFn = (
  event: import('./effect-engine-types').EffectEvent,
) => void;

/**
 * Interprets authored `EffectAction[]` against the authoritative duel state.
 */
export class EffectActionExecutor {
  public constructor(
    private readonly registry: EffectRegistry,
    private readonly host: EffectEngineHost,
    private readonly selectors: EffectSelectorResolver,
    private readonly conditions: EffectConditionEvaluator,
    private readonly decisions: EffectDecisionManager,
    private readonly modifiers: EffectModifierEngine,
    private readonly queueEffect: QueueEffectFn,
    private readonly scheduleTurnEndActions: ScheduleTurnEndActionsFn,
    private readonly emitEffectEvent: EmitEffectEventFn,
  ) {}

  /** Resolves an authored action list sequentially, pausing for decisions when needed. */
  public resolveActions(
    actions: EffectAction[],
    controllerSessionId: string,
    source: DuelCard,
    context: EffectResolutionContext,
    startIndex = 0,
    onComplete?: () => void,
  ): void {
    if (startIndex >= actions.length || this.decisions.hasPendingDecision()) {
      if (
        startIndex >= actions.length &&
        !this.decisions.hasPendingDecision()
      ) {
        onComplete?.();
      }

      return;
    }

    const action = actions[startIndex];
    const next = () =>
      this.resolveActions(
        actions,
        controllerSessionId,
        source,
        context,
        startIndex + 1,
        onComplete,
      );

    switch (action.type) {
      case 'draw': {
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );

        if (playerId) {
          for (let index = 0; index < action.amount; index += 1) {
            const drawn = this.host.drawCard(playerId);

            if (drawn) {
              this.emitEffectEvent({
                type: 'onCardDrawn',
                playerSessionId: playerId,
                sourceInstanceId: source.instanceId,
                sourceCardId: source.cardId,
              });
            }
          }

          this.host.syncPlayer(playerId);
        }

        next();
        return;
      }
      case 'drawUntilHandSize': {
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );
        const player = playerId ? this.host.getPlayer(playerId) : undefined;

        if (playerId && player) {
          const missing = Math.max(0, action.size - player.zones.hand.length);

          for (let index = 0; index < missing; index += 1) {
            const drawn = this.host.drawCard(playerId);

            if (drawn) {
              this.emitEffectEvent({
                type: 'onCardDrawn',
                playerSessionId: playerId,
                sourceInstanceId: source.instanceId,
                sourceCardId: source.cardId,
              });
            }
          }

          this.host.syncPlayer(playerId);
        }

        next();
        return;
      }
      case 'ko': {
        this.forSelectedCards(
          action.selector,
          controllerSessionId,
          context,
          this.createDecisionId(source.instanceId, action.type),
          'Choisissez la carte a mettre KO.',
          (cards) => {
            for (const target of cards) {
              this.host.koCharacter(
                target.ownerSessionId,
                target.instanceId,
                action.reason ?? 'effect',
              );
            }
            next();
          },
        );
        return;
      }
      case 'koAllCharacters': {
        const targets = this.host
          .getCards(action.selector, controllerSessionId)
          .filter(
            (card) =>
              !action.excludeSource || card.instanceId !== source.instanceId,
          );

        for (const target of targets) {
          this.host.koCharacter(
            target.ownerSessionId,
            target.instanceId,
            action.reason ?? 'effect',
          );
        }

        next();
        return;
      }
      case 'trashFromDeck': {
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );

        if (playerId) {
          this.host.trashTopDeckCards(playerId, action.amount);
          this.host.syncPlayer(playerId);
        }

        next();
        return;
      }
      case 'trashFromHand': {
        this.forSelectedCards(
          action.selector,
          controllerSessionId,
          context,
          this.createDecisionId(source.instanceId, action.type),
          'Choisissez des cartes a defausser.',
          (cards) => {
            for (const card of cards) {
              const originZone = this.selectors.findZoneOfCard(card)?.zone;
              this.host.moveCard(card, card.ownerSessionId, 'trash');
              this.emitCardRemovedByEffect(
                card,
                originZone,
                'trash',
                controllerSessionId,
              );
            }
            next();
          },
        );
        return;
      }
      case 'rest':
      case 'unrest':
      case 'restand': {
        for (const target of this.host.getCards(
          action.selector,
          controllerSessionId,
        )) {
          this.patchCardStatus(target, {
            rested: action.type === 'rest',
          });
        }
        next();
        return;
      }
      case 'addToLife': {
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );

        if (playerId) {
          for (const card of this.host.getCards(
            action.selector,
            controllerSessionId,
          )) {
            this.host.moveCard(card, playerId, 'life', { faceDown: true });
          }
        }

        next();
        return;
      }
      case 'addDon': {
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );

        if (playerId) {
          this.host.addDonToCost(
            playerId,
            action.amount,
            action.rested ?? false,
          );
        }

        next();
        return;
      }
      case 'removeDon': {
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );

        if (playerId) {
          this.host.returnDonToDonDeck(playerId, action.amount);
        }

        next();
        return;
      }
      case 'returnDonToDonDeckMatchingOpponentCount': {
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );
        const referencePlayerId = this.selectors.resolvePlayer(
          action.referencePlayer,
          controllerSessionId,
        );

        if (playerId && referencePlayerId) {
          const player = this.host.getPlayer(playerId);
          const referencePlayer = this.host.getPlayer(referencePlayerId);

          if (player && referencePlayer) {
            const playerDonCount =
              this.selectors.countTotalDonOnField(playerId);
            const referenceDonCount =
              this.selectors.countTotalDonOnField(referencePlayerId);
            const amount = Math.max(
              0,
              Math.min(
                playerDonCount - referenceDonCount,
                player.zones.cost.length,
              ),
            );

            if (amount > 0) {
              this.host.returnDonToDonDeck(playerId, amount);
            }
          }
        }

        next();
        return;
      }
      case 'reveal': {
        this.host.addLog(
          `${source.name} revele ${action.amount} carte(s) depuis ${action.zone}.`,
        );
        next();
        return;
      }
      case 'search': {
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );

        if (!playerId) {
          next();
          return;
        }

        const player = this.host.getPlayer(playerId);

        if (!player) {
          next();
          return;
        }

        const sourceCards =
          action.sourceZone === 'deck' ? player.zones.deck : player.zones.trash;
        const revealed = Array.from(sourceCards).slice(0, action.amount);

        const maxCount =
          action.count.kind === 'any' ? revealed.length : action.count.value;

        this.decisions.chooseCards(
          this.createDecisionId(source.instanceId, action.type),
          controllerSessionId,
          context,
          controllerSessionId,
          action.count.kind === 'any'
            ? "Choisissez n'importe quel nombre de cartes."
            : `Choisissez ${action.count.kind === 'upTo' ? "jusqu'a " : ''}${maxCount} carte(s).`,
          {
            player: 'self',
            zones: [action.sourceZone],
            filter: action.filter,
            count: action.count,
          },
          revealed.map((card) => card.instanceId),
          (cards) => {
            const chosenIds = new Set(cards.map((card) => card.instanceId));
            const remainingCards = revealed.filter(
              (card) => !chosenIds.has(card.instanceId),
            );

            for (const card of revealed) {
              if (chosenIds.has(card.instanceId)) {
                this.host.moveCard(card, playerId, action.destination);
              }
            }

            if (action.restDestination === 'trash') {
              for (const card of remainingCards) {
                this.host.moveCard(card, playerId, 'trash');
              }

              next();
              return;
            }

            if (
              action.restDestination === 'deck' &&
              action.restToBottom &&
              action.restOrder === 'player' &&
              remainingCards.length > 1
            ) {
              this.decisions.orderCards(
                this.createDecisionId(
                  source.instanceId,
                  `${action.type}:rest-order`,
                ),
                playerId,
                'Placez les cartes restantes au bas du deck dans l ordre de votre choix.',
                remainingCards.map((card) => card.instanceId),
                'deck',
                (orderedIds) => {
                  const remainingById = new Map(
                    remainingCards.map((card) => [card.instanceId, card]),
                  );

                  for (const instanceId of orderedIds) {
                    const card = remainingById.get(instanceId);

                    if (card) {
                      this.host.moveCard(card, playerId, 'deck', {
                        toBottom: true,
                      });
                    }
                  }

                  next();
                },
              );
              return;
            }

            if (action.restDestination === 'deck') {
              for (const card of remainingCards) {
                this.host.moveCard(card, playerId, 'deck', {
                  toBottom: action.restToBottom,
                });
              }
            }

            next();
          },
        );
        return;
      }
      case 'moveCard': {
        this.selectCardsForAction(
          action.selector,
          controllerSessionId,
          context,
          source.instanceId,
          action.type,
          'Choisissez la carte a deplacer.',
          (cards) => {
            this.moveCardsWithOptionalDestinationChoice(
              cards,
              controllerSessionId,
              source,
              action.destinationPlayer,
              action.destinationZone,
              {
                faceDown: action.faceDown,
                rested: action.rested,
                toBottom: action.toBottom,
                chooseDestinationPosition: action.chooseDestinationPosition,
              },
              next,
            );
          },
        );
        return;
      }
      case 'moveFirstCard': {
        const card = this.selectors.getSelectableCards(
          action.selector,
          controllerSessionId,
          context,
        )[0];

        if (!card) {
          next();
          return;
        }

        const playerId =
          action.destinationPlayer === 'selectedCardOwner'
            ? card.ownerSessionId
            : this.selectors.resolvePlayer(
                action.destinationPlayer,
                controllerSessionId,
              );

        if (playerId) {
          if (
            !this.canMoveCardByEffect(
              card,
              controllerSessionId,
              action.destinationZone,
            )
          ) {
            next();
            return;
          }

          const originZone = this.selectors.findZoneOfCard(card)?.zone;
          this.host.moveCard(card, playerId, action.destinationZone, {
            faceDown: action.faceDown,
            rested: action.rested,
            toBottom: action.toBottom,
          });
          this.emitCardRemovedByEffect(
            card,
            originZone,
            action.destinationZone,
            controllerSessionId,
          );
        }

        next();
        return;
      }
      case 'modifyPower': {
        this.applyModifierToSelectedCards(
          action.selector,
          controllerSessionId,
          context,
          source.instanceId,
          action.type,
          'Choisissez la carte dont la puissance sera modifiee.',
          (cards) => {
            for (const target of cards) {
              this.modifiers.addPowerModifier(
                source.instanceId,
                controllerSessionId,
                target.instanceId,
                action.amount,
                action.duration.type,
              );
            }

            this.modifiers.reapplyContinuousEffects();
          },
          next,
        );
        return;
      }
      case 'modifyPowerByStoredCount': {
        const cards = context.storedSelections[action.key] ?? [];
        const amount = cards.length * action.amountPerCard;

        if (amount === 0) {
          next();
          return;
        }

        this.applyModifierToSelectedCards(
          action.selector,
          controllerSessionId,
          context,
          source.instanceId,
          action.type,
          'Choisissez la carte dont la puissance sera modifiee.',
          (targets) => {
            for (const target of targets) {
              this.modifiers.addPowerModifier(
                source.instanceId,
                controllerSessionId,
                target.instanceId,
                amount,
                action.duration.type,
              );
            }
          },
          next,
        );
        return;
      }
      case 'modifyCost': {
        this.applyModifierToSelectedCards(
          action.selector,
          controllerSessionId,
          context,
          source.instanceId,
          action.type,
          'Choisissez la carte dont le cout sera modifie.',
          (cards) => {
            for (const target of cards) {
              this.modifiers.addCostModifier(
                source.instanceId,
                controllerSessionId,
                target.instanceId,
                action.amount,
                action.duration.type,
              );
            }
          },
          next,
        );
        return;
      }
      case 'grantKeywords': {
        this.applyModifierToSelectedCards(
          action.selector,
          controllerSessionId,
          context,
          source.instanceId,
          action.type,
          'Choisissez la carte qui gagne un mot-cle.',
          (cards) => {
            for (const target of cards) {
              this.modifiers.addKeywordModifier(
                source.instanceId,
                controllerSessionId,
                target.instanceId,
                action.keywords,
                action.duration.type,
              );
            }
          },
          next,
        );
        return;
      }
      case 'preventOwnEffectLifeToHand': {
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );

        if (playerId) {
          this.modifiers.addPlayerRestriction(
            playerId,
            'preventOwnEffectLifeToHand',
            action.duration.type,
          );
        }

        next();
        return;
      }
      case 'restrictAttack': {
        for (const target of this.host.getCards(
          action.selector,
          controllerSessionId,
        )) {
          const cannotAttackUntilTurn = Math.max(
            target.cannotAttackUntilTurn,
            this.host.state.turn + action.turns,
          );

          this.patchCardStatus(target, {
            cannotAttackUntilTurn,
          });
        }
        next();
        return;
      }
      case 'activateEffect': {
        this.queueEffect(
          controllerSessionId,
          source.instanceId,
          action.cardId,
          action.effectId,
        );

        next();
        return;
      }
      case 'attachDon': {
        this.forSelectedCards(
          action.selector,
          controllerSessionId,
          context,
          this.createDecisionId(source.instanceId, action.type),
          'Choisissez une carte a laquelle attacher des DON!!',
          (cards) => {
            const playerId = this.selectors.resolvePlayer(
              action.player,
              controllerSessionId,
            );

            if (playerId) {
              for (const card of cards) {
                this.host.attachDon(playerId, card.instanceId, action.amount, {
                  rested: action.rested,
                });
              }
            }

            next();
          },
        );
        return;
      }
      case 'detachDon': {
        for (const target of this.host.getCards(
          action.selector,
          controllerSessionId,
        )) {
          const attachedDon = Math.max(0, target.attachedDon - action.amount);

          this.patchCardStats(target, {
            attachedDon,
          });
        }

        next();
        return;
      }
      case 'registerNextPlayCostModifier': {
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );

        if (playerId) {
          this.modifiers.registerNextPlayCostModifier(
            playerId,
            source.instanceId,
            action.filter,
            action.sourceZone,
            action.amount,
          );
        }

        next();
        return;
      }
      case 'scheduleMoveAtEndOfBattle': {
        this.forSelectedCards(
          action.selector,
          controllerSessionId,
          context,
          this.createDecisionId(source.instanceId, action.type),
          'Choisissez la carte a deplacer a la fin du combat.',
          (cards) => {
            for (const card of cards) {
              const playerId =
                action.destinationPlayer === 'selectedCardOwner'
                  ? card.ownerSessionId
                  : this.selectors.resolvePlayer(
                      action.destinationPlayer,
                      controllerSessionId,
                    );

              if (!playerId) {
                continue;
              }

              this.modifiers.scheduleMoveAtEndOfBattle(
                card.instanceId,
                playerId,
                action.destinationZone,
                {
                  faceDown: action.faceDown,
                  rested: action.rested,
                  toBottom: action.toBottom,
                },
              );
            }

            next();
          },
        );
        return;
      }
      case 'skipNextRefreshPhases': {
        this.forSelectedCards(
          action.selector,
          controllerSessionId,
          context,
          this.createDecisionId(source.instanceId, action.type),
          'Choisissez la carte qui ne deviendra pas active lors de sa prochaine phase de Recharge.',
          (cards) => {
            for (const card of cards) {
              const skipNextRefreshPhases = Math.max(
                card.skipNextRefreshPhases,
                action.amount,
              );

              this.patchCardStatus(card, {
                skipNextRefreshPhases,
              });
            }

            next();
          },
        );
        return;
      }
      case 'shuffleDeck': {
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );

        if (playerId) {
          this.host.shuffleDeck(playerId);
          this.host.syncPlayer(playerId);
        }

        next();
        return;
      }
      case 'arrangeDeckWindow': {
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );
        const player = playerId ? this.host.getPlayer(playerId) : undefined;

        if (!playerId || !player) {
          next();
          return;
        }

        const windowCards = Array.from(player.zones.deck).slice(
          0,
          action.amount,
        );

        if (windowCards.length === 0) {
          next();
          return;
        }

        this.arrangeDeckWindow(
          this.createDecisionId(source.instanceId, action.type),
          controllerSessionId,
          playerId,
          windowCards,
          () => {
            this.host.syncPlayer(playerId);
            next();
          },
        );
        return;
      }
      case 'revealTopAndPlayIfMatches': {
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );
        const player = playerId ? this.host.getPlayer(playerId) : undefined;
        const topCard = player?.zones.deck[0];

        if (!playerId || !player || !topCard) {
          next();
          return;
        }

        this.host.addLog(
          `${source.name} revele ${topCard.name} depuis le dessus du deck.`,
        );

        if (
          !this.selectors.matchesFilter(
            topCard,
            action.filter,
            controllerSessionId,
          )
        ) {
          next();
          return;
        }

        this.decisions.pause(
          {
            id: `${source.instanceId}:${action.type}:${topCard.instanceId}`,
            effectId: action.type,
            effectCardId: source.cardId,
            sourceInstanceId: source.instanceId,
            playerSessionId: controllerSessionId,
            createdAt: new Date().toISOString(),
            prompt: {
              type: 'confirm',
              message: `Jouer ${topCard.name} revelee depuis le dessus du deck ?`,
              optional: true,
            },
          },
          (response) => {
            if (response.confirmed) {
              this.host.moveCard(topCard, playerId, action.destination, {
                rested: action.rested ?? false,
              });
            }
            next();
          },
        );
        return;
      }
      case 'storeSelectedCards': {
        this.selectCardsForAction(
          action.selector,
          controllerSessionId,
          context,
          source.instanceId,
          `${action.type}:${action.key}`,
          'Choisissez la ou les cartes.',
          (cards) => {
            context.storedSelections[action.key] = cards;
            next();
          },
        );
        return;
      }
      case 'revealStoredCards': {
        const cards = context.storedSelections[action.key] ?? [];

        if (cards.length > 0) {
          this.host.addLog(
            `${source.name} revele ${cards.map((card) => card.name).join(', ')}.`,
          );
        }

        next();
        return;
      }
      case 'moveStoredCards': {
        const cards = this.getStoredSelection(context, action.key);
        this.moveCardsWithOptionalDestinationChoice(
          cards,
          controllerSessionId,
          source,
          action.destinationPlayer,
          action.destinationZone,
          {
            faceDown: action.faceDown,
            rested: action.rested,
            toBottom: action.toBottom,
            chooseDestinationPosition: action.chooseDestinationPosition,
          },
          next,
        );
        return;
      }
      case 'ifStoredSelectionMatches': {
        const cards = this.getStoredSelection(context, action.key);
        const matches = cards.some((card) =>
          this.selectors.matchesFilter(
            card,
            action.filter,
            controllerSessionId,
            context,
          ),
        );

        if (!matches) {
          next();
          return;
        }

        this.resolveChildActions(
          action.actions,
          controllerSessionId,
          source,
          context,
          next,
        );
        return;
      }
      case 'ifConditionsMatch': {
        if (
          !this.conditions.conditionsPass(
            action.conditions,
            controllerSessionId,
            source,
          )
        ) {
          next();
          return;
        }

        this.resolveChildActions(
          action.actions,
          controllerSessionId,
          source,
          context,
          next,
        );
        return;
      }
      case 'ifAnyConditionGroupMatches': {
        const evaluationEvent = context.triggeringEvent ?? {
          type: source.type === 'Character' ? 'onPlay' : 'activateMain',
          playerSessionId: controllerSessionId,
          sourceInstanceId: source.instanceId,
          sourceCardId: source.cardId,
          targetInstanceId: context.eventTargetInstanceId,
        };
        const matches = action.conditionGroups.some((conditionGroup) =>
          this.conditions.conditionsPass(
            conditionGroup,
            controllerSessionId,
            source,
            evaluationEvent,
          ),
        );

        if (!matches) {
          next();
          return;
        }

        this.resolveChildActions(
          action.actions,
          controllerSessionId,
          source,
          context,
          next,
        );
        return;
      }
      case 'modifyStoredCardsPower': {
        const cards = context.storedSelections[action.key] ?? [];

        for (const target of cards) {
          this.modifiers.addPowerModifier(
            source.instanceId,
            controllerSessionId,
            target.instanceId,
            action.amount,
            action.duration.type,
          );
        }

        this.modifiers.reapplyContinuousEffects();
        next();
        return;
      }
      case 'play': {
        this.forSelectedCards(
          action.selector,
          controllerSessionId,
          context,
          this.createDecisionId(source.instanceId, action.type),
          'Choisissez une carte a mettre en jeu.',
          (cards) => {
            for (const card of cards) {
              const originZone = this.selectors.findZoneOfCard(card)?.zone;
              this.host.moveCard(
                card,
                card.ownerSessionId,
                action.destination,
                {
                  rested: action.rested ?? false,
                },
              );

              if (card.type === 'Character') {
                this.emitEffectEvent({
                  type: 'onCharacterPlayed',
                  playerSessionId: controllerSessionId,
                  sourceInstanceId: card.instanceId,
                  sourceCardId: card.cardId,
                  sourceZone: originZone,
                  playedByEffect: true,
                });
                this.emitEffectEvent({
                  type: 'onPlay',
                  playerSessionId: controllerSessionId,
                  sourceInstanceId: card.instanceId,
                  sourceCardId: card.cardId,
                  sourceZone: originZone,
                  playedByEffect: true,
                });
              } else if (card.type === 'Stage') {
                this.emitEffectEvent({
                  type: 'onPlay',
                  playerSessionId: controllerSessionId,
                  sourceInstanceId: card.instanceId,
                  sourceCardId: card.cardId,
                  sourceZone: originZone,
                  playedByEffect: true,
                });
              }
            }
            next();
          },
        );
        return;
      }
      case 'chooseActionBranch': {
        const availableChoices = action.choices.filter((choice) =>
          this.conditions.conditionsPass(
            choice.conditions ?? [],
            controllerSessionId,
            source,
            context.triggeringEvent,
          ),
        );

        if (availableChoices.length === 0) {
          next();
          return;
        }

        if (availableChoices.length === 1) {
          this.resolveChildActions(
            availableChoices[0].actions,
            controllerSessionId,
            source,
            context,
            next,
          );
          return;
        }

        this.decisions.chooseChoices(
          this.createDecisionId(source.instanceId, action.type),
          controllerSessionId,
          action.message,
          availableChoices.map((choice) => ({
            id: choice.id,
            label: choice.label,
          })),
          1,
          1,
          (choiceIds) => {
            const selected = action.choices.find(
              (choice) => choice.id === choiceIds[0],
            );

            if (!selected) {
              next();
              return;
            }

            this.resolveChildActions(
              selected.actions,
              controllerSessionId,
              source,
              context,
              next,
            );
          },
        );
        return;
      }
      case 'scheduleActionsAtTurnEnd': {
        this.scheduleTurnEndActions(
          controllerSessionId,
          source,
          action.actions,
        );
        next();
        return;
      }
    }
  }

  /** Returns true when every authored cost can currently be paid. */
  public canPayCosts(
    costs: EffectAction[],
    controllerSessionId: string,
  ): boolean {
    return costs.every((cost) =>
      this.canResolveCostAction(cost, controllerSessionId),
    );
  }

  private forSelectedCards(
    selector: EffectTargetSelector,
    controllerSessionId: string,
    context: EffectResolutionContext,
    decisionId: string,
    message: string,
    resolve: (cards: DuelCard[]) => void,
  ): void {
    const targets = this.selectors.getSelectableCards(
      selector,
      controllerSessionId,
      context,
    );
    const count = selector.count ?? { kind: 'exact', value: targets.length };
    const min = count.kind === 'exact' ? count.value : 0;
    const max = count.kind === 'any' ? targets.length : count.value;

    if (targets.length === 0 && min === 0) {
      resolve([]);
      return;
    }

    if (targets.length <= max && targets.length === min) {
      resolve(targets);
      return;
    }

    this.decisions.chooseCards(
      decisionId,
      controllerSessionId,
      context,
      this.selectors.resolveSelectorChooser(selector, controllerSessionId),
      message,
      selector,
      undefined,
      resolve,
    );
  }

  private selectCardsForAction(
    selector: EffectTargetSelector,
    controllerSessionId: string,
    context: EffectResolutionContext,
    sourceInstanceId: string,
    actionTypeSuffix: string,
    message: string,
    resolve: (cards: DuelCard[]) => void,
  ): void {
    this.forSelectedCards(
      selector,
      controllerSessionId,
      context,
      this.createDecisionId(sourceInstanceId, actionTypeSuffix),
      message,
      resolve,
    );
  }

  private applyModifierToSelectedCards(
    selector: EffectTargetSelector,
    controllerSessionId: string,
    context: EffectResolutionContext,
    sourceInstanceId: string,
    actionTypeSuffix: string,
    message: string,
    applyModifier: (cards: DuelCard[]) => void,
    onComplete: () => void,
  ): void {
    this.selectCardsForAction(
      selector,
      controllerSessionId,
      context,
      sourceInstanceId,
      actionTypeSuffix,
      message,
      (cards) => {
        applyModifier(cards);
        this.modifiers.reapplyContinuousEffects();
        onComplete();
      },
    );
  }

  private resolveChildActions(
    actions: EffectAction[],
    controllerSessionId: string,
    source: DuelCard,
    context: EffectResolutionContext,
    onComplete: () => void,
  ): void {
    this.resolveActions(
      actions,
      controllerSessionId,
      source,
      context,
      0,
      onComplete,
    );
  }

  private getStoredSelection(
    context: EffectResolutionContext,
    key: string,
  ): DuelCard[] {
    return context.storedSelections[key] ?? [];
  }

  private arrangeDeckWindow(
    decisionId: string,
    controllerSessionId: string,
    playerSessionId: string,
    windowCards: DuelCard[],
    onComplete: () => void,
  ): void {
    const chooserSessionId =
      this.selectors.resolvePlayer('self', controllerSessionId) ??
      controllerSessionId;
    const remaining = [...windowCards];
    const topCards: DuelCard[] = [];
    const bottomCards: DuelCard[] = [];

    const pickNextCard = () => {
      if (remaining.length === 0) {
        this.commitDeckWindowOrder(
          playerSessionId,
          windowCards,
          topCards,
          bottomCards,
        );
        onComplete();
        return;
      }

      this.decisions.chooseChoices(
        `${decisionId}:card:${remaining.length}`,
        chooserSessionId,
        'Choisissez la prochaine carte a placer.',
        remaining.map((card) => ({
          id: card.instanceId,
          label: card.name,
          cardInstanceId: card.instanceId,
        })),
        1,
        1,
        (selectedChoiceIds) => {
          const selectedId = selectedChoiceIds[0];
          const selectedIndex = remaining.findIndex(
            (card) => card.instanceId === selectedId,
          );

          if (selectedIndex < 0) {
            pickNextCard();
            return;
          }

          const [selectedCard] = remaining.splice(selectedIndex, 1);

          if (!selectedCard) {
            pickNextCard();
            return;
          }

          this.decisions.chooseChoices(
            `${decisionId}:dest:${selectedCard.instanceId}`,
            chooserSessionId,
            `Placez ${selectedCard.name} en haut ou en bas du deck.`,
            [
              { id: 'top', label: 'Haut du deck' },
              { id: 'bottom', label: 'Bas du deck' },
            ],
            1,
            1,
            (destinationChoiceIds) => {
              if (destinationChoiceIds[0] === 'bottom') {
                bottomCards.push(selectedCard);
              } else {
                topCards.push(selectedCard);
              }

              pickNextCard();
            },
          );
        },
      );
    };

    pickNextCard();
  }

  private commitDeckWindowOrder(
    playerSessionId: string,
    windowCards: DuelCard[],
    topCards: DuelCard[],
    bottomCards: DuelCard[],
  ): void {
    const player = this.host.getPlayer(playerSessionId);

    if (!player) {
      return;
    }

    const windowIds = new Set(windowCards.map((card) => card.instanceId));
    const remainingDeck = Array.from(player.zones.deck).filter(
      (card) => !windowIds.has(card.instanceId),
    );
    player.zones.deck.splice(
      0,
      player.zones.deck.length,
      ...topCards,
      ...remainingDeck,
      ...bottomCards,
    );
  }

  private canResolveCostAction(
    action: EffectAction,
    controllerSessionId: string,
  ): boolean {
    switch (action.type) {
      case 'removeDon': {
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );
        const player = playerId ? this.host.getPlayer(playerId) : undefined;
        return (player?.zones.cost.length ?? 0) >= action.amount;
      }
      case 'trashFromHand':
      case 'rest':
      case 'unrest':
      case 'restand':
      case 'moveCard':
      case 'moveFirstCard':
      case 'scheduleMoveAtEndOfBattle':
      case 'skipNextRefreshPhases':
      case 'attachDon':
      case 'play':
      case 'ko':
      case 'koAllCharacters':
      case 'modifyPower':
      case 'modifyCost':
      case 'grantKeywords':
      case 'modifyPowerByStoredCount':
      case 'restrictAttack':
      case 'addToLife':
      case 'detachDon':
        return this.selectors.hasSelectableCards(
          action.selector,
          controllerSessionId,
        );
      case 'draw':
      case 'trashFromDeck':
      case 'addDon':
      case 'reveal':
      case 'search':
      case 'shuffleDeck':
      case 'arrangeDeckWindow':
      case 'revealTopAndPlayIfMatches':
      case 'revealStoredCards':
      case 'moveStoredCards':
      case 'ifStoredSelectionMatches':
      case 'ifConditionsMatch':
      case 'ifAnyConditionGroupMatches':
      case 'activateEffect':
      case 'drawUntilHandSize':
      case 'preventOwnEffectLifeToHand':
      case 'registerNextPlayCostModifier':
      case 'scheduleActionsAtTurnEnd':
      case 'returnDonToDonDeckMatchingOpponentCount':
      case 'modifyStoredCardsPower':
        return true;
      case 'chooseActionBranch':
        return true;
      case 'storeSelectedCards':
        return this.selectors.hasSelectableCards(
          action.selector,
          controllerSessionId,
        );
    }
  }

  private createDecisionId(sourceInstanceId: string, suffix: string): string {
    return `${sourceInstanceId}:${suffix}:${Math.random()}`;
  }

  private emitCardRemovedByEffect(
    card: DuelCard,
    originZone: import('@onepiecetcg/shared').GameZone | undefined,
    destinationZone: string,
    effectControllerSessionId: string,
  ): void {
    if (!originZone || originZone === destinationZone) {
      return;
    }

    this.emitEffectEvent({
      type: 'onCardRemovedByEffect',
      playerSessionId: card.ownerSessionId,
      effectControllerSessionId,
      sourceInstanceId: card.instanceId,
      sourceCardId: card.cardId,
      targetInstanceId: card.instanceId,
      targetCardId: card.cardId,
      sourceZone: originZone,
      destinationZone:
        destinationZone as import('@onepiecetcg/shared').GameZone,
    });
  }

  private moveCardsWithOptionalDestinationChoice(
    cards: DuelCard[],
    controllerSessionId: string,
    source: DuelCard,
    destinationPlayer:
      import('@onepiecetcg/shared').EffectOwnerSelector | 'selectedCardOwner',
    destinationZone: string,
    options: {
      faceDown?: boolean;
      rested?: boolean;
      toBottom?: boolean;
      chooseDestinationPosition?: boolean;
    },
    onComplete: () => void,
    index = 0,
  ): void {
    if (index >= cards.length) {
      onComplete();
      return;
    }

    const card = cards[index];

    if (!this.canMoveCardByEffect(card, controllerSessionId, destinationZone)) {
      this.moveCardsWithOptionalDestinationChoice(
        cards,
        controllerSessionId,
        source,
        destinationPlayer,
        destinationZone,
        options,
        onComplete,
        index + 1,
      );
      return;
    }

    const playerId =
      destinationPlayer === 'selectedCardOwner'
        ? card.ownerSessionId
        : this.selectors.resolvePlayer(destinationPlayer, controllerSessionId);

    if (!playerId) {
      this.moveCardsWithOptionalDestinationChoice(
        cards,
        controllerSessionId,
        source,
        destinationPlayer,
        destinationZone,
        options,
        onComplete,
        index + 1,
      );
      return;
    }

    const finishMove = (toBottom: boolean | undefined) => {
      const originZone = this.selectors.findZoneOfCard(card)?.zone;
      this.host.moveCard(card, playerId, destinationZone, {
        faceDown: options.faceDown,
        rested: options.rested,
        toBottom,
      });
      this.emitCardRemovedByEffect(
        card,
        originZone,
        destinationZone,
        controllerSessionId,
      );
      this.moveCardsWithOptionalDestinationChoice(
        cards,
        controllerSessionId,
        source,
        destinationPlayer,
        destinationZone,
        options,
        onComplete,
        index + 1,
      );
    };

    if (!options.chooseDestinationPosition) {
      finishMove(options.toBottom);
      return;
    }

    this.decisions.chooseChoices(
      `${source.instanceId}:move-pos:${card.instanceId}:${index}`,
      controllerSessionId,
      `Placez ${card.name} en haut ou en bas de ${destinationZone}.`,
      [
        { id: 'top', label: 'Haut' },
        { id: 'bottom', label: 'Bas' },
      ],
      1,
      1,
      (choiceIds) => {
        finishMove(choiceIds[0] === 'bottom');
      },
    );
  }

  private canMoveCardByEffect(
    card: DuelCard,
    controllerSessionId: string,
    destinationZone: string,
  ): boolean {
    const currentZone = this.selectors.findZoneOfCard(card)?.zone;
    const staysInField =
      destinationZone === 'characters' || destinationZone === 'stage';

    if (
      currentZone === 'life' &&
      destinationZone === 'hand' &&
      card.ownerSessionId === controllerSessionId &&
      this.modifiers.blocksOwnEffectLifeToHand(card.ownerSessionId)
    ) {
      return false;
    }

    if (
      !card.cannotBeRemovedByOpponentEffects ||
      card.ownerSessionId === controllerSessionId
    ) {
      return true;
    }

    if (
      (currentZone === 'characters' || currentZone === 'stage') &&
      !staysInField
    ) {
      return false;
    }

    return true;
  }

  private patchCardStatus(card: DuelCard, patch: Record<string, unknown>): void {
    if (this.host.patchCardStatus) {
      this.host.patchCardStatus(card.instanceId, patch);
      return;
    }

    Object.assign(card, patch);
  }

  private patchCardStats(card: DuelCard, patch: Record<string, unknown>): void {
    if (this.host.patchCardStats) {
      this.host.patchCardStats(card.instanceId, patch);
      return;
    }

    Object.assign(card, patch);
  }
}
