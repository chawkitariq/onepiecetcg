import type {
  EffectDecisionChoice,
  EffectDecisionResponse,
  EffectTargetSelector,
  PendingEffectDecision,
} from '@onepiecetcg/shared';
import type { DuelCard } from '@onepiecetcg/shared';
import { EffectSelectorResolver } from './effect-selector-resolver';
import type {
  EffectEngineHost,
  EffectResolutionContext,
  PendingDecisionState,
} from './effect-engine-types';

/**
 * Manages pause/resume flow when an effect requires a player decision.
 */
export class EffectDecisionManager {
  private pendingDecisionState: PendingDecisionState | null = null;

  public constructor(
    private readonly host: EffectEngineHost,
    private readonly selectors: EffectSelectorResolver,
  ) {}

  /** Returns the serialized pending decision, if the engine is paused. */
  public getPendingDecision(): PendingEffectDecision | null {
    return this.pendingDecisionState?.decision ?? null;
  }

  /** Returns true when the engine is currently waiting for player input. */
  public hasPendingDecision(): boolean {
    return this.pendingDecisionState !== null;
  }

  /** Pauses effect resolution until the provided continuation is answered. */
  public pause(
    decision: PendingEffectDecision,
    continuation: (response: EffectDecisionResponse) => void,
  ): void {
    this.setPendingDecisionState({ decision, continuation });
  }

  /** Resumes the currently paused decision if the response matches it. */
  public answerDecision(response: EffectDecisionResponse): void {
    if (!this.pendingDecisionState) {
      return;
    }

    if (this.pendingDecisionState.decision.id !== response.decisionId) {
      return;
    }

    const continuation = this.pendingDecisionState.continuation;
    this.setPendingDecisionState(null);
    continuation(response);
  }

  /** Opens a card-selection prompt and resumes with the validated selection. */
  public chooseCards(
    decisionId: string,
    controllerSessionId: string,
    context: EffectResolutionContext,
    chooserSessionId: string,
    message: string,
    selector: EffectTargetSelector,
    revealedCards: string[] | undefined,
    resolve: (cards: DuelCard[]) => void,
  ): void {
    const count = selector.count ?? { kind: 'exact', value: 1 };
    const min = count.kind === 'exact' ? count.value : 0;
    const max =
      count.kind === 'any'
        ? this.selectors.getSelectableCards(
            selector,
            controllerSessionId,
            context,
          ).length
        : count.value;

    this.pause(
      {
        id: decisionId,
        effectId: decisionId,
        effectCardId: '',
        sourceInstanceId: '',
        playerSessionId: chooserSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'selectCards',
          message,
          selector,
          min,
          max,
          revealedCards,
        },
      },
      (response) => {
        const selected = new Set(response.selectedCardInstanceIds ?? []);
        const selectedCards = this.selectors
          .getSelectableCards(selector, controllerSessionId, context)
          .filter((card) => selected.has(card.instanceId));

        resolve(this.applyDistinctRule(selectedCards, selector));
      },
    );
  }

  /** Opens a finite-choice prompt and resumes with the chosen ids. */
  public chooseChoices(
    decisionId: string,
    playerSessionId: string,
    message: string,
    choices: EffectDecisionChoice[],
    min: number,
    max: number,
    resolve: (choiceIds: string[]) => void,
  ): void {
    this.pause(
      {
        id: decisionId,
        effectId: decisionId,
        effectCardId: '',
        sourceInstanceId: '',
        playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'selectChoice',
          message,
          choices,
          min,
          max,
        },
      },
      (response) => {
        resolve(response.selectedChoiceIds ?? []);
      },
    );
  }

  private setPendingDecisionState(state: PendingDecisionState | null): void {
    this.pendingDecisionState = state;
    this.host.onPendingDecisionChange?.(state?.decision ?? null);
  }

  private applyDistinctRule(
    cards: DuelCard[],
    selector: EffectTargetSelector,
  ): DuelCard[] {
    if (selector.distinctBy !== 'name') {
      return cards;
    }

    const seenNames = new Set<string>();
    return cards.filter((card) => {
      if (seenNames.has(card.name)) {
        return false;
      }

      seenNames.add(card.name);
      return true;
    });
  }
}
