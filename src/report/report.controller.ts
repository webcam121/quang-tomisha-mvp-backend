import { Body, Controller, Get, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AdminJwtAuthGuard } from 'src/auth/jwt-admin.guard';
import { PublicJwtAuthGuard } from 'src/auth/jwt-public.guard';
import { CreateReportDto, FindReportsDto, PatchReportsDto } from './dto';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(private reportService: ReportService) {}

  @UseGuards(AdminJwtAuthGuard)
  @Get()
  public find(@Query() findReportsDto: FindReportsDto) {
    return this.reportService.find(findReportsDto);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Patch()
  public async patch(@Body() patchReportsDto: PatchReportsDto, @Res() res: Response) {
    await this.reportService.patch(patchReportsDto);
    res.sendStatus(200);
  }

  @UseGuards(PublicJwtAuthGuard)
  @Post()
  public async create(@Body() createReportDto: CreateReportDto, @Req() req: Request, @Res() res: Response) {
    await this.reportService.create(createReportDto, req.user?.id);
    res.sendStatus(200);
  }
}
