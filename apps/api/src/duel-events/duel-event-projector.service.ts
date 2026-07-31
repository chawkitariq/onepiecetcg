import { Injectable } from '@nestjs/common';
import type { CanonicalDomainEvent } from './duel-domain-event.types';

export type EventViewerContext = {
  viewerType: 'PLAYER' | 'SPECTATOR' | 'THIRD_PARTY' | 'INTERNAL';
  playerId?: string;
  scopes: string[];
  matchEnded: boolean;
};

export type ExposedDomainEvent = Pick<
  CanonicalDomainEvent,
  | 'eventId'
  | 'eventType'
  | 'eventVersion'
  | 'matchId'
  | 'sequenceNumber'
  | 'occurredAt'
> & {
  payload: Record<string, unknown>;
};

/**
 * Projects canonical duel events into a consumer-safe view. The current event
 * catalog emitted by the room does not yet carry hidden-card identities, but
 * this projector is the mandatory boundary for future confidential payloads.
 */
@Injectable()
export class DuelEventProjectorService {
  /** Projects one canonical event for a specific viewer context. */
  public project(
    event: CanonicalDomainEvent,
    context: EventViewerContext,
  ): ExposedDomainEvent | null {
    if (context.viewerType === 'INTERNAL') {
      return {
        eventId: event.eventId,
        eventType: event.eventType,
        eventVersion: event.eventVersion,
        matchId: event.matchId,
        sequenceNumber: event.sequenceNumber,
        occurredAt: event.occurredAt,
        payload: event.payload,
      };
    }

    switch (event.eventType) {
      case 'MatchCreated':
      case 'PlayerJoined':
      case 'DeckLocked':
      case 'OpeningHandDrawn':
      case 'StartingPlayerDetermined':
      case 'MulliganRequested':
      case 'MulliganResolved':
      case 'MatchStarted':
      case 'MatchAborted':
      case 'TurnStarted':
      case 'PhaseChanged':
      case 'TurnEnded':
      case 'DonAdded':
      case 'CardPlayed':
      case 'CardDiscarded':
      case 'CostPaid':
      case 'DeckShuffled':
      case 'DonAttached':
      case 'DonDetached':
      case 'DonRested':
      case 'DonRefreshed':
      case 'AttackDeclared':
      case 'AttackTargetSelected':
      case 'BlockerDeclared':
      case 'CounterUsed':
      case 'BattleResolved':
      case 'AttackCancelled':
      case 'CharacterKOD':
      case 'DamageDealt':
      case 'ChoiceSubmitted':
      case 'PlayerConceded':
      case 'MatchEnded':
        return {
          eventId: event.eventId,
          eventType: event.eventType,
          eventVersion: event.eventVersion,
          matchId: event.matchId,
          sequenceNumber: event.sequenceNumber,
          occurredAt: event.occurredAt,
          payload: event.payload,
        };
      case 'CardRevealed':
      case 'CardMoved':
      case 'CardReturnedToHand':
      case 'CardPlacedOnDeck':
      case 'CardPlacedUnderCard':
      case 'CardAddedToLife':
        return {
          eventId: event.eventId,
          eventType: event.eventType,
          eventVersion: event.eventVersion,
          matchId: event.matchId,
          sequenceNumber: event.sequenceNumber,
          occurredAt: event.occurredAt,
          payload: this.projectCardVisibilityPayload(
            event.eventType,
            event.payload,
            context,
          ),
        };
      case 'CardDrawn':
        return {
          eventId: event.eventId,
          eventType: event.eventType,
          eventVersion: event.eventVersion,
          matchId: event.matchId,
          sequenceNumber: event.sequenceNumber,
          occurredAt: event.occurredAt,
          payload: this.isOwnerView(event.payload, context)
            ? event.payload
            : {
                playerId: event.payload.playerId,
                count: event.payload.count,
              },
        };
      case 'LifeCardTaken':
        return {
          eventId: event.eventId,
          eventType: event.eventType,
          eventVersion: event.eventVersion,
          matchId: event.matchId,
          sequenceNumber: event.sequenceNumber,
          occurredAt: event.occurredAt,
          payload: this.isOwnerView(event.payload, context)
            ? event.payload
            : {
                playerId: event.payload.playerId,
                count: event.payload.count,
                destinationZone: event.payload.destinationZone,
              },
        };
      default:
        return null;
    }
  }

  private projectCardVisibilityPayload(
    eventType: CanonicalDomainEvent['eventType'],
    payload: Record<string, unknown>,
    context: EventViewerContext,
  ): Record<string, unknown> {
    if (this.isOwnerView(payload, context)) {
      return payload;
    }

    const fromZone = payload.fromZone;
    const toZone = payload.toZone;

    if (
      fromZone === 'LIFE' ||
      fromZone === 'DECK' ||
      toZone === 'HAND' ||
      toZone === 'DECK' ||
      toZone === 'LIFE' ||
      (fromZone === 'LIFE' && toZone === 'TRASH')
    ) {
      return Object.fromEntries(
        Object.entries(payload).filter(
          ([key]) => key !== 'cardInstanceId' && key !== 'cardDefinitionId',
        ),
      );
    }

    if (
      eventType === 'CardReturnedToHand' ||
      eventType === 'CardPlacedOnDeck' ||
      eventType === 'CardAddedToLife'
    ) {
      return Object.fromEntries(
        Object.entries(payload).filter(
          ([key]) => key !== 'cardInstanceId' && key !== 'cardDefinitionId',
        ),
      );
    }

    return payload;
  }

  private isOwnerView(
    payload: Record<string, unknown>,
    context: EventViewerContext,
  ): boolean {
    return (
      context.viewerType === 'PLAYER' &&
      typeof context.playerId === 'string' &&
      payload.playerId === context.playerId
    );
  }
}
