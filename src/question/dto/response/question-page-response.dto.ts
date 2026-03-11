import { QuestionResponseDto } from './question.response.dto';

export class QuestionPageResponseDto {
  items: QuestionResponseDto[];
  nextCursor: string | null;
  hasNext: boolean;

  constructor(
    items: QuestionResponseDto[],
    nextCursor: string | null,
    hasNext: boolean,
  ) {
    this.items = items;
    this.nextCursor = nextCursor;
    this.hasNext = hasNext;
  }
}
