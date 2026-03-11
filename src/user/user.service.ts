import { ConflictException, Injectable } from '@nestjs/common';
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

    const { data, error } = await supabase.storage
      .from('images')
      .createSignedUploadUrl(filePath);

    if (error) {
      throw new Error('이미지 업로드 URL 생성 실패');
    }

    const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/images/${filePath}`;

    return {
      uploadUrl: data.signedUrl,
      token: data.token,
      imageUrl,
    };
  }
}
