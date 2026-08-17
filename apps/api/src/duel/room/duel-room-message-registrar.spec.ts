import { registerDuelRoomMessages } from './duel-room-message-registrar';

describe('duel-room-message-registrar', () => {
  it('registers every duel room message and forwards callbacks', () => {
    const handlers = new Map<
      string,
      (client: unknown, message: unknown) => void
    >();
    const room = {
      onMessage: jest.fn(
        (
          type: string,
          callback: (client: unknown, message: unknown) => void,
        ) => {
          handlers.set(type, callback);
        },
      ),
    };
    const handleChooseFirstOrSecond = jest.fn();
    const handleMulligan = jest.fn();
    const handleEndPhase = jest.fn();
    const handlePlayCard = jest.fn();
    const handleAttachDon = jest.fn();
    const handleDeclareAttack = jest.fn();
    const handleDeclareBlock = jest.fn();
    const handleDeclareCounter = jest.fn();
    const handleFinishCounterStep = jest.fn();
    const handleResolveTrigger = jest.fn();
    const handleResolveEffectDecision = jest.fn();
    const client = { sessionId: 'session-a' };

    registerDuelRoomMessages({
      room,
      handleChooseFirstOrSecond,
      handleMulligan,
      handleEndPhase,
      handlePlayCard,
      handleAttachDon,
      handleDeclareAttack,
      handleDeclareBlock,
      handleDeclareCounter,
      handleFinishCounterStep,
      handleResolveTrigger,
      handleResolveEffectDecision,
    });

    expect(room.onMessage).toHaveBeenCalledTimes(11);
    expect(Array.from(handlers.keys())).toEqual([
      'chooseFirstOrSecond',
      'mulligan',
      'endPhase',
      'playCard',
      'attachDon',
      'declareAttack',
      'declareBlock',
      'declareCounter',
      'finishCounterStep',
      'resolveTrigger',
      'resolveEffectDecision',
    ]);

    handlers.get('chooseFirstOrSecond')?.(client, { choice: 'first' });
    handlers.get('mulligan')?.(client, { mulligan: true });
    handlers.get('endPhase')?.(client, undefined);
    handlers.get('playCard')?.(client, { instanceId: 'card-1' });
    handlers.get('attachDon')?.(client, { target: 'leader', count: 1 });
    handlers.get('declareAttack')?.(client, {
      attackerInstanceId: 'attacker-1',
      targetType: 'leader',
    });
    handlers.get('declareBlock')?.(client, { blockerInstanceId: 'blocker-1' });
    handlers.get('declareCounter')?.(client, {
      discardInstanceId: 'counter-1',
    });
    handlers.get('finishCounterStep')?.(client, undefined);
    handlers.get('resolveTrigger')?.(client, { activate: true });
    handlers.get('resolveEffectDecision')?.(client, {
      selectedCardInstanceIds: ['card-1'],
      confirmed: true,
    });

    expect(handleChooseFirstOrSecond).toHaveBeenCalledWith(client, {
      choice: 'first',
    });
    expect(handleMulligan).toHaveBeenCalledWith(client, { mulligan: true });
    expect(handleEndPhase).toHaveBeenCalledWith(client);
    expect(handlePlayCard).toHaveBeenCalledWith(client, {
      instanceId: 'card-1',
    });
    expect(handleAttachDon).toHaveBeenCalledWith(client, {
      target: 'leader',
      count: 1,
    });
    expect(handleDeclareAttack).toHaveBeenCalledWith(client, {
      attackerInstanceId: 'attacker-1',
      targetType: 'leader',
    });
    expect(handleDeclareBlock).toHaveBeenCalledWith(client, {
      blockerInstanceId: 'blocker-1',
    });
    expect(handleDeclareCounter).toHaveBeenCalledWith(client, {
      discardInstanceId: 'counter-1',
    });
    expect(handleFinishCounterStep).toHaveBeenCalledWith(client);
    expect(handleResolveTrigger).toHaveBeenCalledWith(client, {
      activate: true,
    });
    expect(handleResolveEffectDecision).toHaveBeenCalledWith(client, {
      selectedCardInstanceIds: ['card-1'],
      confirmed: true,
    });
  });
});
