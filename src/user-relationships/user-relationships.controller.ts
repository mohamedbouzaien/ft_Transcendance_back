import { ClassSerializerInterceptor, Controller, Param, ParseIntPipe, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import JwtTwoFactornGuard from 'src/authentication/jwt-two-factor.guard';
import RequestWithUser from 'src/authentication/request-with-user.interface';
import { UsersService } from 'src/users/users.service';
import { UserRelationshipStatus } from './user-relationship-status.enum';
import { UserRelationshipsService } from './user-relationships.service';

@Controller('user-relationships')
@UseInterceptors(ClassSerializerInterceptor)
export class UserRelationshipsController {
    constructor(
        private readonly userRelationshipsService: UserRelationshipsService,
        private readonly usersService: UsersService
        ) {}
    @Post(':id')
    @UseGuards(JwtTwoFactornGuard)
    async createRelationship(@Param('id', ParseIntPipe)id: number, @Req() request: RequestWithUser) {
        const requestedUser = await this.usersService.getById(id);
        const {user} = request;
        return this.userRelationshipsService.create({
            issuer: user,
            receiver: requestedUser,
            status: UserRelationshipStatus.PENDING
        });

    }
}
