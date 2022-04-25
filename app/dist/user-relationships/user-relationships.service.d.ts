import User from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { CreateUserRelationshipDto } from './dto/create-user-relationship.dto';
import { UserRelationshipStatus } from './user-relationship-status.enum';
import UserRelationship from './user-relationship.entity';
export declare class UserRelationshipsService {
    private userRelashionshipRepository;
    constructor(userRelashionshipRepository: Repository<UserRelationship>);
    create(userRelationshipDto: CreateUserRelationshipDto): Promise<UserRelationship>;
    getById(id: number): Promise<UserRelationship>;
    updateStatus(status: UserRelationshipStatus, userRelationship: UserRelationship, user: User): Promise<UserRelationship>;
    delete(id: number, user: User): Promise<import("typeorm").DeleteResult>;
}
