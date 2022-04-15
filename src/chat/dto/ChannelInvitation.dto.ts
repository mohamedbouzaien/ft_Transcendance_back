import User from "src/users/user.entity";
import Channel from "../entities/channel.entity";

class ChannelInvitationDto {
  invited_user: User;
  channel: Channel;
}

export default ChannelInvitationDto;