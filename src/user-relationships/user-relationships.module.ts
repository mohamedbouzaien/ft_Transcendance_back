import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserRelationship from './user-relationship.entity';
import { UserRelationshipsService } from './user-relationships.service';

@Module({
    imports: [TypeOrmModule.forFeature([UserRelationship])],
    providers: [UserRelationshipsService]
})
export class UserRelationshipsModule {}
