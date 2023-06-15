import { Controller, Get, Post, Body, UseGuards, Query, Patch, Param, ParseIntPipe, Delete, Res, Req } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { DegreeService } from './degree.service';
import { CreateDegreeDto, UpdateDegreeDto } from './dto';
import { Request, Response } from 'express';

@Controller('degree')
export class DegreeController {
  constructor(private degreeService: DegreeService) {}

  @UseGuards(JwtAuthGuard)
  @Get('')
  public findDegrees(@Query('type', ParseIntPipe) type: number, @Req() req: Request) {
    return this.degreeService.find(type, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('')
  public createDegree(@Body() createDegreeDto: CreateDegreeDto) {
    return this.degreeService.createDegree(createDegreeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  public updateDegree(@Param('id', ParseIntPipe) id: number, @Body() updateDegreeDto: UpdateDegreeDto) {
    return this.degreeService.updateDegree(id, updateDegreeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  public async removeDegree(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.degreeService.removeDegree(id);
    res.sendStatus(200);
  }
}
