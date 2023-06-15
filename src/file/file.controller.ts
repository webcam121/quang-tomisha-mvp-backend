import { Controller, Get, Post, Body, UseGuards, Patch, Param, ParseIntPipe, Delete, Res, Req } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { FileService } from './file.service';
import { CreateUserFileDto, UpdateUserFileDto } from './dto';
import { Request, Response } from 'express';

@Controller('file')
export class FileController {
  constructor(private fileService: FileService) {}

  @UseGuards(JwtAuthGuard)
  @Get('')
  public findMyFiles(@Req() req: Request) {
    return this.fileService.findMyFiles(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('')
  public createFile(@Body() createUserFileDto: CreateUserFileDto, @Req() req: Request) {
    return this.fileService.createMyFile(createUserFileDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  public updateFile(@Param('id', ParseIntPipe) id: number, @Body() updateUserFileDto: UpdateUserFileDto, @Req() req: Request) {
    return this.fileService.updateMyFile(id, updateUserFileDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  public async removeFile(@Param('id', ParseIntPipe) id: number, @Req() req: Request, @Res() res: Response) {
    await this.fileService.removeMyFile(id, req.user.id);
    res.sendStatus(200);
  }
}
