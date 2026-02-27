// src/auth/auth.controller.ts

import { Body, Controller, Post, Delete, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SocialLoginDto } from './dto/request/social-login.dto';
import { RefreshDto } from './dto/request/refresh.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // MARK: - Social Login
  @Post('social-login')
  login(@Body() dto: SocialLoginDto) {
    return this.authService.socialLogin(dto.provider, dto.idToken);
  }

  // MARK: - Refresh
  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  // MARK: - Logout
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req, @Body() dto: RefreshDto) {
    return this.authService.logout(req.user.userId, dto.refreshToken);
  }

  // MARK: - Withdraw
  @UseGuards(JwtAuthGuard)
  @Delete('withdraw')
  withdraw(@Req() req) {
    return this.authService.withdraw(req.user.userId);
  }
}
