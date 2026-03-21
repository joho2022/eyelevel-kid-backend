import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserRequestDto } from './dto/request/update-user.request.dto';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UserResponseDto } from './dto/response/user.response.dto';

@Injectable()
export class UserService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

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

  // MARK: - 내 정보 조회
  async findMyProfile(userId: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        profileImage: true,
      },
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    return this.toUserResponseDto(user);
  }

  // MARK: - 내 정보 수정
  async updateMyProfile(
    userId: number,
    dto: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
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

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(dto.nickname !== undefined && { nickname: dto.nickname }),
          ...(dto.profileImageKey !== undefined && {
            profileImage: dto.profileImageKey,
          }),
        },
        select: {
          id: true,
          nickname: true,
          profileImage: true,
        },
      });

      return this.toUserResponseDto(updatedUser);
    } catch (error) {
      console.error('updateMyProfile error:', error);
      throw new InternalServerErrorException(
        '회원 정보 수정 중 오류가 발생했습니다.',
      );
    }
  }

  // MARK: - 프로필 이미지 업로드용 URL 생성
  async createProfileImageUploadUrl(userId: number): Promise<{
    uploadUrl: string;
    key: string;
  }> {
    const key = `users/${userId}/profile.jpg`;

    try {
      const uploadUrl = await getSignedUrl(
        this.s3Client,
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          ContentType: 'image/jpeg',
        }),
        { expiresIn: 3600 },
      );

      return {
        uploadUrl,
        key,
      };
    } catch (error) {
      console.error('createProfileImageUploadUrl error:', error);
      throw new InternalServerErrorException(
        '프로필 이미지 업로드 URL 생성에 실패했습니다.',
      );
    }
  }

  // MARK: - 내 프로필 이미지 조회용 URL만 따로 재발급
  async getMyProfileImageUrl(userId: number): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        profileImage: true,
      },
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    if (!user.profileImage) {
      return null;
    }

    return this.createProfileImageReadUrl(user.profileImage);
  }

  // MARK: - 조회 응답 DTO 변환
  private async toUserResponseDto(user: {
    id: number;
    nickname: string | null;
    profileImage: string | null;
  }): Promise<UserResponseDto> {
    let profileImageUrl: string | null = null;

    if (user.profileImage) {
      profileImageUrl = await this.createProfileImageReadUrl(user.profileImage);
    }

    return new UserResponseDto({
      id: user.id,
      nickname: user.nickname,
      profileImageUrl,
    });
  }

  // MARK: - 프로필 이미지 읽기용 presigned URL 생성
  private async createProfileImageReadUrl(key: string): Promise<string> {
    try {
      return await getSignedUrl(
        this.s3Client,
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
        { expiresIn: 3600 },
      );
    } catch (error) {
      console.error('createProfileImageReadUrl error:', error);
      throw new InternalServerErrorException(
        '프로필 이미지 조회 URL 생성에 실패했습니다.',
      );
    }
  }
}
