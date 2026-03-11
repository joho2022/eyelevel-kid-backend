export class ProfileImageUploadUrlResponseDto {
  uploadUrl: string;

  token: string;

  imageUrl: string;

  constructor(uploadUrl: string, token: string, imageUrl: string) {
    this.uploadUrl = uploadUrl;
    this.token = token;
    this.imageUrl = imageUrl;
  }
}
