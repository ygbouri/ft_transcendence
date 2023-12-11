import { Member } from 'src/Chat/entity/Chat.entity';
import {
  Column,
  JoinColumn,
  Entity,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Stats } from './Stats.entity';

export enum userStatus {
  ONLINE = 'Online',
  OFFLINE = 'Offline',
  INGAME = 'In Game',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  login: string;

  @Column()
  fullname: string;

  @Column()
  avatar: string;

  @Column({ type: 'enum', enum: userStatus, default: userStatus.ONLINE })
  status: userStatus;

  @Column({ nullable: true })
  _2faSecret: string;

  @Column({ default: false })
  is2faEnabled: boolean;

  @OneToOne(() => Stats)
  @JoinColumn()
  stats: Stats;

  @OneToMany(() => Member, (member) => member.user)
  members: Member[];
}
