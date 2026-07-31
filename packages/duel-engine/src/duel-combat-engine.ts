import type {
  DuelCard,
  DuelEndReason,
  DuelPlayer,
  DuelState,
} from '@onepiecetcg/shared';
import type { DuelEngineEffectBoundary } from './contracts.js';

type DeclareAttackMessage = {
  attackerInstanceId: string;
  targetType: 'leader' | 'character';
  targetInstanceId?: string;
};

type DeclareBlockMessage = {
  blockerInstanceId?: string | null;
};

type DeclareCounterMessage = {
  discardInstanceId: string;
  counterPowerBonus: number;
};

type FindCardResult = { card: DuelCard; index: number } | null;

/**
 * Dependencies needed by the combat structural engine.
 */
export type DuelCombatEngineDeps = {
  state: DuelState;
  effectBoundary: Pick<
    DuelEngineEffectBoundary,
    | 'emitCardEvent'
    | 'emitBattleKo'
    | 'emitCounterUsage'
    | 'hasCounterEffect'
    | 'hasPendingPlayerInteraction'
    | 'clearCombatModifiers'
    | 'resolveRevealedLifeCard'
  >;
  addLog: (message: string, actorSessionId?: string) => void;
  sendError: (message: string) => void;
  broadcastCardView: (card: DuelCard) => void;
  syncZoneCounts: (player: DuelPlayer) => void;
  unshiftIntoTrash: (player: DuelPlayer, card: DuelCard) => void;
  isCombatInProgress: () => boolean;
  getOpponentSessionId: (sessionId: string) => string | null;
  findCardInZone: (
    player: DuelPlayer,
    zone: 'characters' | 'hand',
    instanceId: string,
  ) => FindCardResult;
  cardPower: (card: DuelCard) => number;
  knockOutCharacter: (owner: DuelPlayer, card: DuelCard) => void;
  isProtectedFromBattleKo: (
    defendingCard: DuelCard,
    attackerCard: DuelCard,
  ) => boolean;
  finalizeMatch: (endReason: DuelEndReason, winnerSessionId: string) => void;
  recordMatchResult: () => void;
};

/**
 * Owns the structural combat pipeline independently from Colyseus transport:
 * declare attack, declare block, counter step, damage resolution and reset.
 */
export class DuelCombatEngine {
  public constructor(private readonly deps: DuelCombatEngineDeps) {}

  /**
   * Validates and resolves attack declaration during the main phase.
   */
  public handleDeclareAttack(
    clientSessionId: string,
    message: DeclareAttackMessage,
  ): boolean {
    if (this.deps.state.phase !== 'main') {
      this.deps.sendError('Action impossible hors de la phase Principale.');
      return false;
    }

    if (this.deps.isCombatInProgress()) {
      this.deps.sendError('Un combat est deja en cours.');
      return false;
    }

    if (clientSessionId !== this.deps.state.activePlayerSessionId) {
      this.deps.sendError("Ce n'est pas votre tour.");
      return false;
    }

    const attacker = this.deps.state.players.get(clientSessionId);

    if (!attacker) {
      return false;
    }

    if (!attacker.hasTakenFirstTurn) {
      this.deps.sendError(
        "Aucune attaque n'est autorisee lors de votre premier tour.",
      );
      return false;
    }

    const attackerCard = this.getAttackingCard(
      attacker,
      message.attackerInstanceId,
    );

    if (!attackerCard) {
      this.deps.sendError('Attaquant introuvable.');
      return false;
    }

    if (attackerCard.rested) {
      this.deps.sendError("L'attaquant est deja epuise.");
      return false;
    }

    if (attackerCard.playedThisTurn && !attackerCard.hasRush) {
      this.deps.sendError(
        'Un Personnage joue ce tour-ci ne peut pas attaquer.',
      );
      return false;
    }

    if (attackerCard.cannotAttack) {
      this.deps.sendError('Cette carte ne peut pas attaquer.');
      return false;
    }

    if (attackerCard.cannotAttackUntilTurn >= this.deps.state.turn) {
      this.deps.sendError('Ce Personnage ne peut pas attaquer pour le moment.');
      return false;
    }

    const defenderSessionId = this.deps.getOpponentSessionId(clientSessionId);

    if (!defenderSessionId) {
      this.deps.sendError('Adversaire introuvable.');
      return false;
    }

    const defender = this.deps.state.players.get(defenderSessionId);

    if (!defender) {
      return false;
    }

    const forcedTargets = defender.zones.characters.filter(
      (card) => card.mustBeAttackTarget,
    );

    if (message.targetType === 'leader') {
      if (
        attackerCard.playedThisTurn &&
        attackerCard.cannotAttackLeaderOnTurnPlayed
      ) {
        this.deps.sendError(
          'Cette carte ne peut pas attaquer un Leader le tour ou elle est jouee.',
        );
        return false;
      }

      if (forcedTargets.length > 0) {
        this.deps.sendError(
          'Une autre carte doit etre choisie comme cible de cette attaque.',
        );
        return false;
      }
    } else if (message.targetType === 'character') {
      const targetFound = message.targetInstanceId
        ? this.deps.findCardInZone(
            defender,
            'characters',
            message.targetInstanceId,
          )
        : null;

      if (!targetFound) {
        this.deps.sendError('Cible introuvable.');
        return false;
      }

      if (!targetFound.card.rested && !attackerCard.canAttackActiveCharacters) {
        this.deps.sendError(
          'Seul un Personnage adverse epuise peut etre cible.',
        );
        return false;
      }

      if (
        forcedTargets.length > 0 &&
        !forcedTargets.some(
          (card) => card.instanceId === targetFound.card.instanceId,
        )
      ) {
        this.deps.sendError(
          'Une autre carte doit etre choisie comme cible de cette attaque.',
        );
        return false;
      }
    } else {
      this.deps.sendError('Type de cible invalide.');
      return false;
    }

    attackerCard.rested = true;

    const combat = this.deps.state.combat;
    combat.attackerSessionId = clientSessionId;
    combat.attackerInstanceId = attackerCard.instanceId;
    combat.defenderSessionId = defenderSessionId;
    combat.targetType = message.targetType;
    combat.targetInstanceId =
      message.targetType === 'leader'
        ? defender.zones.leader.instanceId
        : (message.targetInstanceId ?? '');
    combat.blockerInstanceId = '';
    combat.step = 'declared';
    combat.counterPowerBonus = 0;
    combat.awaitingTriggerDecision = false;

    const targetLabel =
      message.targetType === 'leader'
        ? `le Leader de ${defender.displayName}`
        : (this.deps.findCardInZone(
            defender,
            'characters',
            combat.targetInstanceId,
          )?.card.name ?? 'un Personnage');

    this.deps.addLog(
      `${attacker.displayName} attaque avec ${attackerCard.name} vers ${targetLabel}.`,
      attacker.sessionId,
    );

    this.deps.effectBoundary.emitCardEvent(
      'whenAttacking',
      clientSessionId,
      attackerCard,
      {
        targetInstanceId: combat.targetInstanceId,
      },
    );

    combat.step = 'blocked';
    return true;
  }

  /**
   * Validates and resolves the blocking declaration for the defending player.
   */
  public handleDeclareBlock(
    clientSessionId: string,
    message: DeclareBlockMessage,
  ): boolean {
    const combat = this.deps.state.combat;

    if (!this.deps.isCombatInProgress() || combat.step !== 'blocked') {
      this.deps.sendError('Aucune etape de Blocage en cours.');
      return false;
    }

    if (clientSessionId !== combat.defenderSessionId) {
      this.deps.sendError("Vous n'etes pas le defenseur de ce combat.");
      return false;
    }

    const defender = this.deps.state.players.get(combat.defenderSessionId);

    if (!defender) {
      return false;
    }

    if (message.blockerInstanceId) {
      const blockerFound = this.deps.findCardInZone(
        defender,
        'characters',
        message.blockerInstanceId,
      );

      if (!blockerFound) {
        this.deps.sendError('Bloqueur introuvable.');
        return false;
      }

      if (blockerFound.card.rested) {
        this.deps.sendError('Le Bloqueur doit etre redresse.');
        return false;
      }

      if (blockerFound.card.cannotBlock) {
        this.deps.sendError(
          'Cette carte ne peut pas bloquer pendant ce combat.',
        );
        return false;
      }

      blockerFound.card.rested = true;
      combat.blockerInstanceId = blockerFound.card.instanceId;
      this.deps.addLog(
        `${defender.displayName} declare ${blockerFound.card.name} comme Bloqueur.`,
        defender.sessionId,
      );
      this.deps.effectBoundary.emitCardEvent(
        'onBlock',
        defender.sessionId,
        blockerFound.card,
      );
    } else {
      this.deps.addLog(
        `${defender.displayName} ne bloque pas.`,
        defender.sessionId,
      );
    }

    if (!combat.blockerInstanceId && combat.targetType === 'leader') {
      this.deps.effectBoundary.emitCardEvent(
        'onAttacked',
        defender.sessionId,
        defender.zones.leader,
      );
    }

    combat.step = 'countering';
    return true;
  }

  /**
   * Validates and resolves a counter card discard during the counter step.
   */
  public handleDeclareCounter(
    clientSessionId: string,
    message: DeclareCounterMessage,
  ): boolean {
    const combat = this.deps.state.combat;

    if (!this.deps.isCombatInProgress() || combat.step !== 'countering') {
      this.deps.sendError('Aucune etape de Contre en cours.');
      return false;
    }

    if (clientSessionId !== combat.defenderSessionId) {
      this.deps.sendError("Vous n'etes pas le defenseur de ce combat.");
      return false;
    }

    const defender = this.deps.state.players.get(combat.defenderSessionId);

    if (!defender) {
      return false;
    }

    const found = this.deps.findCardInZone(
      defender,
      'hand',
      message.discardInstanceId,
    );

    if (!found) {
      this.deps.sendError('Carte introuvable en main.');
      return false;
    }

    const bonus = Math.max(0, Math.trunc(message.counterPowerBonus));
    const hasCounterEffect = this.deps.effectBoundary.hasCounterEffect(
      found.card.cardId,
    );

    if (bonus <= 0 && !hasCounterEffect) {
      this.deps.sendError('Valeur de Contre invalide.');
      return false;
    }

    defender.zones.hand.splice(found.index, 1);
    this.deps.unshiftIntoTrash(defender, found.card);
    this.deps.broadcastCardView(found.card);
    combat.counterPowerBonus += bonus;

    this.deps.addLog(
      `${defender.displayName} defausse ${found.card.name} et declare +${bonus} de Contre.`,
      defender.sessionId,
    );

    if (hasCounterEffect || found.card.type === 'Event') {
      this.deps.effectBoundary.emitCounterUsage(defender.sessionId, found.card);
    }

    return true;
  }

  /**
   * Ends the counter step and resolves combat damage if the state is valid.
   */
  public handleFinishCounterStep(clientSessionId: string): boolean {
    const combat = this.deps.state.combat;

    if (!this.deps.isCombatInProgress() || combat.step !== 'countering') {
      this.deps.sendError('Aucune etape de Contre en cours.');
      return false;
    }

    if (clientSessionId !== combat.defenderSessionId) {
      this.deps.sendError("Vous n'etes pas le defenseur de ce combat.");
      return false;
    }

    this.resolveCombatDamage();
    return true;
  }

  /**
   * Clears current combat state and returns the duel flow to the main phase.
   */
  public endCombat(): void {
    const combat = this.deps.state.combat;
    combat.step = 'resolved';
    this.deps.addLog('Fin du combat, retour a la phase Principale.');
    combat.attackerSessionId = '';
    combat.attackerInstanceId = '';
    combat.defenderSessionId = '';
    combat.targetType = 'leader';
    combat.targetInstanceId = '';
    combat.blockerInstanceId = '';
    combat.step = 'declared';
    combat.counterPowerBonus = 0;
    combat.awaitingTriggerDecision = false;
    this.deps.effectBoundary.clearCombatModifiers();
  }

  private getAttackingCard(
    attacker: DuelPlayer,
    attackerInstanceId: string,
  ): DuelCard | null {
    if (attacker.zones.leader.instanceId === attackerInstanceId) {
      return attacker.zones.leader;
    }

    return (
      this.deps.findCardInZone(attacker, 'characters', attackerInstanceId)
        ?.card ?? null
    );
  }

  private getCombatAttackingCard(): DuelCard | null {
    const combat = this.deps.state.combat;
    const attacker = this.deps.state.players.get(combat.attackerSessionId);

    if (!attacker) {
      return null;
    }

    return this.getAttackingCard(attacker, combat.attackerInstanceId);
  }

  private getCombatDefendingCard(): DuelCard | null {
    const combat = this.deps.state.combat;
    const defender = this.deps.state.players.get(combat.defenderSessionId);

    if (!defender) {
      return null;
    }

    if (combat.blockerInstanceId) {
      return (
        this.deps.findCardInZone(
          defender,
          'characters',
          combat.blockerInstanceId,
        )?.card ?? null
      );
    }

    if (combat.targetType === 'leader') {
      return defender.zones.leader;
    }

    return (
      this.deps.findCardInZone(defender, 'characters', combat.targetInstanceId)
        ?.card ?? null
    );
  }

  private resolveCombatDamage(): void {
    const combat = this.deps.state.combat;
    combat.step = 'resolving';

    const attackerCard = this.getCombatAttackingCard();
    const defendingCard = this.getCombatDefendingCard();
    const attacker = this.deps.state.players.get(combat.attackerSessionId);
    const defender = this.deps.state.players.get(combat.defenderSessionId);

    if (!attackerCard || !defendingCard || !attacker || !defender) {
      this.endCombat();
      return;
    }

    const attackerPower = this.deps.cardPower(attackerCard);
    const defenderPower =
      this.deps.cardPower(defendingCard) + combat.counterPowerBonus;

    this.deps.addLog(
      `Etape de Degats : ${attackerCard.name} (${attackerPower}) contre ${defendingCard.name} (${defenderPower}).`,
      attacker.sessionId,
    );

    if (attackerPower < defenderPower) {
      this.deps.addLog(
        `${attacker.displayName} perd le combat.`,
        attacker.sessionId,
      );
      this.endCombat();
      return;
    }

    this.deps.addLog(
      `${attacker.displayName} remporte le combat.`,
      attacker.sessionId,
    );

    if (combat.blockerInstanceId || combat.targetType === 'character') {
      if (this.deps.isProtectedFromBattleKo(defendingCard, attackerCard)) {
        this.deps.addLog(
          `${defendingCard.name} ne peut pas etre mis KO pendant ce combat.`,
          defender.sessionId,
        );
      } else {
        this.deps.knockOutCharacter(defender, defendingCard);
        this.deps.effectBoundary.emitBattleKo(attacker.sessionId, attackerCard);
      }
      this.endCombat();
      return;
    }

    this.dealLeaderDamage(defender, attackerCard);
  }

  private dealLeaderDamage(defender: DuelPlayer, attackerCard: DuelCard): void {
    const damageCount = attackerCard.hasDoubleAttack ? 2 : 1;

    for (let damageIndex = 0; damageIndex < damageCount; damageIndex += 1) {
      if (!this.resolveSingleLeaderDamage(defender, attackerCard)) {
        return;
      }
    }

    this.endCombat();
  }

  private resolveSingleLeaderDamage(
    defender: DuelPlayer,
    attackerCard: DuelCard,
  ): boolean {
    if (defender.zones.life.length === 0) {
      this.deps.finalizeMatch(
        'life',
        this.deps.getOpponentSessionId(defender.sessionId) ?? '',
      );
      this.deps.addLog(
        `${defender.displayName} subit un degat sur une Vie deja vide : defaite.`,
        defender.sessionId,
      );
      this.endCombat();
      this.deps.recordMatchResult();
      return false;
    }

    const revealedCard = defender.zones.life.shift();
    this.deps.syncZoneCounts(defender);

    if (!revealedCard) {
      this.endCombat();
      return false;
    }

    revealedCard.faceDown = false;

    if (attackerCard.hasBanish) {
      this.deps.unshiftIntoTrash(defender, revealedCard);
      this.deps.broadcastCardView(revealedCard);
      this.deps.addLog(
        `${defender.displayName} subit 1 degat en [Banish] et la carte de Vie est mise a la Defausse.`,
        defender.sessionId,
      );
      return true;
    }

    const triggerResolution = this.deps.effectBoundary.resolveRevealedLifeCard(
      defender,
      revealedCard,
    );

    this.deps.effectBoundary.emitCardEvent(
      'onLifeDamageDealt',
      this.deps.getOpponentSessionId(defender.sessionId) ?? '',
      attackerCard,
    );

    if (triggerResolution === 'addedToHand') {
      return true;
    }

    if (!this.deps.effectBoundary.hasPendingPlayerInteraction()) {
      this.endCombat();
    }

    return false;
  }
}
