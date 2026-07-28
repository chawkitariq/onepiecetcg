import type {
  DuelCard,
  DuelPlayer,
  DuelState,
  EffectDecisionResponse,
  PendingEffectDecision,
  EffectTargetSelector,
} from '@onepiecetcg/shared';
import {
  EffectEngine,
  type EffectEngineHost,
  type EffectEventType,
} from '../card-effect/effect-engine';
import { effectRegistry } from '../card-effect/effect-registry';

type ManualTriggerFallbackState = {
  card: DuelCard;
  ownerSessionId: string;
};

export type DuelRoomEffectBoundaryDeps = {
  state: DuelState;
  addLog: (message: string) => void;
  onPendingEffectDecisionChange?: (
    decision: PendingEffectDecision | null,
  ) => void;
  getPlayer: (sessionId: string) => DuelPlayer | undefined;
  getOpponentSessionId: (sessionId: string) => string | null;
  getCard: (instanceId: string) => DuelCard | null;
  getCards: (
    selector: EffectTargetSelector,
    controllerSessionId: string,
  ) => DuelCard[];
  moveCard: EffectEngineHost['moveCard'];
  shuffleDeck: (playerSessionId: string) => void;
  drawCard: (playerSessionId: string) => DuelCard | null;
  trashTopDeckCards: (playerSessionId: string, amount: number) => DuelCard[];
  addDonToCost: (playerSessionId: string, amount: number, rested: boolean) => number;
  attachDon: EffectEngineHost['attachDon'];
  returnDonToDonDeck: (playerSessionId: string, amount: number) => number;
  koCharacter: EffectEngineHost['koCharacter'];
  syncPlayer: (playerSessionId: string) => void;
  broadcastCardView: (card: DuelCard) => void;
};

/**
 * Explicit API boundary between Colyseus duel orchestration and the card
 * effect engine. `DuelRoom` keeps structural combat/state rules; this class
 * translates gameplay windows into effect events and isolates the temporary
 * manual Trigger fallback for cards that still lack a local definition.
 */
export class DuelRoomEffectBoundary {
  private readonly engine: EffectEngine;

  private pendingManualTrigger: ManualTriggerFallbackState | null = null;

  public constructor(private readonly deps: DuelRoomEffectBoundaryDeps) {
    this.engine = new EffectEngine(effectRegistry, {
      state: deps.state,
      addLog: deps.addLog,
      onPendingDecisionChange: (decision) =>
        deps.onPendingEffectDecisionChange?.(decision),
      getPlayer: deps.getPlayer,
      getOpponentSessionId: deps.getOpponentSessionId,
      getCard: deps.getCard,
      getCards: deps.getCards,
      moveCard: deps.moveCard,
      shuffleDeck: deps.shuffleDeck,
      drawCard: deps.drawCard,
      trashTopDeckCards: deps.trashTopDeckCards,
      addDonToCost: deps.addDonToCost,
      attachDon: deps.attachDon,
      returnDonToDonDeck: deps.returnDonToDonDeck,
      koCharacter: deps.koCharacter,
      syncPlayer: deps.syncPlayer,
    });
  }

  public hasPendingPlayerInteraction(): boolean {
    return this.getPendingEffectDecision() !== null || this.pendingManualTrigger !== null;
  }

  public getPendingEffectDecision() {
    return this.engine.getPendingDecision();
  }

  public answerEffectDecision(response: EffectDecisionResponse): void {
    this.engine.answerDecision(response);
  }

  public reapplyContinuousEffects(): void {
    this.engine.reapplyContinuousEffects();
  }

  public clearTurnModifiers(): void {
    this.engine.clearTurnModifiers();
  }

  public clearCombatModifiers(): void {
    this.engine.clearCombatModifiers();
    this.clearManualTriggerFallback();
  }

  public applyKoReplacement(
    playerSessionId: string,
    sourceInstanceId: string,
    reason: 'battle' | 'effect',
  ): boolean {
    return this.engine.applyReplacement({
      type: 'wouldKoCharacter',
      playerSessionId,
      sourceInstanceId,
      reason,
    });
  }

  public emitCardEvent(
    type: EffectEventType,
    playerSessionId: string,
    card: DuelCard,
  ): void {
    this.engine.handleEvent({
      type,
      playerSessionId,
      sourceInstanceId: card.instanceId,
      sourceCardId: card.cardId,
    });
  }

  public emitWindowEffects(type: 'onTurnStart' | 'onTurnEnd'): void {
    for (const player of this.deps.state.players.values()) {
      this.emitCardEvent(type, player.sessionId, player.zones.leader);

      for (const character of player.zones.characters) {
        this.emitCardEvent(type, player.sessionId, character);
      }

      if (player.zones.stage.instanceId) {
        this.emitCardEvent(type, player.sessionId, player.zones.stage);
      }
    }
  }

  public emitPlayedCard(playerSessionId: string, card: DuelCard): void {
    if (card.type === 'Event') {
      this.emitCardEvent('activateMain', playerSessionId, card);
      this.emitCardEvent('onEventActivated', playerSessionId, card);
      return;
    }

    this.emitCardEvent('onPlay', playerSessionId, card);
  }

  public hasCounterEffect(cardId: string): boolean {
    return (
      effectRegistry.effectsByCardId[cardId]?.standard?.some(
        (effect) => effect.trigger.type === 'activateCounter',
      ) ?? false
    );
  }

  public emitCounterUsage(playerSessionId: string, card: DuelCard): void {
    if (this.hasCounterEffect(card.cardId)) {
      this.emitCardEvent('activateCounter', playerSessionId, card);
    }

    if (card.type === 'Event') {
      this.emitCardEvent('onEventActivated', playerSessionId, card);
    }
  }

  public hasLocalTriggerDefinition(cardId: string): boolean {
    return (
      effectRegistry.effectsByCardId[cardId]?.standard?.some(
        (effect) => effect.trigger.type === 'trigger',
      ) ?? false
    );
  }

  public resolveRevealedLifeCard(
    defender: DuelPlayer,
    revealedCard: DuelCard,
  ): 'addedToHand' | 'engineTrigger' | 'manualFallback' {
    if (this.hasLocalTriggerDefinition(revealedCard.cardId)) {
      this.unshiftIntoTrash(defender, revealedCard);
      this.deps.broadcastCardView(revealedCard);
      this.emitCardEvent('trigger', defender.sessionId, revealedCard);
      return 'engineTrigger';
    }

    if (revealedCard.trigger) {
      this.queueManualTriggerFallback(defender.sessionId, revealedCard, defender.displayName);
      return 'manualFallback';
    }

    defender.zones.hand.push(revealedCard);
    this.deps.syncPlayer(defender.sessionId);
    this.deps.addLog(
      `${defender.displayName} subit 1 degat et ajoute la carte de Vie a sa main.`,
    );
    return 'addedToHand';
  }

  public resolveManualTriggerDecision(
    playerSessionId: string,
    activate: boolean,
  ): { ok: true } | { ok: false; error: string } {
    if (!this.pendingManualTrigger) {
      return {
        ok: false,
        error: 'Aucune decision de Declenchement en attente.',
      };
    }

    if (this.pendingManualTrigger.ownerSessionId !== playerSessionId) {
      return {
        ok: false,
        error: "Seul le defenseur peut decider d'activer ce Declenchement.",
      };
    }

    const defender = this.deps.getPlayer(playerSessionId);
    const { card } = this.pendingManualTrigger;

    if (!defender) {
      this.clearManualTriggerFallback();
      return { ok: true };
    }

    if (activate) {
      this.unshiftIntoTrash(defender, card);
      this.deps.broadcastCardView(card);
      this.deps.addLog(
        `${defender.displayName} active le Declenchement de ${card.name} et l'ecarte (effet a appliquer manuellement).`,
      );
    } else {
      defender.zones.hand.push(card);
      this.deps.addLog(
        `${defender.displayName} ajoute ${card.name} a sa main sans activer le Declenchement.`,
      );
    }

    this.deps.syncPlayer(defender.sessionId);
    this.clearManualTriggerFallback();
    return { ok: true };
  }

  private queueManualTriggerFallback(
    ownerSessionId: string,
    card: DuelCard,
    defenderDisplayName: string,
  ): void {
    this.deps.state.combat.awaitingTriggerDecision = true;
    this.pendingManualTrigger = { card, ownerSessionId };
    this.deps.addLog(
      `${defenderDisplayName} subit 1 degat et revele une carte avec [Declenchement] : decision en attente.`,
    );
  }

  private clearManualTriggerFallback(): void {
    this.deps.state.combat.awaitingTriggerDecision = false;
    this.pendingManualTrigger = null;
  }

  private unshiftIntoTrash(player: DuelPlayer, card: DuelCard): void {
    player.zones.trash.unshift(card);
  }
}
