import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { UserService } from 'src/User/User.service';
import { Repository } from 'typeorm';
import {
  conversationDto,
  createChannelDto,
  createconversationDto,
  createMemberDto,
  createMsgDto,
  msgDto,
  updateChannelDto,
} from './Chat.dto';
import {
  Conversation,
  conversationType,
  invitationStatus,
  Member,
  memberStatus,
  Message,
} from './entity/Chat.entity';
import { ChatGateway } from './Chat.gateway';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Service_of_friendship } from 'src/Friendship/Friendship.service';
import { userRelation } from 'src/Friendship/entity/Friendship.entity';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => Service_of_friendship))
    private Service_of_friendship: Service_of_friendship,
    @Inject(forwardRef(() => ChatGateway))
    private chatGateway: ChatGateway,
    private schedulerRegistry: SchedulerRegistry,
    private readonly configService: ConfigService,
  ) {}

  async searchChannels(login: string, search: string) {
    search = search.toLowerCase();
    const convs: Conversation[] = await this.conversationRepository
      .createQueryBuilder('conversations')
      .select([
        'conversations.id',
        'conversations.name',
        'conversations.avatar',
        'conversations.type',
      ])
      .where(
        `(conversations.type = 'Public' OR conversations.type = 'Protected') AND LOWER(conversations.name) LIKE '%${search}%'`,
      )
      .getMany();
    if (!convs.length) return { data: convs };
    const convsList = [];
    await Promise.all(
      convs.map(async (conv) => {
        const exist = await this.memberRepository.query(
          `select members.id, members."status" from members Join users ON members."userId" = users.id where members."conversationId" = '${conv.id}' AND users."login" = '${login}';`,
        );
        if (!exist.length || exist[0].status === memberStatus.LEFT)
          convsList.push({
            convId: conv.id,
            Avatar: conv.avatar,
            title: conv.name,
            type: conv.type,
            status: undefined,
          });
        else if (exist[0].status !== memberStatus.BANNED)
          convsList.push({
            convId: conv.id,
            Avatar: conv.avatar,
            title: conv.name,
            type: conv.type,
            status: exist[0].status,
          });
      }),
    );
    return { data: [...convsList] };
  }

  async getAllUnreadMsg(login: string) {
    const mem: Member[] = await this.memberRepository.query(
      `select members.id, members."unread" from members Join users ON members."userId" = users.id where users."login" = '${login}' AND members."leftDate" is null;`,
    );
    if (!mem.length) return { data: false };
    const member: Member = mem.find((member) => member.unread > 0);
    if (!member) return { data: false };
    return { data: true };
  }

  async setMsgsAsRead(login: string, conversationId: string) {
    const mem = await this.memberRepository.query(
      `select members.id, members."unread" from members Join users ON members."userId" = users.id where members."conversationId" = '${conversationId}' AND users."login" = '${login}' AND members."leftDate" is null;`,
    );
    if (!mem.length) return { error: 'Invalid conversation' };
    await this.memberRepository.query(
      `update members set unread = '${0}' where members."id" = '${mem[0].id}';`,
    );
    return { data: true };
  }

  async updateUnreadMsgs(login: string, convId: string) {
    const mem = await this.memberRepository.query(
      `select members.id, members."unread", users.login from members Join users ON members."userId" = users.id where members."conversationId" = '${convId}' AND members."leftDate" is null;`,
    );
    if (!mem.length) return;
    await Promise.all(
      mem.map(async (member) => {
        const unread: number = +member.unread;
        if (login !== member.login)
          await this.memberRepository.query(
            `update members set unread = '${
              unread + 1
            }' where members."id" = '${member.id}';`,
          );
      }),
    );
  }

  async getRoomSockets(login: string, room: string) {
    const sockets = await this.chatGateway.server.in(room).fetchSockets();
    const newSockets: string[] = [];
    await Promise.all(
      sockets.map(async (socket) => {
        const relation = await this.Service_of_friendship.getRelation(
          login,
          socket.data.login,
        );
        if (relation !== 'blocked') newSockets.push(socket.id);
      }),
    );
    return newSockets;
  }

  async joinConversations(client: Socket) {
    const conversation: conversationDto[] = await this.memberRepository.query(
      `select conversations.id as "convId" from members Join users ON members."userId" = users.id Join conversations ON members."conversationId" = conversations.id where users."login" = '${client.data.login}' AND members."leftDate" IS null;`,
    );
    if (!conversation.length) return;
    conversation.forEach((conv) => client.join(conv.convId));
  }

  async getDMInfo(login: string, name: string) {
    const userInfo = await this.userService.getFriend(name);
    if (!userInfo) return { error: 'user not found' };
    const conversation = await this.memberRepository.query(
      `select conversations.id, count(*) from members join users on members."userId" = users.id join conversations on members."conversationId" = conversations.id where (users.login = '${login}' or users.login = '${name}') and conversations.type = 'Dm' group by conversations.id having count(*) = 2;`,
    );
    if (conversation.length) return { data: true };
    const relation = await this.Service_of_friendship.getRelation(login, name);
    if (relation === userRelation.BLOCKED) return { error: 'user is blocked' };
    return { data: { ...userInfo, relation } };
  }

  // async getChannelInfo(login: string, id: string) {
  //   const conv = await this.conversationRepository.query(
  //     `select conversations.id as "convId", conversations.type, conversations.avatar, conversations.name from conversations where conversations.type != 'Dm' AND conversations.id = '${id}';`,
  //   );
  //   if (!conv.length) return { error: 'Channel not found' };
  //   const member = await this.memberRepository.query(
  //     `select members.id from members Join users ON members."userId" = users.id Join conversations ON members."conversationId" = conversations.id where users."login" = '${login}' AND conversations.id = '${id}';`,
  //   );
  //   if (member.length) return { data: true };
  //   if (conv[0].type === 'Private') return { error: 'Channel not found' };
  //   return { data: { ...conv[0] } };
  // }

  async blockUser(login: string, user: string) {
    const conv = await this.memberRepository.query(
      `select conversations.id, count(*) from members join users on members."userId" = users.id join conversations on members."conversationId" = conversations.id where (users.login = '${login}' or users.login = '${user}') and conversations.type = 'Dm' group by conversations.id having count(*) = 2;`,
    );
    if (!conv.length) return null;
    let currDate = new Date(Date.now()).toLocaleString('en-US', {
      timeZone: 'CET',
    });
    currDate = new Date(currDate).toISOString();
    await this.memberRepository.query(
      `update members set status = 'Blocker', "leftDate" = '${currDate}' FROM users where members."userId" = users.id AND members."conversationId" = '${conv[0].id}' AND users."login" = '${login}';`,
    );
    const sockets = await this.chatGateway.server.fetchSockets();
    const clients = sockets.filter((socket) => socket.data.login === login);
    clients.forEach((client) => client.leave(conv[0].id));
  }

  async unBlockUser(login: string, user: string) {
    const conv = await this.memberRepository.query(
      `select conversations.id, count(*) from members join users on members."userId" = users.id join conversations on members."conversationId" = conversations.id where (users.login = '${login}' or users.login = '${user}') and conversations.type = 'Dm' group by conversations.id having count(*) = 2;`,
    );
    if (!conv.length) return null;
    await this.memberRepository.query(
      `update members set status = 'Member', "leftDate" = null FROM users where members."userId" = users.id AND members."conversationId" = '${conv[0].id}' AND users."login" = '${login}';`,
    );
    const sockets = await this.chatGateway.server.fetchSockets();
    const clients = sockets.filter((socket) => socket.data.login === login);
    clients.forEach((client) => client.join(conv[0].id));
  }

  async encryptPasswordOfChannel(password: string) {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  async checkPassword(password: string, input: string) {
    return await bcrypt.compare(input, password);
  }

  async getConvInfo(login: string, conversation: conversationDto) {
    if (conversation.type === 'Dm') {
      const users = await this.memberRepository.query(
        `select users.login, users.fullname, users.avatar,users.status, members."unread" from members Join users ON members."userId" = users.id where members."conversationId" = '${conversation.convId}' AND users.login != '${login}';`,
      );
      const relation = await this.Service_of_friendship.getChatRelation(
        login,
        users[0].login,
      );
      conversation.name = users[0].fullname;
      conversation.login = users[0].login;
      if (relation === 'blocked') conversation.status = 'Blocker';
      else conversation.status = users[0].status;
      conversation.avatar = users[0].avatar;
    } else {
      const nomberOfMember = await this.memberRepository.query(
        `select COUNT(*) from members where members."conversationId" = '${conversation.convId}' AND members."leftDate" is null;`,
      );
      conversation.login = conversation.name;
      conversation.membersNum = +nomberOfMember[0].count;
    }
    return conversation;
  }

  async getConversationById(login: string, convId: string) {
    const convs: conversationDto[] = await this.memberRepository.query(
      `select conversations.id as "convId", conversations.type, conversations.avatar, conversations.name, conversations."lastUpdate", members.status, members."leftDate", members."unread" from members Join users ON members."userId" = users.id Join conversations ON members."conversationId" = conversations.id where users."login" = '${login}' AND members."conversationId" = '${convId}';`,
    );
    if (!convs.length) return { error: 'Conversation not found!' };
    const conversation: conversationDto = await this.getConvInfo(
      login,
      convs[0],
    );
    return { data: { ...conversation } };
  }

  async getAllConversationOf(login: string) {
    const conversation: conversationDto[] = await this.memberRepository.query(
      `select conversations.id as "convId", conversations.type, conversations.avatar, conversations.name, conversations."lastUpdate", members.status, members."leftDate", members."unread" from members Join users ON members."userId" = users.id Join conversations ON members."conversationId" = conversations.id where users."login" = '${login}' order by conversations."lastUpdate" DESC;`,
    );
    const conversations: conversationDto[] = await Promise.all(
      conversation.map(async (conv) => this.getConvInfo(login, conv)),
    );
    return { data: [...conversations] };
  }

  async createConversation(
    newConv: createconversationDto,
    members: createMemberDto[],
  ) {
    let conv: Conversation = new Conversation();
    conv.type = newConv.type;
    if (newConv.name) conv.name = newConv.name;
    if (newConv.avatar) conv.avatar = newConv.avatar;
    if (newConv.password)
      conv.password = await this.encryptPasswordOfChannel(newConv.password);
    conv = await this.conversationRepository.save(conv);

    await Promise.all(
      members.map(async (mem) => {
        const member: Member = new Member();
        member.status = mem.status;
        member.conversation = conv;
        member.user = await this.userService.getUser(mem.login);
        await this.memberRepository.save(member);
      }),
    );
    return conv;
  }

  async updateConvDate(convId: string, date: Date) {
    return await this.conversationRepository
      .createQueryBuilder('conversations')
      .update({ lastUpdate: date })
      .where('id = :convId', { convId: convId })
      .execute();
  }

  async getConvById(convId: string) {
    const conv: Conversation = await this.conversationRepository
      .createQueryBuilder('conversations')
      .where('conversations.id = :convId', { convId: convId })
      .getOne();
    return conv;
  }

  async storeMsg(
    msg: string,
    sender: string,
    invitation: string,
    convId: Conversation,
  ) {
    let msgs: Message = new Message();
    msgs.msg = msg;
    msgs.sender = sender;
    msgs.invitation = invitation;
    msgs.conversation = convId;
    msgs = await this.messageRepository.save(msgs);
    return msgs;
  }

  async getMessages(login: string, id: string, conversationId: string) {
    const da = await this.memberRepository.query(
      `select members."joinDate", members."leftDate" from members where members."conversationId" = '${conversationId}' AND members."userId" = '${id}';`,
    );
    if (!da.length) return { error: 'Invalid data' };
    const joinDate: string = new Date(da[0].joinDate).toISOString();
    const leftDate: string = !da[0].leftDate
      ? da[0].leftDate
      : new Date(da[0].leftDate).toISOString();
    let messages: Message[] = [];
    if (leftDate)
      messages = await this.messageRepository.query(
        `SELECT messages."id", messages."sender", messages."msg", messages."createDate", messages."conversationId" as "convId", messages."invitation", messages."status" FROM messages where messages."conversationId" = '${conversationId}' AND messages."createDate" >= '${joinDate}' AND messages."createDate" <= '${leftDate}' order by messages."createDate" ASC;`,
      );
    else
      messages = await this.messageRepository.query(
        `SELECT messages."id", messages."sender", messages."msg", messages."createDate", messages."conversationId" as "convId", messages."invitation", messages."status" FROM messages where messages."conversationId" = '${conversationId}' AND messages."createDate" >= '${joinDate}' order by messages."createDate" ASC;`,
      );

    if (!messages.length) return { data: messages };
    const convers: Conversation = await this.getConvById(conversationId);
    const newMessage: msgDto[] = [];
    await Promise.all(
      messages.map(async (msg) => {
        const msgSent: msgDto = {
          msg: msg.msg,
          sender: msg.sender,
          invitation: msg.invitation,
          status: msg.status,
          date: msg.createDate,
          convId: convers.id,
          msgId: msg.id,
        };
        if (convers.type === conversationType.Dm) newMessage.push(msgSent);
        else {
          const relation = await this.Service_of_friendship.getRelation(
            login,
            msg.sender,
          );
          if (relation !== 'blocked') {
            const fullname = await this.memberRepository.query(
              `select users.fullname from members Join users ON members."userId" = users.id where members."conversationId" = '${conversationId}' AND users."login" = '${msg.sender}';`,
            );
            msgSent.fullname = fullname[0].fullname;
            newMessage.push(msgSent);
          }
        }
      }),
    );
    newMessage.sort((a: msgDto, b: msgDto) => {
      const right: number = a.date.getTime();
      const left: number = b.date.getTime();
      return right - left;
    });
    return { data: [...newMessage] };
  }

  async updateInvitation(
    login: string,
    convId: string,
    msgId: string,
    status: invitationStatus,
  ) {
    const me = await this.memberRepository.query(
      `select from members Join users ON members."userId" = users.id where members."conversationId" = '${convId}' AND users.login != '${login}';`,
    );
    if (!me.length) return { error: 'Invalid data' };
    await this.messageRepository.query(
      `update messages set status = '${status}' where id = '${msgId}' AND status = '${invitationStatus.SENT}'`,
    );
    const msg = await this.messageRepository.query(
      `SELECT messages."id" as "msgId", messages."sender", messages."msg", messages."createDate", messages."conversationId" as "convId", messages."invitation", messages."status" FROM messages where messages."id" = '${msgId}';`,
    );
    return { data: msg[0] };
  }

  async createNewDm(client: Socket, data: createMsgDto) {
    const me = await this.memberRepository.query(
      `select conversations.id, count(*) from members join users on members."userId" = users.id join conversations on members."conversationId" = conversations.id where (users.login = '${client.data.login}' or users.login = '${data.receiver}') and conversations.type = 'Dm' group by conversations.id having count(*) = 2;`,
    );
    if (me.length) {
      data.convId = me[0].id;
      return await this.createNewMessage(client.data.login, data);
    }
    const newConversation: createconversationDto = {
      type: conversationType.Dm,
    };
    const newMember: createMemberDto[] = [
      { status: memberStatus.MEMBER, login: client.data.login },
      { status: memberStatus.MEMBER, login: data.receiver },
    ];
    const conv: Conversation = await this.createConversation(
      newConversation,
      newMember,
    );
    const newMsg: Message = await this.storeMsg(
      data.msg,
      client.data.login,
      data.invitation,
      conv,
    );

    const soc = await this.chatGateway.server.fetchSockets();
    const clients = soc.filter(
      (socket) => socket.data.login === client.data.login,
    );
    clients.forEach((client) => client.join(conv.id));

    const friendSoc = soc.filter(
      (socket) => socket.data.login === data.receiver,
    );
    friendSoc.forEach((friendSocket) => friendSocket.join(conv.id));

    const fullname = await this.memberRepository.query(
      `select users."fullname" from members Join users ON members."userId" = users.id where users.login != '${client.data.login}';`,
    );
    // newMsg.createDate.getTime() - new Date().getTimezoneOffset() * 120000,
    const newDate: Date = new Date();
    const msg: msgDto = {
      msg: data.msg,
      sender: client.data.login,
      fullname: fullname[0].fullname,
      invitation: newMsg.invitation,
      status: newMsg.status,
      date: newDate,
      convId: conv.id,
      msgId: newMsg.id,
    };
    return msg;
  }

  async createNewMessage(login: string, data: createMsgDto) {
    if (!data.convId) return null;
    const converstaion = await this.getConvById(data.convId);
    const me = await this.memberRepository.query(
      `select members.status from members Join users ON members."userId" = users.id where members."conversationId" = '${data.convId}' AND users."login" = '${login}';`,
    );
    if (!me.length) return null;
    const status = me[0].status;
    if (
      status === 'Muted' ||
      status === 'Left' ||
      status === 'Banned' ||
      status === 'Blocker' ||
      status === 'Kicked'
    )
      return status;
    const newMessage: Message = await this.storeMsg(
      data.msg,
      login,
      data.invitation,
      converstaion,
    );
    await this.updateConvDate(converstaion.id, newMessage.createDate);
    const fullname = await this.memberRepository.query(
      `select users."fullname" from members Join users ON members."userId" = users.id where users.login = '${login}';`,
    );
    const msg: msgDto = {
      msg: data.msg,
      sender: login,
      fullname: fullname[0].fullname,
      invitation: newMessage.invitation,
      status: newMessage.status,
      date: newMessage.createDate,
      convId: converstaion.id,
      msgId: newMessage.id,
    };
    return msg;
  }

  async createChannel(owner: string, chan: createChannelDto) {
    if (chan.type === conversationType.PROTECTED && !chan.password?.length)
      return { error: 'Password incorrect' };
    if (chan.type !== conversationType.PROTECTED) chan.password = undefined;
    const avatar = `https://source.boringavatars.com/beam/200/${chan.name}?colors=00a0b0,6a4a3c,cc333f,eb6841,edc951`;

    const newConversation: createconversationDto = {
      type: chan.type,
      name: chan.name,
      avatar: avatar,
      password: chan.password,
    };
    chan.members.unshift(owner);
    chan.members = [...new Set(chan.members)];
    const addMembers: createMemberDto[] = chan.members.map((mem) => {
      if (mem === owner) return { status: memberStatus.OWNER, login: owner };
      return { status: memberStatus.MEMBER, login: mem };
    });
    const conversation: Conversation = await this.createConversation(
      newConversation,
      addMembers,
    );
    const sockets = await this.chatGateway.server.fetchSockets();
    chan.members.forEach((member) => {
      const membersSockets = sockets.filter(
        (socket) => socket.data.login === member,
      );
      membersSockets.forEach((memberSocket) =>
        memberSocket.join(conversation.id),
      );
    });
    return {
      data: {
        convId: conversation.id,
        name: conversation.name,
        login: conversation.name,
        type: conversation.type,
        membersNum: chan.members.length,
        avatar: conversation.avatar,
      },
    };
  }

  async joinChannel(
    login: string,
    conversationId: string,
    password: string,
    owner: boolean,
  ) {
    const member = await this.conversationRepository.query(
      `select id, type, password from conversations where conversations.id = '${conversationId}';`,
    );
    if (!member.length) return { error: 'Invalid data' };
    if (member[0].type === 'Protected' && !owner) {
      if (!password) return { error: 'Please provide a correct password' };
      const validPassword: boolean = await this.checkPassword(
        member[0].password,
        password,
      );
      if (!validPassword) return { error: 'Invalid password' };
    }
    const mem = await this.memberRepository.query(
      `select members.id, members."leftDate", members."status" from members Join users ON members."userId" = users.id where members."conversationId" = '${conversationId}' AND users."login" = '${login}';`,
    );
    const own = await this.memberRepository.query(
      `select members.id from members where members."conversationId" = '${conversationId}' AND members.status = 'Owner';`,
    );
    let status: memberStatus = memberStatus.MEMBER;
    if (!own.length) status = memberStatus.OWNER;
    if (!mem.length) {
      const member = new Member();
      member.status = status;
      member.conversation = await this.getConvById(conversationId);
      member.user = await this.userService.getUser(login);
      await this.memberRepository.save(member);
    } else if (
      (mem[0].leftDate && owner) ||
      (mem[0].leftDate && mem[0].status !== memberStatus.BANNED)
    ) {
      await this.memberRepository.query(
        `update members set "leftDate" = null, "status" = '${status}' FROM users where members."userId" = users.id AND members."conversationId" = '${conversationId}' AND users."login" = '${login}';`,
      );
    }
    const soc = await this.chatGateway.server.fetchSockets();
    const clients = soc.filter((socket) => socket.data.login === login);
    clients.forEach((client) => client.join(conversationId));
    return { data: { conversationId } };
  }

  async leaveChannel(login: string, conversationId: string) {
    const leave = await this.memberRepository.query(
      `select members.status, members.id from members Join users ON members."userId" = users.id Join conversations ON members."conversationId" = conversations.id where members."conversationId" = '${conversationId}' AND users."login" = '${login}' AND conversations."type" != 'Dm' AND members."leftDate" is null;`,
    );
    if (!leave.length) return { error: 'Invalid data' };
    if (leave[0].status === 'Owner') {
      const admins = await this.memberRepository.query(
        `select members.id from members where members."conversationId" = '${conversationId}' AND members.status = 'Admin';`,
      );
      if (admins.length) {
        await this.memberRepository.query(
          `update members set "status" = 'Owner' where members.id = '${admins[0].id}';`,
        );
      } else {
        const members = await this.memberRepository.query(
          `select members.id from members where members."conversationId" = '${conversationId}' AND members.status = 'Member';`,
        );
        if (members.length) {
          await this.memberRepository.query(
            `update members set "status" = 'Owner' where members.id = '${members[0].id}';`,
          );
        } else {
          const muted = await this.memberRepository.query(
            `select members.id from members where members."conversationId" = '${conversationId}' AND members.status = 'Muted';`,
          );
          if (muted.length) {
            await this.memberRepository.query(
              `update members set "status" = 'Owner' where members.id = '${muted[0].id}';`,
            );
          }
        }
      }
    }
    const leavingDate = new Date().toISOString();
    await this.memberRepository.query(
      `update members set "leftDate" = '${leavingDate}', "status" = 'Left' where members.id = '${leave[0].id}';`,
    );
    const soc = await this.chatGateway.server.fetchSockets();
    const clients = soc.filter((socket) => socket.data.login === login);
    clients.forEach((client) => client.leave(conversationId));
    return { data: { conversationId } };
  }

  async channelDetail(login: string, convId: string) {
    const me = await this.memberRepository.query(
      `select members.status from members Join users ON members."userId" = users.id where members."conversationId" = '${convId}' AND users."login" = '${login}';`,
    );
    if (!me.length) return { error: 'Invalid data' };
    const owner: Member[] = await this.memberRepository.query(
      `select users."login", users."fullname", users."avatar", members."status" from members Join users ON members."userId" = users.id where members."conversationId" = '${convId}' AND members."status" = 'Owner';`,
    );
    const admins: Member[] = await this.memberRepository.query(
      `select users."login", users."fullname", users."avatar", members."status" from members Join users ON members."userId" = users.id where members."conversationId" = '${convId}' AND members."status" = 'Admin';`,
    );
    const members: Member[] = await this.memberRepository.query(
      `select users."login", users."fullname", users."avatar", members."status" from members Join users ON members."userId" = users.id where members."conversationId" = '${convId}' AND members."status" = 'Member';`,
    );
    let muted: Member[] = [];
    if (me[0].status === 'Owner' || me[0].status === 'Admin')
      muted = await this.memberRepository.query(
        `select users."login", users."fullname", users."avatar", members."status" from members Join users ON members."userId" = users.id where members."conversationId" = '${convId}' AND members."status" = 'Muted';`,
      );
    return { data: { owner, admins, members, muted } };
  }

  async setMemberStatus(
    login: string,
    conversationId: string,
    memberadded: string,
    status: memberStatus,
  ) {
    const me = await this.memberRepository.query(
      `select from members Join users ON members."userId" = users.id where members."conversationId" = '${conversationId}' AND users."login" = '${login}' AND (members."status" = 'Owner' OR members."status" = 'Admin');`,
    );
    if (!me.length) return { error: 'Invalid data' };
    await this.memberRepository.query(
      `update members set status = '${status}' FROM users where members."userId" = users.id AND members."conversationId" = '${conversationId}' AND users."login" = '${memberadded}' AND members."leftDate" IS NULL AND members."status" != 'Owner';`,
    );
    return { data: true };
  }

  async addMembers(login: string, conversationId: string, memb: string[]) {
    const me = await this.memberRepository.query(
      `select from members Join users ON members."userId" = users.id where members."conversationId" = '${conversationId}' AND users."login" = '${login}' AND (members."status" = 'Owner' OR members."status" = 'Admin');`,
    );
    if (!me.length) return { error: 'Invalid data' };
    memb = [...new Set(memb)];
    memb.forEach(async (mem) => {
      await this.joinChannel(mem, conversationId, undefined, true);
    });
    return { data: true };
  }

  async banMember(login: string, conversationId: string, membLogin: string) {
    const me = await this.memberRepository.query(
      `select from members Join users ON members."userId" = users.id where members."conversationId" = '${conversationId}' AND users."login" = '${login}' AND (members."status" = 'Owner' OR members."status" = 'Admin');`,
    );
    if (!me.length) return { error: 'Invalid data' };
    const banDate = new Date().toISOString();
    await this.memberRepository.query(
      `update members set "leftDate" = '${banDate}', "status" = 'Banned' FROM users where members."userId" = users.id AND members."conversationId" = '${conversationId}' AND members."status" != 'Owner' AND users."login" = '${membLogin}';`,
    );
    const soc = await this.chatGateway.server.fetchSockets();
    const clients = soc.filter((socket) => socket.data.login === login);
    clients.forEach((client) => client.leave(conversationId));
    return { data: { conversationId } };
  }

  async kickMember(login: string, conversationId: string, membLogin: string) {
    const me = await this.memberRepository.query(
      `SELECT FROM members
      JOIN users ON members."userId" = users.id
      WHERE members."conversationId" = '${conversationId}'
        AND users."login" = '${login}'
        AND (members."status" = 'Owner' OR members."status" = 'Admin');`,
    );

    if (!me.length) {
      return { error: 'Invalid data' };
    }

    const kickDate = new Date().toISOString();

    await this.memberRepository.query(
      `UPDATE members SET "leftDate" = '${kickDate}', "status" = 'Kicked' FROM users WHERE members."userId" = users.id AND members."conversationId" = '${conversationId}' AND members."status" != 'Owner' AND users."login" = '${membLogin}';`,
    );
    const soc = await this.chatGateway.server.fetchSockets();
    const clients = soc.filter((socket) => socket.data.login === login);
    clients.forEach((client) => client.leave(conversationId));
    return { data: true };
  }

  async unmuteMember(login: string, conversationId: string, membLogin: string) {
    const me = await this.memberRepository.query(
      `select from members Join users ON members."userId" = users.id where members."conversationId" = '${conversationId}' AND users."login" = '${login}' AND (members."status" = 'Owner' OR members."status" = 'Admin');`,
    );
    if (!me.length) return { error: 'Invalid data' };
    const membId = await this.memberRepository.query(
      `select members.id from members Join users ON members."userId" = users.id where members."conversationId" = '${conversationId}' AND users."login" = '${membLogin}' AND members."status" = 'Muted';`,
    );
    if (!membId.length) return { error: 'Invalid data' };
    await this.memberRepository.query(
      `update members set "leftDate" = null, "status" = 'Member' where members."id" = '${membId[0].id}';`,
    );

    return { data: true };
  }

  async muteMember(
    login: string,
    conversationId: string,
    membLogin: string,
  ) {
    const me = await this.memberRepository.query(
      `select from members Join users ON members."userId" = users.id where members."conversationId" = '${conversationId}' AND users."login" = '${login}' AND (members."status" = 'Owner' OR members."status" = 'Admin');`,
    );
    if (!me.length) return { error: 'Invalid data' };
    const membId = await this.memberRepository.query(
      `select members.id from members Join users ON members."userId" = users.id where members."conversationId" = '${conversationId}' AND users."login" = '${membLogin}' AND (members."status" = 'Member' OR members."status" = 'Admin');`,
    );
    if (!membId.length) return { error: 'Invalid data' };
    await this.memberRepository.query(
      `update members set "status" = 'Muted' where members."id" = '${membId[0].id}';`,
    );
    return { data: true };
  }

  async updateChannel(
    login: string,
    conversationId: string,
    data: updateChannelDto,
  ) {
    const me = await this.memberRepository.query(
      `select from members Join users ON members."userId" = users.id where members."conversationId" = '${conversationId}' AND users."login" = '${login}' AND (members."status" = 'Owner' OR members."status" = 'Admin');`,
    );
    if (!me.length) return { error: 'Invalid data' };
    if (data.type === 'Protected' && !data.password)
      return { error: 'password incorrect' };

    if (data.name)
      await this.conversationRepository.query(
        `update conversations set name = '${data.name}' where id = '${conversationId}'`,
      );
    if (data.type)
      await this.conversationRepository.query(
        `update conversations set type = '${data.type}' where id = '${conversationId}'`,
      );
    if (data.password) {
      const pass = await this.encryptPasswordOfChannel(data.password);
      await this.conversationRepository.query(
        `update conversations set type = '${pass}' where id = '${conversationId}'`,
      );
    }
    return { data: true };
  }
}
