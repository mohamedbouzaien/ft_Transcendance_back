import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
export class RegisterDto {

    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @IsString()
    @IsOptional()
    intra_id: string;
}
export default RegisterDto;