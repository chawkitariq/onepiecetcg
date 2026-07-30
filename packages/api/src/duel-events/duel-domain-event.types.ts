/**
 * Stable business identity for a duel participant. Event contracts use this
 * instead of transient Colyseus session identifiers.
 */
export type PlayerId = string;

/**
 * Draft domain event emitted by gameplay code before infrastructure metadata
 * such as sequence numbers and timestamps are attached.
 */
export type DomainEventDraft<
  TType extends string = string,
  TPayload = Record<string, unknown>,
> = {
  type: TType;
  version: number;
  payload: TPayload;
};

/**
 * Canonical persisted event enriched with technical metadata by the recorder.
 */
export type CanonicalDomainEvent<
  TType extends string = string,
  TPayload = Record<string, unknown>,
> = {
  eventId: string;
  eventType: TType;
  eventVersion: number;
  matchId: string;
  sequenceNumber: number;
  occurredAt: string;
  recordedAt: string;
  actorPlayerId?: PlayerId;
  correlationId: string;
  causationId: string;
  transactionId: string;
  engineVersion: string;
  rulesetVersion: string;
  payload: TPayload;
};

/**
 * Persisted metadata stored alongside the event payload in the outbox.
 */
export type CanonicalDomainEventMetadata = Omit<
  CanonicalDomainEvent,
  'eventType' | 'eventVersion' | 'matchId' | 'sequenceNumber' | 'payload'
>;

/**
 * Input accepted by the recorder once gameplay validation has already
 * completed and the event drafts are ready to be persisted.
 */
export type RecordValidatedDuelEventsInput = {
  matchId: string;
  actorPlayerId?: PlayerId;
  commandId: string;
  actionId: string;
  eventDrafts: DomainEventDraft[];
  engineVersion: string;
  rulesetVersion: string;
};

/**
 * Result returned by the recorder after drafts were converted, sequenced, and
 * inserted into the outbox.
 */
export type RecordedDuelEvents = {
  events: CanonicalDomainEvent[];
  lastSequenceNumber: number;
};

/**
 * Payload used to atomically create a new duel event stream with its initial
 * `MatchCreated` event.
 */
export type CreateDuelEventStreamInput = {
  matchId: string;
  actorPlayerId?: PlayerId;
  engineVersion: string;
  rulesetVersion: string;
  matchCreatedPayload: Record<string, unknown>;
};

/**
 * Query input for read-side consumers that want the ordered published event
 * stream for a match.
 */
export type ListPublishedDuelEventsInput = {
  matchId: string;
  afterSequenceNumber?: number;
  limit?: number;
};
