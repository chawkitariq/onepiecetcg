/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from '@jest/globals';
import {
  createOncePerTurnKey,
  hasResolvedOncePerTurn,
  markResolvedOncePerTurn,
  scheduleTurnEndEffect,
} from './special-handler-utils';

describe('special handler utilities', () => {
  it('builds stable once-per-turn keys', () => {
    expect(createOncePerTurnKey('src-1', 'op07-029', 4)).toBe(
      'src-1:op07-029:4',
    );
  });

  it('tracks once-per-turn resolutions on the provided engine state', () => {
    const engine = { resolvedOncePerTurnKeys: new Set<string>() };

    expect(hasResolvedOncePerTurn(engine, 'src-1', 'op07-029', 4)).toBe(false);

    markResolvedOncePerTurn(engine, 'src-1', 'op07-029', 4);

    expect(hasResolvedOncePerTurn(engine, 'src-1', 'op07-029', 4)).toBe(true);
  });

  it('schedules a turn-end follow-up effect', () => {
    let callCount = 0;
    const resolve = () => {
      callCount += 1;
    };
    const engine: { delayedEffects?: Array<{ resolve: () => void }> } = {};

    scheduleTurnEndEffect(engine, 'src-1', resolve);

    expect(engine.delayedEffects).toHaveLength(1);
    expect(engine.delayedEffects?.[0]).toMatchObject({
      trigger: { type: 'onTurnEnd' },
      sourceInstanceId: 'src-1',
    });

    engine.delayedEffects?.[0]?.resolve();
    expect(callCount).toBe(1);
  });
});
