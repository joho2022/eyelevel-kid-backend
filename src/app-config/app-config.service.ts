import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AppConfigResponseDto,
  AppMessageDto,
} from './dto/request/app-config.response.dto';
import { UpdateAppConfigRequestDto } from './dto/response/update-app-config.request.dto';

@Injectable()
export class AppConfigService {
  constructor(private readonly prisma: PrismaService) {}

  // MARK: - 앱 설정 1건 보장
  private async getOrCreateConfig() {
    const existing = await this.prisma.appConfig.findFirst({
      orderBy: { id: 'asc' },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.appConfig.create({
      data: {},
    });
  }

  // MARK: - 앱 설정 조회
  async getAppConfig(): Promise<AppConfigResponseDto> {
    const config = await this.getOrCreateConfig();

    return this.toResponseDto(config);
  }

  // MARK: - 앱 설정 수정
  async updateAppConfig(
    dto: UpdateAppConfigRequestDto,
  ): Promise<AppConfigResponseDto> {
    const config = await this.getOrCreateConfig();

    const updated = await this.prisma.appConfig.update({
      where: { id: config.id },
      data: {
        ...(dto.minimumVersion !== undefined && {
          minimumVersion: dto.minimumVersion,
        }),
        ...(dto.latestVersion !== undefined && {
          latestVersion: dto.latestVersion,
        }),
        ...(dto.messageShow !== undefined && {
          messageShow: dto.messageShow,
        }),
        ...(dto.messageTitle !== undefined && {
          messageTitle: dto.messageTitle,
        }),
        ...(dto.messageBody !== undefined && {
          messageBody: dto.messageBody,
        }),
        ...(dto.messageBlocking !== undefined && {
          messageBlocking: dto.messageBlocking,
        }),
      },
    });

    return this.toResponseDto(updated);
  }

  // MARK: - DTO 변환
  private toResponseDto(config: {
    minimumVersion: string;
    latestVersion: string;
    messageShow: boolean;
    messageTitle: string | null;
    messageBody: string | null;
    messageBlocking: boolean;
  }): AppConfigResponseDto {
    return new AppConfigResponseDto({
      minimumVersion: config.minimumVersion,
      latestVersion: config.latestVersion,
      message: new AppMessageDto(
        config.messageShow,
        config.messageTitle,
        config.messageBody,
        config.messageBlocking,
      ),
    });
  }
}
