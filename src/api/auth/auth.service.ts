import { hash, compare } from 'bcryptjs';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt/dist';

import { Errors } from 'src/utils';
import { Config } from 'src/modules';
import {
  CreateUserDto as SignupDto,
  LoginUserDto,
  Users,
  UsersDocument,
  GetUserDto,
} from 'src/api';
import { Token, TokenDocument } from './auth.entity';
import { v4 } from 'uuid';

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
    @InjectModel(Token.name) private readonly tokenModel: Model<TokenDocument>,
    @InjectModel('Users') private readonly usersModel: Model<UsersDocument>,
    @Inject(forwardRef(() => JwtService)) private jwtService: JwtService,
  ) {}

  async createUser(data: SignupDto, password: string, providers: string[]) {
    const createdUser = await this.usersModel.create({
      ...data,
      password,
      providers,
      public_id: v4(),
      createdAt: Date.now(),
    });

    return createdUser;
  }

  async signup(dto: SignupDto, userAgent: string): Promise<IAuthResponse> {
    const emailIsExist = await this.usersModel.findOne({ email: dto.email });

    if (emailIsExist)
      throw Errors.badRequest('User with this email already exists');

    const hashPassword = await hash(dto.password, 7);
    const createdUser = await this.createUser(dto, hashPassword, ['pass']);

    const tokens = await this.generateAndSaveTokens(createdUser, userAgent);

    return { user: createdUser, tokens };
  }

  async authByGoogle(
    credential: string,
    userAgent: string,
  ): Promise<IAuthResponse> {
    const userData: any = this.jwtService.decode(credential);

    if (!userData?.email) throw Errors.undefinedError();
    const emailIsExist = await this.usersModel.findOne({
      email: userData?.email,
    });

    let user = emailIsExist;

    if (!emailIsExist) {
      user = await this.usersModel.create({
        email: userData?.email,
        name: userData?.name || '',
        providers: ['google'],
        createdAt: Date.now(),
      });
    }

    if (!user && !emailIsExist)
      return {
        tokens: null,
        user: null,
      };

    const tokens = await this.generateAndSaveTokens(user, userAgent);
    return { user, tokens };
  }

  async login(
    loginDto: LoginUserDto,
    userAgent: string,
  ): Promise<IAuthResponse> {
    const user = await this.usersModel
      .findOne({ email: loginDto.email })
      .populate(Object.keys(new GetUserDto(undefined)));

    if (!user) throw Errors.notFound('User');
    if (!user?.password) throw Errors.badRequest('Try another sign in method');

    const isPassEqual = await compare(loginDto.password, user?.password);
    if (!isPassEqual) throw Errors.badRequest('Password is wrong');

    const tokens = await this.generateAndSaveTokens(user, userAgent);
    return { user, tokens };
  }

  async generateTokens({ _id, email }: UsersDocument): Promise<ITokens> {
    const accessToken = this.jwtService.sign(
      { email, _id },
      { expiresIn: '15m', secret: Config.accessSecret },
    );
    const refreshToken = this.jwtService.sign(
      { email, _id },
      { expiresIn: '30d', secret: Config.refreshSecret },
    );

    return { accessToken, refreshToken };
  }

  async saveTokens(
    userID: string,
    refreshToken: string,
    userAgent: string,
  ): Promise<void> {
    const token = await this.tokenModel.findOne({ userID, userAgent });

    if (token) {
      token.refreshToken = refreshToken;
      await token.save();
    } else {
      await this.tokenModel.create({ userID, refreshToken, userAgent });
    }
  }

  async generateAndSaveTokens(user: any, userAgent: string): Promise<ITokens> {
    const tokens = await this.generateTokens(user);
    await this.saveTokens(user?._id + '', tokens.refreshToken, userAgent);

    return tokens;
  }

  async deleteToken(obj: {
    userID?: string;
    refreshToken?: string;
  }): Promise<void> {
    await this.tokenModel.findOneAndDelete(obj);
  }

  async validateToken(token: string, isRefresh?: boolean) {
    try {
      return await this.jwtService.verify(token, {
        secret: isRefresh ? Config.refreshSecret : Config.accessSecret,
      });
    } catch (error) {
      return false;
    }
  }

  async getToken(refreshToken: string): Promise<TokenDocument | null> {
    try {
      return await this.tokenModel.findOne({ refreshToken });
    } catch (error) {
      return null;
    }
  }

  async refresh(
    refreshToken: string,
    userAgent: string,
  ): Promise<IAuthResponse> {
    if (!refreshToken) {
      throw Errors.unauthorized();
    }
    const tokenIsValid = await this.validateToken(refreshToken, true);
    const tokenData = await this.getToken(refreshToken);

    if (!tokenData || !tokenIsValid) {
      throw Errors.unauthorized();
    }

    const user = await this.usersModel
      .findById(tokenData.userID)
      .populate(Object.keys(new GetUserDto(undefined)));
    const tokens = await this.generateAndSaveTokens(user, userAgent);

    return { tokens, user };
  }

  async getTokens(): Promise<any> {
    return await this.tokenModel.find();
  }
}
