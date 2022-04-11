import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from "class-validator";
export class RegisterDto {

    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @ApiProperty({
        description: 'Has to match a regular expression: /^\\+[1-9]\\d{1,14}$/',
        example: '+123123123123'
      })
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+[1-9]\d{1,14}$/)
    phoneNumber: string;

    @IsString()
    @IsOptional()
    intra_id: string;
}
export default RegisterDto;