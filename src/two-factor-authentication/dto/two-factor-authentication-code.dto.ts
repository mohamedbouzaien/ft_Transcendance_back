import { IsString } from "class-validator";

export class twoFactorAuthenticationCodeDto {
    @IsString()
    twoFactorAuthenticationCode: string;
}
export default twoFactorAuthenticationCodeDto;