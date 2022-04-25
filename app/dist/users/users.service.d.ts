import { Repository } from 'typeorm';
import CreateUserDto from './dto/createUser.dto';
import User from './user.entity';
import LocalFilesService from 'src/local-files/local-files.service';
export declare class UsersService {
    private usersRepository;
    private localFilesService;
    constructor(usersRepository: Repository<User>, localFilesService: LocalFilesService);
    create(userData: CreateUserDto): Promise<User>;
    setCurrentRefreshToken(refreshToken: string, userId: number): Promise<void>;
    getByEmail(email: string): Promise<User>;
    getByUsername(username: string): Promise<User>;
    getById(id: number): Promise<User>;
    getByIntraId(intra_id: string): Promise<User>;
    getUserIfRefreshTokenMatches(refreshToken: string, userId: number): Promise<User>;
    removeRefreshToken(userId: number): Promise<import("typeorm").UpdateResult>;
    setTwoFactorAuthenticationSecret(secret: string, userId: number): Promise<import("typeorm").UpdateResult>;
    setIsTwoFactorAuthenticationIsEnabled(status: boolean, userId: number): Promise<import("typeorm").UpdateResult>;
    addAvatar(userId: number, fileData: LocalFileDto): Promise<void>;
    getRelationships(userId: number): Promise<void>;
}
