import { Question } from '@prisma/client';

export class QuestionResponseDto {
  id: number;
  title: string;
  answer: string;
  style: string;
  isBookmarked: boolean;
  createdAt: Date;

  constructor(question: Question) {
    this.id = question.id;
    this.title = question.title;
    this.answer = question.answer;
    this.style = question.style;
    this.isBookmarked = question.isBookmarked;
    this.createdAt = question.createdAt;
  }
}
