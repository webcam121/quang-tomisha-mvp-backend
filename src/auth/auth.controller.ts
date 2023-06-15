import { Controller, Post, UseGuards, Res, Body, Get, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto, RegisterDto, VerifyEmailDto, RequestNewEmailDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto, @Res() res: Response): Promise<void> {
    await this.authService.verifyEmail(verifyEmailDto);
    res.sendStatus(200)
  }

  // @UseGuards(JwtAuthGuard)
  // @Post('verify-password')
  // async verifyPassword(@Body('password') password: string, @Req() req: Request) {
  //   return this.authService.verifyPassword(req.user.id, password);
  // }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Req() req: Request) {
    return this.authService.login(req.user);
  }

  @Throttle(1, 29)
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.registerLocal(registerDto);
    return this.authService.login(user);
  }

  @UseGuards(AuthGuard('facebook'))
  @Get('facebook')
  public async facebookAuth() {}

  @UseGuards(AuthGuard('facebook'))
  @Get('redirect/facebook')
  public async facebookAuthRedirect(@Req() req: Request, @Res() res: Response) {
    if (!!req.user?.isNew) {
      // webapp/auth/create-account?token=...
      const tokenUrl = await this.authService.generateCreateAccountUrl(req.user, true);
      res.redirect(tokenUrl);
    } else {
      const href = await this.authService.generateLoginCallbackUrl(req.user);
      res.redirect(href);
    }
  }

  // @UseGuards(AuthGuard('google'))
  // @Get('google')
  // public async googleAuth() {}

  // @UseGuards(AuthGuard('google'))
  // @Get('redirect/google')
  // public async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
  //   if (!!req.user?.isNew) {
  //     const tokenUrl = await this.authService.generateCreateAccountUrl(req.user);
  //     res.redirect(tokenUrl);
  //   } else {
  //     const href = await this.authService.generateLoginCallbackUrl(req.user);
  //     res.redirect(href);
  //   }
  // }

  @UseGuards(JwtAuthGuard)
  @Post('password/change')
  public async changePassword(@Req() req: Request, @Res() res: Response, @Body() changePasswordDto: ChangePasswordDto) {
    await this.authService.changePassword(changePasswordDto, req.user.id);
    res.sendStatus(200);
  }

  @Post('password/forgot')
  public async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto, @Res() res: Response) {
    await this.authService.forgotPassword(forgotPasswordDto);
    res.sendStatus(200);
  }

  @Post('password/reset')
  public async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @Res() res: Response) {
    await this.authService.resetPassword(resetPasswordDto);
    res.sendStatus(200);
  }

  @UseGuards(JwtAuthGuard)
  @Post('email/new')
  public async requestNewEmail(@Req() req: Request, @Res() res: Response, @Body() newEmailDto: RequestNewEmailDto) {
    await this.authService.requestNewEmail(newEmailDto, req.user.id);
    res.sendStatus(200);
  }

  @Post('email/change')
  public async changeEmail(@Res() res: Response, @Body('token') token: string) {
    await this.authService.changeEmail(token);
    res.sendStatus(200);
  }
}