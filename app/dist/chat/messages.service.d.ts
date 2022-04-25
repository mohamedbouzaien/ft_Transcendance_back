import { AuthenticationService } from "src/authentication/authentication.service";
import { Repository } from "typeorm";
import { ChannelsService } from "./channels.service";
import CreateMessageDto from "./dto/createMessage.dto";
import Message from "./entities/message.entity";
export declare class MessagesService {
    private readonly authenticationService;
    private readonly messagesRepository;
    private readonly channelsService;
    constructor(authenticationService: AuthenticationService, messagesRepository: Repository<Message>, channelsService: ChannelsService);
    saveMessage(messageData: CreateMessageDto): Promise<Message>;
    getAllMessages(): Promise<Message[]>;
    getMessageById(id: number): Promise<Message>;
}
