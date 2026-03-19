import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserRequestDto } from './dto/request/update-user.request.dto';
import { supabase } from '../supabase/supabase.client';
import { ProfileImageUploadUrlResponseDto } from './dto/response/profile-image-upload-url.response.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findById(userId: number) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }

  async updateUser(userId: number, dto: UpdateUserRequestDto) {
    if (dto.nickname) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          nickname: dto.nickname,
          NOT: {
            id: userId,
          },
        },
      });

      if (existingUser) {
        throw new ConflictException('이미 사용중인 닉네임입니다.');
      }
    }

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        nickname: dto.nickname,
        profileImage: dto.profileImage,
      },
    });
  }

  async createProfileImageUploadUrl(userId: number) {
    const filePath = `users/${userId}/profile.jpg`;

    await supabase.storage.from('images').remove([filePath]);

    const { data, error } = await supabase.storage
      .from('images')
      .createSignedUploadUrl(filePath);

    if (error) {
      console.error('Supabase Error:', error);

      throw new InternalServerErrorException(
        '프로필 이미지를 업로드할 수 없습니다. 잠시 후 다시 시도해주세요.',
      );
    }

    // public url 생성
    const { data: publicData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return {
      uploadUrl: data.signedUrl,
      token: data.token,
      imageUrl: `${publicData.publicUrl}?v=${Date.now()}`,
    };
  }
}
