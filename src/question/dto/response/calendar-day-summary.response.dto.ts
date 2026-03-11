export class CalendarQuestionPreview {
  id: number;
  title: string;
  createdAt: Date;

  constructor(question: any) {
    this.id = question.id;
    this.title = question.title;
    this.createdAt = question.createdAt;
  }
}

export class CalendarDayResponseDto {
  date: string;
  questions: CalendarQuestionPreview[];

  constructor(date: string, questions: any[]) {
    this.date = date;
    this.questions = questions.map((q) => new CalendarQuestionPreview(q));
  }
}
