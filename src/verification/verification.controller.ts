import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { VerificationService } from './verification.service';

@Controller('verification')
export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  @Get('redirect')
  public async redirectToWebApp(@Query('token') token: string, @Res() res: Response): Promise<void> {
    const href = await this.verificationService.redirectToWebApp(token);
    res.redirect(href);
  }
}
