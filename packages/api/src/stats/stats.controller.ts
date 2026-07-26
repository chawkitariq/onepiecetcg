import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../accounts/accounts.service';
import { StatsService } from './stats.service';

type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

@UseGuards(AuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('me')
  getMyStats(@Req() request: AuthenticatedRequest) {
    return this.statsService.getStatsForUser(request.user);
  }
}
