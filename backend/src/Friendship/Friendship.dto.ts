import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class loginValidate {
  @IsNotEmpty()
  @IsString()
  @Matches(
    /^((?=.{2,20}$)(?![ _.-])(?!.*[_.-]{2})[a-zA-Z0-9 ._]+(?<![ _.-])|(\@me))$/,
  )
  login: string;
}

export interface friendST {
  login: string;
  fullname: string;
  avatar: string;
  status?: string;
}

export interface friendshipDto {
  id?: string;
  user: string;
  friend: string;
}

