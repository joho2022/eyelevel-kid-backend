import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserRequestDto } from './dto/request/update-user.request.dto';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// import { supabase } from '../supabase/supabase.client';
// import { ProfileImageUploadUrlResponseDto } from './dto/response/profile-image-upload-url.response.dto';

@Injectable()
export class UserService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private readonly prisma: PrismaService) {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const region = process.env.AWS_DEFAULT_REGION;
    const endpoint = process.env.AWS_ENDPOINT_URL;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (
      !bucketName ||
      !region ||
      !endpoint ||
      !accessKeyId ||
      !secretAccessKey
    ) {
      throw new Error('S3 환경변수가 올바르게 설정되지 않았습니다.');
    }

    this.bucketName = bucketName;
    this.s3Client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

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

  // async createProfileImageUploadUrl(userId: number) {
  //   const filePath = `users/${userId}/profile.jpg`;

  //   await supabase.storage.from('images').remove([filePath]);

  //   const { data, error } = await supabase.storage
  //     .from('images')
  //     .createSignedUploadUrl(filePath);

  //   if (error) {
  //     console.error('Supabase Error:', error);

  //     throw new InternalServerErrorException(
  //       '프로필 이미지를 업로드할 수 없습니다. 잠시 후 다시 시도해주세요.',
  //     );
  //   }

  //   // public url 생성
  //   const { data: publicData } = supabase.storage
  //     .from('images')
  //     .getPublicUrl(filePath);

  //   return {
  //     uploadUrl: data.signedUrl,
  //     token: data.token,
  //     imageUrl: `${publicData.publicUrl}?v=${Date.now()}`,
  //   };
  // }

  async createProfileImageUploadUrl(userId: number) {
    const key = `users/${userId}/profile.jpg`;

    const uploadUrl = await getSignedUrl(
      this.s3Client,
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: 'image/jpeg',
      }),
      { expiresIn: 3600 },
    );

    const imageUrl = await getSignedUrl(
      this.s3Client,
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
      { expiresIn: 3600 },
    );

    return {
      uploadUrl,
      imageUrl,
    };
  }
}
