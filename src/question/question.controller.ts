import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';
import { QuestionService } from './question.service';
import { AskQuestionRequestDto } from './dto/request/ask-question.request.dto';

@Controller('questions')
@UseGuards(JwtAuthGuard)
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  // MARK: - 질문 생성
  @Post()
  async createQuestion(@Req() req: any, @Body() dto: AskQuestionRequestDto) {
    return this.questionService.createQuestion(req.user.sub, dto);
  }

  // MARK: - 달력 요약 조회
  @Get('calendar-summary')
  async getCalendarSummary(
    @Req() req: any,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.questionService.getCalendarSummary(req.user.sub, year, month);
  }

  // MARK: - 달력 날짜 질문 조회
  @Get('by-date')
  async getQuestionsByDate(
    @Req() req: any,
    @Query('year') year: number,
    @Query('month') month: number,
    @Query('day') day: number,
  ) {
    return this.questionService.getQuestionsByDate(
      req.user.sub,
      year,
      month,
      day,
    );
  }

  // MARK: - 질문 목록 조회 (pagination)
  @Get()
  async getQuestions(
    @Req() req: any,
    @Query('cursor') cursor?: string,
    @Query('limit') limit = 20,
  ) {
    return this.questionService.getQuestions(
      req.user.sub,
      cursor,
      Number(limit),
    );
  }

  // MARK: - 북마크 토글
  @Patch(':id/bookmark')
  async toggleBookmark(@Req() req: any, @Param('id') id: number) {
    return this.questionService.toggleBookmark(req.user.sub, Number(id));
  }

  // MARK: - 질문 삭제
  @Delete(':id')
  async deleteQuestion(@Req() req: any, @Param('id') id: number) {
    return this.questionService.deleteQuestion(req.user.sub, Number(id));
  }

  // MARK: - 단일 질문 조회
  @Get(':id')
  async getQuestion(@Req() req: any, @Param('id') id: number) {
    return this.questionService.getQuestion(req.user.sub, Number(id));
  }
}
