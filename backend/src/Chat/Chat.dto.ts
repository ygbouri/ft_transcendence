import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';
import {
  conversationType,
  invitationStatus,
  memberStatus,
} from './entity/Chat.entity';

export class passwordV {
  @IsOptional()
  @Matches(
    /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/,
    {
      message:
        'Password must contain at least 8 characters.At least one number, one uppercase letter and one special character',
    },
  )
  password: string;
}

export class nameV {
  @IsNotEmpty()
  @IsString()
  @Length(2, 20)
  @Matches(/^(?=.{2,}$)(?![ _.-])(?!.*[_.-]{2})[a-zA-Z0-9 ._-]+(?<![ _.-])$/)
  name: string;
}

export class convIdV {
  @IsUUID()
  convId: string;
}

export class memberV {
  @IsNotEmpty()
  @IsString()
  @Length(4, 20)
  @Matches(/^(?=.{4,20}$)(?![ _.-])(?!.*[_.-]{2})[a-zA-Z0-9 ._-]+(?<![ _.-])$/)
  member: string;
}

export class membersV {
  @IsArray()
  @IsString({ each: true })
  @Length(4, 20, { each: true })
  @Matches(
    /^(?=.{4,20}$)(?![ _.-])(?!.*[_.-]{2})[a-zA-Z0-9 ._-]+(?<![ _.-])$/,
    { each: true },
  )
  members: string[];
}

export class memberStatusV {
  @IsNotEmpty()
  @IsEnum(memberStatus, { each: true, message: 'Invalid member status' })
  status: memberStatus;
}



export class createMsgDto {
  @IsOptional()
  @IsString()
  msg: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @Length(4, 20)
  @Matches(/^(?=.{4,20}$)(?![ _.-])(?!.*[_.-]{2})[a-zA-Z0-9 ._-]+(?<![ _.-])$/)
  receiver: string;

  @IsOptional()
  @IsUUID()
  convId: string;

  @IsOptional()
  @IsString()
  invitation: string;
}

export class updateInvitationDto {
  @IsUUID()
  convId: string;

  @IsUUID()
  msgId: string;

  @IsNotEmpty()
  @IsEnum(invitationStatus, {
    each: true,
    message: 'Invalid invitation status',
  })
  status: invitationStatus;
}

export class createChannelDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 20)
  @Matches(/^(?=.{2,20}$)(?![ _.-])(?!.*[_.-]{2})[a-zA-Z0-9 ._-]+(?<![ _.-])$/)
  name: string;

  @IsNotEmpty()
  @IsEnum(conversationType, {
    each: true,
    message: 'Conversation must be either Public, Protected or Private',
  })
  type: conversationType;

  @IsArray()
  @IsString({ each: true })
  @Length(4, 20, { each: true })
  @Matches(
    /^(?=.{4,20}$)(?![ _.-])(?!.*[_.-]{2})[a-zA-Z0-9 ._-]+(?<![ _.-])$/,
    { each: true },
  )
  members: string[];

  @IsOptional()
  @Matches(
    /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/,
    {
      message:
        'Password must contain at least 8 characters.At least one number, one uppercase letter and one special character',
    },
  )
  password: string;
}

export class updateChannelDto {
  @IsOptional()
  @IsString()
  @Length(2, 20)
  @Matches(/^(?=.{2,20}$)(?![ _.-])(?!.*[_.-]{2})[a-zA-Z0-9 ._-]+(?<![ _.-])$/)
  name: string;

  @IsOptional()
  @IsEnum(conversationType, {
    each: true,
    message: 'Conversation must be either Public, Protected or Private',
  })
  type: conversationType;

  @IsOptional()
  @Matches(
    /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/,
    {
      message:
        'Password must contain at least 8 characters.At least one number, one uppercase letter and one special character',
    },
  )
  password: string;
}

export interface conversationDto {
  convId: string;
  type: string;
  unread: number;
  name?: string;
  login?: string;
  avatar?: string;
  status?: string;
  membersNum?: number;
  lastUpdate?: Date;
  leftDate?: Date;
}

export interface createMemberDto {
  status: memberStatus;
  login: string;
}

export interface createconversationDto {
  name?: string;
  type: conversationType;
  password?: string;
  avatar?: string;
}

export interface msgDto {
  msg: string;
  sender: string;
  fullname?: string;
  invitation: string;
  status: invitationStatus;
  date: Date;
  convId: string;
  msgId: string;
}
