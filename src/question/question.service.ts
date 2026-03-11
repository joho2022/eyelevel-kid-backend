import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AskQuestionRequestDto } from './dto/request/ask-question.request.dto';
import { QuestionResponseDto } from './dto/response/question.response.dto';
import { CalendarSummaryResponseDto } from './dto/response/calendar-summary.response.dto';
import { CalendarDayResponseDto } from './dto/response/calendar-day-summary.response.dto';
import { QuestionPageResponseDto } from './dto/response/question-page-response.dto';
import { AiService } from 'src/ai/ai.service';
import { AiGuardService } from 'src/ai/ai.guard.service';

@Injectable()
export class QuestionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly aiGuard: AiGuardService,
  ) {}

  // MARK: - 질문 생성
  async createQuestion(userId: number, dto: AskQuestionRequestDto) {
    // 질문 검증
    this.aiGuard.validateQuestion(dto.question);

    // AI 답변 생성
    const answer = await this.aiService.generateAnswer(dto.question, dto.style);

    // DB 저장
    const question = await this.prisma.question.create({
      data: {
        title: dto.question,
        answer: answer,
        style: dto.style,
        userId: userId,
      },
    });

    return new QuestionResponseDto(question);
  }

  // MARK: - 달력 질문 날짜 조회
  async getCalendarSummary(userId: number, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const questions = await this.prisma.question.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const dateSet = new Set<string>();

    for (const question of questions) {
      const date = new Date(
        question.createdAt.getFullYear(),
        question.createdAt.getMonth(),
        question.createdAt.getDate(),
      );

      dateSet.add(date.toISOString());
    }

    const dates = Array.from(dateSet);

    return new CalendarSummaryResponseDto(year, month, dates);
  }

  // MARK: - 특정 날짜 질문 조회
  async getQuestionsByDate(
    userId: number,
    year: number,
    month: number,
    day: number,
  ) {
    const start = new Date(year, month - 1, day);
    const end = new Date(year, month - 1, day, 23, 59, 59);

    const questions = await this.prisma.question.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const date = start.toISOString();

    return new CalendarDayResponseDto(date, questions);
  }

  // MARK: - 질문 목록 조회 (cursor pagination)
  async getQuestions(userId: number, cursor?: string, limit = 20) {
    const questions = await this.prisma.question.findMany({
      where: {
        userId: userId,
      },

      orderBy: {
        createdAt: 'desc',
      },

      take: limit + 1,

      ...(cursor && {
        cursor: {
          id: Number(cursor),
        },
        skip: 1,
      }),
    });

    // 다음 페이지 존재 여부
    const hasNext = questions.length > limit;

    const items = questions.slice(0, limit);

    const nextCursor = hasNext ? String(items[items.length - 1].id) : null;

    return new QuestionPageResponseDto(
      items.map((q) => new QuestionResponseDto(q)),
      nextCursor,
      hasNext,
    );
  }

  // MARK: - 북마크 토글
  async toggleBookmark(userId: number, questionId: number) {
    // 해당 질문이 존재하는지 확인
    const question = await this.prisma.question.findFirst({
      where: {
        id: questionId,
        userId: userId,
      },
    });

    if (!question) {
      throw new NotFoundException('질문이 존재하지 않습니다.');
    }

    // 북마크 상태 토글
    const updatedQuestion = await this.prisma.question.update({
      where: {
        id: questionId,
      },
      data: {
        isBookmarked: !question.isBookmarked,
      },
    });

    return new QuestionResponseDto(updatedQuestion);
  }

  // MARK: - 질문 삭제
  async deleteQuestion(userId: number, questionId: number) {
    // 해당 질문 존재 여부 확인
    const question = await this.prisma.question.findFirst({
      where: {
        id: questionId,
        userId: userId,
      },
    });

    if (!question) {
      throw new NotFoundException('질문이 존재하지 않습니다.');
    }

    // 질문 삭제
    await this.prisma.question.delete({
      where: {
        id: questionId,
      },
    });

    return {
      message: '질문이 삭제되었습니다.',
    };
  }

  // MARK: - 단일 질문 조회
  async getQuestion(userId: number, questionId: number) {
    const question = await this.prisma.question.findFirst({
      where: {
        id: questionId,
        userId,
      },
    });

    if (!question) {
      throw new NotFoundException('질문을 찾을 수 없습니다.');
    }

    return new QuestionResponseDto(question);
  }
}
