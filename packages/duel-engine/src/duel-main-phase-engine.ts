import type { DuelCard, DuelPlayer, DuelState } from '@onepiecetcg/shared';
import type { DuelEngineEffectBoundary } from './contracts.js';

const MAX_CHARACTERS = 5;

type PlayCardMessage = {
  instanceId: string;
  discardCharacterInstanceId?: string;
};

type AttachDonMessage = {
  target: 'leader' | 'character';
  targetInstanceId?: string;
  count?: number;
};

type FindCardResult = { card: DuelCard; index: number } | null;

/**
 * Dependencies needed by the main-phase structural engine.
 */
export type DuelMainPhaseEngineDeps = {
  state: DuelState;
  effectBoundary: Pick<
    DuelEngineEffectBoundary,
    | 'hasPendingPlayerInteraction'
    | 'reapplyContinuousEffects'
    | 'emitPlayedCard'
    | 'emitDonAttached'
    | 'getNextPlayCostModifier'
    | 'consumeNextPlayCostModifier'
  >;
  addLog: (message: string, actorSessionId?: string) => void;
  sendError: (message: string) => void;
  broadcastCardView: (card: DuelCard) => void;
  syncZoneCounts: (player: DuelPlayer) => void;
  unshiftIntoTrash: (player: DuelPlayer, card: DuelCard) => void;
  returnDonToCost: (
    player: DuelPlayer,
    sessionId: string,
    count: number,
  ) => void;
  findCardInZone: (
    player: DuelPlayer,
    zone: 'characters' | 'cost' | 'hand',
    instanceId: string,
  ) => FindCardResult;
  takeUntappedDonCards: (
    player: DuelPlayer,
    amount: number,
  ) => DuelCard[] | null;
};

/**
 * Owns structural main-phase actions that are independent from the realtime
 * boundary: playing cards from hand and attaching DON!! from the cost zone.
 */
export class DuelMainPhaseEngine {
  public constructor(private readonly deps: DuelMainPhaseEngineDeps) {}

  /**
   * Validates and resolves a structural "play a card from hand" action.
   * Returns `true` when the action was handled, `false` when validation failed.
   */
  public handlePlayCard(
    clientSessionId: string,
    message: PlayCardMessage,
  ): boolean {
    const player = this.assertMainPhaseAction(clientSessionId);

    if (!player) {
      return false;
    }

    const found = this.deps.findCardInZone(player, 'hand', message.instanceId);

    if (!found) {
      this.deps.sendError('Carte introuvable en main.');
      return false;
    }

    const { card, index } = found;

    if (
      card.type !== 'Character' &&
      card.type !== 'Event' &&
      card.type !== 'Stage'
    ) {
      this.deps.sendError('Cette carte ne peut pas etre jouee depuis la main.');
      return false;
    }

    let characterToDiscard: FindCardResult = null;

    if (
      card.type === 'Character' &&
      player.zones.characters.length >= MAX_CHARACTERS
    ) {
      characterToDiscard = message.discardCharacterInstanceId
        ? this.deps.findCardInZone(
            player,
            'characters',
            message.discardCharacterInstanceId,
          )
        : null;

      if (!characterToDiscard) {
        this.deps.sendError(
          `Zone Personnage pleine (${MAX_CHARACTERS} max) : choisissez un Personnage a defausser pour jouer ${card.name}.`,
        );
        return false;
      }
    }

    const cost = Math.max(
      card.cost + this.deps.effectBoundary.getNextPlayCostModifier(card),
      0,
    );
    const paidDonCards = this.deps.takeUntappedDonCards(player, cost);

    if (!paidDonCards) {
      this.deps.sendError(
        `DON!! insuffisant pour jouer ${card.name} (cout ${cost}).`,
      );
      return false;
    }

    player.zones.hand.splice(index, 1);

    if (card.type === 'Character') {
      this.playCharacter(player, clientSessionId, card, characterToDiscard);
      this.deps.effectBoundary.consumeNextPlayCostModifier(card);
    } else if (card.type === 'Stage') {
      this.playStage(player, clientSessionId, card);
    } else {
      this.activateEvent(player, card);
    }

    this.deps.syncZoneCounts(player);
    return true;
  }

  /**
   * Validates and resolves a DON!! attachment action from the cost zone.
   * Returns `true` when the action was handled, `false` when validation failed.
   */
  public handleAttachDon(
    clientSessionId: string,
    message: AttachDonMessage,
  ): boolean {
    const player = this.assertMainPhaseAction(clientSessionId);

    if (!player) {
      return false;
    }

    const count = Number.isInteger(message.count) ? (message.count ?? 1) : 1;

    if (count < 1) {
      this.deps.sendError('Quantite de DON!! invalide.');
      return false;
    }

    const donCards = this.deps.takeUntappedDonCards(player, count);

    if (!donCards) {
      this.deps.sendError(
        'Pas assez de DON!! redresses disponibles en zone de Cout.',
      );
      return false;
    }

    if (message.target === 'leader') {
      const attachedCount = this.consumeReservedDon(player, donCards);

      if (attachedCount > 0) {
        player.zones.leader.attachedDon += attachedCount;
        this.deps.effectBoundary.emitDonAttached(
          player.sessionId,
          player.zones.leader,
        );
      }

      this.deps.addLog(
        `${player.displayName} donne ${attachedCount} DON!! a son Leader (+${attachedCount * 1000} de puissance).`,
        player.sessionId,
      );
      return true;
    }

    const found = message.targetInstanceId
      ? this.deps.findCardInZone(player, 'characters', message.targetInstanceId)
      : null;

    if (!found) {
      for (const donCard of donCards) {
        donCard.rested = false;
      }
      this.deps.sendError('Cible invalide pour attacher un DON!!.');
      return false;
    }

    const attachedCount = this.consumeReservedDon(player, donCards);
    found.card.attachedDon += attachedCount;
    if (attachedCount > 0) {
      this.deps.effectBoundary.emitDonAttached(player.sessionId, found.card);
    }
    this.deps.addLog(
      `${player.displayName} donne ${attachedCount} DON!! a ${found.card.name} (+${attachedCount * 1000} de puissance).`,
      player.sessionId,
    );
    return true;
  }

  private assertMainPhaseAction(clientSessionId: string): DuelPlayer | null {
    if (this.deps.effectBoundary.hasPendingPlayerInteraction()) {
      this.deps.sendError("Une decision d'effet est en attente.");
      return null;
    }

    if (this.deps.state.phase !== 'main') {
      this.deps.sendError('Action impossible hors de la phase Principale.');
      return null;
    }

    if (this.deps.state.combat.attackerInstanceId !== '') {
      this.deps.sendError('Un combat est en cours.');
      return null;
    }

    if (clientSessionId !== this.deps.state.activePlayerSessionId) {
      this.deps.sendError("Ce n'est pas votre tour.");
      return null;
    }

    const player = this.deps.state.players.get(clientSessionId);

    if (!player) {
      return null;
    }

    return player;
  }

  private playCharacter(
    player: DuelPlayer,
    clientSessionId: string,
    card: DuelCard,
    characterToDiscard: FindCardResult,
  ): void {
    if (characterToDiscard) {
      const [discarded] = player.zones.characters.splice(
        characterToDiscard.index,
        1,
      );

      if (discarded) {
        const attachedDon = discarded.attachedDon;
        discarded.attachedDon = 0;
        this.deps.unshiftIntoTrash(player, discarded);
        this.deps.returnDonToCost(player, clientSessionId, attachedDon);
        this.deps.addLog(
          `${player.displayName} defausse ${discarded.name} pour liberer la zone Personnage.`,
          player.sessionId,
        );
      }
    }

    card.playedThisTurn = true;
    card.rested = false;
    player.zones.characters.push(card);
    this.deps.broadcastCardView(card);
    this.deps.addLog(
      `${player.displayName} joue ${card.name} en zone Personnage.`,
      player.sessionId,
    );
    this.deps.effectBoundary.reapplyContinuousEffects();
    this.deps.effectBoundary.emitPlayedCard(player.sessionId, card, 'hand');
  }

  private playStage(
    player: DuelPlayer,
    clientSessionId: string,
    card: DuelCard,
  ): void {
    if (player.zones.stage.instanceId) {
      const discardedStage = player.zones.stage;
      const attachedDon = discardedStage.attachedDon;
      discardedStage.attachedDon = 0;
      this.deps.unshiftIntoTrash(player, discardedStage);
      this.deps.returnDonToCost(player, clientSessionId, attachedDon);
    }

    card.rested = false;
    player.zones.stage = card;
    this.deps.broadcastCardView(card);
    this.deps.addLog(
      `${player.displayName} joue ${card.name} en zone Lieu.`,
      player.sessionId,
    );
    this.deps.effectBoundary.reapplyContinuousEffects();
    this.deps.effectBoundary.emitPlayedCard(player.sessionId, card, 'hand');
  }

  private activateEvent(player: DuelPlayer, card: DuelCard): void {
    this.deps.unshiftIntoTrash(player, card);
    this.deps.broadcastCardView(card);
    this.deps.addLog(
      `${player.displayName} active ${card.name}.`,
      player.sessionId,
    );
    this.deps.effectBoundary.emitPlayedCard(player.sessionId, card, 'hand');
  }

  private consumeReservedDon(player: DuelPlayer, donCards: DuelCard[]): number {
    let attachedCount = 0;

    for (const donCard of donCards) {
      const removed = player.zones.cost.splice(
        player.zones.cost.indexOf(donCard),
        1,
      )[0];

      if (removed) {
        attachedCount += 1;
      }
    }

    return attachedCount;
  }
}
