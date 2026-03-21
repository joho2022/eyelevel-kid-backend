export class ProfileImageUploadUrlResponseDto {
  uploadUrl: string;
  key: string;

  constructor(uploadUrl: string, key: string) {
    this.uploadUrl = uploadUrl;
    this.key = key;
  }
}
