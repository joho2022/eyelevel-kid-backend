import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { AuthProvider } from '../../enums/auth-provider.enum';

export class SocialLoginDto {
  @IsEnum(AuthProvider)
  provider: AuthProvider;

  @IsString()
  @IsNotEmpty()
  idToken: string;
}
