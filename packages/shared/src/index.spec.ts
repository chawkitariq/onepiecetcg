import { describe, expect, it } from 'vitest';
import { parseDeckText } from './index.js';

describe('parseDeckText', () => {
  it('parses the leader line and normalizes main deck quantities', () => {
    const result = parseDeckText(
      ['1xL-001', '4xC-001', '2x c-001', '4xC-002'].join('\n'),
      'Import',
    );

    expect(result.payload).toEqual({
      name: 'Import',
      leaderCardId: 'L-001',
      cards: [
        { cardId: 'C-001', quantity: 6 },
        { cardId: 'C-002', quantity: 4 },
      ],
    });
    expect(result.invalidLines).toEqual([]);
  });

  it('surfaces invalid lines with their 1-based line number instead of dropping them silently', () => {
    const result = parseDeckText(
      ['1xL-001', '4xC-001', 'not a line', '', '4xC-002', '4x'].join('\n'),
      'Import',
    );

    expect(result.invalidLines).toEqual([
      { line: 3, raw: 'not a line' },
      { line: 6, raw: '4x' },
    ]);
    expect(result.payload.cards).toEqual([
      { cardId: 'C-001', quantity: 4 },
      { cardId: 'C-002', quantity: 4 },
    ]);
  });

  it('treats a missing or malformed leader line as no leader selected, without treating it as invalid', () => {
    const result = parseDeckText(['2xL-001', '4xC-001'].join('\n'), 'Import');

    expect(result.payload.leaderCardId).toBe('');
    expect(result.invalidLines).toEqual([]);
  });

  it('ignores blank lines without flagging them as invalid', () => {
    const result = parseDeckText(
      ['1xL-001', '', '  ', '4xC-001'].join('\n'),
      'Import',
    );

    expect(result.invalidLines).toEqual([]);
    expect(result.payload.cards).toEqual([{ cardId: 'C-001', quantity: 4 }]);
  });
});
