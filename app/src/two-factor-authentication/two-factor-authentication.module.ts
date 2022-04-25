import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { UsersModule } from 'src/users/users.module';
import { TwoFactorAuthenticationController } from './two-factor-authentication.controller';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';

@Module({
    imports:[ AuthenticationModule, UsersModule, ConfigModule],
    providers: [TwoFactorAuthenticationService],
    controllers: [TwoFactorAuthenticationController]
})
export class TwoFactorAuthenticationModule {
}
