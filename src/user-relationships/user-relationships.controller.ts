import { Body, ClassSerializerInterceptor, Controller, Delete, HttpCode, HttpException, HttpStatus, Param, ParseIntPipe, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import JwtTwoFactornGuard from 'src/authentication/jwt-two-factor.guard';
import RequestWithUser from 'src/authentication/request-with-user.interface';
import { UsersService } from 'src/users/users.service';
import { UpdateUserRelationshipStatusDto } from './dto/update-user-relationship-status.dto';
import { UserRelationshipStatus } from './user-relationship-status.enum';
import { UserRelationshipsService } from './user-relationships.service';

@Controller('user-relationships')
@UseInterceptors(ClassSerializerInterceptor)
export class UserRelationshipsController {
    constructor(
        private readonly userRelationshipsService: UserRelationshipsService,
        private readonly usersService: UsersService
        ) {}
    @Post()
    @UseGuards(JwtTwoFactornGuard)
    async createRelationship(@Body('id', ParseIntPipe)id: number, @Req() request: RequestWithUser) {
        const requestedUser = await this.usersService.getById(id);
        if (requestedUser)
        {
            const {user} = request;
            return this.userRelationshipsService.create({
                issuer: user,
                receiver: requestedUser,
                status: UserRelationshipStatus.PENDING
            });
        }
        throw new HttpException('Requested user doesn\'t exist', HttpStatus.BAD_REQUEST);
    }

    @Post('update-status')
    @HttpCode(200)
    @UseGuards(JwtTwoFactornGuard)
    async updateStatus(@Req() request: RequestWithUser, @Body() {id, status}: UpdateUserRelationshipStatusDto) {
        const {user} = request;
        const secondUser = await this.usersService.getById(id);
        const userRelationship = await this.userRelationshipsService.findByUsers(user, secondUser);
        await this.userRelationshipsService.updateStatus(status, userRelationship, user);
        return this.usersService.getById(user.id);
    }

    @Delete(':id')
    @UseGuards(JwtTwoFactornGuard)
    async deleteRelationship(@Param('id', ParseIntPipe)id: number, @Req() request:RequestWithUser) {
        const {user} = request;
        const secondUser = await this.usersService.getById(id);
        const userRelationship = await this.userRelationshipsService.findByUsers(user, secondUser);
        await this.userRelationshipsService.delete(userRelationship.id, user);
        return this.usersService.getById(user.id);
    }
}
