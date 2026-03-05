export class UserResponseDto {
  id: number;
  nickname: string | null;
  profileImage: string | null;

  constructor(user: any) {
    this.id = user.id;
    this.nickname = user.nickname;
    this.profileImage = user.profileImage;
  }
}
