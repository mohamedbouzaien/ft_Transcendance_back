import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { LocalFilesModule } from 'src/local-files/local-files.module';
import { ConfigModule } from '@nestjs/config';
import Game from 'src/pong/entities/game.entity';
import { GamesService } from 'src/pong/services/game.service';

@Module({
    imports: [TypeOrmModule.forFeature([User, Game]), ConfigModule, LocalFilesModule],
    providers: [UsersService, GamesService],
    exports: [UsersService],
    controllers: [UsersController]
})
export class UsersModule {}
