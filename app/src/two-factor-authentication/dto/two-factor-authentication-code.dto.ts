import { IsNotEmpty, IsString } from "class-validator";

export class twoFactorAuthenticationCodeDto {
    //@IsNotEmpty()
    //status: boolean;
    @IsString()
    twoFactorAuthenticationCode: string;
}
export default twoFactorAuthenticationCodeDto;