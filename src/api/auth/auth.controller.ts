import { Controller, Post, Body, Res, Get, Req } from '@nestjs/common';
import { Errors } from 'src/utils';

import { AuthService, IAuthResponse } from './auth.service';
import { LoginUserDto, CreateUserDto } from 'src/api';

@Controller('auth')
export class AuthController {
  cookieOptions: any;
  constructor(private readonly authService: AuthService) {}

  setCookies(data: IAuthResponse, res: any) {
    if (data?.tokens?.refreshToken) {
      res?.cookie('refreshToken', data.tokens.refreshToken, {
        maxAge: 24 * 60 * 60 * 1000 * 7,
        httpOnly: true,
        sameSite: 'None',
        secure: true,
      });
      return { ...data, tokens: data.tokens.accessToken };
    } else {
      throw Errors.undefinedError();
    }
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginUserDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res,
  ) {
    const data: IAuthResponse = await this.authService.login(
      loginDto,
      req.headers['user-agent'],
    );
    return this.setCookies(data, res);
  }

  @Get('tokens') // TODO delete on release
  async tokens() {
    return await this.authService.getTokens();
  }

  @Get('refresh')
  async refresh(@Req() req, @Res({ passthrough: true }) res) {
    const refreshToken = req.cookies?.refreshToken;

    const data: IAuthResponse = await this.authService.refresh(
      refreshToken,
      req.headers['user-agent'],
    );
    return this.setCookies(data, res);
  }

  @Post('signup')
  async signup(
    @Body() signupDto: CreateUserDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res,
  ) {
    const data: IAuthResponse = await this.authService.signup(
      signupDto,
      req.headers['user-agent'],
    );
    return this.setCookies(data, res);
  }

  @Post('google')
  async authByGoogle(
    @Body() { credential }: { credential: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res,
  ) {
    const data: IAuthResponse = await this.authService.authByGoogle(
      credential,
      req.headers['user-agent'],
    );
    return this.setCookies(data, res);
  }

  @Get('logout')
  async logout(@Req() req, @Res({ passthrough: true }) res) {
    const { refreshToken } = req.cookies;
    res.clearCookie('refreshToken');

    await this.authService.deleteToken({ refreshToken });
    return true;
  }
}
