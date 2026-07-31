import type { ArraySchema } from '@colyseus/schema';

/**
 * Inserts a value at the front of an `ArraySchema` while preserving Colyseus
 * parent/ChangeTree wiring.
 */
export function unshiftIntoArraySchema<T>(
  zone: ArraySchema<T>,
  value: T,
): void {
  zone.push(value);
  zone.move(() => {
    for (let index = zone.length - 1; index > 0; index -= 1) {
      [zone[index], zone[index - 1]] = [zone[index - 1], zone[index]];
    }
  });
}

/**
 * Shuffles an array-like card collection in place using Fisher-Yates.
 */
export function shuffleArrayLike<T>(
  values: {
    length: number;
    [index: number]: T | undefined;
  },
): void {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.floor(Math.random() * (index + 1));
    const current = values[index];
    const other = values[otherIndex];

    if (current && other) {
      values[index] = other;
      values[otherIndex] = current;
    }
  }
}
