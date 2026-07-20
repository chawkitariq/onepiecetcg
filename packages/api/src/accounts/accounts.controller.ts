import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import type { Request } from 'express';
import { AccountsService, type AuthenticatedUser } from './accounts.service';

type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

@Controller()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  async getCurrentProfile(@Req() request: AuthenticatedRequest) {
    const account = await this.accountsService.findOrCreateForAuthUser(
      request.user,
    );

    return {
      authenticated: true,
      user: {
        id: request.user.id,
        name: request.user.name ?? null,
        email: request.user.email ?? null,
        image: request.user.image ?? null,
      },
      profile: {
        id: account.id,
        displayName: account.displayName,
        email: account.email,
        image: account.image,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      },
    };
  }

  @UseGuards(AuthGuard)
  @Get('private/auth-check')
  getPrivateAuthCheck() {
    return { ok: true };
  }
}
