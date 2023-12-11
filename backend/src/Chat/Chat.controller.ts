import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { User } from 'src/User/User.decorator';
import {
  convIdV,
  createChannelDto,
  memberStatusV,
  membersV,
  memberV,
  nameV,
  passwordV,
  updateChannelDto,
} from './Chat.dto';
import { ChatService } from './Chat.service';
import { CustomJwtAuthGuard } from 'src/2faJwt/jwt/JwtAuth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @UseGuards(CustomJwtAuthGuard)
  async getAllConversations(@User('login') login: string) {
    return await this.chatService.getAllConversationOf(login);
  }

  @Get('conversations/:convId')
  @UseGuards(CustomJwtAuthGuard)
  async getConversationById(
    @User('login') login: string,
    @Param() id: convIdV,
  ) {
    return await this.chatService.getConversationById(login, id.convId);
  }

  @Get('/loginInfo/:name')
  @UseGuards(CustomJwtAuthGuard)
  async ft_user_info(@User('login') login: string, @Param() param: nameV) {
    return await this.chatService.getDMInfo(login, param.name);
  }

  @Get('/unreadMsgs')
  @UseGuards(CustomJwtAuthGuard)
  async getUnreadMsgs(@User('login') login: string) {
    return await this.chatService.getAllUnreadMsg(login);
  }

  @Post('/createChannel')
  @UseGuards(CustomJwtAuthGuard)
  async createChannel(
    @User('login') login: string,
    @Body() data: createChannelDto,
  ) {
    return await this.chatService.createChannel(login, data);
  }

  @Post('/leaveChannel/:convId')
  @UseGuards(CustomJwtAuthGuard)
  async leaveChannel(@User('login') login: string, @Param() id: convIdV) {
    return await this.chatService.leaveChannel(login, id.convId);
  }

  @Post('/joinChannel/:convId')
  @UseGuards(CustomJwtAuthGuard)
  async joinChannel(
    @User('login') login: string,
    @Param() id: convIdV,
    @Body() data: passwordV,
  ) {
    return await this.chatService.joinChannel(
      login,
      id.convId,
      data.password,
      false,
    );
  }

  @Post('/channelProfile/:convId')
  @UseGuards(CustomJwtAuthGuard)
  async channelProfile(@User('login') login: string, @Param() id: convIdV) {
    return await this.chatService.channelDetail(login, id.convId);
  }

  @Post('/setMemberStatus/:convId')
  @UseGuards(CustomJwtAuthGuard)
  async setMemberStatus(
    @User('login') login: string,
    @Param() id: convIdV,
    @Body() data: memberV,
    @Body() status: memberStatusV,
  ) {
    return await this.chatService.setMemberStatus(
      login,
      id.convId,
      data.member,
      status.status,
    );
  }

  @Post('/addMembers/:convId')
  @UseGuards(CustomJwtAuthGuard)
  async addMembers(
    @User('login') login: string,
    @Param() id: convIdV,
    @Body() data: membersV,
  ) {
    return await this.chatService.addMembers(login, id.convId, data.members);
  }

  @Post('/banMember/:convId')
  @UseGuards(CustomJwtAuthGuard)
  async banMember(
    @User('login') login: string,
    @Param() id: convIdV,
    @Body() data: memberV,
  ) {
    return await this.chatService.banMember(login, id.convId, data.member);
  }

  @Post('/kickMember/:convId')
  @UseGuards(CustomJwtAuthGuard)
  async kickMember(
    @User('login') login: string,
    @Param() id: convIdV,
    @Body() data: memberV,
  ) {
    return await this.chatService.kickMember(login, id.convId, data.member);
  }

  @Post('/muteMember/:convId')
  @UseGuards(CustomJwtAuthGuard)
  async muteMember(
    @User('login') login: string,
    @Param() id: convIdV,
    @Body() data: memberV,
  ) {
    return await this.chatService.muteMember(
      login,
      id.convId,
      data.member,
    );
  }

  @Post('/unmuteMember/:convId')
  @UseGuards(CustomJwtAuthGuard)
  async unmuteMember(
    @User('login') login: string,
    @Param() id: convIdV,
    @Body() data: memberV,
  ) {
    return await this.chatService.unmuteMember(login, id.convId, data.member);
  }

  @Post('/updateChannel/:convId')
  @UseGuards(CustomJwtAuthGuard)
  async updateChannel(
    @User('login') login: string,
    @Param() id: convIdV,
    @Body() data: updateChannelDto,
  ) {
    return await this.chatService.updateChannel(login, id.convId, data);
  }
}
