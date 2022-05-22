import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt'
import RegisterDto from './dto/register.dto';
import TokenPayload from './token-payload.interface'
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';
import { parse } from 'cookie';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}

    public async register(registrationData: RegisterDto)
    {
        const hashedPassword = await bcrypt.hash(registrationData.password, 10);
        try {
            const createdUser = await this.usersService.create({
                ...registrationData,
                password: hashedPassword
            });
            createdUser.password = undefined;
            return createdUser;
        } catch (error) {
            if (error?.code === PostGresErrorCode.UniqueViolation) {
                throw new HttpException('User with that email already exists', HttpStatus.BAD_REQUEST);
            }
            throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public async getAuthenticatedUser(username: string, hashedPassword: string) {
        try {
            const user = await this.usersService.getByUsername(username);
            await this.verifyPassword(user.password, hashedPassword);
            user.password = undefined;
            return user;
        } catch (error) {
            throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
        }
    }

    private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
        const isPasswordMatching = await bcrypt.compare(
            hashedPassword,
            plainTextPassword
        );
        if (!isPasswordMatching)
            throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
    }

    public getCookieWithJwtAccessToken(userId: number, isSecondFactorAuthenticated = false) {
        const payload: TokenPayload = { 
            userId,
            isSecondFactorAuthenticated
        };
        const token = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
            expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`
        });
        return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}`;
    }

    public getCookieWithJwtRefreshToken(userId: number) {
        const payload: TokenPayload = { userId };
        const token = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}s`
        });
        const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}`;
        return {
            cookie,
            token
        }
    }

    public getCookiesForLogOut() {
        return [
            'Authentication=; HttpOnly; Path=/; Max-Age=0',
            'Refresh=; HttpOnly; Path=/; Max-Age=0'
        ];
    }

      public async getUserFromToken(token: string, tokenName: string) {
        const payload: TokenPayload = this.jwtService.verify(token, {
            secret: this.configService.get(tokenName)
          });
          if (payload.userId) {
            return this.usersService.getUserWithRelations(payload.userId, []);
          }
      }

    public async getUserFromSocket(socket: Socket) {
        const cookie = socket.handshake.headers.cookie;
        const { Authentication: authenticationToken } = parse(cookie);
        const { Refresh: refreshToken } = parse(cookie);
        let user;
        if (refreshToken)
            user = await this.getUserFromToken(refreshToken, 'JWT_REFRESH_TOKEN_SECRET');
        else 
            user = await this.getUserFromToken(authenticationToken, 'JWT_ACCESS_TOKEN_SECRET');
        if (!user) {
            console.log('invalides credentials');
            throw new WsException('Invalid credentials.');
        }
        return user;
      }
}
