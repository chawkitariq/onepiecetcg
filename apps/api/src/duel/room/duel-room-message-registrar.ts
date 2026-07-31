import type {
  EffectDecisionResponse,
  FirstOrSecondChoice,
} from '@onepiecetcg/shared';
import type { Client } from 'colyseus';

export type ChooseFirstOrSecondMessage = {
  choice: FirstOrSecondChoice;
};

export type MulliganMessage = {
  mulligan: boolean;
};

export type PlayCardMessage = {
  instanceId: string;
  discardCharacterInstanceId?: string;
};

export type AttachDonMessage = {
  target: 'leader' | 'character';
  targetInstanceId?: string;
  count?: number;
};

export type DeclareAttackMessage = {
  attackerInstanceId: string;
  targetType: 'leader' | 'character';
  targetInstanceId?: string;
};

export type DeclareBlockMessage = {
  blockerInstanceId?: string | null;
};

export type DeclareCounterMessage = {
  discardInstanceId: string;
  counterPowerBonus: number;
};

export type ResolveTriggerMessage = {
  activate: boolean;
};

export type ResolveEffectDecisionMessage = EffectDecisionResponse;

type DuelRoomMessageRegistrar = Pick<RoomMessageReceiver, 'onMessage'>;

type RoomMessageReceiver = {
  onMessage: <T>(
    type: string,
    callback: (client: Client, message: T) => void,
  ) => void;
};

/**
 * Handlers needed to bind the Colyseus room message protocol.
 */
export type RegisterDuelRoomMessagesInput = {
  room: DuelRoomMessageRegistrar;
  handleChooseFirstOrSecond: (
    client: Client,
    message: ChooseFirstOrSecondMessage,
  ) => Promise<void> | void;
  handleMulligan: (
    client: Client,
    message: MulliganMessage,
  ) => Promise<void> | void;
  handleEndPhase: (client: Client) => Promise<void> | void;
  handlePlayCard: (
    client: Client,
    message: PlayCardMessage,
  ) => Promise<void> | void;
  handleAttachDon: (
    client: Client,
    message: AttachDonMessage,
  ) => Promise<void> | void;
  handleDeclareAttack: (
    client: Client,
    message: DeclareAttackMessage,
  ) => Promise<void> | void;
  handleDeclareBlock: (
    client: Client,
    message: DeclareBlockMessage,
  ) => Promise<void> | void;
  handleDeclareCounter: (
    client: Client,
    message: DeclareCounterMessage,
  ) => Promise<void> | void;
  handleFinishCounterStep: (client: Client) => Promise<void> | void;
  handleResolveTrigger: (
    client: Client,
    message: ResolveTriggerMessage,
  ) => Promise<void> | void;
  handleResolveEffectDecision: (
    client: Client,
    message: ResolveEffectDecisionMessage,
  ) => Promise<void> | void;
};

/**
 * Registers the duel room's Colyseus message handlers in one place so the
 * room boot sequence can stay focused on high-level orchestration.
 */
export function registerDuelRoomMessages(
  input: RegisterDuelRoomMessagesInput,
): void {
  input.room.onMessage(
    'chooseFirstOrSecond',
    (client: Client, message: ChooseFirstOrSecondMessage) => {
      void input.handleChooseFirstOrSecond(client, message);
    },
  );

  input.room.onMessage(
    'mulligan',
    (client: Client, message: MulliganMessage) => {
      void input.handleMulligan(client, message);
    },
  );

  input.room.onMessage('endPhase', (client: Client) => {
    void input.handleEndPhase(client);
  });

  input.room.onMessage(
    'playCard',
    (client: Client, message: PlayCardMessage) => {
      void input.handlePlayCard(client, message);
    },
  );

  input.room.onMessage(
    'attachDon',
    (client: Client, message: AttachDonMessage) => {
      void input.handleAttachDon(client, message);
    },
  );

  input.room.onMessage(
    'declareAttack',
    (client: Client, message: DeclareAttackMessage) => {
      void input.handleDeclareAttack(client, message);
    },
  );

  input.room.onMessage(
    'declareBlock',
    (client: Client, message: DeclareBlockMessage) => {
      void input.handleDeclareBlock(client, message);
    },
  );

  input.room.onMessage(
    'declareCounter',
    (client: Client, message: DeclareCounterMessage) => {
      void input.handleDeclareCounter(client, message);
    },
  );

  input.room.onMessage('finishCounterStep', (client: Client) => {
    void input.handleFinishCounterStep(client);
  });

  input.room.onMessage(
    'resolveTrigger',
    (client: Client, message: ResolveTriggerMessage) => {
      void input.handleResolveTrigger(client, message);
    },
  );

  input.room.onMessage(
    'resolveEffectDecision',
    (client: Client, message: ResolveEffectDecisionMessage) => {
      void input.handleResolveEffectDecision(client, message);
    },
  );
}
