import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Provider } from '@prisma/client';
import { AuthProvider } from './enums/auth-provider.enum';
import { OAuth2Client } from 'google-auth-library';
import * as appleSignin from 'apple-signin-auth';
import bcrypt from 'bcrypt';
import { SocialLoginResponseDto } from './dto/response/social-login.response.dto';
import { RefreshResponseDto } from './dto/response/refresh.response.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  private readonly googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
  );

  private static readonly ACCESS_EXPIRE = '4h';
  private static readonly REFRESH_EXPIRE = '30d';
  private static readonly REFRESH_EXPIRE_MS = 30 * 24 * 60 * 60 * 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // MARK: - Social Login
  async socialLogin(
    provider: AuthProvider,
    idToken: string,
  ): Promise<SocialLoginResponseDto> {
    let socialId: string;

    // 소셜 토큰 검증
    if (provider === AuthProvider.google) {
      try {
        const ticket = await this.googleClient.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload?.sub) {
          throw new UnauthorizedException(
            '구글 페이로드에 식별 정보가 없습니다.',
          );
        }
        socialId = payload.sub;
      } catch (error) {
        if (error instanceof Error) {
          console.error('Google Auth Error:', error.message);
        } else {
          console.error('Google Auth Error:', error);
        }

        throw new UnauthorizedException('구글 인증에 실패했습니다.');
      }
    } else if (provider === AuthProvider.apple) {
      try {
        const payload = await appleSignin.verifyIdToken(idToken, {
          audience: process.env.APPLE_CLIENT_ID,
          issuer: 'https://appleid.apple.com',
        });

        if (!payload?.sub) {
          throw new UnauthorizedException(
            '애플 페이로드에 식별 정보가 없습니다.',
          );
        }
        socialId = payload.sub;
      } catch (error) {
        if (error instanceof Error) {
          console.error('Apple Auth Error:', error.message);
        } else {
          console.error('Apple Auth Error:', error);
        }

        throw new UnauthorizedException('애플 인증에 실패했습니다.');
      }
    } else {
      throw new BadRequestException('지원하지 않는 로그인 방식입니다.');
    }

    const prismaProvider = provider as Provider;

    // 기존 유저 조회
    let user = await this.prisma.user.findUnique({
      where: {
        socialId_provider: {
          socialId,
          provider: prismaProvider,
        },
      },
    });

    // 없으면 생성
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          socialId,
          provider: prismaProvider,
        },
      });
    }

    const accessToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: AuthService.ACCESS_EXPIRE,
      },
    );

    const jti = randomUUID();

    const refreshToken = this.jwtService.sign(
      { sub: user.id, jti },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: AuthService.REFRESH_EXPIRE,
      },
    );

    const hashed = await bcrypt.hash(refreshToken, 10);

    await this.prisma.refreshToken.create({
      data: {
        jti,
        token: hashed,
        userId: user.id,
        expiresAt: new Date(Date.now() + AuthService.REFRESH_EXPIRE_MS),
      },
    });

    return {
      accessToken,
      refreshToken,
      isNewUser: !user.nickname,
    };
  }

  // MARK: - Refresh
  async refresh(refreshToken: string): Promise<RefreshResponseDto> {
    let payload: { sub: number; jti: string };

    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }

    const token = await this.prisma.refreshToken.findUnique({
      where: { jti: payload.jti },
    });

    if (!token) {
      throw new UnauthorizedException('세션이 존재하지 않습니다.');
    }

    if (token.expiresAt < new Date()) {
      throw new UnauthorizedException('만료된 세션입니다.');
    }

    const match = await bcrypt.compare(refreshToken, token.token);

    if (!match) {
      throw new UnauthorizedException('토큰이 일치하지 않습니다.');
    }

    const newAccess = this.jwtService.sign(
      { sub: payload.sub },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: AuthService.ACCESS_EXPIRE,
      },
    );

    return { accessToken: newAccess };
  }

  // MARK: - Logout
  async logout(userId: number, refreshToken: string): Promise<void> {
    let payload: { sub: number; jti: string };

    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException();
    }

    const token = await this.prisma.refreshToken.findUnique({
      where: { jti: payload.jti },
    });

    if (!token || token.userId !== userId) {
      throw new UnauthorizedException();
    }

    await this.prisma.refreshToken.delete({
      where: { jti: payload.jti },
    });
  }

  // MARK: - Withdraw
  async withdraw(userId: number): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id: userId },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('존재하지 않는 유저입니다.');
      }

      console.error('Withdraw Error:', error);
      throw new InternalServerErrorException(
        '회원 탈퇴 처리 중 오류가 발생했습니다.',
      );
    }
  }
}
