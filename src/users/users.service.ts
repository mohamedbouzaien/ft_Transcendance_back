import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import CreateUserDto from './dto/createUser.dto';
import User from './user.entity';
import * as bcrypt from 'bcrypt';
import LocalFilesService from 'src/local-files/local-files.service';
import { UserStatus } from './user-status.enum';
import Game, { EndGameStatus } from 'src/pong/entities/game.entity';

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

    async setStatus(status: UserStatus, id: number)
    {
        await this.usersRepository.update(id, {
            status
        });
    }

    async   getByEmail(email: string)
    {
        const user = await this.usersRepository.findOne({email});
        if (user)
            return user;
        throw new HttpException('User with this email does not exist', HttpStatus.NOT_FOUND);
    }

    async   checkIfExistsByEmail(email: string)
    {
        const user = await this.usersRepository.findOne({email});
        if (user)
            throw new HttpException('User with this email exists', HttpStatus.CONFLICT);
        else
            return false;
    }

    async   getByUsername(username: string)
    {
        const user = await this.usersRepository.findOne({username},{
            relations: [
                'sent_relationships', 
                'received_relationships',
                'invited_channels', 'userChannels', 'blocked_users', 'gamesAsPlayer1', 'gamesAsPlayer2'
            ]});
        if (user) 
            return user;
        throw new HttpException('User with this username does not exist', HttpStatus.NOT_FOUND);
    }

    async   checkIfExistsByUsername(username: string)
    {
        const user = await this.usersRepository.findOne({username});
        if (user)
            throw new HttpException('User with this username exists', HttpStatus.CONFLICT);
        else
            return false;
    }

    async getById(id: number) {
        const user = await this.usersRepository.findOne({
            id
        },{
            relations: [
                'sent_relationships', 
                'received_relationships',
                'invited_channels', 'userChannels', 'blocked_users', 'gamesAsPlayer1', 'gamesAsPlayer2', 'achievement_history', 'achievement_history.achievement'
            ]});
        if (user) {
            return user;
        }
        throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
    }

    async   getByIntraId(intra_id: string)
    {
        const user = await this.usersRepository.findOne({intra_id});
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
            avatar_id: avatar.id
        });
    }

    async saveUser(user: User) {
        const updated_user = await this.usersRepository.save(user);
        if (!updated_user) {
            throw new HttpException('user not found', HttpStatus.BAD_REQUEST);
        }
        return updated_user;
    }
    
    async getRelationships(userId: number) {
        const user = this.usersRepository.findOne(userId, {
            relations: [
                'sent_relationships']
            });
    }

    async update(id:number, user: CreateUserDto) {
        if (user.password == "")
            await this.usersRepository.update(id, {email: user.email, username: user.username});
        else
        {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            user.password = hashedPassword;
            await this.usersRepository.update(id, user);
        }
        const updatedUser = await this.getById(id);
        if (updatedUser) {
            return updatedUser;
        }
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    async saveUsersGameResult(game: Game) {
        if (game.endGameStatus == EndGameStatus.ABORT)
            return ;
        if (game.player1Points > game.player2Points) {
            await this.usersRepository.update(game.player1.id, {victories: game.player1.victories += 1});
            await this.usersRepository.update(game.player2.id, {defeats: game.player2.defeats += 1});
        }
        else {
            await this.usersRepository.update(game.player2.id, {victories: game.player2.victories += 1});
            await this.usersRepository.update(game.player1.id, {defeats: game.player1.defeats += 1});  
        }
    }

    async getUserWithRelations(id: number, relations: string[]) {
        const user =  await this.usersRepository.findOne(id, {relations});
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        return user;
    } 
}
