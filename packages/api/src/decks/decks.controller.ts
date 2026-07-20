import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import type { DeckPayload } from '@onepiecetcg/shared';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../accounts/accounts.service';
import { DecksService } from './decks.service';

type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

@UseGuards(AuthGuard)
@Controller('decks')
export class DecksController {
  constructor(private readonly decksService: DecksService) {}

  @Get()
  async list(@Req() request: AuthenticatedRequest) {
    return { decks: await this.decksService.list(request.user) };
  }

  @Get(':id')
  get(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.decksService.get(request.user, id);
  }

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() payload: DeckPayload) {
    return this.decksService.create(request.user, payload);
  }

  @Put(':id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() payload: DeckPayload,
  ) {
    return this.decksService.update(request.user, id, payload);
  }

  @Delete(':id')
  remove(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.decksService.remove(request.user, id);
  }

  @Post('validate')
  validate(@Body() payload: DeckPayload) {
    return this.decksService.validate(payload);
  }

  @Post('import')
  importText(@Body() body: { text: string; name?: string }) {
    return this.decksService.importText(body.text ?? '', body.name);
  }
}
