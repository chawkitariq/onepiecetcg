/**
 * Raised when gameplay code tries to append events to a match that never had
 * a stream created.
 */
export class DuelEventStreamNotFoundError extends Error {
  public constructor(matchId: string) {
    super(`Duel event stream not found for match ${matchId}.`);
    this.name = 'DuelEventStreamNotFoundError';
  }
}

/**
 * Raised when a stream already exists for the match being initialized.
 */
export class DuelEventStreamAlreadyExistsError extends Error {
  public constructor(matchId: string) {
    super(`Duel event stream already exists for match ${matchId}.`);
    this.name = 'DuelEventStreamAlreadyExistsError';
  }
}

/**
 * Raised when gameplay code tries to append events to a stream that has
 * already been closed normally or aborted.
 */
export class DuelEventStreamClosedError extends Error {
  public constructor(
    matchId: string,
    status: 'OPEN' | 'COMPLETED' | 'ABORTED',
  ) {
    super(`Duel event stream ${matchId} is closed with status ${status}.`);
    this.name = 'DuelEventStreamClosedError';
  }
}

/**
 * Raised when a draft references an event type or version that is not
 * registered for publication.
 */
export class UnsupportedDomainEventError extends Error {
  public constructor(type: string, version: number) {
    super(`Unsupported domain event ${type}@v${version}.`);
    this.name = 'UnsupportedDomainEventError';
  }
}
