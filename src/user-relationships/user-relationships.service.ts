import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UserRelationship from './user-relationship.entity';

@Injectable()
export class UserRelationshipsService {
    constructor(@InjectRepository(UserRelationship) private userRelashipRepository: Repository<UserRelationship>) {}
}
