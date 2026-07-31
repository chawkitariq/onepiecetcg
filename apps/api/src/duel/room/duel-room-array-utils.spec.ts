import { ArraySchema } from '@colyseus/schema';
import {
  shuffleArrayLike,
  unshiftIntoArraySchema,
} from './duel-room-array-utils';

describe('duel-room-array-utils', () => {
  it('prepends into an ArraySchema while keeping order intact', () => {
    const zone = new ArraySchema<string>('b', 'c');

    unshiftIntoArraySchema(zone, 'a');

    expect(Array.from(zone)).toEqual(['a', 'b', 'c']);
  });

  it('shuffles an array-like collection in place', () => {
    const values: {
      length: number;
      [index: number]: string | undefined;
    } = ['a', 'b', 'c', 'd'];

    const randomSpy = jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.75)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.25);

    shuffleArrayLike(values);

    expect(values).toEqual(['c', 'a', 'b', 'd']);

    randomSpy.mockRestore();
  });
});
