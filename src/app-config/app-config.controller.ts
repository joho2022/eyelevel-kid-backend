import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AppConfigService } from './app-config.service';
import { AppConfigResponseDto } from './dto/request/app-config.response.dto';
import { AdminSecretGuard } from './admin-secret.guard';
import { UpdateAppConfigRequestDto } from './dto/response/update-app-config.request.dto';

@Controller('app')
export class AppConfigController {
  constructor(private readonly appConfigService: AppConfigService) {}

  // MARK: - 앱 설정 조회
  @Get('config')
  async getAppConfig(): Promise<AppConfigResponseDto> {
    return this.appConfigService.getAppConfig();
  }

  // MARK: - 앱 설정 수정
  @UseGuards(AdminSecretGuard)
  @Patch('config')
  async updateAppConfig(
    @Body() dto: UpdateAppConfigRequestDto,
  ): Promise<AppConfigResponseDto> {
    return this.appConfigService.updateAppConfig(dto);
  }
}
