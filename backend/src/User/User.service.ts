import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  deleteOldAvatar,
  isFileValid,
  resizeAvatar,
} from 'src/config/upload.config';
import { friendST } from 'src/Friendship/Friendship.dto';
import { userRelation } from 'src/Friendship/entity/Friendship.entity';
import { Service_of_friendship } from 'src/Friendship/Friendship.service';
import { opponentDto } from 'src/Game/Game.dto';
import { Repository } from 'typeorm';
import { Stats, userAchievements } from './entity/Stats.entity';
import {
  DBleader,
  DBrank,
  DBstats,
  userDto,
  userParitalDto,
} from './User.dto';
import { User, userStatus } from './entity/User.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Stats)
    private statsRepository: Repository<Stats>,
    private readonly Service_of_friendship: Service_of_friendship,
    private readonly configService: ConfigService,
  ) {}

  async registerUser(newUser: userDto): Promise<userParitalDto> {
    let stats: Stats = new Stats();
    stats.rank =
      (await this.userRepository.createQueryBuilder('users').getCount()) + 1;
    stats = await this.statsRepository.save(stats);
    let user: User = new User();
    user.login = newUser.login;
    user.fullname = newUser.fullname;
    user.avatar = newUser.avatar;
    user.stats = stats;
    user = await this.userRepository.save(user);
    const getUser: userParitalDto = {
      id: user.id,
      login: user.login,
      isFirst: true,
    };
    return getUser;
  }

  async profileStyle(
    id: string,
    fullname: string,
    avatar: string,
    oldPath: string,
  ) {
    const currentUser = await this.userRepository.query(`select * from users`);

    for (const user of currentUser) {
      // Ensure that user.fullname and fullname are strings and convert them to lowercase
      const userFullname = user.fullname ? user.fullname.toLowerCase() : '';
      const inputFullname = fullname ? fullname.toLowerCase() : '';
    
      if (userFullname === inputFullname) {
        // Return an error and exit the loop
        return { error: 'Fullname is already in use by another user' };
      }
    }

    if (fullname) await this.setName(id, fullname);
    if (avatar) avatar = await isFileValid('users', avatar);
    if (avatar) {
      if (oldPath) deleteOldAvatar('users', oldPath);
      await this.setAvatar(
        id,
        `http://${this.configService.get(
          'BACKEND_IP',
        )}/uploads/users/${avatar}`,
      );
      resizeAvatar('users', avatar);
    }
    return { data: true };
  }

  async getUser(login: string) {
    const user: User = await this.userRepository
      .createQueryBuilder('users')
      .select(['users.id'])
      .where('users.login = :login', { login: login })
      .getOne();
    if (!user) return user;
    return user;
  }

  async userExist(login: string, friend: string) {
    const user: User = await this.userRepository
      .createQueryBuilder('users')
      .select(['users.login'])
      .where('users.login = :login', { login: friend })
      .getOne();
    if (!user) return { err: 'User not found' };
    const relation = await this.Service_of_friendship.getRelation(login, friend);
    if (relation === 'blocked') return { err: 'Unauthorized' };
    return { data: true };
  }

  async getPartialUser(login: string): Promise<userParitalDto> {
    const user: User = await this.userRepository
      .createQueryBuilder('users')
      .select(['users.id', 'users.login'])
      .where('users.login = :login', { login: login })
      .getOne();
    if (!user) return user;
    return {
      id: user.id,
      login: user.login,
    };
  }

  async getSecret(id: string) {
    const user: User = await this.userRepository
      .createQueryBuilder('users')
      .select(['users._2faSecret'])
      .where('users.id = :id', { id: id })
      .getOne();
    return user?._2faSecret;
  }

  async get2faEnabled(id: string) {
    const user: User = await this.userRepository
      .createQueryBuilder('users')
      .select(['users.is2faEnabled'])
      .where('users.id = :id', { id: id })
      .getOne();
    return user?.is2faEnabled;
  }

  async ft_get_header(currLogin: string, login: string) {
    if (login === '@me') login = currLogin;
    const user: User = await this.userRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.stats', 'stats')
      .select(['users.fullname', 'users.avatar'])
      .where('users.login = :login', { login: login })
      .getOne();
    if (!user) return { err: 'User not found' };
    return { data: { ...user } };
  }

  async ft_user_info(currLogin: string, login: string) {
    if (login === '@me') login = currLogin;
    let relation: userRelation = userRelation.NONE;
    const user: User = await this.userRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.stats', 'stats')
      .select([
        'users.login',
        'users.fullname',
        'users.avatar',
        'users.status',
        'stats.XP',
        'stats.GP',
        'stats.rank',
      ])
      .where(`users.login = :login`, { login: login })
      .getOne();
    if (!user) return { err: 'User not found' };
    if (currLogin !== login)
      relation = await this.Service_of_friendship.getRelation(currLogin, login);
    return { data: { ...user, relation } };
  }

  async ft_stats_user(currLogin: string, login: string) {
    if (login === '@me') login = currLogin;
    const stats: Stats[] = await this.userRepository
      .query(`SELECT stats."numGames", stats."gamesWon" FROM users
		JOIN stats ON users."statsId" = stats.id where users.login = '${login}';`);
    if (!stats.length) return { err: 'User not found' };
    return {
      data: { numGames: stats[0].numGames, gamesWon: stats[0].gamesWon },
    };
  }

  async achiev_add(currLogin: string, login: string) {
    if (login === '@me') login = currLogin;
    const user: User = await this.userRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.stats', 'stats')
      .select(['users.id', 'stats.achievement'])
      .where(`users.login = :login`, { login: login })
      .getOne();
    if (!user) return { err: 'User not found' };
    return { data: { achievements: user.stats.achievement } };
  }

  async ft_leader_get(login: string) {
    const users = await this.userRepository.query(
      `select users.login, users.fullname, users.avatar, stats.rank, stats."numGames", stats."gamesWon", stats."GP" from users join stats on users."statsId" = stats.id order by stats."GP" DESC`,
    );
    if (!users.length) return { data: [...users] };
    const leaderBoard: DBleader[] = await Promise.all(
      users.map(async (user) => {
        const relation = await this.Service_of_friendship.getRelation(
          login,
          user.login,
        );
        return {
          login: user.login,
          fullname: user.fullname,
          avatar: user.avatar,
          rank: user.rank,
          numGames: user.numGames,
          gamesWon: user.gamesWon,
          GP: user.GP,
          relation: relation,
        };
      }),
    );
    leaderBoard.sort((a: DBleader, b: DBleader) => {
      const right: number = a.GP;
      const left: number = b.GP;
      return left - right;
    });
    return { data: [...leaderBoard] };
  }

  async searchUsers(login: string, search: string) {
    search = search.toLowerCase();
    const users: User[] = await this.userRepository
      .createQueryBuilder('users')
      .select(['users.login', 'users.fullname', 'users.avatar'])
      .where(
        `LOWER(users.login) LIKE '%${search}%' AND users.login != :login`,
        { login: login },
      )
      .getMany();
    const usersList = [];
    await Promise.all(
      users.map(async (user) => {
        const relation = await this.Service_of_friendship.getRelation(
          login,
          user.login,
        );
        if (relation !== 'blocked') usersList.push({ ...user, relation });
      }),
    );
    return { data: [...usersList] };
  }

  async getOpponent(login: string) {
    const user: User = await this.userRepository
      .createQueryBuilder('users')
      .select(['users.fullname', 'users.avatar'])
      .where('users.login = :login', { login: login })
      .getOne();
    if (!user) return user;
    const opponent: opponentDto = {
      fullname: user.fullname,
      avatar: user.avatar,
    };
    return { ...opponent };
  }

  async getFriend(login: string) {
    const user: User = await this.userRepository
      .createQueryBuilder('users')
      .select(['users.login', 'users.fullname', 'users.avatar', 'users.status'])
      .where('users.login = :login', { login: login })
      .getOne();
    if (!user) return user;
    const friend: friendST = {
      login: user.login,
      fullname: user.fullname,
      avatar: user.avatar,
      status: user.status,
    };
    return { ...friend };
  }

  async getRank() {
    const rank: DBrank[] = await this.statsRepository.query(
      `select stats.id, stats.rank, stats."GP", stats."XP" from stats order by stats."GP" DESC;`,
    );
    return rank;
  }

  async getStats(login: string) {
    const user: User = await this.userRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.stats', 'stats')
      .select([
        'users.id',
        'stats.id',
        'stats.XP',
        'stats.GP',
        'stats.numGames',
        'stats.gamesWon',
        'stats.rank',
        'stats.achievement',
      ])
      .where(`users.login = :login`, { login: login })
      .getOne();
    const stats: DBstats = user.stats;
    return stats;
  }

  async updateStats(stats: DBstats) {
    await this.statsRepository
      .createQueryBuilder('stats')
      .update({
        XP: stats.XP,
        GP: stats.GP,
        numGames: stats.numGames,
        gamesWon: stats.gamesWon,
        rank: stats.rank,
        achievement: stats.achievement,
      })
      .where('id = :id', { id: stats.id })
      .execute();
  }

  async updateRank(id: string, rank: number) {
    await this.statsRepository
      .createQueryBuilder('stats')
      .update({ rank })
      .where('id = :id', { id: id })
      .execute();
  }

  async updateAchievements(id: string, achievements: userAchievements[]) {
    await this.statsRepository
      .createQueryBuilder('stats')
      .update({ achievement: achievements })
      .where('id = :id', { id: id })
      .execute();
  }

  async set2faSecret(id: string, secret: string) {
    return await this.userRepository
      .createQueryBuilder('users')
      .update({ _2faSecret: secret })
      .where('id = :id', { id: id })
      .execute();
  }

  async set2faEnabled(id: string, status: boolean) {
    return await this.userRepository
      .createQueryBuilder('users')
      .update({ is2faEnabled: status })
      .where('id = :id', { id: id })
      .execute();
  }

  async setAvatar(id: string, avatar: string) {
    return await this.userRepository
      .createQueryBuilder('users')
      .update({ avatar: avatar })
      .where('id = :id', { id: id })
      .execute();
  }

  async setName(id: string, name: string) {
    return await this.userRepository
      .createQueryBuilder('users')
      .update({ fullname: name })
      .where('id = :id', { id: id })
      .execute();
  }

  async setStatus(login: string, status: userStatus) {
    return await this.userRepository
      .createQueryBuilder('users')
      .update({ status: status })
      .where('login = :login', { login: login })
      .execute();
  }
}
