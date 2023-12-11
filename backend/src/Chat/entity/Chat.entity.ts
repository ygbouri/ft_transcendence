import { User } from 'src/User/entity/User.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum memberStatus {
  OWNER = 'Owner',
  ADMIN = 'Admin',
  MEMBER = 'Member',
  LEFT = 'Left',
  MUTED = 'Muted',
  BANNED = 'Banned',
  BLOCKER = 'Blocker',
  KICKED = 'Kicked',
}

export enum conversationType {
  Dm = 'Dm',
  PUBLIC = 'Public',
  PROTECTED = 'Protected',
  PRIVATE = 'Private',
}

export enum invitationStatus {
  SENT = 'Sent',
  CANCELED = 'Canceled',
  ACCEPTED = 'Accepted',
  REFUSED = 'Refused',
}

@Entity({ name: 'conversations' })
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: null })
  name: string;

  @UpdateDateColumn()
  lastUpdate: Date;

  @Column({
    type: 'enum',
    enum: conversationType,
    default: conversationType.Dm,
  })
  type: conversationType;

  @Column({ default: null })
  password: string;

  @Column({ default: null })
  avatar: string;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @OneToMany(() => Member, (member) => member.conversation)
  members: Member[];
}

@Entity({ name: 'messages' })
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sender: string;

  @Column({ type: 'text', nullable: true })
  msg: string;

  @Column({ default: null })
  invitation: string;

  @Column({
    type: 'enum',
    enum: invitationStatus,
    default: invitationStatus.SENT,
  })
  status: invitationStatus;

  @CreateDateColumn()
  createDate: Date;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  conversation: Conversation;
}

@Entity({ name: 'members' })
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: memberStatus, default: memberStatus.MEMBER })
  status: memberStatus;

  @CreateDateColumn()
  joinDate: Date;

  @Column({ default: null })
  leftDate: Date;

  @Column({ default: 0 })
  unread: number;

  @ManyToOne(() => Conversation, (conversation) => conversation.members)
  conversation: Conversation;

  @ManyToOne(() => User, (user) => user.members)
  user: User;
}
