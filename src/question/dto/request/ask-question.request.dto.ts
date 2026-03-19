import { AnswerStyle } from '@prisma/client';

import { IsString, IsEnum } from 'class-validator';

export class AskQuestionRequestDto {
  @IsString()
  question: string;

  @IsEnum(AnswerStyle)
  style: AnswerStyle;
}
