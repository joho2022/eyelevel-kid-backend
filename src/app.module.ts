import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        //GOOGLE_CLIENT_ID: Joi.string().required(),
        //APPLE_CLIENT_ID: Joi.string().required(),
        //PORT: Joi.number().default(4000),
      }),
    }),
    PrismaModule,
    AuthModule,
  ],
})
export class AppModule {}
