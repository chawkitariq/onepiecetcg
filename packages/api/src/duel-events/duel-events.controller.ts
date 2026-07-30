import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import { DuelDomainEventsService } from './duel-domain-events.service';
import {
  DuelEventProjectorService,
  type ExposedDomainEvent,
} from './duel-event-projector.service';

@UseGuards(AuthGuard)
@Controller('duel-events')
export class DuelEventsController {
  public constructor(
    private readonly duelEvents: DuelDomainEventsService,
    private readonly projector: DuelEventProjectorService,
  ) {}

  /**
   * Returns the published event stream for one match after projection through
   * the safe third-party/public view.
   */
  @Get(':matchId/published')
  public async listPublishedEvents(
    @Param('matchId') matchId: string,
    @Query('afterSequenceNumber', new DefaultValuePipe(0), ParseIntPipe)
    afterSequenceNumber: number,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ): Promise<{ events: ExposedDomainEvent[] }> {
    const events = await this.duelEvents.listPublishedEvents({
      matchId,
      afterSequenceNumber,
      limit,
    });

    return {
      events: events.flatMap((event) => {
        const projected = this.projector.project(event, {
          viewerType: 'THIRD_PARTY',
          scopes: [],
          matchEnded: event.eventType === 'MatchEnded',
        });

        return projected ? [projected] : [];
      }),
    };
  }
}
