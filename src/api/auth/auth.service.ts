import { hash, compare } from 'bcryptjs';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt/dist';

import { Errors } from 'src/utils';
import {
  CreateUserDto as SignupDto,
  LoginUserDto,
  Users,
  UsersDocument,
  GetUserDto,
  ITokenDto,
} from 'src/api';
import { v4 } from 'uuid';
import { SessionsService } from '../sessions';
import { Config } from 'src/modules';

interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthResponse {
  user: Users | null;
  tokens: ITokens | null;
}
@Injectable()
export class AuthService {
  constructor(
    @InjectModel('Users') private readonly usersModel: Model<UsersDocument>,
    private readonly jwtService: JwtService,
    private readonly sessionsService: SessionsService,
  ) {}

  async createUser(data: SignupDto, password: string, providers: string[]) {
    const createdUser = await this.usersModel.create({
      ...data,
      password,
      providers,
      public_id: v4(),
      created_at: Date.now(),
    });

    return createdUser;
  }

  async signup(
    dto: SignupDto,
    userAgent: string,
    device?: string,
  ): Promise<IAuthResponse> {
    const emailIsExist = await this.usersModel.findOne({ email: dto.email });

    if (emailIsExist)
      throw Errors.badRequest('User with this email already exists');

    const hashPassword = await hash(dto.password, 7);
    const createdUser = await this.createUser(dto, hashPassword, ['pass']);

    const tokens = await this.sessionsService.generateAndSaveSession(
      {
        user_id: createdUser.id,
        last_active_at: new Date(),
        created_at: new Date(),
        user_agent: userAgent,
        device_name: device ?? 'unknown',
      },
      createdUser,
    );

    return { user: createdUser, tokens };
  }

  async authByGoogle(
    credential: string,
    userAgent: string,
    device?: string,
  ): Promise<IAuthResponse> {
    const userData: any = this.jwtService.decode(credential);

    if (!userData?.email) throw Errors.undefinedError();
    const emailIsExist = await this.usersModel.findOne({
      email: userData?.email,
    });

    let user = emailIsExist as UsersDocument;

    if (!emailIsExist) {
      user = await this.usersModel.create({
        email: userData?.email,
        name: userData?.name || '',
        providers: ['google'],
        created_at: Date.now(),
      });
    }

    if (!user && !emailIsExist)
      return {
        tokens: null,
        user: null,
      };

    const tokens = await this.sessionsService.generateAndSaveSession(
      {
        user_id: user.id,
        last_active_at: new Date(),
        created_at: new Date(),
        user_agent: userAgent,
        device_name: device ?? 'unknown',
      },
      user,
    );
    return { user, tokens };
  }

  async login(
    loginDto: LoginUserDto,
    userAgent: string,
    device?: string,
  ): Promise<IAuthResponse> {
    const user = await this.usersModel
      .findOne({ email: loginDto.email })
      .populate(Object.keys(new GetUserDto(undefined)));

    if (!user) throw Errors.notFound('User');
    if (!user?.password) throw Errors.badRequest('Try another sign in method');

    const isPassEqual = await compare(loginDto.password, user?.password);
    if (!isPassEqual) throw Errors.badRequest('Password is wrong');

    const tokens = await this.sessionsService.generateAndSaveSession(
      {
        user_id: user.id,
        last_active_at: new Date(),
        created_at: new Date(),
        user_agent: userAgent,
        device_name: device ?? 'unknown',
      },
      user,
    );
    return { user, tokens };
  }

  async validateToken(
    token: string,
    isRefresh?: boolean,
  ): Promise<ITokenDto | null> {
    try {
      return await this.jwtService.verifyAsync<ITokenDto>(token, {
        secret: isRefresh ? Config.refreshSecret : Config.accessSecret,
      });
    } catch (error) {
      return null;
    }
  }

  async refresh(user_id: string, user_agent: string): Promise<IAuthResponse> {
    const tokenData = await this.sessionsService.getOne({
      user_id,
      user_agent,
    });

    if (!tokenData) {
      throw Errors.unauthorized();
    }

    const user = await tokenData.populate('user_id');

    // user.user_id.email;
    const tokens = await this.sessionsService.generateAndSaveSession(
      {
        ...tokenData,
        user_agent: user_agent,
        user_id: user_id,
        last_active_at: new Date(),
      },
      user?.user_id as UsersDocument,
    );

    return { tokens, user: user?.user_id };
  }

  async logout(obj: { user_id: string; user_agent: string }) {
    return await this.sessionsService.delete(obj);
  }
}
