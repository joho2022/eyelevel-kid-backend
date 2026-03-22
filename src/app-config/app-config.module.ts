import { Module } from '@nestjs/common';
import { AppConfigController } from './app-config.controller';
import { AppConfigService } from './app-config.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AdminSecretGuard } from './admin-secret.guard';

@Module({
  imports: [PrismaModule],
  controllers: [AppConfigController],
  providers: [AppConfigService, AdminSecretGuard],
})
export class AppConfigModule {}
