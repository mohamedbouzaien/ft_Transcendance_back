import { ChannelStatus } from "../entities/channel.entity";
declare class CreateChannelDto {
    name: string;
    status: ChannelStatus;
    password: string;
}
export default CreateChannelDto;
