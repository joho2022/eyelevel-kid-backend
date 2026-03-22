import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { QuestionModule } from './question/question.module';
import { AppConfigModule } from './app-config/app-config.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        GOOGLE_CLIENT_ID: Joi.string().required(),
        APPLE_CLIENT_ID: Joi.string().required(),
        PORT: Joi.number().default(4000),
        HOST: Joi.string().default('0.0.0.0'),
        SUPABASE_URL: Joi.string().uri().required(),
        SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
        AWS_S3_BUCKET_NAME: Joi.string().required(),
        AWS_DEFAULT_REGION: Joi.string().required(),
        AWS_ENDPOINT_URL: Joi.string().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        ADMIN_SECRET: Joi.string().required(),
      }),
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    QuestionModule,
    AppConfigModule,
  ],
})
export class AppModule {}
