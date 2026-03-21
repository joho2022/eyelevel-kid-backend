export class UserResponseDto {
  id: number;
  nickname: string | null;
  profileImageUrl: string | null;

  constructor(user: {
    id: number;
    nickname: string | null;
    profileImageUrl: string | null;
  }) {
    this.id = user.id;
    this.nickname = user.nickname;
    this.profileImageUrl = user.profileImageUrl;
  }
}
