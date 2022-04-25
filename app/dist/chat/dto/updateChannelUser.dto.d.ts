import { ChannelUserRole, SanctionType } from "../entities/channelUser.entity";
declare class UpdateChannelUserDto {
    id: number;
    role: ChannelUserRole;
    sanction: SanctionType;
    end_of_sanction: Date;
}
export default UpdateChannelUserDto;
