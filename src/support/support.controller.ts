import { Body, Controller, Get, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AdminJwtAuthGuard } from 'src/auth/jwt-admin.guard';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { CreateSupportDto, FindSupportsDto, PatchSupportsDto } from './dto';
import { SupportService } from './support.service';

@Controller('support')
export class SupportController {
  constructor(
    private supportService: SupportService,
  ) {}

  @UseGuards(AdminJwtAuthGuard)
  @Get()
  public find(@Query() findSupportsDto: FindSupportsDto) {
    return this.supportService.find(findSupportsDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  public async create(@Body() createSupportDto: CreateSupportDto, @Req() req: Request, @Res() res: Response) {
    await this.supportService.create(createSupportDto, req.user.id);
    res.sendStatus(200);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Patch()
  public async patch(@Body() patchSupportsDto: PatchSupportsDto, @Res() res: Response) {
    await this.supportService.patch(patchSupportsDto);
    await res.sendStatus(200);
  }
}
