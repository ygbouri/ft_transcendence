import { Injectable } from '@nestjs/common';
import { ChatService } from 'src/Chat/Chat.service';
import { UserService } from 'src/User/User.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly userService: UserService,
    private readonly chatService: ChatService,
  ) {}

  async getUsers(login: string, search: string) {
    return await this.userService.searchUsers(login, search);
  }

  async getChannels(login: string, search: string) {
    return await this.chatService.searchChannels(login, search);
  }
}
