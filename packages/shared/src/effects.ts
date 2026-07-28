import type { CardColor, CardType, GameZone } from './index.js';

export type EffectTriggerType =
  | 'onPlay'
  | 'activateMain'
  | 'activateCounter'
  | 'onEventActivated'
  | 'whenAttacking'
  | 'onKo'
  | 'trigger'
  | 'onBlock'
  | 'onTurnStart'
  | 'onTurnEnd';

export type EffectOwnerSelector = 'self' | 'opponent' | 'either';

export type EffectKeyword =
  | 'rush'
  | 'doubleAttack'
  | 'banish'
  | 'canAttackActiveCharacters'
  | 'mustBeAttackTarget'
  | 'cannotBlock'
  | 'cannotBeKoedInBattle'
  | 'cannotBeKoedByStrikeInBattle';

export type EffectCount =
  | { kind: 'exact'; value: number }
  | { kind: 'upTo'; value: number };

export type EffectCondition =
  | { type: 'controllerTurn'; value: boolean }
  | { type: 'sourceHasAttachedDonAtLeast'; value: number }
  | { type: 'playerHasLifeAtMost'; player: EffectOwnerSelector; value: number }
  | { type: 'playerHasLeaderName'; player: EffectOwnerSelector; value: string }
  | { type: 'playerHasLeaderTrait'; player: EffectOwnerSelector; value: string }
  | { type: 'playerHasTotalDonAtLeast'; player: EffectOwnerSelector; value: number }
  | { type: 'eventPlayerIs'; player: EffectOwnerSelector }
  | { type: 'targetExists'; selector: EffectTargetSelector }
  | { type: 'targetCountAtLeast'; selector: EffectTargetSelector; value: number }
  | { type: 'targetCountAtMost'; selector: EffectTargetSelector; value: number }
  | { type: 'cardInZone'; zone: GameZone }
  | { type: 'sourceIsRested'; value: boolean };

export type EffectCardFilter = {
  cardCategory?: CardType[];
  costMax?: number;
  costMin?: number;
  powerMax?: number;
  powerMin?: number;
  color?: CardColor[];
  differentColorThanStoredSelection?: string;
  trait?: string[];
  name?: string[];
  excludeName?: string[];
  rested?: boolean;
  owner?: EffectOwnerSelector;
};

export type EffectTargetSelector = {
  player: EffectOwnerSelector;
  chooser?: EffectOwnerSelector;
  zones: GameZone[];
  filter?: EffectCardFilter;
  count?: EffectCount;
};

export type EffectDuration =
  | { type: 'untilEndOfTurn' }
  | { type: 'untilEndOfBattle' }
  | { type: 'whileSourceInPlay' }
  | { type: 'permanent' };

export type EffectTrigger = {
  type: EffectTriggerType;
  optional?: boolean;
  oncePerTurn?: boolean;
};

export type EffectDecisionChoice = {
  id: string;
  label: string;
  cardInstanceId?: string;
};

export type EffectDecisionPrompt =
  | {
      type: 'confirm';
      message: string;
      optional?: boolean;
    }
  | {
      type: 'selectCards';
      message: string;
      selector: EffectTargetSelector;
      min: number;
      max: number;
      revealedCards?: string[];
    }
  | {
      type: 'selectChoice';
      message: string;
      choices: EffectDecisionChoice[];
      min: number;
      max: number;
    };

export type PendingEffectDecision = {
  id: string;
  effectId: string;
  effectCardId: string;
  sourceInstanceId: string;
  playerSessionId: string;
  prompt: EffectDecisionPrompt;
  createdAt: string;
};

export type EffectDecisionResponse = {
  decisionId: string;
  confirmed?: boolean;
  selectedCardInstanceIds?: string[];
  selectedChoiceIds?: string[];
};

export type EffectAction =
  | {
      type: 'draw';
      player: EffectOwnerSelector;
      amount: number;
    }
  | {
      type: 'play';
      selector: EffectTargetSelector;
      destination: 'characters' | 'stage';
      rested?: boolean;
    }
  | {
      type: 'ko';
      selector: EffectTargetSelector;
      upTo?: boolean;
      reason?: 'battle' | 'effect';
    }
  | {
      type: 'koAllCharacters';
      selector: EffectTargetSelector;
      excludeSource?: boolean;
      reason?: 'battle' | 'effect';
    }
  | {
      type: 'trashFromDeck';
      player: EffectOwnerSelector;
      amount: number;
    }
  | {
      type: 'trashFromHand';
      selector: EffectTargetSelector;
    }
  | {
      type: 'rest' | 'unrest' | 'restand';
      selector: EffectTargetSelector;
    }
  | {
      type: 'addToLife';
      selector: EffectTargetSelector;
      player: EffectOwnerSelector;
    }
  | {
      type: 'addDon';
      player: EffectOwnerSelector;
      amount: number;
      rested?: boolean;
      destination?: 'cost';
    }
  | {
      type: 'removeDon';
      player: EffectOwnerSelector;
      amount: number;
    }
  | {
      type: 'reveal';
      player: EffectOwnerSelector;
      zone: Extract<GameZone, 'deck' | 'life' | 'hand'>;
      amount: number;
      storeAs?: string;
    }
  | {
      type: 'search';
      player: EffectOwnerSelector;
      sourceZone: Extract<GameZone, 'deck' | 'trash'>;
      amount: number;
      filter: EffectCardFilter;
      count: EffectCount;
      destination: Extract<GameZone, 'hand' | 'characters' | 'trash'>;
      restDestination?: Extract<GameZone, 'deck' | 'trash'>;
      restToBottom?: boolean;
    }
  | {
      type: 'moveCard';
      selector: EffectTargetSelector;
      destinationPlayer: EffectOwnerSelector | 'selectedCardOwner';
      destinationZone: GameZone;
      faceDown?: boolean;
      rested?: boolean;
    }
  | {
      type: 'moveFirstCard';
      selector: EffectTargetSelector;
      destinationPlayer: EffectOwnerSelector | 'selectedCardOwner';
      destinationZone: GameZone;
      faceDown?: boolean;
      rested?: boolean;
    }
  | {
      type: 'modifyPower';
      selector: EffectTargetSelector;
      amount: number;
      duration: EffectDuration;
      description?: string;
    }
  | {
      type: 'grantKeywords';
      selector: EffectTargetSelector;
      keywords: EffectKeyword[];
      duration: EffectDuration;
    }
  | {
      type: 'restrictAttack';
      selector: EffectTargetSelector;
      turns: number;
    }
  | {
      type: 'activateEffect';
      cardId: string;
      effectId: string;
    }
  | {
      type: 'attachDon';
      selector: EffectTargetSelector;
      player: EffectOwnerSelector;
      amount: number;
      rested?: boolean;
    }
  | {
      type: 'detachDon';
      selector: EffectTargetSelector;
      amount: number;
    }
  | {
      type: 'shuffleDeck';
      player: EffectOwnerSelector;
    }
  | {
      type: 'arrangeDeckWindow';
      player: EffectOwnerSelector;
      amount: number;
    }
  | {
      type: 'revealTopAndPlayIfMatches';
      player: EffectOwnerSelector;
      filter: EffectCardFilter;
      destination: 'characters' | 'stage';
      rested?: boolean;
    }
  | {
      type: 'storeSelectedCards';
      key: string;
      selector: EffectTargetSelector;
    }
  | {
      type: 'revealStoredCards';
      key: string;
    }
  | {
      type: 'moveStoredCards';
      key: string;
      destinationPlayer: EffectOwnerSelector | 'selectedCardOwner';
      destinationZone: GameZone;
      faceDown?: boolean;
      rested?: boolean;
    }
  | {
      type: 'ifStoredSelectionMatches';
      key: string;
      filter: EffectCardFilter;
      actions: EffectAction[];
    };

export type StandardEffectDefinition = {
  id: string;
  text: string;
  trigger: EffectTrigger;
  conditions?: EffectCondition[];
  costs?: EffectAction[];
  actions: EffectAction[];
};

export type ContinuousEffectDefinition = {
  id: string;
  text: string;
  conditions?: EffectCondition[];
  modifier: {
    selector: EffectTargetSelector;
    power?: number;
    cost?: number;
    powerPerCount?:
      | {
          selector: EffectTargetSelector;
          amount: number;
          divisor?: number;
        }
      | undefined;
    keywords?: EffectKeyword[];
  };
};

export type ReplacementEffectDefinition = {
  id: string;
  text: string;
  event: 'wouldKoCharacter' | 'wouldMoveCard';
  optional?: boolean;
  conditions?: EffectCondition[];
  replacement: EffectAction[];
  priority?: number;
};

export type CardEffectDefinition = {
  cardId: string;
  standard?: StandardEffectDefinition[];
  continuous?: ContinuousEffectDefinition[];
  replacements?: ReplacementEffectDefinition[];
  specialHandlerId?: string;
};
