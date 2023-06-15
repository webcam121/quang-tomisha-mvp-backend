import { Controller, UseGuards, Res, Post, Body, Req, Get, Query, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Request, Response } from 'express';
import { RequestJoinDto } from './dto';

@Controller('company')
export class CompanyController {
  constructor(
    private companyService: CompanyService,
  ) {}

  @Get('public/:companySlug')
  public getPublicCompany(@Param('companySlug') companySlug: string) {
    return this.companyService.getPublicCompany(companySlug);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  public searchByEmail(@Query('email') email: string) {
    return this.companyService.searchByEmail(email);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':companyId')
  public getDetailById(@Param('companyId', ParseUUIDPipe) companyId: string, @Req() req: Request) {
    return this.companyService.getDetailById(companyId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-email')
  public async verifyEmail(@Body('email') email: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.companyService.verifyEmail(email, req.user.id);
    res.sendStatus(200);
  }

  @UseGuards(JwtAuthGuard)
  @Post('join')
  public async requestJoinCompany(@Body() requestJoinDto: RequestJoinDto, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.companyService.requestJoinCompany(requestJoinDto, req.user.id);
    res.sendStatus(200);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  public async patchCompany(@Param('id', ParseUUIDPipe) id: string, @Body('slug') slug: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.companyService.patchCompany(id, { slug }, req.user.id);
    res.sendStatus(200);
  }
}
