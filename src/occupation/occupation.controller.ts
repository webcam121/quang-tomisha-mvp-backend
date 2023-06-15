import { Controller, Get, Req, Param, Post, Body, UseGuards, Patch, ParseUUIDPipe } from '@nestjs/common';
import { OccupationService } from './occupation.service';
import { CreateOccupationDto, UpdateOccupationDto } from './dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Request } from 'express';
import { Occupation } from './occupation.entity';

@Controller('occupation')
export class OccupationController {
  constructor(private occupationService: OccupationService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  public findMyOccupations(@Req() req: Request): Promise<Occupation[]> {
    return this.occupationService.findMyOccupations(req.user);
  }

  @Get(':slug')
  public findOne(@Param('slug') slug: string): Promise<Occupation> {
    return this.occupationService.findOne(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  public create(@Body() createOccupationDto: CreateOccupationDto, @Req() req: Request): Promise<Occupation> {
    return this.occupationService.create(createOccupationDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  public update(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request, @Body() updateOccupationDto: UpdateOccupationDto): Promise<Occupation> {
    return this.occupationService.update(id, req.user.id, updateOccupationDto);
  }
}
