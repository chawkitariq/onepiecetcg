import { createRandomDisplayName } from './display-name';

describe('createRandomDisplayName', () => {
  it('creates a 12-character alphanumeric display name', () => {
    const displayName = createRandomDisplayName();

    expect(displayName).toHaveLength(12);
    expect(displayName).toMatch(/^[A-Za-z0-9]+$/);
  });
});
