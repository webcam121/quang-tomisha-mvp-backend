import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Request, Response } from 'express';
import { CreateReferenceDto } from './dto';
import { Reference } from './reference.entity';
import { ReferenceService } from './reference.service';

@UseGuards(JwtAuthGuard)
@Controller('reference')
export class ReferenceController {
  constructor (private referenceService: ReferenceService) {}

  @Get('me')
  public findMyReferences (@Req() req: Request): Promise<Reference[]> {
    return this.referenceService.findMyReferences(req.user.id);
  }

  @Get('sent')
  public findMySentReferences(@Req() req: Request) {
    return this.referenceService.findMySentReferences(req.user.id);
  }

  @Get('user/:userId')
  public findReferencesByUserId (@Param('userId', ParseUUIDPipe) userId: string, @Req() req: Request): Promise<Reference[]> {
    return this.referenceService.findReferencesByUserId(userId, req.user.id);
  }

  @Post('invite')
  public async inviteReference (@Body('refUserId', ParseUUIDPipe) refUserId: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.referenceService.inviteReference(req.user.id, refUserId);
    res.sendStatus(200);
  }

  @Post('request')
  public async requestViewReferences (@Body('userId', ParseUUIDPipe) userId: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.referenceService.requestViewReferences(userId, req.user.id);
    res.sendStatus(200);
  }

  @Post('allow')
  public async allowViewReferences (@Body('viewerId', ParseUUIDPipe) viewerId: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.referenceService.allowViewReferences(viewerId, req.user.id);
    res.sendStatus(200);
  }

  @Post()
  public async createReference (@Body() createReferenceDto: CreateReferenceDto, @Req() req: Request, @Res() res: Response): Promise<void> {
    await this.referenceService.create(createReferenceDto, req.user.id);
    res.sendStatus(200);
  }
}
