import { INestApplicationContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Socket } from 'socket.io';
import { JwtAuthService } from './2faJwt/jwt/JwtAuth.service';

export class CustomSocketIOAdapter extends IoAdapter {
  private readonly logger = new Logger(CustomSocketIOAdapter.name);

  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const frontend_ip = this.configService.get<string>('FRONTEND_IP');

    options.cors = { origin: `http://${frontend_ip}`, credentials: true };

    const jwtAuthService = this.app.get(JwtAuthService);

    const server = super.createIOServer(port, options);
    server.use(customVerifyTokenMiddleware(jwtAuthService, this.logger));
    return server;
  }
}

const customVerifyTokenMiddleware =
  (jwtAuthService: JwtAuthService, logger: Logger) =>
  (socket: Socket, next) => {
    const token = socket.handshake.headers.cookie
      ?.split(';')
      ?.find((cookie: string) => cookie.includes('jwt='))
      ?.split('=')[1];
    try {
      const payload = jwtAuthService.verify(token);
      socket.data.login = payload.login;
      next();
    } catch (error) {
      socket.disconnect();
    }
  };
