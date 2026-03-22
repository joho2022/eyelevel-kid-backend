import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateAppConfigRequestDto {
  @IsOptional()
  @IsString()
  minimumVersion?: string;

  @IsOptional()
  @IsString()
  latestVersion?: string;

  @IsOptional()
  @IsBoolean()
  messageShow?: boolean;

  @IsOptional()
  @IsString()
  messageTitle?: string;

  @IsOptional()
  @IsString()
  messageBody?: string;

  @IsOptional()
  @IsBoolean()
  messageBlocking?: boolean;
}
