import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import CreateUserDto from './dto/createUser.dto';
import User from './user.entity';
import * as bcrypt from 'bcrypt';
import LocalFilesService from 'src/local-files/local-files.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private localFilesService: LocalFilesService
    ) {}

    async create(userData: CreateUserDto)
    {
        const newUser = await this.usersRepository.create(userData);
        await this.usersRepository.save(newUser);
        return newUser;
    }

    async setCurrentRefreshToken(refreshToken: string, userId: number)
    {
        const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.usersRepository.update(userId, {
            currentHashedRefreshToken
        });
    }

    async   getByEmail(email: string)
    {
        const user = await this.usersRepository.findOne({email});
        if (user)
            return user;
        throw new HttpException('User with this email does not exist', HttpStatus.NOT_FOUND);
    }

    async getById(id: number) {
        const user = await this.usersRepository.findOne({
            id
        }, {
            relations: ['invited_channels', 'userChannels', 'blocked_users']
        });
        if (user) {
            return user;
        }
        throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
    }

    async   getByIntraId(intraId: string)
    {
        const user = await this.usersRepository.findOne({intraId});
        if (user)
            return user;
        return undefined;
    }

    async getUserIfRefreshTokenMatches(refreshToken: string, userId: number) {
        const user = await this.getById(userId);
        const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.currentHashedRefreshToken);
        if (isRefreshTokenMatching) {
            return user;
        }
    }

    async removeRefreshToken(userId: number) {
        return this.usersRepository.update(userId, {
            currentHashedRefreshToken: null
        });
    }

    async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
        return this.usersRepository.update(userId, {
            twoFactorAuthenticationSecret: secret
        });
    }

    async setIsTwoFactorAuthenticationIsEnabled(status: boolean, userId: number) {
        return this.usersRepository.update(userId, {
            isTwoFactorAuthenticationEnabled: status
        });
    }

    async addAvatar(userId: number, fileData: LocalFileDto) {
        const avatar = await this.localFilesService.saveLocalFileData(fileData);
        await this.usersRepository.update(userId, {
            avatarId: avatar.id
        });
    }

    async saveUser(user: User) {
        const updated_user = await this.usersRepository.save(user);
        if (!updated_user) {
            throw new HttpException('user not found', HttpStatus.BAD_REQUEST);
        }
        return updated_user;
    }
}
