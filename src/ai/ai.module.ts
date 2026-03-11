import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiGuardService } from './ai.guard.service';

@Module({
  providers: [AiService, AiGuardService],
  exports: [AiService, AiGuardService],
})
export class AiModule {}
