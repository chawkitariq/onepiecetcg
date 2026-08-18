import { randomInt } from 'node:crypto';

const DISPLAY_NAME_ALPHABET =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
const DISPLAY_NAME_LENGTH = 12;

function pickRandomCharacter(): string {
  return DISPLAY_NAME_ALPHABET[randomInt(DISPLAY_NAME_ALPHABET.length)]!;
}

/**
 * Creates a random display name for anonymous or fallback users.
 *
 * The output is intentionally plain and wordless so it does not look like a
 * predefined pseudo.
 */
export function createRandomDisplayName(): string {
  return Array.from({ length: DISPLAY_NAME_LENGTH }, pickRandomCharacter).join(
    '',
  );
}
