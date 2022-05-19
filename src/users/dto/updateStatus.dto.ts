import { IsEnum} from "class-validator";
import { UserStatus } from "../user-status.enum";

export class UpdateStatusDto {
    @IsEnum(UserStatus)
    status: UserStatus;
}
export default UpdateStatusDto;