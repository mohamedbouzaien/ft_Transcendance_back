import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import JwtTwoFactornGuard from 'src/authentication/jwt-two-factor.guard';
import RequestWithUser from 'src/authentication/request-with-user.interface';
import LocalFilesInterceptor from 'src/local-files/local-files.interceptor';
import CreateUserDto from './dto/createUser.dto';
import UpdateStatusDto from './dto/updateStatus.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}
    @Post('avatar')
    @UseGuards(JwtTwoFactornGuard)
    @UseInterceptors(LocalFilesInterceptor({
        fieldName: 'file',
        path: '/avatars',
        fileFilter: (request, file, callback) => {
            if (!file.mimetype.includes('image'))
                return callback(new BadRequestException('Provide a valid image'), false);
                callback(null, true);
        },
        limits: {
            fileSize: Math.pow(1024, 2)
        }
    }))
    async addAvatar(@Req() request: RequestWithUser, @UploadedFile() file: Express.Multer.File) {
        await this.usersService.addAvatar(request.user.id, {
            path: file.path,
            filename: file.originalname,
            mimetype: file.mimetype
        });
        return await this.usersService.getById(request.user.id);
    }

    @Get('intern/check_mail/:email')
    @UseGuards(JwtTwoFactornGuard)
    async   checkIfEmailExistsIntern(@Param('email') email: string, @Req() request: RequestWithUser) {
        if (email !== request.user.email) {
            return this.usersService.checkIfExistsByEmail(email)
        }
    }

    @Get('extern/check_mail/:email')
    async   checkIfEmailExistsExtern(@Param('email') email: string, @Req() request: RequestWithUser) {
        if ( email !== undefined) {
            return this.usersService.checkIfExistsByEmail(email)
        }
    }

    @Get('intern/check_username/:username')
    @UseGuards(JwtTwoFactornGuard)
    async   checkIfUsernameExistsIntern(@Param('username') username: string, @Req() request: RequestWithUser) {
        if (username !== request.user.username)
            return this.usersService.checkIfExistsByUsername(username);
    }

    @Get('extern/check_username/:username')
    async   checkIfUsernameExistsExtern(@Param('username') username: string, @Req() request: RequestWithUser) {
        if (username !== undefined)
            return this.usersService.checkIfExistsByUsername(username);
    }

    @Patch()
    @UseGuards(JwtTwoFactornGuard)
    async updateUser(@Req() request: RequestWithUser, @Body() user: CreateUserDto) {
        return this.usersService.update(+request.user.id, user);
    }

    @Get(':id')
    @UseGuards(JwtTwoFactornGuard)
    async   getUserById(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.getById(id);
    }

    @Get("/username/:username")
    @UseGuards(JwtTwoFactornGuard)
    async   getByUsername(@Param('username') username: string) {
        return this.usersService.getByUsername(username);
    }

    @Post('status')
    @UseGuards(JwtTwoFactornGuard)
    async   setStatus(@Body() {status} :UpdateStatusDto, @Req() request: RequestWithUser)
    {
        await this.usersService.setStatus(status, request.user.id);
        return await this.usersService.getById(request.user.id);
    }

    @Get()
    @UseGuards(JwtTwoFactornGuard)
    async  getCurrent(@Req() request: RequestWithUser) {
        return await   this.usersService.getById(request.user.id);
    }
}
