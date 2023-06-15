import { Controller, Get, Req, Param, Post, Body, UseGuards, ParseIntPipe, Res, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto, CreateApplicationLogDto, FindApplicationsDto } from './dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Request, Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('application')
export class ApplicationController {
  constructor(private applicationService: ApplicationService) {}

  @Get()
  public findApplicationsByJobId(@Query() findApplicationsDto: FindApplicationsDto, @Req() req: Request) {
    return this.applicationService.findApplicationsByJobId(findApplicationsDto, req.user.id);
  }

  @Get('me')
  public findMyApplications(@Req() req: Request) {
    return this.applicationService.findMyApplications(req.user.id);
  }

  @Get(':id')
  public findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request, @Query('companyId', ParseUUIDPipe) companyId: string) {
    return this.applicationService.findOne(id, req.user.id, companyId);
  }

  @Post()
  public create(@Body() createApplicationDto: CreateApplicationDto, @Req() req: Request) {
    return this.applicationService.create(createApplicationDto, req.user.id);
  }

  @Post('log')
  public async log(@Body() createAPplicationLogDto: CreateApplicationLogDto, @Req() req: Request, @Res() res: Response) {
    await this.applicationService.createApplicationLog(createAPplicationLogDto, req.user.id);
    res.sendStatus(200);
  }
}
