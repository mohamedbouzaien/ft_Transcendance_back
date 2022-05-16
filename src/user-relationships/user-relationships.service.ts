import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { CreateUserRelationshipDto } from './dto/create-user-relationship.dto';
import { UserRelationshipStatus } from './user-relationship-status.enum';
import UserRelationship from './user-relationship.entity';

@Injectable()
export class UserRelationshipsService {
    constructor(@InjectRepository(UserRelationship) private userRelashionshipRepository: Repository<UserRelationship>) {}

    async create(userRelationshipDto: CreateUserRelationshipDto) {
        const userRelationshipFound = await this.userRelashionshipRepository.findOne({
            issuer: userRelationshipDto.issuer,
            receiver: userRelationshipDto.receiver
        });
        if (!userRelationshipFound)
        {
            const userRelationshipReverseFound = await this.userRelashionshipRepository.findOne({
                issuer: userRelationshipDto.receiver,
                receiver: userRelationshipDto.issuer
            });
            if (!userRelationshipReverseFound)
            {
                const userRelationship = await this.userRelashionshipRepository.create(userRelationshipDto);
                await this.userRelashionshipRepository.save(userRelationship);
                return userRelationship;
            }
        }
        throw new HttpException('Relationship with this user already exists', HttpStatus.BAD_REQUEST);
    }

    async findByUsers(first: User, second: User) {
        const userRelationshipFound = await this.userRelashionshipRepository.findOne({
            issuer: first,
            receiver: second
        });
        
        if (userRelationshipFound)
            return userRelationshipFound;
        else {
            const userRelationshipReverseFound = await this.userRelashionshipRepository.findOne({
                issuer: second,
                receiver: first
            });
            if (userRelationshipReverseFound)
                return userRelationshipReverseFound;
        }
        throw new HttpException('Relationship doesn\'t exist', HttpStatus.BAD_REQUEST);
    }

    async getById(id: number) {
        const userRelationship = await this.userRelashionshipRepository.findOne(id);
        if (userRelationship)
            return userRelationship;
        throw new HttpException('Relationship doesn\'t exist', HttpStatus.BAD_REQUEST);
    }
    
    async updateStatus(status: UserRelationshipStatus, userRelationship: UserRelationship, user: User) {
        if (userRelationship.receiver_id === user.id && userRelationship.status === UserRelationshipStatus.PENDING 
            && status === UserRelationshipStatus.FRIENDS) {
            await this.userRelashionshipRepository.update(userRelationship.id, {
                status: UserRelationshipStatus.FRIENDS
            });
            return this.userRelashionshipRepository.findOne(userRelationship.id);
            }
        if (status === UserRelationshipStatus.BLOCKED && (userRelationship.status === UserRelationshipStatus.FRIENDS
            || userRelationship.status === UserRelationshipStatus.PENDING)) {
            await this.userRelashionshipRepository.update(userRelationship.id, {
                status: UserRelationshipStatus.BLOCKED
            });
            return this.userRelashionshipRepository.findOne(userRelationship.id);
        }   
        throw new HttpException('Relationship status not alloud', HttpStatus.BAD_REQUEST);
    }

    async delete(id: number, user: User) {
        const userRelationship = await this.userRelashionshipRepository.findOne(id);
        if (userRelationship && (userRelationship.issuer_id === user.id || userRelationship.receiver_id === user.id))
            return await this.userRelashionshipRepository.delete(id);
        throw new HttpException('Relationship status not alloud', HttpStatus.BAD_REQUEST);
    }
}
