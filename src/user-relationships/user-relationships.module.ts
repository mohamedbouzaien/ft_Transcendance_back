import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserRelationship from './user-relationship.entity';
import { UserRelationshipsService } from './user-relationships.service';
import { UserRelationshipsController } from './user-relationships.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([UserRelationship]), UsersModule],
    providers: [UserRelationshipsService],
    controllers: [UserRelationshipsController],
    exports: [UserRelationshipsService]
})
export class UserRelationshipsModule {}
