import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateUserRequestDto {
  @IsOptional()
  @IsString()
  @Length(2, 8)
  @Matches(/^[a-zA-Z0-9가-힣]+$/, {
    message: '닉네임은 한글, 영어, 숫자만 가능합니다.',
  })
  nickname?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;
}
