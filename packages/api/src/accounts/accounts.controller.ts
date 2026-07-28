import { Controller, Delete, Get, Req, UseGuards } from '@nestjs/common';
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
        isAnonymous: request.user.isAnonymous ?? false,
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

  /** Permanently deletes the authenticated account and its owned data. */
  @UseGuards(AuthGuard)
  @Delete('me')
  deleteCurrentAccount(@Req() request: AuthenticatedRequest) {
    return this.accountsService.deleteAccountForAuthUser(request.user);
  }
}
