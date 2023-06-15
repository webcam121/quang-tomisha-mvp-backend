import { Controller, Get, Query, Post, Body, Param, UseGuards, Req, Res, Patch, ParseUUIDPipe } from '@nestjs/common';
import { EmploymentService } from './employment.service';
import { FindEmploymentsDto } from './dto/find-employments.dto';
import { AcceptEmploymentInvitationDto, CreateEmploymentDto, InviteEmploymentDto, UpdateEmploymentDto } from './dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Employment } from './employment.entity';
import { Request, Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('employment')
export class EmploymentController {
  constructor(
    private employmentService: EmploymentService,
  ) {}

  @Get()
  public find(@Query() findEmploymentsDto: FindEmploymentsDto): Promise<Employment[]> {
    return this.employmentService.find(findEmploymentsDto);
  }

  @Get('candidate')
  public findAgencyCandidates(@Query('agencyId', ParseUUIDPipe) agencyId: string, @Req() req: Request) {
    return this.employmentService.findAgencyCandidates(agencyId, req.user.id)
  }

  @Post('invite')
  public async invite(@Body() inviteEmploymentDto: InviteEmploymentDto, @Req() req: Request, @Res() res: Response) {
    await this.employmentService.invite(inviteEmploymentDto, req.user.id);
    res.sendStatus(200);
  }

  @Post('accept')
  public acceptInvitation(@Body() acceptEmploymentInvitationdto: AcceptEmploymentInvitationDto, @Req() req: Request) {
    return this.employmentService.acceptInvitation(acceptEmploymentInvitationdto, req.user.id);
  }

  @Post()
  public acceptJoinRequest(@Body() createEmploymentDto: CreateEmploymentDto, @Req() req: Request) {
    return this.employmentService.create(createEmploymentDto, req.user.id);
  }

  @Patch(':id')
  public update(@Param('id') id: number, @Body() updateEmploymentDto: UpdateEmploymentDto, @Req() req: Request) {
    return this.employmentService.update(id, updateEmploymentDto, req.user.id);
  }
}
