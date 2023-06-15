import { Controller, Post, Body, Req, Get, Query, Param, UseGuards, Patch, ParseUUIDPipe } from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto, FindJobsDto } from './dto';
import { Job } from './job.entity';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Request } from 'express';

@Controller('job')
export class JobController {
  constructor(private jobService: JobService) {}

  @Get()
  public find(@Query() findJobsDto: FindJobsDto) {
    return this.jobService.find(findJobsDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('recommend')
  public findMyRecommendations(@Req() req: Request) {
    return this.jobService.findMyRecommendations(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('company')
  public findCompanyjobs(@Query('companyId', ParseUUIDPipe) companyId: string, @Req() req: Request) {
    return this.jobService.findCompanyJobs(companyId, req.user.id);
  }

  @Get('detail/:id')
  public findOneById(@Param('id', ParseUUIDPipe) id: string): Promise<Job> {
    return this.jobService.findOneById(id);
  }

  @Get(':slug')
  public findOne(@Param('slug') slug: string): Promise<Job> {
    return this.jobService.findOne(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  public create(@Body() createJobDto: CreateJobDto, @Req() req: Request): Promise<Job> {
    return this.jobService.create(createJobDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  public update(@Param('id', ParseUUIDPipe) id: string, @Body() createJobDto: CreateJobDto): Promise<Job> {
    return this.jobService.update(id, createJobDto);
  }
}
