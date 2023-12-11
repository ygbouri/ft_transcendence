import { Module } from '@nestjs/common';
import { JwtAuthModule } from 'src/2faJwt/jwt/JwtAuth.module';
import { ChatModule } from 'src/Chat/Chat.module';
import { UserModule } from 'src/User/User.module';
import { SearchController } from './Search.controller';
import { SearchService } from './Search.service';

@Module({
  controllers: [SearchController],
  providers: [SearchService],
  imports: [UserModule, JwtAuthModule, ChatModule],
})
export class SearchModule {}
