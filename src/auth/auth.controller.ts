// src/auth/auth.controller.ts

import {
  Body,
  Controller,
  Post,
  Delete,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
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
  @HttpCode(204)
  logout(@Req() req, @Body() dto: RefreshDto) {
    console.log('logout user', req.user);
    console.log('logout body', dto);

    return this.authService.logout(req.user.sub, dto.refreshToken);
  }

  // MARK: - Withdraw
  @UseGuards(JwtAuthGuard)
  @Delete('withdraw')
  @HttpCode(204)
  withdraw(@Req() req) {
    return this.authService.withdraw(req.user.sub);
  }
}
