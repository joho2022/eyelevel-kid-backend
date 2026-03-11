import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class AiGuardService {
  validateQuestion(question: string) {
    if (!question || question.trim().length === 0) {
      throw new BadRequestException('질문이 비어있습니다.');
    }

    if (question.length > 200) {
      throw new BadRequestException('질문은 200자 이하로 입력해주세요.');
    }
  }
}
