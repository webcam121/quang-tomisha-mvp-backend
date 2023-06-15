import { Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { ContactService } from './contact.service';
import { FindContactsDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('contact')
export class ContactController {
  constructor(
    private contactService: ContactService,
  ) {}

  @Get('count')
  public getContactCounts(@Req() req: Request) {
    return this.contactService.getContactCount(req.user.id);
  }

  @Get()
  public findMyContacts(@Query() findContactsDto: FindContactsDto, @Req() req: Request) {
    return this.contactService.find(findContactsDto, req.user.id);
  }

  @Post('company-block/:userId')
  public async companyBlockUser(@Param('userId', ParseUUIDPipe) userId: string, @Body('companyId') companyId: string, @Req() req: Request, @Res() res: Response) {
    await this.contactService.blockUser(userId, req.user.id, companyId);
    res.sendStatus(200);
  }

  @Post('block/:userId')
  public async blockUser(@Param('userId', ParseUUIDPipe) userId: string, @Req() req: Request, @Res() res: Response) {
    await this.contactService.blockUser(userId, req.user.id);
    res.sendStatus(200);
  }

  @Post('invite/:userId')
  public async inviteContact(@Param('userId', ParseUUIDPipe) userId: string, @Req() req: Request, @Res() res: Response) {
    await this.contactService.invite(userId, req.user.id);
    res.sendStatus(200);
  }

  @Post('accept/:id')
  public async acceptInvitation(@Param('id', ParseIntPipe) id: number, @Req() req: Request, @Res() res: Response) {
    await this.contactService.acceptInvitation(id, req.user.id);
    res.sendStatus(200);
  }

  @Put('read')
  public async readAllInvitations(@Req() req: Request, @Res() res: Response) {
    await this.contactService.readAllInvitations(req.user.id);
    res.sendStatus(200);
  }

  @Delete(':id')
  public async removeContact(@Param('id', ParseIntPipe) id: number, @Req() req: Request, @Res() res: Response) {
    await this.contactService.removeContact(id, req.user.id);
    res.sendStatus(200);
  }
}
