import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import request from 'supertest';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('AuthController (단위 테스트)', () => {
  let app: INestApplication;

  // MARK: - Mock Service

  const mockAuthService = {
    socialLogin: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    withdraw: jest.fn(),
  };

  // MARK: - Mock Guard

  class MockJwtAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext) {
      const req = context.switchToHttp().getRequest();
      req.user = { userId: 1 }; // 가짜 로그인 사용자 주입
      return true;
    }
  }

  // MARK: - Setup

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  // MARK: - Teardown

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // MARK: - POST /auth/social-login

  describe('POST /auth/social-login', () => {
    it('정상 요청이면 201과 토큰을 반환해야 한다', async () => {
      mockAuthService.socialLogin.mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        isNewUser: false,
      });

      const res = await request(app.getHttpServer())
        .post('/auth/social-login')
        .send({
          provider: 'google',
          idToken: 'mock',
        })
        .expect(201);

      expect(res.body.accessToken).toBe('access');
      expect(mockAuthService.socialLogin).toHaveBeenCalled();
    });

    it('provider가 잘못되면 400을 반환해야 한다', async () => {
      await request(app.getHttpServer())
        .post('/auth/social-login')
        .send({
          provider: 'invalid',
          idToken: 'mock',
        })
        .expect(400);
    });

    it('idToken이 없으면 400을 반환해야 한다', async () => {
      await request(app.getHttpServer())
        .post('/auth/social-login')
        .send({
          provider: 'google',
        })
        .expect(400);
    });
  });

  // MARK: - POST /auth/refresh

  describe('POST /auth/refresh', () => {
    it('정상 요청이면 새로운 access 토큰을 반환해야 한다', async () => {
      mockAuthService.refresh.mockResolvedValue({
        accessToken: 'newAccess',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'valid' })
        .expect(201);

      expect(res.body.accessToken).toBe('newAccess');
    });

    it('refreshToken이 없으면 400을 반환해야 한다', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .expect(400);
    });
  });

  // MARK: - POST /auth/logout

  describe('POST /auth/logout', () => {
    it('Guard 통과 시 201을 반환해야 한다', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer mock')
        .send({ refreshToken: 'test' })
        .expect(201);
    });
  });

  // MARK: - DELETE /auth/withdraw

  describe('DELETE /auth/withdraw', () => {
    it('Guard 통과 시 200을 반환해야 한다', async () => {
      mockAuthService.withdraw.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/auth/withdraw')
        .set('Authorization', 'Bearer mock')
        .expect(200);
    });
  });
});
