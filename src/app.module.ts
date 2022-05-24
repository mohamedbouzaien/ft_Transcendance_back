import * as Joi from '@hapi/joi';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AcheivementsHistoriesModule } from './acheivements-history/acheivements-histories.module';
import { AcheivementsModule } from './acheivements/acheivements.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { ChatModule } from './chat/chat.module';
import { DatabaseModule } from './database/database.module';
import { LocalFilesModule } from './local-files/local-files.module';
import { PongModule } from './pong/pong.module';
import { TwoFactorAuthenticationModule } from './two-factor-authentication/two-factor-authentication.module';
import { UserRelationshipsModule } from './user-relationships/user-relationships.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule.forRoot({
    validationSchema: Joi.object({
      POSTGRES_HOST: Joi.string().required(),
      POSTGRES_PORT: Joi.number().required(),
      POSTGRES_USER: Joi.string().required(),
      POSTGRES_PASSWORD: Joi.string().required(),
      POSTGRES_DB: Joi.string().required(),
      PORT: Joi.number(),
      JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
      JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),      
      JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
      JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
      FT_AUTH_CLIENT_ID: Joi.string().required(),
      FT_AUTH_CLIENT_SECRET: Joi.string().required(),
      FRONT_URL: Joi.string().required(),
      TWO_FACTOR_AUTHENTICATION_APP_NAME: Joi.string().required(),
      UPLOADED_FILES_DESTINATION: Joi.string().required()
    })
  }), DatabaseModule, TwoFactorAuthenticationModule, UsersModule, AuthenticationModule, LocalFilesModule, ChatModule, UserRelationshipsModule, PongModule, AcheivementsModule, AcheivementsHistoriesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
