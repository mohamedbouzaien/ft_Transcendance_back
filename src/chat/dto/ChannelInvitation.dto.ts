import { IsNumber, isNumber } from "class-validator";

export class ChannelInvitationDto {
  
  @IsNumber()
  invitedId: number;

  @IsNumber()
  channelId: number;
}