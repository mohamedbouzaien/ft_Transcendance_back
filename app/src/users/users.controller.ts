import { BadRequestException, Controller, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import JwtTwoFactornGuard from 'src/authentication/jwt-two-factor.guard';
import RequestWithUser from 'src/authentication/request-with-user.interface';
import LocalFilesInterceptor from 'src/local-files/local-files.interceptor';
import { fileURLToPath } from 'url';
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
        return this.usersService.addAvatar(request.user.id, {
            path: file.path,
            filename: file.originalname,
            mimetype: file.mimetype
        });
    }
}
