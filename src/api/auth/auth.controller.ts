import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto, type ITokenDto, LoginUserDto } from 'src/api';
import { ParsedToken, ParsedTokenPipe } from 'src/decorators/TokenDecorator';
import { AuthGuard } from 'src/guards';
import { Errors } from 'src/utils';

import { AuthService, IAuthResponse } from './auth.service';

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
      return data;
    } else {
      throw Errors.undefinedError();
    }
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@ParsedToken(ParsedTokenPipe) user: ITokenDto) {
    if (!user?._id) throw Errors.unauthorized();
    return this.authService.getMe(user?._id);
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
      req.headers['device'],
    );
    return this.setCookies(data, res);
  }

  @Get('refresh')
  async refresh(
    @ParsedToken(ParsedTokenPipe) user: ITokenDto,
    @Res({ passthrough: true }) res,
  ) {
    const data: IAuthResponse = await this.authService.refresh(
      user?._id,
      user?.user_agent,
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
      req.headers['device'],
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
      req.headers['device'],
    );
    return this.setCookies(data, res);
  }

  @Get('logout')
  async logout(
    @ParsedToken(ParsedTokenPipe) user: ITokenDto,
    @Res({ passthrough: true }) res,
  ) {
    res.clearCookie('refreshToken');

    await this.authService.logout({
      user_agent: user?.user_agent,
      user_id: user?._id,
    });
    return true;
  }
}
