import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { userAchievements } from './entity/Stats.entity';

export class updateProfileValidate {
  @IsOptional()
  @IsString()
  @Matches(/^(?=.{4,25}$)(?![ _.-])(?!.*[_.-]{2})[a-zA-Z0-9 ._-]+(?<![ _.-])$/)
  fullname: string;

  @IsOptional()
  @IsString()
  oldPath: string;
}

export interface userDto {
  id?: string;
  login: string;
  fullname: string;
  avatar: string;
  isAuthenticated?: boolean;
  _2faSecret?: string;
  is2faEnabled?: boolean;
}

export interface userParitalDto {
  id: string;
  login: string;
  isFirst?: boolean;
}

export interface DBrank {
  id: string;
  XP: number;
  GP: number;
  rank: number;
}

export interface DBstats {
  id: string;
  XP: number;
  GP: number;
  numGames: number;
  gamesWon: number;
  rank: number;
  achievement: userAchievements[];
}

export interface DBleader {
  login: string;
  fullname: string;
  avatar: string;
  numGames: string;
  gamesWon: string;
  GP: number;
  rank: number;
  relation: string;
}
