import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtRefreshTokenStrategy } from './jwtRefreshToken.strategy';
import { LocalStrategy } from './local.strategy';

@Module({
    imports: [
            UsersModule, 
            PassportModule,
            ConfigModule,
            JwtModule.register({})
            ],
    providers: [AuthenticationService, LocalStrategy, JwtStrategy, JwtRefreshTokenStrategy],
    controllers: [AuthenticationController]
})
export class AuthenticationModule {}
