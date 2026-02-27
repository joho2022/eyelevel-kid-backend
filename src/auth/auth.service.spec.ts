import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * refresh 테스트
   */
  describe('refresh', () => {
    it('refresh token이 일치하면 새로운 access token 발급', async () => {
      const userId = 1;
      const refreshToken = 'validRefreshToken';

      const hashedToken = await bcrypt.hash(refreshToken, 10);

      mockJwtService.verify.mockReturnValue({ sub: userId });

      mockPrisma.refreshToken.findMany.mockResolvedValue([
        { id: 1, token: hashedToken, userId },
      ]);

      mockJwtService.sign.mockReturnValue('newAccessToken');

      const result = await authService.refresh(refreshToken);

      expect(result).toEqual({
        accessToken: 'newAccessToken',
      });

      expect(mockJwtService.verify).toHaveBeenCalled();
      expect(mockJwtService.sign).toHaveBeenCalled();
    });
  });

  /**
   * 회원 탈퇴 테스트
   */
  describe('withdraw', () => {
    it('user 삭제가 호출되는지 확인', async () => {
      mockPrisma.user.delete.mockResolvedValue({});

      await authService.withdraw(1);

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
