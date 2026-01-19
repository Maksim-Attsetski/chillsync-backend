import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist';
import { InjectModel } from '@nestjs/mongoose';
import { compare, hash } from 'bcryptjs';
import { Model } from 'mongoose';
import {
  CreateUserDto as SignupDto,
  GetUserDto,
  ITokenDto,
  LoginUserDto,
  MailService,
  Users,
  UsersDocument,
} from 'src/api';
import { Config } from 'src/modules';
import { Errors } from 'src/utils';
import { v4 } from 'uuid';

import { SessionsService } from '../sessions';
import { CreateSessionDto } from '../sessions/dto/create.dto';
import { SettingsService } from '../settings/settings.service';

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
    @Inject(forwardRef(() => SettingsService))
    private readonly settingsService: SettingsService,
    @Inject(forwardRef(() => MailService))
    private readonly mailService: MailService,
  ) {}

  async createUser(data: SignupDto, password: string, providers: string[]) {
    const createdUser = await this.usersModel.create({
      ...data,
      password,
      providers,
      public_id: v4(),
      created_at: Date.now(),
    });

    if (createdUser?._id) {
      void this.settingsService.create({
        user_id: createdUser?._id.toString(),
      });
    }

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

    const { tokens } = await this.sessionsService.generateAndSaveSession(
      {
        user_id: createdUser.id,
        last_active_at: new Date(),
        created_at: new Date(),
        user_agent: userAgent,
        device_name: device ?? 'unknown',
      },
      createdUser,
    );

    void this.mailService.sendEmailToNewUser(
      `${dto?.first_name} ${dto.last_name}`,
      dto?.email,
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
      user = await this.createUser(
        {
          ...userData,
          email: userData?.email,
          first_name: userData?.first_name || '',
          last_name: userData?.last_name || '',
        },
        '',
        ['google'],
      );
    }

    if (!user && !emailIsExist)
      return {
        tokens: null,
        user: null,
      };

    const dto = {
      user_id: user.id,
      last_active_at: new Date(),
      created_at: new Date(),
      user_agent: userAgent,
      device_name: device ?? 'unknown',
    } as CreateSessionDto;
    const { tokens, isNewSession } =
      await this.sessionsService.generateAndSaveSession(dto, user);
    void (
      isNewSession && this.mailService.sendEmailIfNewSession(dto, user?.email)
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

    const dto = {
      user_id: user.id,
      last_active_at: new Date(),
      created_at: new Date(),
      user_agent: userAgent,
      device_name: device ?? 'unknown',
    } as CreateSessionDto;
    const { tokens, isNewSession } =
      await this.sessionsService.generateAndSaveSession(dto, user);

    if (isNewSession) {
      void this.mailService.sendEmailIfNewSession(dto, user?.email);
    }

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
      console.log('token error', error);
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

    const dto = {
      ...tokenData,
      user_agent: user_agent,
      user_id: user_id,
      last_active_at: new Date(),
    } as CreateSessionDto;
    const { tokens, isNewSession } =
      await this.sessionsService.generateAndSaveSession(
        dto,
        user?.user_id as UsersDocument,
      );
    console.log('isNewSession', isNewSession);

    if (isNewSession) {
      void this.mailService.sendEmailIfNewSession(dto, user?.user_id?.email);
    }
    return { tokens, user: user?.user_id };
  }

  async logout(obj: { user_id: string; user_agent: string }) {
    return await this.sessionsService.delete(obj);
  }

  async getMe(id: string) {
    return this.usersModel.findById(id);
  }
}
