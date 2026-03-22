export class AppMessageDto {
  show: boolean;
  title: string | null;
  body: string | null;
  blocking: boolean;

  constructor(
    show: boolean,
    title: string | null,
    body: string | null,
    blocking: boolean,
  ) {
    this.show = show;
    this.title = title;
    this.body = body;
    this.blocking = blocking;
  }
}

export class AppConfigResponseDto {
  minimumVersion: string;
  latestVersion: string;
  message: AppMessageDto;

  constructor(params: {
    minimumVersion: string;
    latestVersion: string;
    message: AppMessageDto;
  }) {
    this.minimumVersion = params.minimumVersion;
    this.latestVersion = params.latestVersion;
    this.message = params.message;
  }
}
