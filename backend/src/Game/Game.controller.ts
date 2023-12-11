import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CustomJwtAuthGuard } from 'src/2faJwt/jwt/JwtAuth.guard';
import { loginValidate } from 'src/Friendship/Friendship.dto';
import { User } from 'src/User/User.decorator';
import { userParitalDto } from 'src/User/User.dto';
import { GameService } from './Game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('/matchHistory')
  @UseGuards(CustomJwtAuthGuard)
  async getMyMatches(@User() user: userParitalDto) {
    return await this.gameService.getMatches(user.login);
  }

  @Get('/matchHistory/:login')
  @UseGuards(CustomJwtAuthGuard)
  async getUserMatches(@Param() data: loginValidate) {
    return await this.gameService.getMatches(data.login);
  }
}
