import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import type { DescribedRoomListResponse } from '@onepiecetcg/shared';
import { listDescribedDuelRooms } from './lobby';

@UseGuards(AuthGuard)
@Controller('lobby')
export class LobbyController {
  @Get('rooms')
  listDescribedRooms(): Promise<DescribedRoomListResponse> {
    return listDescribedDuelRooms();
  }
}
