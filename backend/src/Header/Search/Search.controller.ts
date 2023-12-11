import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CustomJwtAuthGuard } from 'src/2faJwt/jwt/JwtAuth.guard';
import { User } from 'src/User/User.decorator';
import { userParitalDto } from 'src/User/User.dto';
import { searchValidate } from './Search.dto';
import { SearchService } from './Search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('/users')
  @UseGuards(CustomJwtAuthGuard)
  async getUsers(@User() user: userParitalDto, @Query() query: searchValidate) {
    return await this.searchService.getUsers(user.login, query.search);
  }

  @Get('/channels')
  @UseGuards(CustomJwtAuthGuard)
  async getChannels(
    @User() user: userParitalDto,
    @Query() query: searchValidate,
  ) {
    return await this.searchService.getChannels(user.login, query.search);
  }
}
