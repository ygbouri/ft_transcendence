import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { UserService } from './User/User.service';
import { userStatus } from './User/entity/User.entity';

@WebSocketGateway()
export class CustomAppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger('CustomAppGateway');

  constructor(private userService: UserService) {}

  afterInit() {
    this.logger.log('CustomAppGateway initialized!');
  }

  async handleConnection(client: Socket) {
    const login = client.data.login; // Assuming the 'login' property exists in client data
    if (login) {
      this.userService.setStatus(login, userStatus.ONLINE);
    } else {
      this.logger.warn('handleConnection: Missing login data in client!');
    }
  }

  async handleDisconnect(client: Socket) {
    const login = client.data.login; // Assuming the 'login' property exists in client data
    if (login) {
      this.userService.setStatus(login, userStatus.OFFLINE);
    } else {
      this.logger.warn('handleDisconnect: Missing login data in client!');
    }
    client.disconnect();
  }
}
