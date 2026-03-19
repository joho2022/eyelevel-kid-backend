import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
  Post,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { UpdateUserRequestDto } from './dto/request/update-user.request.dto';
import { UserResponseDto } from './dto/response/user.response.dto';
import { ProfileImageUploadUrlResponseDto } from './dto/response/profile-image-upload-url.response.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // MARK: - 내 정보 조회
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any): Promise<UserResponseDto> {
    const userId = req.user.sub;

    const user = await this.userService.findById(userId);

    return new UserResponseDto(user);
  }

  // MARK: - 닉네임 / 프로필 수정
  @UseGuards(JwtAuthGuard)
  @Patch()
  async updateUser(
    @Req() req: any,
    @Body() dto: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    const userId = req.user.sub;

    const user = await this.userService.updateUser(userId, dto);

    return new UserResponseDto(user);
  }

  // MARK: -프로필 이미지 업로드 URL 생성
  @Post('profile-image/upload-url')
  @UseGuards(JwtAuthGuard)
  async createProfileImageUploadUrl(
    @Req() req: any,
  ): Promise<ProfileImageUploadUrlResponseDto> {
    const userId = req.user.sub;

    const result = await this.userService.createProfileImageUploadUrl(userId);

    return new ProfileImageUploadUrlResponseDto(
      result.uploadUrl,
      result.token,
      result.imageUrl,
    );
  }
}
