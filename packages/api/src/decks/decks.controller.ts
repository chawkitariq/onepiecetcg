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
import type { Request } from 'express';
import type { AuthenticatedUser } from '../accounts/accounts.service';
import { DeckIdParamDto, DeckPayloadDto, ImportDeckTextDto } from './deck.dto';
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
  get(@Req() request: AuthenticatedRequest, @Param() params: DeckIdParamDto) {
    return this.decksService.get(request.user, params.id);
  }

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() payload: DeckPayloadDto,
  ) {
    return this.decksService.create(request.user, payload);
  }

  @Put(':id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param() params: DeckIdParamDto,
    @Body() payload: DeckPayloadDto,
  ) {
    return this.decksService.update(request.user, params.id, payload);
  }

  @Delete(':id')
  remove(
    @Req() request: AuthenticatedRequest,
    @Param() params: DeckIdParamDto,
  ) {
    return this.decksService.remove(request.user, params.id);
  }

  @Post('validate')
  validate(@Body() payload: DeckPayloadDto) {
    return this.decksService.validate(payload);
  }

  @Post('import')
  importText(@Body() body: ImportDeckTextDto) {
    return this.decksService.importText(body.text, body.name);
  }
}
