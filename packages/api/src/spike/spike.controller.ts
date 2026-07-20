import { Controller, Get, Query } from '@nestjs/common';
import {
  AllowAnonymous,
  OptionalAuth,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { SpikeTypeormQueryDto } from './spike.dto';
import { SpikeService } from './spike.service';

@Controller('spike')
export class SpikeController {
  constructor(private readonly spikeService: SpikeService) {}

  @OptionalAuth()
  @Get('session')
  getSession(@Session() session?: UserSession) {
    return {
      authenticated: Boolean(session),
      user: session?.user ?? null,
    };
  }

  @AllowAnonymous()
  @Get('typeorm')
  persistAndRead(@Query() query: SpikeTypeormQueryDto) {
    return this.spikeService.persistAndRead(query.label);
  }
}
