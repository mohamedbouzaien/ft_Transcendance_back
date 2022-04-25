import CreateMessageDto from "./createMessage.dto";
declare class CreateDirectMessageDto extends CreateMessageDto {
    recipientId: number;
    channelId: number;
}
export default CreateDirectMessageDto;
