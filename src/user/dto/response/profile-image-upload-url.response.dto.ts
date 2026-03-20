export class ProfileImageUploadUrlResponseDto {
  uploadUrl: string;

  imageUrl: string;

  constructor(uploadUrl: string, imageUrl: string) {
    this.uploadUrl = uploadUrl;
    this.imageUrl = imageUrl;
  }
}
