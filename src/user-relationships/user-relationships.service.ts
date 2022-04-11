import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserRelationshipDto } from './dto/create-user-relationship.dto';
import UserRelationship from './user-relationship.entity';

@Injectable()
export class UserRelationshipsService {
    constructor(@InjectRepository(UserRelationship) private userRelashipRepository: Repository<UserRelationship>) {}

    async create(userRelationshipDto: CreateUserRelationshipDto) {
        const userRelationship = await this.userRelashipRepository.create(userRelationshipDto);
        await this.userRelashipRepository.save(userRelationship);
        return userRelationship;
    }
    
}
