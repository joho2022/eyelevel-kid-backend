export class CalendarSummaryResponseDto {
  year: number;
  month: number;
  questionDates: string[];

  constructor(year: number, month: number, dates: string[]) {
    this.year = year;
    this.month = month;
    this.questionDates = dates;
  }
}
